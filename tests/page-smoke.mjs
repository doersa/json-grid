// 宿主页面冒烟测试：用 jsdom 加载 index.html（file:// 经典 script），
// 验证页面启动、示例数据渲染、预览 srcdoc 组装（pm 桩 + 模板 + 桥接脚本）。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import jsdomPkg from "jsdom";
const { JSDOM } = jsdomPkg;

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let failures = 0;
const check = (label, ok, extra) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : extra ? `\n      ${extra}` : ""}`);
  if (!ok) failures += 1;
};

// 把两个 dist 产物内联进 HTML（dist 已保证无裸 </script），
// 以 https://localhost/ 为 URL 避免 file:// 不透明源禁用 localStorage。
let html = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const name of ["visualizer.js", "page.js"]) {
  const code = fs.readFileSync(path.join(root, "dist", name), "utf8");
  html = html.replace(`<script src="dist/${name}"></script>`, () => `<script>\n${code}\n</script>`);
}
if (html.includes("<script src=")) throw new Error("script 内联失败");

const dom = new JSDOM(html, {
  url: "https://localhost/index.html",
  runScripts: "dangerously",
  pretendToBeVisual: true,
});
const { window } = dom;

// 等待外部脚本加载与首渲染
await new Promise((resolve) => {
  if (window.document.readyState === "complete") return resolve();
  window.addEventListener("load", resolve);
});
await new Promise((r) => setTimeout(r, 300));

const doc = window.document;

check("window.__jsonGridVisualizer 已暴露", typeof window.__jsonGridVisualizer === "function");
check("左侧编辑器填充了示例 JSON", (doc.querySelector("#jsonEditor .cm-content")?.textContent || "").includes("request_id"));

const status = doc.getElementById("status")?.textContent || "";
check("状态栏显示已渲染", status.startsWith("已渲染"), status);

const srcdoc = doc.getElementById("preview")?.getAttribute("srcdoc") || "";
check("srcdoc 非空", srcdoc.length > 10000, `长度 ${srcdoc.length}`);
check("srcdoc 含 pm 桩", srcdoc.startsWith('<script>window.pm={getData:function(cb){cb(null,{raw:'), srcdoc.slice(0, 90));
check("srcdoc 含模板骨架", srcdoc.includes('<div class="app">') && srcdoc.includes('id="content"'));
check("srcdoc 含桥接脚本", srcdoc.includes("json-table-cell-click") && srcdoc.includes("BRIDGE_ID"));
check("srcdoc 中引擎就位", srcdoc.includes("pm.getData(function"));

// 注：iframe srcdoc 内部的引擎执行由 tests/equivalence.mjs 直接覆盖
// （jsdom 不为 srcdoc 子框架执行脚本，这里只验证 srcdoc 组装正确）。

console.log(failures ? `\n${failures} 项失败` : "\n全部通过");
window.close();
process.exit(failures ? 1 : 0);
