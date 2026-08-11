// 宿主页面的 DOM 句柄、持久化键与可变 UI 状态。
// 脚本在 body 末尾加载（dist/page.js），模块求值时 DOM 已就绪。

export const STORAGE_KEY = 'json-table-split-input-v3';
export const SPLIT_KEY = 'json-table-split-left-width-v1';
export const PANE_COLLAPSED_KEY = 'json-table-split-input-collapsed-v1';
export const SPLIT_MIN_LEFT = 220;
export const SPLIT_MIN_RIGHT = 320;
export const SPLIT_HANDLE_WIDTH = 8;

export const el = {
  app: document.querySelector('.app'),
  input: document.getElementById('jsonInput'),
  preview: document.getElementById('preview'),
  status: document.getElementById('status'),
  splitResizer: document.getElementById('splitResizer'),
  paneToggleBtn: document.getElementById('paneToggleBtn'),
};

export const ui = {
  renderTimer: null,
  previewState: null,
  previewBridgeId: 0,
  previewRestoringUntil: 0,
  hasRenderedPreview: false,
  pendingPreviewFocus: null,
  previewFocusSeq: 0,
};
