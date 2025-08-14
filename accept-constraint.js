import { spawn } from 'child_process';

const child = spawn('npm', ['run', 'db:push'], {
  stdio: ['pipe', 'inherit', 'inherit']
});

setTimeout(() => {
  child.stdin.write('\n');
  child.stdin.end();
}, 2000);

child.on('exit', (code) => {
  process.exit(code);
});
