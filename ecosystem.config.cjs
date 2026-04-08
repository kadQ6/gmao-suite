const path = require("path");
const { config } = require("dotenv");

const root = __dirname;
config({ path: path.join(root, ".env") });

module.exports = {
  apps: [
    {
      name: "gmao-suite",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: root,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        ...process.env,
      },
    },
  ],
};
