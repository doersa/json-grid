// 通用工具：HTML 转义、类型/摘要格式化、localStorage 安全读写、剪贴板、Toast、下载、CSV。
// 由单文件 index.html 拆分而来；共享状态集中在 state.js（state / dom 两个对象）。

import { dom, state } from "./state.js";
import { setRootPath } from "./paths.js";
export function esc(v) {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function isPlainObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

export function isObj(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

export function safeStorageGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}

export function safeStorageSet(key, value) {
  try { localStorage.setItem(key, value); } catch (e) {}
}

export function setMeta(html) {
  dom.meta.innerHTML = html;
  Array.prototype.forEach.call(dom.meta.querySelectorAll(".meta-path-btn"), function (btn) {
    btn.onclick = function (event) {
      event.stopPropagation();
      setRootPath(btn.getAttribute("data-path"));
    };
  });
}

export function highlightText(text) {
  var rawText = String(text);
  var q = dom.globalSearch.value.trim();
  if (!q) return esc(rawText);

  var lower = rawText.toLowerCase();
  var needle = q.toLowerCase();
  var html = "";
  var from = 0;
  var index = lower.indexOf(needle);

  while (index >= 0) {
    html += esc(rawText.slice(from, index));
    html += '<span class="search-hit">' + esc(rawText.slice(index, index + q.length)) + '</span>';
    from = index + q.length;
    index = lower.indexOf(needle, from);
  }

  return html + esc(rawText.slice(from));
}

export function typeOf(v) {
  if (Array.isArray(v)) return "array";
  if (v === null) return "null";
  return typeof v;
}

export function valueText(v) {
  if (v === undefined) return "";
  if (v === null) return "null";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return JSON.stringify(v);
}

export function summarize(v) {
  if (v === undefined) return "";
  if (v === null) return "null";
  if (Array.isArray(v)) return "[" + v.length + " items]";
  if (isObj(v)) return "{" + Object.keys(v).length + " keys}";
  return String(v);
}

export function tryParseJsonStringValue(v) {
  if (!state.parseJsonString || typeof v !== "string") return null;

  var text = v.trim();
  if (!text || (text[0] !== "{" && text[0] !== "[")) return null;

  try {
    var parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (e) {
    state.parseFailureSamples[text.slice(0, 120)] = true;
    return null;
  }
}

export function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () {
      showToast("已复制");
    }).catch(function () {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

export function fallbackCopy(text) {
  var ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch (e) {}
  document.body.removeChild(ta);
  showToast("已复制");
}

export function showToast(text) {
  var old = document.querySelector(".toast");
  if (old && old.parentNode) old.parentNode.removeChild(old);
  var div = document.createElement("div");
  div.className = "toast";
  div.textContent = text;
  document.body.appendChild(div);
  setTimeout(function () {
    if (div.parentNode) div.parentNode.removeChild(div);
  }, 1200);
}

export function downloadFile(name, text, type) {
  var blob = new Blob([text], { type: type || "text/plain" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
}

export function csvEscape(value) {
  var text = valueText(value);
  return '"' + text.replace(/"/g, '""') + '"';
}

export function rowsToCsv(rows, cols) {
  var lines = [cols.map(csvEscape).join(",")];
  rows.forEach(function (row) {
    lines.push(cols.map(function (col) {
      return csvEscape(row ? row[col] : undefined);
    }).join(","));
  });
  return lines.join("\n");
}

export function getExportRows() {
  if (state.currentRows && state.currentRows.length) return state.currentRows;
  var node = state.nodesByPath[state.selectedPath];
  return Array.isArray(node) ? node : [node];
}