// 渲染主流程：值/对象/数组/记录表的 HTML 生成与总 render()。
// 由单文件 index.html 拆分而来；共享状态集中在 state.js（state / dom 两个对象）。

import { LARGE_JSON_CHARS, LARGE_SEARCH_CHARS, MAX_RENDER_ROWS, dom, state } from "./state.js";
import { applyFrozenLayout, bindColumnFreezeEvents, bindColumnResizeEvents, collectColumns, ensureFrozenColumns, getFrozenColumns, getVisibleColumns } from "./columns.js";
import { applySearchExpansion, bindDetailsToggleEvents, bindTreeMenuEvents, closeTreeMenu, getNodeAtPath, getPathDepth, gridClass, hasExpandableValue, restoreExpandedDetails, syncExpandedDetailPaths } from "./details-tree.js";
import { bindFilterEvents, expandSearchMatches, filterMenuKey, getActiveFilterCount, getColumnFilter, getFilteredRows, getSortedRows, hasColumnFilter, renderFilterChips, renderFilterMenu } from "./filter-sort.js";
import { findFirstRecordArray, isRecordArray, renderMetaPath } from "./paths.js";
import { bindCopyEvents, bindSettingsPanelEvents, updateSettingsPanel } from "./settings.js";
import { bindStickyContextEvents, hideStickyContextBar, updateStickyContextBar, updateStickyOffsets } from "./sticky-header.js";
import { copyText, esc, highlightText, isObj, setMeta, showToast, summarize, tryParseJsonStringValue, typeOf, valueText } from "./utils.js";
export function colWidthStyle(tableId, colKey) {
  var width = state.columnWidths[tableId + "::" + colKey];
  return width ? ' style="width:' + width + 'px;min-width:' + width + 'px"' : "";
}

export function resizeHandleHtml() {
  return '<span class="col-resizer" title="拖拽调整列宽"></span>';
}

export function simpleHeader(label, className, tableId, colKey) {
  return '<th class="' + className + '" data-col-key="' + esc(colKey) + '"' + colWidthStyle(tableId, colKey) + '>' +
    '<div class="th-wrap"><span class="th-left"><span class="th-title-static">' + esc(label) + '</span></span></div>' +
    resizeHandleHtml() + '</th>';
}

export function renderValueHeader(hasTreeActions, tableId) {
  var html = '<th class="value-col" data-col-key="Value"' + colWidthStyle(tableId, "Value") + '>';
  html += '<div class="value-th-wrap"><span>Value</span>';
  if (hasTreeActions) {
    html += '<button class="tree-menu-btn" title="展开/折叠层级" aria-expanded="false">⤢</button>';
  }
  html += '</div>' + resizeHandleHtml() + '</th>';
  return html;
}

export function filterIconSvg() {
  return '<svg viewBox="0 0 16 16" aria-hidden="true">' +
    '<path d="M2.2 3h11.6L9.4 8.2v4.1l-2.8 1.5V8.2L2.2 3z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>' +
  '</svg>';
}

export function freezeIconSvg() {
  return '<svg viewBox="0 0 16 16" aria-hidden="true">' +
    '<path d="M5 7V5.5a3 3 0 0 1 6 0V7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
    '<path d="M4 7h8a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>' +
  '</svg>';
}

export function sortMark(col) {
  if (state.sortState.col !== col) return "";
  return '<span class="sort-mark">' + (state.sortState.dir === "asc" ? "↑" : "↓") + '</span>';
}

export function renderHeader(col, rows, tableId) {
  var filter = getColumnFilter(tableId, col);
  var active = hasColumnFilter(filter);
  var hasTreeActions = rows.some(function (row) {
    return hasExpandableValue(row ? row[col] : undefined);
  });
  var html = "";
  var fz = !!getFrozenColumns(tableId)[col];

  html += '<th data-col-key="' + esc(col) + '"' + colWidthStyle(tableId, col) + (fz ? ' class="frozen-col"' : '') + '>';
  html += '<div class="th-wrap">';
  html += '<span class="th-left">';
  html += '<button class="th-title" data-col="' + esc(col) + '" title="点击排序">' + esc(col) + '</button>';
  html += sortMark(col);
  html += '<button class="filter-btn' + (active ? " active" : "") + '" data-col="' + esc(col) + '" data-filter-key="' +
    esc(filterMenuKey(tableId, col)) + '" title="过滤">' + filterIconSvg() + '</button>';
  if (hasTreeActions) {
    html += '<button class="tree-menu-btn" title="展开/折叠本列层级" aria-expanded="false">⤢</button>';
  }
  // Nested tables have no settings panel, so expose column freezing
  // directly in the header (root tables keep the settings-panel lock).
  if (tableId !== state.tablePath) {
    html += '<button class="col-freeze-btn' + (fz ? " active" : "") + '" data-table-id="' + esc(tableId) + '" data-col="' + esc(col) + '" title="冻结/解冻此列">' + freezeIconSvg() + '</button>';
  }
  html += '</span>';
  html += renderFilterMenu(col, rows, tableId);
  html += '</div>';
  html += resizeHandleHtml();
  html += '</th>';

  return html;
}

export function getDisplayNodeAtPath(path) {
  if (Object.prototype.hasOwnProperty.call(state.renderedNodesByPath, path)) return state.renderedNodesByPath[path];
  var node = getNodeAtPath(path);
  return tryParseJsonStringValue(node) || node;
}

export function renderNodeActions(path) {
  return '<span class="node-actions">' +
    '<button class="node-action" data-node-action="copy-json" data-path="' + esc(path) + '" title="复制当前 JSON">JSON</button>' +
    '</span>';
}

export function bindNodeActionEvents() {
  Array.prototype.forEach.call(dom.content.querySelectorAll(".node-action"), function (btn) {
    btn.onclick = function (event) {
      event.preventDefault();
      event.stopPropagation();
      var path = btn.getAttribute("data-path");
      copyText(JSON.stringify(getDisplayNodeAtPath(path), null, 2));
    };
  });
}

export function renderValue(v, path) {
  if (v === undefined) return '<span class="muted"></span>';
  if (v === null) return '<span class="muted">' + highlightText("null") + '</span>';
  if (typeof v === "string") {
    var parsedStringJson = tryParseJsonStringValue(v);
    if (!parsedStringJson) return highlightText(v);
    return renderExpandableValue(parsedStringJson, path, "", true);
  }
  if (typeof v === "number") return '<span class="number-value">' + highlightText(v) + '</span>';
  if (typeof v === "boolean") return highlightText(v);

  return renderExpandableValue(v, path, "", false);
}

export function renderExpandableValue(v, path, prefix, parsedString) {
  var pathKey = path || "$";
  var depth = getPathDepth(pathKey);
  var summary = (prefix || "") + summarize(v);
  var badge = parsedString ? '<span class="json-string-badge">parsed</span>' : "";
  var expanded = !!state.expandedDetailPaths[pathKey];
  var body = expanded ? '<div class="detail-body">' + renderNode(v, pathKey) + '</div>' : "";

  return '<details data-path="' + esc(pathKey) + '" data-depth="' + depth + '" data-context-summary="' +
    esc(summary) + '"' + (expanded ? ' open' : '') + '>' +
    '<summary><span class="summary-main">' + badge + esc(summary) + '</span>' + renderNodeActions(pathKey) + '</summary>' +
    body +
    '</details>';
}

export function renderKeyCell(key, childPath) {
  if (!Object.prototype.hasOwnProperty.call(state.nodesByPath, childPath)) {
    return highlightText(key);
  }

  return '<button class="key-jump" data-path="' + esc(childPath) + '" title="切换根路径到 ' +
    esc(childPath) + '">↪ ' + highlightText(key) + '</button>';
}

export function renderObject(obj, path) {
  var keys = Object.keys(obj);
  if (!keys.length) return '<div class="empty">{}</div>';

  var tableId = path || "$";
  var hasTreeActions = keys.some(function (key) {
    return hasExpandableValue(obj[key]);
  });

  var html = '<table class="' + gridClass(tableId) + '" data-table-id="' + esc(tableId) + '"><thead><tr>' +
    simpleHeader("Key", "key-col", tableId, "Key") +
    (state.showTypeColumn ? simpleHeader("Type", "type-col", tableId, "Type") : "") +
    renderValueHeader(hasTreeActions, tableId) + '</tr></thead><tbody>';

  keys.forEach(function (key) {
    var value = obj[key];
    var childPath = (path || "$") + "." + key;

    html += '<tr data-row-path="' + esc(childPath) + '">';
    html += '<td class="key-col" data-copy="' + esc(key) + '">' + renderKeyCell(key, childPath) + '</td>';
    if (state.showTypeColumn) {
      var typeName = typeOf(value);
      html += '<td class="type type-col' + (typeName === "number" ? " type-number" : "") + '" data-copy="' + esc(typeName) + '">' + esc(typeName) + '</td>';
    }
    html += '<td class="value-col" data-copy="' + esc(valueText(value)) + '">' + renderValue(value, childPath) + '</td>';
    html += '</tr>';
  });

  html += '</tbody></table>';
  return html;
}

export function renderRecordArray(arr, path) {
  var pathKey = path || state.tablePath;
  var isRootTable = pathKey === state.tablePath;
  var allCols = collectColumns(arr);
  var cols = getVisibleColumns(allCols, pathKey);
  // Nested tables now support frozen columns too (previously frozenSet was
  // forced to null for them), so read the frozen set for every table.
  var frozenSet = getFrozenColumns(pathKey);
  // L8: prune frozen flags for columns that no longer exist in the data,
  // so they don't accumulate as unreachable orphans in persisted state.
  // Applies to root and nested tables alike.
  if (frozenSet) {
    var pruned = false;
    Object.keys(frozenSet).forEach(function (k) {
      if (allCols.indexOf(k) < 0) { delete frozenSet[k]; pruned = true; }
    });
    if (pruned) savePersistedState();
  }
  if (isRootTable && state.pendingFreezeFirstCol && allCols.length) {
    frozenSet = ensureFrozenColumns(pathKey);
    frozenSet[allCols[0]] = true;
    state.pendingFreezeFirstCol = false;
    savePersistedState();
    // L3: this migration can fire late (e.g. when the root isn't a record
    // array and the user drills into one via setRootPath). Tell the user so
    // the suddenly-frozen first column isn't a surprise.
    showToast("已迁移旧版『冻结表头』为首列冻结");
  }
  var renderCols = frozenSet
    ? cols.filter(function (c) { return frozenSet[c]; }).concat(cols.filter(function (c) { return !frozenSet[c]; }))
    : cols;
  var filtered = getFilteredRows(arr, allCols, pathKey);
  var sortedRows = getSortedRows(filtered);
  var visibleRows = sortedRows.slice(0, MAX_RENDER_ROWS);
  var activeCount = getActiveFilterCount();

  if (isRootTable) {
    state.currentAllColumns = allCols;
    state.currentColumns = cols;
    state.currentRows = sortedRows;

    setMeta(filtered.length + " / " + arr.length + " 行 · " +
      cols.length + " / " + allCols.length + " 列 · " + renderMetaPath(pathKey) +
      (activeCount ? " · " + activeCount + " 个过滤条件" : ""));
  }

  if (!arr.length) return '<div class="empty">[]</div>';

  var html = "";
  if (isRootTable && sortedRows.length > MAX_RENDER_ROWS) {
    html += '<div class="perf-note">数据量较大，仅渲染前 ' + MAX_RENDER_ROWS + ' 行；导出仍包含全部筛选结果。</div>';
  }

  html += '<table class="' + gridClass(pathKey) + '" data-table-id="' + esc(pathKey) + '"><thead><tr>';
  renderCols.forEach(function (col) {
    html += renderHeader(col, arr, pathKey);
  });
  html += '</tr></thead><tbody>';

  visibleRows.forEach(function (row) {
    var rowIndex = arr.indexOf(row);
    var rowPath = pathKey + '[' + rowIndex + ']';
    html += '<tr data-row-index="' + rowIndex + '" data-row-path="' + esc(rowPath) + '">';
    renderCols.forEach(function (col) {
      var fz = frozenSet && !!frozenSet[col];
      html += '<td data-copy="' + esc(valueText(row ? row[col] : undefined)) + '"' + (fz ? ' class="frozen-col"' : '') + '>' + renderValue(row ? row[col] : undefined, rowPath + '.' + col) + '</td>';
    });
    html += '</tr>';
  });

  html += '</tbody></table>';

  if (!filtered.length) {
    html += '<div class="empty">没有匹配结果</div>';
  }

  return html;
}

export function renderArray(arr, path) {
  if (isRecordArray(arr)) {
    state.tableRows = arr;
    return renderRecordArray(arr, path || "$");
  }

  // var found = findFirstRecordArray(arr, "$");
  // if (found) {
  //   tableRows = found.rows;
  //   tablePath = found.path;
  //   return renderRecordArray(tableRows);
  // }

  setMeta(arr.length + " 项 · " + renderMetaPath(state.tablePath));
  if (!arr.length) return '<div class="empty">[]</div>';

  var hasTreeActions = arr.some(function (value) {
    return hasExpandableValue(value);
  });

  var tableId = path || "$";
  var html = '<table class="' + gridClass(tableId) + '" data-table-id="' + esc(tableId) + '"><thead><tr>' +
    simpleHeader("#", "index-col", tableId, "#") +
    (state.showTypeColumn ? simpleHeader("Type", "type-col", tableId, "Type") : "") +
    renderValueHeader(hasTreeActions, tableId) + '</tr></thead><tbody>';

  arr.forEach(function (value, index) {
    html += '<tr data-row-path="' + esc((path || '$') + '[' + index + ']') + '">';
    html += '<td class="index-col" data-copy="' + index + '">' + index + '</td>';
    if (state.showTypeColumn) {
      var typeName = typeOf(value);
      html += '<td class="type type-col' + (typeName === "number" ? " type-number" : "") + '" data-copy="' + esc(typeName) + '">' + esc(typeName) + '</td>';
    }
    html += '<td class="value-col" data-copy="' + esc(valueText(value)) + '">' + renderValue(value, (path || '$') + '[' + index + ']') + '</td>';
    html += '</tr>';
  });

  html += '</tbody></table>';
  return html;
}

export function renderNode(v, path) {
  state.renderedNodesByPath[path || "$"] = v;
  if (Array.isArray(v)) return renderArray(v, path || "$");
  if (isObj(v)) {
    // var found = findFirstRecordArray(v, "$");
    // if (found) {
    //   tableRows = found.rows;
    //   tablePath = found.path;
    //   return renderRecordArray(tableRows);
    // }

    return renderObject(v, path || "$");
  }

  return '<div class="empty">' + esc(String(v)) + '</div>';
}

export function renderPerformanceNotes() {
  var notes = [];
  if (state.raw.length > LARGE_JSON_CHARS) notes.push("响应较大，复杂搜索/展开全部可能较慢");
  if (dom.globalSearch.value.trim() && state.raw.length > LARGE_SEARCH_CHARS) notes.push("正在大响应上执行全局搜索，建议缩小关键字");
  var failures = Object.keys(state.parseFailureSamples);
  if (state.parseJsonString && failures.length) {
    notes.push("发现 " + failures.length + " 类疑似 JSON 字符串解析失败；可在设置中关闭自动解析");
  }
  if (!notes.length) return "";
  return '<div class="perf-note">' + notes.map(esc).join("；") + '</div>';
}

export function render(options) {
  closeTreeMenu();
  // M3 fix: drop any body-portaled filter menu left over from a previous
  // render so a re-render never strands a stray floating menu.
  var staleFilterMenu = document.body.querySelector(".filter-menu");
  if (staleFilterMenu && staleFilterMenu.parentNode) {
    staleFilterMenu.parentNode.removeChild(staleFilterMenu);
  }
  var preserveDetails = !options || options.preserveDetails !== false;
  if (preserveDetails) {
    syncExpandedDetailPaths();
  } else {
    state.expandedDetailPaths = {};
  }

  if (state.showTable) {
    state.parseFailureSamples = {};
    state.renderedNodesByPath = {};
    dom.content.classList.toggle("freeze-header", state.freezeHeader);
    state.tableRows = null;
    if (!Object.prototype.hasOwnProperty.call(state.nodesByPath, state.selectedPath)) {
      state.selectedPath = "$";
      dom.pathSelect.value = "$";
    }
    state.tablePath = state.selectedPath;
    state.currentAllColumns = [];
    state.currentColumns = [];
    state.currentRows = [];
    applySearchExpansion();
    var renderedHtml = renderNode(state.nodesByPath[state.selectedPath], state.selectedPath);
    dom.content.innerHTML = renderPerformanceNotes() + renderedHtml;
    restoreExpandedDetails();
    expandSearchMatches();
    bindDetailsToggleEvents();
    bindNodeActionEvents();
    bindFilterEvents();
    bindTreeMenuEvents();
    bindColumnResizeEvents();
    bindColumnFreezeEvents();
    applyFrozenLayout();
    bindCopyEvents();
    bindStickyContextEvents();
    updateStickyOffsets();
    updateStickyContextBar();
    updateSettingsPanel();
    renderFilterChips();
    bindSettingsPanelEvents();

    if (!state.tableRows) {
      setMeta("树形表格 · " + renderMetaPath(state.tablePath));
    }
  } else {
    dom.meta.textContent = "原始 JSON";
    dom.filterChips.classList.remove("active");
    dom.filterChips.innerHTML = "";
    dom.content.classList.remove("freeze-header");
    hideStickyContextBar();
    dom.content.innerHTML = "<pre></pre>";
    dom.content.querySelector("pre").textContent = JSON.stringify(state.json, null, 2);
  }

  dom.toggle.textContent = state.showTable ? "原始" : "表格";
  dom.showTypeCheck.checked = state.showTypeColumn;
}