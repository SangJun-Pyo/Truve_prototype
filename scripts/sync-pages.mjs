import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();
const pagesDir = join(rootDir, "src", "pages");

mkdirSync(pagesDir, { recursive: true });

for (const file of readdirSync(pagesDir)) {
  if (!file.endsWith(".html")) continue;
  const srcPath = join(pagesDir, file);
  const dstPath = join(rootDir, file);
  let html = readFileSync(srcPath, "utf8");
  html = html.replaceAll("../../assets/styles.css", "./assets/styles.css");
  html = html.replaceAll("../main/", "./src/main/");
  writeFileSync(dstPath, html, "utf8");
}

console.log("Synced HTML pages from src/pages to project root.");
