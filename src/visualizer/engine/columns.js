// 列模型与布局：列收集、显隐/冻结状态、列宽拖拽、冻结定位。
// 由单文件 index.html 拆分而来；共享状态集中在 state.js（state / dom 两个对象）。

import { dom, savePersistedState, state } from "./state.js";
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

// 按用户拖拽保存的顺序重排列；保存顺序里不存在的新列按数据顺序追加到末尾。
// 纯函数：不写 state。无保存顺序时原样返回（初始渲染输出与无此功能时一致）。
export function getOrderedColumns(cols, path) {
  var order = state.columnOrderByPath[path];
  if (!order || !order.length) return cols;
  var colSet = {};
  cols.forEach(function (c) { colSet[c] = true; });
  var seen = {};
  var result = [];
  order.forEach(function (c) {
    if (colSet[c] && !seen[c]) { result.push(c); seen[c] = true; }
  });
  cols.forEach(function (c) {
    if (!seen[c]) { result.push(c); seen[c] = true; }
  });
  return result;
}

export function setColumnOrder(path, orderedCols) {
  state.columnOrderByPath[path] = orderedCols.slice();
  savePersistedState();
  render();
}

export function resetColumnOrder(path) {
  if (!state.columnOrderByPath[path]) return;
  delete state.columnOrderByPath[path];
  savePersistedState();
  render();
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
  // Batch 1 - read every frozen column width across ALL tables first.
  // Reads interleaved with style writes force one reflow per table;
  // reading them all up front collapses the whole pass to a single reflow (H1/M2).
  var plan = [];
  for (var t = 0; t < tables.length; t++) {
    var table = tables[t];
    if (!table.tHead || !table.tHead.rows.length) continue;
    var ths = table.tHead.rows[0].cells;
    var rows = table.tBodies[0] ? table.tBodies[0].rows : [];
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
    // measure 0), don't paint stale/off-by offsets - wait for the
    // visibilitychange / ResizeObserver re-run instead.
    if (firstW <= 0) continue;

    plan.push({ ths: ths, rows: rows, widths: widths });
  }

  // Batch 2 - write all offsets/z-index. Background is delegated to CSS
  // (.frozen-col rules) so future row/zebra/selected backgrounds aren't
  // clobbered by inline styles (L6).
  for (var p = 0; p < plan.length; p++) {
    var item = plan[p];
    var left = 0;
    for (var j = 0; j < item.ths.length; j++) {
      if (item.widths[j] < 0) continue;
      item.ths[j].style.left = left + "px";
      item.ths[j].style.zIndex = 8;
      for (var r = 0; r < item.rows.length; r++) {
        var td = item.rows[r].cells[j];
        if (td) {
          td.style.left = left + "px";
          td.style.zIndex = 2;
        }
      }
      left += Math.round(item.widths[j]);
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

// 列拖拽换序：抓取表头单元格左右拖动。.th-title 兼任排序按钮与拖拽柄——
// 按下不动 = 排序，移动超过阈值 = 换序（拖完抑制一次 click 以免误排序）。
// 冻结列仍前置：拖拽只在源列所属组（冻结/非冻结）内换序，drop 目标按组夹取，
// 保证所见即所得且不破坏 applyFrozenLayout 要求冻结列连续前置的不变量。
export function bindColumnReorderEvents() {
  Array.prototype.forEach.call(dom.content.querySelectorAll("table.grid thead th.col-reorderable"), function (th) {
    th.onmousedown = function (event) {
      if (event.button !== 0) return;
      // 排除表头内的其它交互控件，让它们的点击/拖拽各走原逻辑。
      if (event.target.closest && event.target.closest(".filter-btn, .col-freeze-btn, .tree-menu-btn, .col-resizer, .filter-menu")) return;
      var table = th.closest("table.grid");
      if (!table || !table.tHead || !table.tHead.rows[0]) return;
      var tableId = table.getAttribute("data-table-id") || "$";
      var headerCells = Array.prototype.slice.call(table.tHead.rows[0].cells);
      var srcIdx = headerCells.indexOf(th);
      if (srcIdx < 0) return;

      var N = headerCells.length;
      var frozenCount = 0;
      for (var i = 0; i < N; i++) {
        if (headerCells[i].classList.contains("frozen-col")) frozenCount++;
        else break;
      }
      var srcIsFrozen = th.classList.contains("frozen-col");

      var startX = event.clientX;
      var startY = event.clientY;
      var dragging = false;
      var currentIndicator = null;
      var lastInsertAt = null;
      var moveTicking = false;
      var lastMoveEvent = null;

      function clearDropClasses() {
        for (var k = 0; k < headerCells.length; k++) {
          headerCells[k].classList.remove("col-drop-before", "col-drop-after");
        }
      }

      function indicatorFor(insertAt) {
        if (insertAt <= 0) return { th: headerCells[0], side: "before" };
        if (insertAt >= N) return { th: headerCells[N - 1], side: "after" };
        // 源列在冻结组、drop 落到冻结区末尾时，指示线画在最后一个冻结列右侧，
        // 而非第一个非冻结列左侧（那会暗示可越过冻结边界）。
        if (srcIsFrozen && insertAt === frozenCount) {
          return { th: headerCells[frozenCount - 1], side: "after" };
        }
        return { th: headerCells[insertAt], side: "before" };
      }

      function computeInsertAt(clientX) {
        var insertAt = N;
        for (var i = 0; i < N; i++) {
          var rect = headerCells[i].getBoundingClientRect();
          if (clientX < rect.right) {
            insertAt = clientX < (rect.left + rect.right) / 2 ? i : i + 1;
            break;
          }
        }
        if (srcIsFrozen) {
          insertAt = Math.max(0, Math.min(insertAt, frozenCount));
        } else {
          insertAt = Math.max(frozenCount, Math.min(insertAt, N));
        }
        return insertAt;
      }

      function applyIndicator(clientX) {
        var insertAt = computeInsertAt(clientX);
        var ind = indicatorFor(insertAt);
        if (currentIndicator && currentIndicator.th === ind.th && currentIndicator.side === ind.side) return insertAt;
        clearDropClasses();
        ind.th.classList.add(ind.side === "before" ? "col-drop-before" : "col-drop-after");
        currentIndicator = ind;
        return insertAt;
      }

      function onMove(me) {
        lastMoveEvent = me;
        if (moveTicking) return;
        moveTicking = true;
        requestAnimationFrame(function () {
          moveTicking = false;
          var e = lastMoveEvent;
          if (!e) return;
          if (!dragging) {
            var dx = e.clientX - startX;
            var dy = e.clientY - startY;
            if (dx * dx + dy * dy < 25) return; // 5px 阈值，区分点击与拖拽
            dragging = true;
            document.body.classList.add("dragging-col");
            th.classList.add("col-dragging");
            var sel = window.getSelection && window.getSelection();
            if (sel && sel.removeAllRanges) sel.removeAllRanges();
          }
          lastInsertAt = applyIndicator(e.clientX);
        });
      }

      function onUp() {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        if (!dragging) return;
        dragging = false;
        document.body.classList.remove("dragging-col");
        th.classList.remove("col-dragging");
        clearDropClasses();
        currentIndicator = null;
        suppressNextClick();
        if (lastInsertAt == null) return;
        if (lastInsertAt === srcIdx || lastInsertAt === srcIdx + 1) return; // 原位释放
        var renderCols = headerCells.map(function (c) {
          return c.getAttribute("data-col-key") || "";
        });
        var actual = lastInsertAt > srcIdx ? lastInsertAt - 1 : lastInsertAt;
        var moved = renderCols.splice(srcIdx, 1)[0];
        renderCols.splice(actual, 0, moved);
        setColumnOrder(tableId, renderCols);
      }

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    };
  });
}

// 抑制拖拽尾随的那一次 click（capture 阶段 stopPropagation），避免 .th-title
// 排序被误触发。一次性：命中首个 click 即拆除；若无 click（如释在窗外），下次
// mousedown 也拆除，防止残留监听吞掉后续合法点击。
function suppressNextClick() {
  function teardown() {
    window.removeEventListener("click", suppress, true);
    document.removeEventListener("mousedown", teardown, true);
  }
  function suppress(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    teardown();
  }
  window.addEventListener("click", suppress, true);
  document.addEventListener("mousedown", teardown, true);
}