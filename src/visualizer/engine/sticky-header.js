// 浮动表头与层级上下文条：滚动时克隆表头、显示当前层级路径。
// 由单文件 index.html 拆分而来；共享状态集中在 state.js（state / dom 两个对象）。

import { dom, state } from "./state.js";
export function isIndexContextPath(path) {
  return /\[\d+\]$/.test(path || "");
}

export function getContextName(path) {
  if (!path || path === "$") return "$";

  var base = String(path).replace(/\[\d+\]$/g, "");
  var keyMatch = base.match(/.([^.[]+)$/);
  if (keyMatch) return keyMatch[1];

  var indexMatch = String(path).match(/\[\d+\]$/);
  return indexMatch ? indexMatch[0] : path;
}

export function hideStickyTableHead() {
  state.stickyTableHeadKey = "";
  dom.stickyTableHead.classList.remove("active");
  dom.stickyTableHead.classList.remove("multi");
  dom.stickyTableHeadInner.innerHTML = "";
  dom.stickyTableHeadInner.style.marginLeft = "0px";
  dom.stickyTableHeadInner.style.width = "auto";
  dom.stickyTableHead.style.left = "0px";
  dom.stickyTableHead.style.top = "0px";
  dom.stickyTableHead.style.width = "0px";
  dom.stickyTableHead.style.height = "0px";
  dom.stickyTableHeadInner.style.height = "auto";
}

export function hideStickyContextBar() {
  state.stickyContextPathValue = "";
  dom.stickyContextBar.classList.remove("active");
  dom.stickyContextPath.textContent = "";
  dom.stickyContextSummary.textContent = "";
  hideStickyTableHead();
}

export function getActiveContextDetails() {
  var contentRect = dom.content.getBoundingClientRect();
  var top = getRootHeaderMetrics(contentRect).bottom + 2;
  var candidates = [];

  Array.prototype.forEach.call(dom.content.querySelectorAll("details[data-path][open]"), function (item) {
    var body = item.querySelector(":scope > .detail-body");
    if (!body) return;

    var itemRect = item.getBoundingClientRect();
    if (itemRect.top <= top && itemRect.bottom > top + 8) {
      candidates.push(item);
    }
  });

  if (!candidates.length) return [];

  var namedCandidates = candidates.filter(function (item) {
    return !isIndexContextPath(item.getAttribute("data-path"));
  });
  var pool = namedCandidates.length ? namedCandidates : candidates;

  pool.sort(function (a, b) {
    return Number(a.getAttribute("data-depth") || 0) - Number(b.getAttribute("data-depth") || 0);
  });
  return pool;
}

export function findActiveContextDetail() {
  var items = getActiveContextDetails();
  return items.length ? items[items.length - 1] : null;
}

export function getContextTable(item) {
  var body = item && item.querySelector(":scope > .detail-body");
  if (!body) return null;
  return body.querySelector("table.grid");
}

export function cloneTableHead(table, tableRect, contentRect) {
  var head = table && table.tHead;
  if (!head || !head.rows.length) return "";

  var widths = Array.prototype.map.call(head.rows[0].cells, function (cell) {
    return Math.max(48, Math.round(cell.getBoundingClientRect().width));
  });
  var totalWidth = Math.max(Math.round(tableRect.width), widths.reduce(function (sum, width) {
    return sum + width;
  }, 0));

  var html = '<table style="width:' + totalWidth + 'px"><colgroup>';
  widths.forEach(function (width) {
    html += '<col style="width:' + width + 'px">';
  });
  html += '</colgroup><thead>' + head.innerHTML + '</thead></table>';
  return html;
}

// Pin cloned frozen-column headers to the floating head's left edge so they
// stay aligned with the original table's sticky frozen columns during
// horizontal scroll. The clone table has no `grid` class, so the CSS
// `table.grid th.frozen-col` sticky rule doesn't apply to it; absolute
// positioning relative to the fixed .sticky-table-head / .sticky-head-layer
// restores the pin without relying on sticky.
function pinFrozenClones(container) {
  var ths = container.querySelectorAll("thead th.frozen-col");
  if (!ths.length) return;
  var cols = container.querySelectorAll("colgroup col");
  Array.prototype.forEach.call(ths, function (th) {
    var left = th.style.left || "0px";
    // Read width from the colgroup <col> (set explicitly by cloneTableHead).
    // th.getBoundingClientRect().width can read 0 if the floating head's
    // size isn't laid out yet at pin time.
    var col = cols[th.cellIndex];
    var width = col ? parseFloat(col.style.width) : 0;
    if (!width) width = th.getBoundingClientRect().width;
    th.style.position = "absolute";
    th.style.top = "0px";
    th.style.left = left;
    th.style.width = Math.round(width) + "px";
    th.style.height = "100%";
    th.style.zIndex = 8;
    th.style.boxSizing = "border-box";
  });
}

export function getRootHeaderMetrics(contentRect) {  var rootHead = dom.content.querySelector("table.root-grid > thead");
  if (!rootHead) return { bottom: contentRect.top, height: 36 };

  var rect = rootHead.getBoundingClientRect();
  var height = Math.max(28, Math.round(rect.height || 36));
  if (rect.bottom <= contentRect.top || rect.top > contentRect.top + 4) {
    return { bottom: contentRect.top, height: height };
  }
  return { bottom: rect.bottom, height: height };
}

export function tableHeaderSignature(table) {
  var row = table && table.tHead && table.tHead.rows[0];
  if (!row) return "";

  return Array.prototype.map.call(row.cells, function (cell) {
    return cell.getAttribute("data-col-key") || cell.textContent.trim();
  }).join("|");
}

// Core metric: given a table element, decide whether its header has scrolled
// above `minTop` (so a floating clone is needed) and return its visible box.
export function computeStickyMetric(table, contentRect, minTop) {
  if (!table) return null;
  var tableRect = table.getBoundingClientRect();
  var head = table.tHead;
  var headRect = head ? head.getBoundingClientRect() : null;
  var headHeight = headRect ? Math.max(28, Math.round(headRect.height || 36)) : 36;
  if (!tableRect || !headRect || headRect.top > minTop || tableRect.bottom <= minTop + headHeight) return null;

  var left = Math.max(contentRect.left, tableRect.left);
  var width = Math.min(tableRect.right, contentRect.right) - left;
  if (width <= 0) return null;

  return { table: table, tableRect: tableRect, height: headHeight, left: left, width: width };
}

export function getStickyHeadMetrics(item, contentRect, minTop) {
  return computeStickyMetric(getContextTable(item), contentRect, minTop);
}

export function renderStickyHeadLayer(metric, top, contentRect) {
  var left = Math.round(contentRect.left);
  var width = Math.round(contentRect.width);
  var height = Math.round(metric.height);
  var marginLeft = Math.round(metric.tableRect.left - contentRect.left);
  var tableWidth = Math.round(metric.tableRect.width);

  return '<div class="sticky-head-layer" style="left:' + left + 'px;top:' + Math.round(top) +
    'px;width:' + width + 'px;height:' + height + 'px">' +
    '<div class="sticky-head-layer-inner" style="margin-left:' + marginLeft + 'px;width:' + tableWidth +
    'px;height:' + height + 'px">' + cloneTableHead(metric.table, metric.tableRect) + '</div></div>';
}
export function updateSingleStickyTableHead(item) {
  var contentRect = dom.content.getBoundingClientRect();
  var rootHeader = getRootHeaderMetrics(contentRect);
  var minTop = rootHeader.bottom;

  // 收集候选：所有“summary 已越过 minTop 线、且自身表头已滚到顶部”的开放 details，
  // 再加上根表（主记录数组表）。根表不在 details 里，主表滚动时也必须浮动，否则
  // 顶部会出现一条空白带（见 issue）。
  var items = getActiveContextDetails();
  var candidates = [];
  items.forEach(function (it) {
    var m = getStickyHeadMetrics(it, contentRect, minTop);
    if (m) candidates.push({ item: it, metric: m, depth: Number(it.getAttribute("data-depth") || 0), isRoot: false });
  });

  var rootTable = dom.content.querySelector("table.root-grid");
  // 根表头只有在“已滚出视口顶部”时才需要浮动；仍在原位时原生表头可见，不必重复浮动。
  if (rootTable && rootTable.tHead) {
    var rootHeadRect = rootTable.tHead.getBoundingClientRect();
    if (rootHeadRect.top < contentRect.top) {
      var rootMetric = computeStickyMetric(rootTable, contentRect, contentRect.top);
      if (rootMetric) candidates.push({ item: null, metric: rootMetric, depth: -1, isRoot: true });
    }
  }

  if (!candidates.length) {
    hideStickyTableHead();
    return;
  }

  // 取最深（最内层）的候选，让内层表头优先浮动；根表作为兜底。
  candidates.sort(function (a, b) { return a.depth - b.depth; });
  var chosen = candidates[candidates.length - 1];
  item = chosen.item;
  var metric = chosen.metric;

  var key = (chosen.isRoot ? "$::root" : (item.getAttribute("data-path") || "")) + "::" +
    Math.round(metric.tableRect.left) + "::" + Math.round(metric.tableRect.width) +
    "::" + dom.content.scrollLeft + "::single";
  var keyChanged = state.stickyTableHeadKey !== key;
  if (keyChanged) {
    dom.stickyTableHeadInner.innerHTML = cloneTableHead(metric.table, metric.tableRect);
    state.stickyTableHeadKey = key;
  }

  dom.stickyTableHead.classList.remove("multi");
  // 紧贴可见表格区域定位（legacy 行为），避免整宽 + marginLeft 偏移导致的空白带/错位。
  dom.stickyTableHead.style.left = Math.round(metric.left) + "px";
  dom.stickyTableHead.style.top = Math.round(minTop) + "px";
  dom.stickyTableHead.style.width = Math.round(metric.width) + "px";
  // 用 minHeight 而非 height：当 .th-title 因列窄换行（v3 修法）时行高会
  // 超过原 thead 的单行高度，外层容器需要随之撑高；内容刚好一行时按
  // minHeight = 原行高，与 legacy 视觉等价。
  dom.stickyTableHead.style.minHeight = Math.round(metric.height) + "px";
  dom.stickyTableHead.style.height = "auto";
  dom.stickyTableHeadInner.style.minHeight = Math.round(metric.height) + "px";
  dom.stickyTableHeadInner.style.height = "auto";
  dom.stickyTableHeadInner.style.marginLeft = "0px";
  dom.stickyTableHeadInner.style.width = Math.round(metric.tableRect.width) + "px";
  // Pin after the head's size is applied so th.getBoundingClientRect().width
  // reflects the laid-out column width (not 0 from an unsized container).
  if (keyChanged) {
    pinFrozenClones(dom.stickyTableHeadInner);
  }
  dom.stickyTableHead.classList.add("active");
}
export function updateMultiStickyTableHead() {
  var contentRect = dom.content.getBoundingClientRect();
  var rootHeader = getRootHeaderMetrics(contentRect);
  var items = getActiveContextDetails();
  var seen = {};
  var layers = [];
  var candidates = [];

  // 根表（主记录表）滚动出视口顶部时也要作为最顶层浮动层，否则主表头消失后
  // 顶部会留一条空白带（与单层模式同样的根表浮动需求）。
  var rootTable = dom.content.querySelector("table.root-grid");
  if (rootTable && rootTable.tHead) {
    var rootHeadRect = rootTable.tHead.getBoundingClientRect();
    if (rootHeadRect.top < contentRect.top) {
      var rootMetric = computeStickyMetric(rootTable, contentRect, contentRect.top);
      if (rootMetric) {
        var rootSig = tableHeaderSignature(rootMetric.table);
        if (rootSig && !seen[rootSig]) {
          seen[rootSig] = true;
          candidates.push({ depth: -1, metric: rootMetric });
        }
      }
    }
  }

  items.forEach(function (item) {
    var metric = getStickyHeadMetrics(item, contentRect, rootHeader.bottom);
    var signature = metric ? tableHeaderSignature(metric.table) : "";
    if (!metric || !signature || seen[signature]) return;

    seen[signature] = true;
    candidates.push({ depth: Number(item.getAttribute("data-depth") || 0), metric: metric });
  });

  // 按深度从外到内（根 -1 最上）排序后，自上而下堆叠各浮动层。
  candidates.sort(function (a, b) { return a.depth - b.depth; });
  var top = rootHeader.bottom;
  candidates.forEach(function (c) {
    if (top + c.metric.height > contentRect.bottom) return;
    layers.push(renderStickyHeadLayer(c.metric, top, contentRect));
    top += c.metric.height + 6;
  });

  if (!layers.length) {
    hideStickyTableHead();
    return;
  }

  var key = layers.join("") + "::multi";
  if (state.stickyTableHeadKey !== key) {
    dom.stickyTableHeadInner.innerHTML = layers.join("");
    Array.prototype.forEach.call(dom.stickyTableHeadInner.querySelectorAll(".sticky-head-layer-inner"), function (inner) {
      pinFrozenClones(inner);
    });
    state.stickyTableHeadKey = key;
  }

  dom.stickyTableHead.classList.add("multi");
  dom.stickyTableHead.style.left = "0px";
  dom.stickyTableHead.style.top = "0px";
  dom.stickyTableHead.style.width = "100vw";
  dom.stickyTableHead.style.height = "100vh";
  dom.stickyTableHeadInner.style.marginLeft = "0px";
  dom.stickyTableHeadInner.style.width = "100vw";
  dom.stickyTableHeadInner.style.height = "100vh";
  dom.stickyTableHead.classList.add("active");
}
export function updateStickyTableHead(item) {
  if (state.stickyHeaderMode === "multi") {
    updateMultiStickyTableHead();
    return;
  }

  updateSingleStickyTableHead(item);
}

export function updateStickyOffsets() {
  var rootHead = dom.content.querySelector("table.root-grid > thead");
  var height = rootHead ? Math.max(28, Math.round(rootHead.getBoundingClientRect().height || 36)) : 36;
  dom.content.style.setProperty("--root-head-height", height + "px");
}

export function updateStickyContextBar() {
  state.stickyContextTicking = false;
  if (!state.showTable) {
    hideStickyContextBar();
    return;
  }

  if (!state.showStickyHeader) {
    hideStickyContextBar();
    return;
  }

  var item = findActiveContextDetail();
  if (!item) {
    // 没有活动明细时，仅隐藏“层级上下文条”；根表浮动头仍由 updateStickyTableHead 接管。
    dom.stickyContextBar.classList.remove("active");
    dom.stickyContextPath.textContent = "";
    dom.stickyContextSummary.textContent = "";
    dom.stickyContextPathValue = "";
    updateStickyTableHead(null);
    return;
  }

  var path = item.getAttribute("data-path") || "";
  var summary = item.getAttribute("data-context-summary") || "";
  state.stickyContextPathValue = path;
  dom.stickyContextPath.textContent = getContextName(path);
  dom.stickyContextPath.title = path;
  dom.stickyContextSummary.textContent = summary ? "· " + summary : "";
  dom.stickyContextBar.title = path;
  dom.stickyContextBar.classList.add("active");
  updateStickyTableHead(item);
}

export function requestStickyContextUpdate() {
  if (state.stickyContextTicking) return;
  state.stickyContextTicking = true;
  requestAnimationFrame(updateStickyContextBar);
}

export function bindStickyContextEvents() {
  dom.content.onscroll = requestStickyContextUpdate;
  dom.stickyContextJump.onclick = function () {
    if (!state.stickyContextPathValue) return;

    var target = null;
    Array.prototype.some.call(dom.content.querySelectorAll("details[data-path]"), function (item) {
      if (item.getAttribute("data-path") === state.stickyContextPathValue) {
        target = item;
        return true;
      }
      return false;
    });

    if (!target) return;
    var summary = target.querySelector(":scope > summary");
    (summary || target).scrollIntoView({ block: "start" });
  };
}