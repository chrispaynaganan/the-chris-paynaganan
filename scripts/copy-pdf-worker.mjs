// The document reader runs pdf.js in a web worker, served from public/. Runs after npm install.
import { copyFileSync, existsSync } from "node:fs";

const from = new URL("../node_modules/pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url);
const to = new URL("../public/pdf.worker.min.mjs", import.meta.url);
if (existsSync(from)) {
  copyFileSync(from, to);
  console.log("pdf.js worker copied to public/");
} else {
  console.warn("pdfjs-dist isn't installed yet, so the pdf.js worker wasn't copied");
}
