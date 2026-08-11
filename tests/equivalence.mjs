// 行为等价测试：重构后的模板与 2623857（单文件版）捕获的 legacy 模板逐 DOM 比对。
//
//   1. 运行 dist/visualizer.js（pm 桩）截获新模板；
//   2. 新模板的 <style> / 骨架部分须与 legacy 逐字节一致（防止样式/骨架被意外改动）；
//   3. 对多组 JSON 样本，分别在 jsdom 中执行 legacy 模板与新模板，
//      初始渲染 + 交互（切换原始视图）后的关键区域 innerHTML 必须完全相等。
//
// 运行：npm test（自动先执行构建）
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const node = process.execPath;

let failures = 0;
function check(label, ok, extra) {
  if (ok) {
    console.log(`PASS  ${label}`);
  } else {
    failures += 1;
    console.log(`FAIL  ${label}${extra ? `\n      ${extra}` : ""}`);
  }
}

// ---------- 0. 构建 ----------
execFileSync(node, [path.join(root, "scripts/build.mjs")], { stdio: "pipe" });

// ---------- 1. 截获新模板 ----------
const dist = fs.readFileSync(path.join(root, "dist/visualizer.js"), "utf8");

function captureTemplate(raw) {
  let captured = null;
  let capturedData = null;
  const pmStub = {
    response: { text: () => raw, json: () => JSON.parse(raw) },
    visualizer: { set: (tpl, data) => { captured = tpl; capturedData = data; } },
  };
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.runInNewContext(dist, sandbox);
  if (typeof sandbox.__jsonGridVisualizer !== "function") throw new Error("dist 未暴露 __jsonGridVisualizer");
  sandbox.__jsonGridVisualizer(pmStub);
  return { template: captured, data: capturedData };
}

const sampleRaw = fs.readFileSync(path.join(root, "src/page/sample-data.json"), "utf8").trim();
const { template: newTemplate } = captureTemplate(sampleRaw);
check("dist/visualizer.js Web 模式截获模板", typeof newTemplate === "string" && newTemplate.length > 10000);

// ---------- 2. 样式与骨架逐字节比对 ----------
const legacy = fs.readFileSync(path.join(root, "tests/fixtures/legacy-template.txt"), "utf8");
const styleOf = (t) => t.match(/<style>([\s\S]*?)<\/style>/)[1];
const scriptOf = (t) => t.match(/<script>([\s\S]*?)<\/script>\s*$/)[0];
const skeletonOf = (t) => t.slice(t.indexOf("</style>") + "</style>".length, t.length - scriptOf(t).length);

check("模板 <style> 与 legacy 逐字节一致", styleOf(newTemplate) === styleOf(legacy));
check("模板骨架与 legacy 逐字节一致", skeletonOf(newTemplate) === skeletonOf(legacy));
check("dist 无裸 </script（防 HTML 截断）", !/<\/script/i.test(dist));

// ---------- 3. jsdom 行为等价 ----------
function renderInJsdom(template, raw) {
  const dom = new JSDOM(template, {
    runScripts: "dangerously",
    pretendToBeVisual: true,
    url: "https://localhost/",
    beforeParse(window) {
      window.pm = { getData: (cb) => cb(null, { raw }) };
    },
  });
  return dom;
}

function snapshot(dom, label) {
  const doc = dom.window.document;
  const parts = [];
  for (const id of ["meta", "pathSelect", "filterChips", "content"]) {
    const el = doc.getElementById(id);
    parts.push(`#${id}:` + (el ? el.innerHTML : "<missing>"));
  }
  return parts.join(`\n@@${label}@@\n`);
}

const fixtures = {
  "示例数据（嵌套/坏 JSON/JSON 字符串）": sampleRaw,
  "记录数组": JSON.stringify([{ x: 1, y: "a", z: null }, { x: 2, y: "b", z: true }], null, 2),
  "纯对象": JSON.stringify({ a: 1, b: [1, 2, 3], c: { d: "e" } }, null, 2),
  "非 JSON 文本": "this is not json",
  "空对象": "{}",
};

for (const [name, raw] of Object.entries(fixtures)) {
  const legacyDom = renderInJsdom(legacy, raw);
  const newDom = renderInJsdom(newTemplate, raw);
  const l0 = snapshot(legacyDom, "init");
  const n0 = snapshot(newDom, "init");
  check(`[${name}] 初始渲染一致`, l0 === n0, diffHint(l0, n0));

  // 交互：切换「原始/表格」视图再切回
  const toggleBoth = (dom) => {
    dom.window.document.getElementById("toggle").click();
    return snapshot(dom, "toggle");
  };
  const l1 = toggleBoth(legacyDom);
  const n1 = toggleBoth(newDom);
  check(`[${name}] 切换原始视图一致`, l1 === n1, diffHint(l1, n1));

  legacyDom.window.close();
  newDom.window.close();
}

// ---------- 4. 入口 DATA/data 解包 ----------
{
  let capturedData = null;
  const pmStub = {
    response: { text: () => '{"DATA":{"list":[1,2]}}', json: () => ({ DATA: { list: [1, 2] } }) },
    visualizer: { set: (tpl, data) => { capturedData = data; } },
  };
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.runInNewContext(dist, sandbox);
  sandbox.__jsonGridVisualizer(pmStub);
  check(
    "入口解包 DATA 字段",
    capturedData && capturedData.raw === JSON.stringify({ list: [1, 2] }, null, 2),
    capturedData && capturedData.raw
  );
}

function diffHint(a, b) {
  if (a === b) return "";
  let i = 0;
  while (i < Math.min(a.length, b.length) && a[i] === b[i]) i += 1;
  return `首个差异位置 ${i}:\n      legacy: ...${JSON.stringify(a.slice(Math.max(0, i - 60), i + 80))}\n      new:    ...${JSON.stringify(b.slice(Math.max(0, i - 60), i + 80))}`;
}

console.log(failures ? `\n${failures} 项失败` : "\n全部通过");
process.exit(failures ? 1 : 0);
