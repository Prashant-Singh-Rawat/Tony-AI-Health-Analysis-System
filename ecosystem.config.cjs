module.exports = {
  apps: [
    {
      name: "heart-ai-frontend",
      script: "npx",
      args: "vite --host",
      cwd: "./frontend",
      interpreter: "none",
      shell: true,
      watch: false,
      autorestart: true,
      max_restarts: 50,
      restart_delay: 5000,
      env: {
        NODE_ENV: "development",
      },
    },
    {
      name: "heart-ai-backend",
      script: "start-backend.bat",
      cwd: ".",
      interpreter: "none",
      shell: true,
      watch: false,
      autorestart: true,
      max_restarts: 50,
      restart_delay: 5000,
      env: {
        PYTHONUNBUFFERED: "1",
      },
    },
  ],
};
