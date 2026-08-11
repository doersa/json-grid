// 左右分栏：拖拽调宽、面板折叠、状态栏、宽度持久化。
// 由单文件 index.html 拆分而来；DOM 句柄与 UI 状态集中在 state.js（el / ui）。

import { PANE_COLLAPSED_KEY, SPLIT_HANDLE_WIDTH, SPLIT_KEY, SPLIT_MIN_LEFT, SPLIT_MIN_RIGHT, el } from "./state.js";
export function setStatus(text, type) {
  el.status.textContent = text;
  el.status.className = 'status' + (type ? ' ' + type : '');
}

export function setInputPaneCollapsed(collapsed) {
  el.app.classList.toggle('input-collapsed', collapsed);
  el.paneToggleBtn.textContent = collapsed ? '显示' : '‹';
  el.paneToggleBtn.title = collapsed ? '显示左侧 JSON' : '隐藏左侧 JSON';
  el.paneToggleBtn.setAttribute('aria-pressed', String(collapsed));
  localStorage.setItem(PANE_COLLAPSED_KEY, collapsed ? '1' : '0');
}

export function initInputPaneToggle() {
  const collapsed = localStorage.getItem(PANE_COLLAPSED_KEY) === '1';
  setInputPaneCollapsed(collapsed);
  el.paneToggleBtn.addEventListener('click', () => {
    setInputPaneCollapsed(!el.app.classList.contains('input-collapsed'));
  });
}

export function formatBytes(chars) {
  const bytes = new Blob([chars]).size;
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

export function clampLeftWidth(width) {
  const max = Math.max(SPLIT_MIN_LEFT, window.innerWidth - SPLIT_MIN_RIGHT - SPLIT_HANDLE_WIDTH);
  return Math.min(max, Math.max(SPLIT_MIN_LEFT, Math.round(width)));
}

export function setLeftWidth(width, shouldPersist = true) {
  const nextWidth = clampLeftWidth(width);
  el.app.style.setProperty('--left-pane-width', nextWidth + 'px');
  if (shouldPersist) localStorage.setItem(SPLIT_KEY, String(nextWidth));
}

export function initSplitWidth() {
  const saved = Number(localStorage.getItem(SPLIT_KEY));
  if (Number.isFinite(saved) && saved > 0) {
    setLeftWidth(saved, false);
    return;
  }

  setLeftWidth(window.innerWidth * 0.25, false);
}

export function bindSplitResizer() {
  el.splitResizer.addEventListener('pointerdown', (event) => {
    if (event.target === el.paneToggleBtn || el.app.classList.contains('input-collapsed')) return;
    event.preventDefault();
    document.body.classList.add('resizing-layout');
    el.splitResizer.classList.add('active');
    el.splitResizer.setPointerCapture(event.pointerId);

    const appRect = el.app.getBoundingClientRect();
    const onMove = (moveEvent) => {
      setLeftWidth(moveEvent.clientX - appRect.left);
    };
    const onUp = (upEvent) => {
      document.body.classList.remove('resizing-layout');
      el.splitResizer.classList.remove('active');
      if (el.splitResizer.hasPointerCapture(upEvent.pointerId)) {
        el.splitResizer.releasePointerCapture(upEvent.pointerId);
      }
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  });

  window.addEventListener('resize', () => {
    const current = Number(localStorage.getItem(SPLIT_KEY)) || window.innerWidth * 0.25;
    setLeftWidth(current, Boolean(localStorage.getItem(SPLIT_KEY)));
  });
}