import { parseLockfile } from './lockfile';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

const mockContent = 'LeagueClient:1234:56789:supersecret:https';
const result = parseLockfile(mockContent);

assert(result.name === 'LeagueClient', 'parses name');
assert(result.pid === 1234, 'parses pid');
assert(result.port === 56789, 'parses port');
assert(result.password === 'supersecret', 'parses password');
assert(result.protocol === 'https', 'parses protocol');

try {
  parseLockfile('invalid');
  assert(false, 'should throw on invalid format');
} catch {
  assert(true, 'throws on invalid format');
}

console.log('\nAll lockfile tests passed!');
