// 列过滤（条件 + 值列表）、过滤 chips、排序、全局搜索展开。
// 由单文件 index.html 拆分而来；共享状态集中在 state.js（state / dom 两个对象）。

import { dom, state } from "./state.js";
import { closeTreeMenu } from "./details-tree.js";
import { setRootPath } from "./paths.js";
import { render } from "./render.js";
import { esc, valueText } from "./utils.js";
export function getValueCounts(rows, col) {
  var counts = {};
  rows.forEach(function (row) {
    var text = valueText(row ? row[col] : undefined);
    counts[text] = (counts[text] || 0) + 1;
  });
  return counts;
}

export function globalFilterKey(col) {
  return "*::" + String(col);
}

export function getColumnFilter(tableId, col) {
  return state.columnFilters[filterMenuKey(tableId, col)] || state.columnFilters[globalFilterKey(col)] || {};
}

export function hasColumnFilter(filter) {
  return !!(filter && ((filter.values && filter.values.length) || filter.mode));
}

export function formatFilterLabel(key, filter) {
  if (key === "__global_search__") return "搜索: " + dom.globalSearch.value.trim();

  var parts = key.split("::");
  var scope = parts[0] === "*" ? "全部" : parts[0];
  var col = parts.slice(1).join("::");
  var bits = [];
  if (filter.values && filter.values.length) bits.push(filter.values.length + " 个值");
  if (filter.mode && filter.mode !== "all") bits.push(filter.mode + (filter.query ? ": " + filter.query : ""));
  return col + " · " + bits.join(" · ") + (scope === "全部" ? " · 全部同名" : "");
}

export function renderFilterChips() {
  var chips = [];
  var q = dom.globalSearch.value.trim();
  if (q) chips.push({ key: "__global_search__", text: formatFilterLabel("__global_search__", {}) });

  Object.keys(state.columnFilters).forEach(function (key) {
    var filter = state.columnFilters[key];
    if (hasColumnFilter(filter)) chips.push({ key: key, text: formatFilterLabel(key, filter) });
  });

  if (!chips.length) {
    dom.filterChips.classList.remove("active");
    dom.filterChips.innerHTML = "";
    return;
  }

  dom.filterChips.classList.add("active");
  dom.filterChips.innerHTML = chips.map(function (chip) {
    return '<span class="filter-chip" title="' + esc(chip.text) + '"><span class="filter-chip-text">' +
      esc(chip.text) + '</span><button class="filter-chip-remove" data-filter-key="' + esc(chip.key) +
      '" title="移除过滤条件">×</button></span>';
  }).join("");
  bindFilterChipEvents();
}

export function bindFilterChipEvents() {
  Array.prototype.forEach.call(dom.filterChips.querySelectorAll(".filter-chip-remove"), function (btn) {
    btn.onclick = function (event) {
      event.stopPropagation();
      var key = btn.getAttribute("data-filter-key");
      if (key === "__global_search__") {
        dom.globalSearch.value = "";
      } else {
        delete state.columnFilters[key];
      }
      state.activeFilterColumn = null;
      render();
    };
  });
}

export function getActiveFilterCount() {
  var count = 0;

  Object.keys(state.columnFilters).forEach(function (key) {
    if (hasColumnFilter(state.columnFilters[key])) count++;
  });

  if (dom.globalSearch.value.trim()) count++;
  return count;
}

export function conditionMatches(filter, text) {
  var mode = filter.mode || "all";
  var q = String(filter.query || "").toLowerCase();
  var lower = String(text || "").toLowerCase();

  if (mode === "empty") return text === "" || text === "null";
  if (mode === "notEmpty") return text !== "" && text !== "null";
  if (!q) return true;
  if (mode === "contains") return lower.indexOf(q) >= 0;
  if (mode === "notContains") return lower.indexOf(q) < 0;
  if (mode === "equals") return lower === q;
  if (mode === "notEquals") return lower !== q;
  return true;
}

export function rowMatches(row, cols, tableId) {
  var global = dom.globalSearch.value.trim().toLowerCase();

  if (global) {
    var wholeRow = cols.map(function (col) {
      return valueText(row ? row[col] : undefined);
    }).join(" ").toLowerCase();

    if (wholeRow.indexOf(global) < 0) return false;
  }

  for (var i = 0; i < cols.length; i++) {
    var col = cols[i];
    var filter = getColumnFilter(tableId, col);
    var text = valueText(row ? row[col] : undefined);
    var lower = text.toLowerCase();

    if (filter.values && filter.values.length && filter.values.indexOf(text) < 0) {
      return false;
    }

    if (!conditionMatches(filter, text)) {
      return false;
    }
  }

  return true;
}

export function getFilteredRows(rows, cols, tableId) {
  return rows.filter(function (row) {
    return rowMatches(row, cols, tableId);
  });
}

export function compareValues(a, b) {
  var av = valueText(a);
  var bv = valueText(b);
  var an = Number(av);
  var bn = Number(bv);

  if (av !== "" && bv !== "" && isFinite(an) && isFinite(bn)) {
    return an === bn ? 0 : an > bn ? 1 : -1;
  }

  return av.localeCompare(bv, "zh-Hans", { numeric: true });
}

export function getSortedRows(rows) {
  if (!state.sortState.col || !state.sortState.dir) return rows;

  return rows.slice().sort(function (a, b) {
    var result = compareValues(a ? a[state.sortState.col] : undefined, b ? b[state.sortState.col] : undefined);
    return state.sortState.dir === "asc" ? result : -result;
  });
}

export function toggleSort(col) {
  if (state.sortState.col !== col) {
    state.sortState = { col: col, dir: "asc" };
  } else if (state.sortState.dir === "asc") {
    state.sortState.dir = "desc";
  } else {
    state.sortState = { col: null, dir: null };
  }

  render();
}

export function expandSearchMatches() {
  // 展开路径已在渲染前根据原始 JSON 计算；这里保留函数名避免调用链分散。
}

export function filterMenuKey(tableId, col) {
  return String(tableId || state.tablePath) + "::" + String(col);
}

export function findFilterButtonByKey(menuKey) {
  var found = null;
  Array.prototype.some.call(dom.content.querySelectorAll(".filter-btn"), function (btn) {
    if (btn.getAttribute("data-filter-key") === menuKey) {
      found = btn;
      return true;
    }
    return false;
  });
  return found;
}

export function positionFilterMenu() {
  if (!state.activeFilterColumn) return;

  var menu = document.body.querySelector(".filter-menu");
  var btn = findFilterButtonByKey(state.activeFilterColumn);
  if (!menu || !btn) return;

  var rect = btn.getBoundingClientRect();
  var width = Math.max(260, menu.offsetWidth || 260);
  var height = Math.max(120, menu.offsetHeight || 320);
  var left = Math.min(rect.left, window.innerWidth - width - 8);
  var top = rect.bottom + 6;

  if (top + height > window.innerHeight - 8) {
    top = rect.top - height - 6;
  }

  menu.style.left = Math.max(8, Math.round(left)) + "px";
  menu.style.top = Math.max(8, Math.round(top)) + "px";
  menu.style.visibility = "visible";
}

export function renderFilterMenu(col, rows, tableId) {
  var menuKey = filterMenuKey(tableId, col);
  if (state.activeFilterColumn !== menuKey) return "";

  var counts = getValueCounts(rows, col);
  var values = Object.keys(counts).sort();
  var filter = getColumnFilter(tableId, col);
  var scopedKey = filterMenuKey(tableId, col);
  var globalKey = globalFilterKey(col);
  var applyAllChecked = !!state.columnFilters[globalKey] && !state.columnFilters[scopedKey];
  var selectedMap = null;

  if (filter.values && filter.values.length) {
    selectedMap = {};
    filter.values.forEach(function (v) {
      selectedMap[v] = true;
    });
  }

  var html = '<div class="filter-menu" data-menu-col="' + esc(col) + '" data-table-id="' +
    esc(tableId || state.tablePath) + '" data-menu-key="' + esc(scopedKey) + '">';
  html += '<input type="text" class="menu-search" data-col="' + esc(col) + '" value="" placeholder="搜索过滤项">';
  html += '<div class="filter-condition">';
  html += '<select class="condition-mode" data-col="' + esc(col) + '">';
  html += '<option value="all"' + ((!filter.mode || filter.mode === "all") ? " selected" : "") + '>条件：全部</option>';
  html += '<option value="contains"' + (filter.mode === "contains" ? " selected" : "") + '>包含</option>';
  html += '<option value="notContains"' + (filter.mode === "notContains" ? " selected" : "") + '>不包含</option>';
  html += '<option value="equals"' + (filter.mode === "equals" ? " selected" : "") + '>等于</option>';
  html += '<option value="notEquals"' + (filter.mode === "notEquals" ? " selected" : "") + '>不等于</option>';
  html += '<option value="empty"' + (filter.mode === "empty" ? " selected" : "") + '>空值</option>';
  html += '<option value="notEmpty"' + (filter.mode === "notEmpty" ? " selected" : "") + '>非空</option>';
  html += '</select>';
  html += '<input type="text" class="condition-value" data-col="' + esc(col) + '" value="' + esc(filter.query || "") + '" placeholder="条件值">';
  html += '</div>';
  html += '<label class="setting-row" style="padding:4px 2px"><input class="apply-all-filter" type="checkbox"' +
    (applyAllChecked ? ' checked' : '') + '> <span>应用到所有同名字段</span></label>';
  html += '<div class="filter-actions">';
  html += '<button class="select-all" data-col="' + esc(col) + '">全选</button>';
  html += '<button class="select-none" data-col="' + esc(col) + '">清空</button>';
  html += '</div>';
  html += '<div class="value-list">';

  values.forEach(function (value) {
    var checked = !selectedMap || selectedMap[value] ? " checked" : "";

    html += '<label class="check-row" data-filter-text="' + esc(String(value).toLowerCase()) + '">';
    html += '<input type="checkbox" class="value-check" data-col="' + esc(col) + '" value="' + esc(value) + '"' + checked + '>';
    html += '<span class="check-label" title="' + esc(value) + '">' + esc(value || "(空)") + '</span>';
    html += '<span class="check-count">' + counts[value] + '</span>';
    html += '</label>';
  });

  html += '</div>';
  html += '<div class="filter-actions">';
  html += '<button class="apply-filter" data-col="' + esc(col) + '">应用</button>';
  html += '<button class="cancel-filter" data-col="' + esc(col) + '">取消</button>';
  html += '</div>';
  html += '</div>';

  return html;
}

export function bindFilterEvents() {
  Array.prototype.forEach.call(dom.content.querySelectorAll(".key-jump"), function (btn) {
    btn.onclick = function (event) {
      event.stopPropagation();
      var path = btn.getAttribute("data-path");
      if (!Object.prototype.hasOwnProperty.call(state.nodesByPath, path)) return;

      setRootPath(path);
    };
  });

  Array.prototype.forEach.call(dom.content.querySelectorAll(".th-title"), function (btn) {
    btn.onclick = function (event) {
      event.stopPropagation();
      closeTreeMenu();
      state.activeFilterColumn = null;
      toggleSort(btn.getAttribute("data-col"));
    };
  });

  Array.prototype.forEach.call(dom.content.querySelectorAll(".filter-btn"), function (btn) {
    btn.onclick = function (event) {
      event.stopPropagation();
      var col = btn.getAttribute("data-col");
      var menuKey = btn.getAttribute("data-filter-key") || col;
      closeTreeMenu();
      state.activeFilterColumn = state.activeFilterColumn === menuKey ? null : menuKey;
      render();
    };
  });

  requestAnimationFrame(positionFilterMenu);

  Array.prototype.forEach.call(dom.content.querySelectorAll(".filter-menu"), function (menu) {
    menu.onclick = function (event) {
      event.stopPropagation();
    };
  });

  function applyMenuSearch(menu) {
    var input = menu.querySelector(".menu-search");
    var q = input ? input.value.trim().toLowerCase() : "";

    Array.prototype.forEach.call(menu.querySelectorAll(".check-row"), function (row) {
      var text = row.getAttribute("data-filter-text") || "";
      row.style.display = !q || text.indexOf(q) >= 0 ? "flex" : "none";
    });
  }

  Array.prototype.forEach.call(dom.content.querySelectorAll(".menu-search"), function (input) {
    input.oninput = function (event) {
      event.stopPropagation();
      applyMenuSearch(input.closest(".filter-menu"));
    };

    input.onkeyup = function (event) {
      event.stopPropagation();
      applyMenuSearch(input.closest(".filter-menu"));
    };

    input.onclick = function (event) {
      event.stopPropagation();
    };
  });

  Array.prototype.forEach.call(dom.content.querySelectorAll(".condition-mode, .condition-value"), function (input) {
    input.onclick = function (event) { event.stopPropagation(); };
    input.oninput = function (event) { event.stopPropagation(); };
  });

  Array.prototype.forEach.call(dom.content.querySelectorAll(".select-all"), function (btn) {
    btn.onclick = function (event) {
      event.stopPropagation();
      var menu = btn.closest(".filter-menu");

      Array.prototype.forEach.call(menu.querySelectorAll(".check-row"), function (row) {
        if (row.style.display !== "none") {
          var check = row.querySelector(".value-check");
          if (check) check.checked = true;
        }
      });
    };
  });

  Array.prototype.forEach.call(dom.content.querySelectorAll(".select-none"), function (btn) {
    btn.onclick = function (event) {
      event.stopPropagation();
      var menu = btn.closest(".filter-menu");

      Array.prototype.forEach.call(menu.querySelectorAll(".check-row"), function (row) {
        if (row.style.display !== "none") {
          var check = row.querySelector(".value-check");
          if (check) check.checked = false;
        }
      });
    };
  });

  Array.prototype.forEach.call(dom.content.querySelectorAll(".apply-filter"), function (btn) {
    btn.onclick = function (event) {
      event.stopPropagation();

      var col = btn.getAttribute("data-col");
      var menu = btn.closest(".filter-menu");
      var checks = Array.prototype.slice.call(menu.querySelectorAll(".value-check"));
      var modeInput = menu.querySelector(".condition-mode");
      var queryInput = menu.querySelector(".condition-value");
      var applyAllInput = menu.querySelector(".apply-all-filter");
      var mode = modeInput ? modeInput.value : "all";
      var query = queryInput ? queryInput.value.trim() : "";
      var tableId = menu.getAttribute("data-table-id") || state.tablePath;
      var targetKey = applyAllInput && applyAllInput.checked ? globalFilterKey(col) : filterMenuKey(tableId, col);
      var oppositeKey = applyAllInput && applyAllInput.checked ? filterMenuKey(tableId, col) : globalFilterKey(col);
      var selected = checks.filter(function (check) {
        return check.checked;
      }).map(function (check) {
        return check.value;
      });

      var allCount = checks.length;

      state.columnFilters[targetKey] = state.columnFilters[targetKey] || {};
      delete state.columnFilters[oppositeKey];

      if (selected.length === allCount) {
        delete state.columnFilters[targetKey].values;
      } else {
        state.columnFilters[targetKey].values = selected;
      }

      if (mode && mode !== "all") {
        state.columnFilters[targetKey].mode = mode;
        state.columnFilters[targetKey].query = query;
      } else {
        delete state.columnFilters[targetKey].mode;
        delete state.columnFilters[targetKey].query;
      }

      if (!hasColumnFilter(state.columnFilters[targetKey])) {
        delete state.columnFilters[targetKey];
      }

      state.activeFilterColumn = null;
      render();
    };
  });

  Array.prototype.forEach.call(dom.content.querySelectorAll(".cancel-filter"), function (btn) {
    btn.onclick = function (event) {
      event.stopPropagation();
      state.activeFilterColumn = null;
      render();
    };
  });

  // M3 fix: portal the filter menu out of its <th> ancestor's stacking
  // context. The <th> is position:sticky + z-index, which traps the menu's
  // z-index:10050 below the app-level .sticky-table-head (z-index 40), so
  // the floating header could cover the menu. Appending to <body> lets it
  // sit at the document's top stacking context, above everything. All
  // handlers above were bound while the menu still lived in content, so
  // they survive the reparent unchanged.
  var portalMenu = dom.content.querySelector(".filter-menu");
  if (portalMenu && portalMenu.parentNode) {
    document.body.appendChild(portalMenu);
  }
}