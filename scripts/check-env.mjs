import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^"(.*)"$/, "$1");
    if (!process.env[key]) process.env[key] = value;
  }
}

const required = ["DATABASE_URL", "NEXTAUTH_URL", "NEXTAUTH_SECRET"];

const missing = required.filter((key) => {
  const value = process.env[key];
  return !value || String(value).trim().length === 0;
});

if (missing.length > 0) {
  console.error("Missing required env vars:", missing.join(", "));
  process.exit(1);
}

if (process.env.NEXTAUTH_SECRET === "change-this-in-production") {
  console.error("NEXTAUTH_SECRET must be changed for production.");
  process.exit(1);
}

if (!process.env.NEXTAUTH_URL?.startsWith("https://")) {
  console.error("NEXTAUTH_URL must use https:// in production.");
  process.exit(1);
}

console.log("Environment looks good.");
