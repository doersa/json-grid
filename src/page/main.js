// 入口：渲染调度（pm 桩截获模板、组装 srcdoc）、按钮与输入事件绑定、初始化。
// 由单文件 index.html 拆分而来；DOM 句柄与 UI 状态集中在 state.js（el / ui）。

import { STORAGE_KEY, el, ui } from "./state.js";
import { locateJsonPath, pathFromInputCursor } from "./json-cursor.js";
import { capturePreviewStateFromDom, errorPreview, flushPreviewFocus, focusPreviewPath, iframeBridgeScript, restorePreviewState } from "./preview.js";
import { sampleJson } from "./sample-data.js";
import { bindSplitResizer, formatBytes, initInputPaneToggle, initSplitWidth, setStatus } from "./split-pane.js";
export function renderNow(options = {}) {
  const replaceOnInvalid = options.replaceOnInvalid === true;
  const stateBeforeRender = ui.hasRenderedPreview ? capturePreviewStateFromDom() : ui.previewState;
  if (stateBeforeRender) ui.previewState = stateBeforeRender;
  const responseText = el.input.value.trim();
  localStorage.setItem(STORAGE_KEY, el.input.value);

  if (!responseText) {
    setStatus('请输入 JSON', 'error');
    if (replaceOnInvalid || !ui.hasRenderedPreview) errorPreview('请输入 JSON');
    return;
  }

  try {
    JSON.parse(responseText);
  } catch (err) {
    setStatus('JSON 解析失败，右侧保持上次有效表格', 'error');
    if (replaceOnInvalid || !ui.hasRenderedPreview) {
      errorPreview(err && (err.message || String(err)));
    }
    return;
  }

  let capturedTemplate = '';
  let capturedData = { raw: responseText };
  const pm = {
    response: {
      text: () => responseText,
      json: () => JSON.parse(responseText)
    },
    visualizer: {
      set: (template, data) => {
        capturedTemplate = template;
        capturedData = data || { raw: responseText };
      }
    }
  };

  try {
    window.__jsonGridVisualizer(pm);
    const raw = JSON.stringify(capturedData.raw || responseText).replace(/<\//g, '<\/');
    const pmShim = '<script>window.pm={getData:function(cb){cb(null,{raw:' + raw + '});}};<\/script>';
    const bridgeId = ++ui.previewBridgeId;
    const stateToRestore = ui.previewState && JSON.parse(JSON.stringify(ui.previewState));
    ui.previewRestoringUntil = stateToRestore ? Date.now() + 1200 : 0;
    el.preview.onload = () => restorePreviewState(stateToRestore, bridgeId);
    el.preview.srcdoc = pmShim + capturedTemplate + iframeBridgeScript(bridgeId);
    ui.hasRenderedPreview = true;
    setStatus('已渲染 · ' + formatBytes(responseText), 'ok');
  } catch (err) {
    setStatus('渲染失败', 'error');
    errorPreview(err && (err.stack || err.message || String(err)));
  }
}

export function scheduleRender() {
  clearTimeout(ui.renderTimer);
  ui.renderTimer = setTimeout(renderNow, 260);
}

window.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.bridgeId && data.bridgeId !== ui.previewBridgeId) return;
  if (data.type === 'json-table-state') {
    if (Date.now() < ui.previewRestoringUntil && data.reason !== 'restored') return;
    ui.previewState = data.state || ui.previewState;
    if (data.reason === 'ready' || data.reason === 'restored') flushPreviewFocus();
    if (data.reason === 'restored') ui.previewRestoringUntil = 0;
    return;
  }
  if (data.type === 'json-table-focus-result') {
    if (ui.pendingPreviewFocus && data.focusId === ui.pendingPreviewFocus.focusId && data.ok) {
      ui.pendingPreviewFocus = null;
    }
    return;
  }
  if (data.type === 'json-table-cell-click' && data.path) {
    locateJsonPath(data.path);
  }
});

document.getElementById('renderBtn').onclick = renderNow;
document.getElementById('formatBtn').onclick = () => {
  try {
    el.input.value = JSON.stringify(JSON.parse(el.input.value), null, 2);
    renderNow();
  } catch (err) {
    setStatus('格式化失败：JSON 无效', 'error');
  }
};
document.getElementById('minifyBtn').onclick = () => {
  try {
    el.input.value = JSON.stringify(JSON.parse(el.input.value));
    renderNow();
  } catch (err) {
    setStatus('压缩失败：JSON 无效', 'error');
  }
};
document.getElementById('sampleBtn').onclick = () => {
  el.input.value = sampleJson;
  renderNow();
};
document.getElementById('clearBtn').onclick = () => {
  el.input.value = '';
  renderNow({ replaceOnInvalid: true });
  el.input.focus();
};
el.input.addEventListener('input', scheduleRender);
el.input.addEventListener('click', () => {
  setTimeout(() => {
    const path = pathFromInputCursor();
    if (!path) return;
    focusPreviewPath(path);
    setStatus('右侧定位 · ' + path, 'ok');
  }, 0);
});

initInputPaneToggle();
initSplitWidth();
bindSplitResizer();
el.input.value = localStorage.getItem(STORAGE_KEY) || sampleJson;
renderNow();