// 로컬 대조 전용: 표적에 접속하지 않고, 표적에서 명령을 실행하지도 않는다.
import { createHash, randomBytes } from 'node:crypto';
const [action, nonce, ...extra] = process.argv.slice(2);
if (action === 'new' && nonce === undefined) {
  console.log(randomBytes(16).toString('hex'));
} else if (action === 'check' && /^[0-9a-f]{32}$/.test(nonce ?? '') && !extra.length) {
  const expected = createHash('sha256').update(nonce, 'ascii').digest('hex');
  let output = Buffer.alloc(0);
  for await (const chunk of process.stdin) {
    if (output.length + chunk.length > 256) { console.error('출력이 너무 깁니다'); process.exit(1); }
    output = Buffer.concat([output, chunk]);
  }
  if (output.toString('utf8').replace(/\r?\n$/, '') === expected) {
    console.log('응답이 일치합니다. 채널과 종료 상태는 따로 확인하세요.');
  } else { console.error('응답이 일치하지 않습니다'); process.exitCode = 1; }
} else { console.error('사용법: exec-proof.mjs new | check <32자리 소문자 16진수> (응답은 stdin 으로)'); process.exitCode = 2; }
