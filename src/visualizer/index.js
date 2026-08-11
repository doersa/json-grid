// 可视化入口（Web / Apifox 双模式的单真源）。
//
// 渲染产物是一个自包含 HTML 模板：<style> + 骨架 + <script> 引擎。
// - Apifox / Postman：粘贴 dist/visualizer.js 后，全局 pm 原生存在，自动执行 run(pm)。
// - Web 宿主页面：全局 pm 不存在，仅暴露 window.__jsonGridVisualizer，
//   由页面用 pm 桩调用以截获模板，再写入预览 iframe 的 srcdoc。
//
// 引擎在模板内部只通过 window.pm.getData(cb) 拿数据（cb(null, { raw })），
// 两种模式的 pm 都必须遵守这个契约。
import css from "./visualizer.css";
import skeleton from "./skeleton.html";
import engineSource from "virtual:engine-bundle";

export function buildTemplate() {
  // 引擎内联进 <script>，其中不能出现裸 "</script"（浏览器解析 srcdoc 时会提前闭合脚本）。
  // 只转义这个特定序列：对 JS 字符串/模板文本 "<\/" 与 "</" 等价，
  // 但不能全文替换 "</"——正则字面量 /</g 里的 "/" 是闭合符，转义后会吞掉后续代码。
  const engine = engineSource.replace(/<\/script/gi, "<\\/script");
  return "<style>" + css + "</style>" + skeleton + "<script>" + engine + "</script>";
}

export function run(pm) {
  let raw = pm.response.text();

  try {
    const root = pm.response.json();
    const payload = root && Object.prototype.hasOwnProperty.call(root, "DATA")
      ? root.DATA
      : root && Object.prototype.hasOwnProperty.call(root, "data")
        ? root.data
        : root;

    raw = JSON.stringify(payload, null, 2);
  } catch (e) {}

  pm.visualizer.set(buildTemplate(), { raw });
}

if (typeof pm !== "undefined" && pm && typeof pm.visualizer !== "undefined") {
  run(pm);
} else if (typeof window !== "undefined") {
  window.__jsonGridVisualizer = run;
}
