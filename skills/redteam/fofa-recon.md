---
name: fofa-recon
description: FOFA API 로 대상 자산(도메인/IP/포트/제목/지문)을 배치 측정한다; 속도 제한 클라이언트 내장, 엄격한 단일 스레드 + 최소 간격 + 백오프 재시도로 45012 트리거를 피한다
whenToUse: 정보 수집 단계에서 특정 기관/도메인의 인터넷 자산면을 빠르게 펼쳐야 할 때
role: recon
enabled: true
---

# FOFA 자산 측정(속도 제한 안전판)

## 자격 증명
- API Key: 환경 변수 `FOFA_KEY` 에서 읽는다(**어떤 key 도 저장소에 쓰지 않는다**; 이 스킬의 모든 스크립트는 환경 변수만 읽는다)
- 엔드포인트: `GET https://fofa.info/api/v1/search/all`
- 파라미터: `key`, `qbase64`(쿼리 문장의 base64), `size`, `page`, `fields`

## 공식 한도(fofa.info/vip, 2026-09 확인)

| 회원 등급 | 조회 요청 | 데이터 수량 | **조회 API 동시성** |
|---|---|---|---|
| 등록 사용자(무료) | API 없음(페이지 300회/월) | 페이지 3,000건/월 | — |
| 개인판 | 10,000회/월 | 100,000건/월 | **1초 1회** |
| 프로판 | 80,000회/월 | 800,000건/월 | **1초 1회** |
| 상업판 | 900,000회/월 | 9,000,000건/월 | **1초 2회** |
| 기업판 V2 | 5,000,000회/월 | 50,000,000건/월 | **1초 5회** |

## 실측 동작(실측으로 검증)
- 연속 고속 요청 → **HTTP 429**, 응답 본문 `{"error":true,"errmsg":"[45012] 요청 속도 초과"}`
- key 오류 → HTTP 200 + `{"error":true,"errmsg":"[-700] 계정 무효"}`
- 단일 페이지 `size` 는 1000 까지 정상이다; 요청 간격이 1초 이상이면 연속 요청도 모두 200 을 반환한다
- 결론: **1초당 1요청으로 보수적으로 실행하고 절대 동시 실행하지 않는다**; 45012 를 만나면 반드시 백오프하며 즉시 재시도하지 않는다

## 사용 규율(중요)
1. **정밀 조회 우선**: `domain=` / `cert=` / `org=` 로 먼저 범위를 좁히고, 그다음 `body=` / `title=` 같은 넓은 문장을 고려한다. 넓은 문장은 수십만 건을 반환해 의미도 없고 쿼터만 태운다.
2. **전체 페이지를 넘기지 않는다**: 기본적으로 앞 1–3 페이지만(페이지당 100건) 가져와 측정 입구를 확보하면 충분하다.
3. **단일 프로세스 단일 스레드**: 같은 시각에 수집 작업은 하나만 돌린다; 여러 조회는 직렬로 대기시킨다.
4. **결과 디스크 캐시**: 같은 조회를 반복해서 받지 않는다, 먼저 `runs/fofa-*.jsonl` 에 이미 있는지 본다.
5. **긴 작업은 백그라운드로**: `run_in_background` 로 돌려 대화를 막지 않는다.
6. 쿼터가 소진되거나 속도 제한을 받으면 다른 데이터 소스(인증서 투명성, DNS, 검색 엔진)로 바꾼다, 우기지 않는다.

## 속도 제한 클라이언트(이것을 쓰고 curl 루프를 직접 쓰지 않는다)
```bash
cat > runs/fofa_client.py <<'PY'
#!/usr/bin/env python3
"""FOFA 수집(속도 제한 안전): 단일 스레드 + 최소 간격 + 지수 백오프 + 결과 캐시.

사용법:
  python3 runs/fofa_client.py 'domain="example.com"' --pages 2 --size 100 --interval 2.0
출력:
  runs/fofa-<slug>.jsonl   한 줄에 자산 하나 {host,ip,port,title,domain,server,protocol}
"""
import argparse, base64, hashlib, json, os, sys, time, urllib.error, urllib.parse, urllib.request

KEY = os.environ["FOFA_KEY"]
API = "https://fofa.info/api/v1/search/all"
FIELDS = "host,ip,port,title,domain,server,protocol"
RETRY_BACKOFF = [5, 15, 45]          # 45012 를 만났을 때의 백오프 초
HARD_BUDGET = 30                      # 1회 실행 최대 요청 수


def fetch(query, page, size, timeout=30):
    qs = urllib.parse.urlencode({
        "key": KEY, "qbase64": base64.b64encode(query.encode()).decode(),
        "size": size, "page": page, "fields": FIELDS,
    })
    req = urllib.request.Request(API + "?" + qs, headers={"User-Agent": "redteam-recon/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, json.load(r)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "ignore")
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, {"error": True, "errmsg": body[:200]}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("query")
    ap.add_argument("--pages", type=int, default=2, help="최대 페이지 수(기본 2)")
    ap.add_argument("--size", type=int, default=100, help="페이지당 건수(기본 100, 늘리지 않는다)")
    ap.add_argument("--interval", type=float, default=2.0, help="요청 최소 간격(초, 기본 2.0)")
    ap.add_argument("--out", default=None)
    args = ap.parse_args()

    slug = hashlib.md5(args.query.encode()).hexdigest()[:8]
    out = args.out or f"runs/fofa-{slug}.jsonl"
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)

    if os.path.exists(out) and os.path.getsize(out) > 0:
        print(f"[cache] {out} 이(가) 이미 존재한다({os.path.getsize(out)} bytes), 다시 받으려면 먼저 삭제한다", file=sys.stderr)
        return 0

    seen, rows, requests_made, last_ts = set(), [], 0, 0.0
    for page in range(1, args.pages + 1):
        # ---- 속도 제한: 두 요청 사이에 최소 interval 초를 보장한다 ----
        wait = args.interval - (time.time() - last_ts)
        if wait > 0:
            time.sleep(wait)

        status, data = None, None
        for attempt, backoff in enumerate([0] + RETRY_BACKOFF):
            if attempt:
                print(f"[backoff] {backoff}s 대기 후 재시도 (page={page})", file=sys.stderr)
                time.sleep(backoff)
            last_ts = time.time()
            requests_made += 1
            if requests_made > HARD_BUDGET:
                print(f"[stop] 요청 예산 {HARD_BUDGET} 에 도달했다", file=sys.stderr)
                break
            status, data = fetch(args.query, page, args.size)
            if status == 200 and not data.get("error"):
                break
            errmsg = str(data.get("errmsg", ""))
            if "45012" in errmsg or status == 429:
                continue                      # 속도 제한 → 백오프 재시도
            print(f"[stop] 재시도할 수 없는 오류 http={status} {errmsg}", file=sys.stderr)
            data = None
            break
        if data is None:
            break

        results = data.get("results") or []
        print(f"[page {page}] {len(results)} 건 (size={data.get('size')}, 소모 F 포인트={data.get('consumed_fpoint')})", file=sys.stderr)
        for item in results:
            if isinstance(item, str):
                item = [item]
            host = item[0] if len(item) > 0 else ""
            ip = item[1] if len(item) > 1 else ""
            port = item[2] if len(item) > 2 else ""
            key = (host, ip, port)
            if key in seen:
                continue
            seen.add(key)
            rows.append({
                "host": host, "ip": ip, "port": port,
                "title": item[3] if len(item) > 3 else "",
                "domain": item[4] if len(item) > 4 else "",
                "server": item[5] if len(item) > 5 else "",
                "protocol": item[6] if len(item) > 6 else "",
            })
        if len(results) < args.size:
            break                              # 마지막 페이지 도달

    with open(out, "w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")
    print(f"[done] 자산 {len(rows)} 건 → {out}(총 {requests_made} 회 요청)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
PY
```

### 사용법
```bash
mkdir -p runs
python3 runs/fofa_client.py 'domain="example.com"' --pages 2 --size 100 --interval 2.0
python3 runs/fofa_client.py 'cert="example.com"' --pages 3 --interval 2.0
python3 runs/fofa_client.py 'org="<ORG_NAME>"' --pages 2 --interval 2.0
```

### 적재
`runs/fofa-*.jsonl` 을 읽어 건별로 `redteam_asset_add` 를 호출한다: `provenance="passive"`, `tool="fofa"`, 포트에 `url=host`, `title`, `product=server` 를 담고 도메인은 `names` 에 쓴다.

## 자주 쓰는 쿼리
| 목적 | 문장 |
|---|---|
| 특정 도메인의 전체 자산 | `domain="example.com"` |
| 인증서에 해당 도메인 포함 | `cert="example.com"` |
| 특정 C 대역 | `ip="203.0.113.0/24"` |
| 기관 이름 | `org="<ORG_NAME>"` |
| 제목으로 백오피스 찾기 | `title="로그인" && domain="example.com"` |
| body 특징으로 찾기 | `body="/seeyon/"` |
| 포트 지정 | `ip="203.0.113.0/24" && port="3306"` |

> 넓은 문장(단독으로 `body=` / `title=` 사용)은 결과량이 많고 쿼터 소모가 빠르므로 반드시 도메인이나 IP 제한을 겹쳐 쓴다.
