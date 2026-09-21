import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Walk the built client chunks and find the embed URL builder we shipped.
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".js")) out.push(p);
  }
  return out;
}

const files = walk(".next/static");
let found = null;

for (const f of files) {
  const s = readFileSync(f, "utf8");
  if (s.includes("chartTimeframesToolbar")) {
    const i = s.indexOf("chartTimeframesToolbar");
    found = { f, snippet: s.slice(Math.max(0, i - 420), i + 200) };
    break;
  }
}

if (!found) {
  console.log("FAIL: embed params not present in client bundle");
  process.exit(1);
}

console.log("embed builder shipped in:", found.f);
console.log(found.snippet.replace(/\n/g, " "));

// Now assert the URL it builds actually resolves.
const pool = "FqkYry3jpRJ21HuJdZ5A8ergQ6qxpaEc3dFcr6kSAxUS";
const params = new URLSearchParams({
  embed: "1",
  theme: "dark",
  chartTheme: "dark",
  chartType: "marketCap",
  interval: "1S",
  info: "0",
  trades: "0",
  nav: "0",
  chartLeftToolbar: "0",
  chartTimeframesToolbar: "1",
  chartDefaultOnMobile: "1",
});
const url = `https://dexscreener.com/solana/${pool}?${params}`;

const res = await fetch(url, {
  headers: {
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
  },
});
const html = await res.text();
const title = html.match(/<title[^>]*>([^<]+)</)?.[1] ?? "(none)";

console.log("\nembed URL:", url);
console.log("status:", res.status);
console.log("x-frame-options:", res.headers.get("x-frame-options") ?? "(absent → framing allowed)");
const csp = res.headers.get("content-security-policy");
console.log("csp frame-ancestors:", csp?.match(/frame-ancestors[^;]*/)?.[0] ?? "(absent → framing allowed)");
console.log("title:", title);
