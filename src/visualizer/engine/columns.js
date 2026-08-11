// 列模型与布局：列收集、显隐/冻结状态、列宽拖拽、冻结定位。
// 由单文件 index.html 拆分而来；共享状态集中在 state.js（state / dom 两个对象）。

import { dom, state } from "./state.js";
import { render } from "./render.js";
import { isObj, showToast } from "./utils.js";
export function collectColumns(rows) {
  var cols = [];
  rows.forEach(function (row) {
    if (!isObj(row)) return;
    Object.keys(row).forEach(function (k) {
      if (cols.indexOf(k) < 0) cols.push(k);
    });
  });
  return cols;
}

export function getHiddenColumns(path) {
  state.hiddenColumnsByPath[path] = state.hiddenColumnsByPath[path] || {};
  return state.hiddenColumnsByPath[path];
}

export function getVisibleColumns(cols, path) {
  var hidden = getHiddenColumns(path);
  var visible = cols.filter(function (col) {
    return !hidden[col];
  });
  return visible.length ? visible : cols;
}

export function setColumnVisible(path, col, visible) {
  var hidden = getHiddenColumns(path);
  if (visible) {
    delete hidden[col];
  } else {
    hidden[col] = true;
  }
  savePersistedState();
  render();
}

export function getFrozenColumns(path) {
  // Read-only: never create an entry on read, otherwise every visited
  // table path (especially nested ones) pollutes frozenColumnsByPath and
  // gets persisted to localStorage indefinitely (L1).
  return state.frozenColumnsByPath[path] || {};
}

export function ensureFrozenColumns(path) {
  if (!state.frozenColumnsByPath[path]) state.frozenColumnsByPath[path] = {};
  return state.frozenColumnsByPath[path];
}

export function isColumnFrozen(path, col) {
  return !!getFrozenColumns(path)[col];
}

export function setColumnFrozen(path, col, frozen) {
  var frozenSet = ensureFrozenColumns(path);
  if (frozen) {
    frozenSet[col] = true;
  } else {
    delete frozenSet[col];
  }
  // L9: warn when freezing leaves no non-frozen column on the root table —
  // once every column is pinned to the left edge, horizontal scrolling
  // becomes useless.
  if (frozen && path === state.tablePath) {
    var visible = getVisibleColumns(state.currentAllColumns, path);
    if (visible.length && visible.every(function (c) { return frozenSet[c]; })) {
      showToast("已冻结全部列，横向滚动将失效（建议至少保留一列非冻结）");
    }
  }
  savePersistedState();
  render();
}

export function setColumnWidth(table, index, width) {
  var tableId = table.getAttribute("data-table-id") || "$";
  var th = table.tHead && table.tHead.rows[0] && table.tHead.rows[0].cells[index];
  var colKey = th ? th.getAttribute("data-col-key") || String(index) : String(index);
  state.columnWidths[tableId + "::" + colKey] = width;

  Array.prototype.forEach.call(table.rows, function (row) {
    var cell = row.cells && row.cells[index];
    if (!cell) return;
    cell.style.width = width + "px";
    cell.style.minWidth = width + "px";
  });
  // Frozen columns are reordered to the front, so a non-frozen column's
  // width change never shifts frozen left offsets (H1). Only recompute
  // when the dragged column is itself frozen.
  if (th && th.classList.contains("frozen-col")) {
    applyFrozenLayout();
  }
}

export function applyFrozenLayout() {
  // Process every grid (root AND nested) so frozen columns in nested
  // tables are laid out too.
  var tables = dom.content.querySelectorAll("table.grid");
  for (var t = 0; t < tables.length; t++) {
    var table = tables[t];
    if (!table.tHead || !table.tHead.rows.length) continue;
    var ths = table.tHead.rows[0].cells;
    var rows = table.tBodies[0] ? table.tBodies[0].rows : [];

    // Batch 1 — read every frozen column width FIRST. Reads interleaved
    // with writes force one synchronous reflow per frozen column (H1);
    // reading them all up front collapses that to a single reflow.
    var widths = new Array(ths.length);
    var firstW = -1;
    for (var i = 0; i < ths.length; i++) {
      var th = ths[i];
      if (!th.classList.contains("frozen-col")) {
        widths[i] = -1;
        continue;
      }
      var w = th.getBoundingClientRect().width;
      if (firstW < 0) firstW = w;
      widths[i] = w;
    }

    // L2: if layout isn't ready (e.g. a backgrounded tab where widths
    // measure 0), don't paint stale/off-by offsets — wait for the
    // visibilitychange / ResizeObserver re-run instead.
    if (firstW <= 0) continue;

    // Batch 2 — write all offsets/z-index. Background is delegated to CSS
    // (.frozen-col rules) so future row/zebra/selected backgrounds aren't
    // clobbered by inline styles (L6).
    var left = 0;
    for (var j = 0; j < ths.length; j++) {
      var t2 = ths[j];
      if (!t2.classList.contains("frozen-col")) continue;
      t2.style.left = left + "px";
      t2.style.zIndex = 8;
      for (var r = 0; r < rows.length; r++) {
        var td = rows[r].cells[j];
        if (td) {
          td.style.left = left + "px";
          td.style.zIndex = 2;
        }
      }
      left += Math.round(widths[j]);
    }
  }
}
export function scheduleFrozenLayout() {
  if (state.frozenLayoutTicking) return;
  state.frozenLayoutTicking = true;
  requestAnimationFrame(function () {
    applyFrozenLayout();
    state.frozenLayoutTicking = false;
  });
}

export function bindColumnResizeEvents() {
  Array.prototype.forEach.call(dom.content.querySelectorAll(".col-resizer"), function (handle) {
    handle.onmousedown = function (event) {
      event.preventDefault();
      event.stopPropagation();

      var th = handle.closest("th");
      var table = handle.closest("table.grid");
      if (!th || !table) return;

      var index = th.cellIndex;
      var startX = event.clientX;
      var startWidth = th.getBoundingClientRect().width;
      document.body.classList.add("resizing-col");

      var resizeTicking = false;
      var lastMoveEvent = null;
      function onMove(moveEvent) {
        lastMoveEvent = moveEvent;
        if (resizeTicking) return;
        resizeTicking = true;
        requestAnimationFrame(function () {
          resizeTicking = false;
          var me = lastMoveEvent;
          if (!me) return;
          var width = Math.max(48, Math.round(startWidth + me.clientX - startX));
          setColumnWidth(table, index, width);
        });
      }

      function onUp() {
        document.body.classList.remove("resizing-col");
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        savePersistedState();
      }

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    };
  });
}

export function bindColumnFreezeEvents() {
  Array.prototype.forEach.call(dom.content.querySelectorAll(".col-freeze-btn"), function (btn) {
    btn.onclick = function (event) {
      event.preventDefault();
      event.stopPropagation();
      var tid = btn.getAttribute("data-table-id");
      var col = btn.getAttribute("data-col");
      setColumnFrozen(tid, col, !isColumnFrozen(tid, col));
    };
  });
}