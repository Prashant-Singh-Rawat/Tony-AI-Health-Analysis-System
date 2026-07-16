const { spawn } = require('child_process');
const path = require('path');

const root = __dirname;
const backendDir = path.join(root, 'backend');
const python = path.join(backendDir, '.venv', 'Scripts', 'python.exe');

const child = spawn(
  python,
  ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8001'],
  {
    cwd: backendDir,
    stdio: 'inherit',
  },
);

child.on('exit', (code, signal) => {
  console.error(`Backend exited with code ${code ?? 'null'} and signal ${signal ?? 'null'}`);
  process.exit(code ?? 1);
});

process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
