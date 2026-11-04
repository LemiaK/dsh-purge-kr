---
name: active-scan
description: 능동 포트·서비스 스캔(nmap/masscan), 승인 범위를 엄격히 준수
whenToUse: 자산 생존 여부와 개방 포트를 확인해야 할 때
role: recon
enabled: true
---

## 사전 점검
1. 대상 CIDR 이 승인 범위 안에 있는지 확인한다.
2. 현재 시간대에 능동 스캔이 허용되는지 확인한다.

## 명령
- 빠른 생존 확인: `nmap -sn <cidr>`
- 전체 포트(속도 제한): `nmap -sS -p- --min-rate 1000 -T4 <target> -oX runs/nmap-full.xml`
- 서비스 버전: `nmap -sV -sC -p <ports> <target> -oX runs/nmap-svc.xml`

## 로컬에 준비된 도구(절대 경로, 우선 사용하고 직접 만들지 않는다)
| 용도 | 명령 |
| --- | --- |
| 포트 스캔 | `nmap` / `masscan` / `~/.dsh/redteam/toolkit/naabu/naabu`(SYN 은 root 필요, 아니면 `-scan-type c` 추가) |
| 내부망 종합 스캔 | `~/.dsh/redteam/toolkit/fscan/fscan`(스킬 fscan-intranet) |
| 내부망 측정/지문 | `~/.dsh/redteam/toolkit/gogo/gogo`(스킬 gogo-intranet) |
| HTTP 탐지(ProjectDiscovery) | `~/.local/bin/pd-httpx`(**주의: `/usr/bin/httpx` 는 Python httpx 라이브러리의 CLI 이며 이것이 아니다**) |
| 서브도메인/해석 | `~/.dsh/redteam/toolkit/subfinder/subfinder`, `~/.dsh/redteam/toolkit/dnsx/dnsx` |
| POC 스캔 | `nuclei`(템플릿은 `~/.local/nuclei-templates` 에 있음) |
| 디렉터리 브루트포스 | `ffuf`, `~/.dsh/redteam/toolkit/dirsearch/dirsearch` |
| 터널 | `~/.dsh/redteam/toolkit/suo5/suo5-linux-amd64`, `toolkit/chisel/chisel`, `toolkit/frp/{frpc,frps}` |
| 전체 목록 | `~/.dsh/redteam/toolkit/` 아래의 도구 목록 문서와 스킬 도구 목록 문서 |

`setup.sh` 는 dirsearch 를 내려받지 않는다. 목록 문서는 설명 파일이므로 그것이 없다고 해서 스캐너가 설치되지 않았다는 뜻은 아니다. Windows 와 ARM 빌드도 설치 스크립트에 포함되지 않는다.

## 적재 요구사항
provenance = `active`, tool = `nmap`/`masscan` 으로 하고 scan_run 을 기록한다.
