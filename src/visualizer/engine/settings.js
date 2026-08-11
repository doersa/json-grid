// 设置面板：显隐列、复制/导出、路径收藏与最近路径。
// 由单文件 index.html 拆分而来；共享状态集中在 state.js（state / dom 两个对象）。

import { dom, state } from "./state.js";
import { getFrozenColumns, getHiddenColumns, isColumnFrozen, setColumnFrozen, setColumnVisible } from "./columns.js";
import { setRootPath } from "./paths.js";
import { copyText, esc } from "./utils.js";
export function updateSettingsPanel() {
  dom.showTypeCheck.checked = state.showTypeColumn;
  dom.freezeHeaderCheck.checked = state.freezeHeader;
  dom.showStickyHeaderCheck.checked = state.showStickyHeader;
  dom.parseJsonStringCheck.checked = state.parseJsonString;
  dom.headerModeSelect.value = state.stickyHeaderMode;
  dom.favPathBtn.textContent = state.favoritePaths[state.selectedPath] ? "取消收藏当前路径" : "收藏当前路径";
  renderColumnSettingsPanel();
  renderPathShortcuts();
}

export function renderColumnSettingsPanel() {
  if (!state.currentAllColumns.length) {
    dom.columnSettings.innerHTML = '<div class="muted" style="padding:6px 8px">当前不是对象数组表格</div>';
    return;
  }

  var hidden = getHiddenColumns(state.tablePath);
  var frozenSet = getFrozenColumns(state.tablePath);
  dom.columnSettings.innerHTML = state.currentAllColumns.map(function (col) {
    var checked = hidden[col] ? "" : " checked";
    var fz = frozenSet[col];
    var fzIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 7V5.5a3 3 0 0 1 6 0V7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path class="lock-body" d="M4 7h8a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    return '<div class="setting-row"><label class="col-label"><input class="column-check" type="checkbox" data-col="' + esc(col) + '"' + checked + '><span class="col-name">' + esc(col) + '</span></label><button class="freeze-toggle' + (fz ? " active" : "") + '" data-col="' + esc(col) + '" title="冻结/解冻此列">' + fzIcon + '</button></div>';
  }).join("");
}

export function renderPathShortcuts() {
  var paths = Object.keys(state.favoritePaths).concat(state.recentPaths).filter(function (path, index, arr) {
    return path && arr.indexOf(path) === index;
  });
  if (!paths.length) {
    dom.pathShortcuts.innerHTML = '<div class="muted" style="padding:6px 8px">暂无路径</div>';
    return;
  }
  dom.pathShortcuts.innerHTML = paths.map(function (path) {
    var star = state.favoritePaths[path] ? "★ " : "";
    return '<button class="path-chip path-shortcut" data-path="' + esc(path) + '" title="' + esc(path) + '">' + star + esc(path) + '</button>';
  }).join("");
}

export function bindSettingsPanelEvents() {
  Array.prototype.forEach.call(dom.settingsMenu.querySelectorAll(".column-check"), function (input) {
    input.onchange = function () {
      setColumnVisible(state.tablePath, input.getAttribute("data-col"), input.checked);
    };
  });

  Array.prototype.forEach.call(dom.settingsMenu.querySelectorAll(".freeze-toggle"), function (btn) {
    btn.onclick = function (event) {
      event.preventDefault();
      event.stopPropagation();
      setColumnFrozen(state.tablePath, btn.getAttribute("data-col"), !isColumnFrozen(state.tablePath, btn.getAttribute("data-col")));
    };
  });

  Array.prototype.forEach.call(dom.settingsMenu.querySelectorAll(".path-shortcut"), function (btn) {
    btn.onclick = function (event) {
      event.preventDefault();
      setRootPath(btn.getAttribute("data-path"));
      dom.settingsMenu.hidden = true;
    };
  });
}

export function bindCopyEvents() {
  Array.prototype.forEach.call(dom.content.querySelectorAll("td"), function (cell) {
    cell.ondblclick = function (event) {
      event.stopPropagation();
      var value = cell.getAttribute("data-copy");
      copyText(value !== null ? value : (cell.innerText || cell.textContent || ""));
    };
    cell.title = cell.title || "双击复制单元格值";
  });
}