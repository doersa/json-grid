// details 展开树：路径工具、展开状态同步、树形操作菜单。
// 由单文件 index.html 拆分而来；共享状态集中在 state.js（state / dom 两个对象）。

import { dom, state } from "./state.js";
import { applyFrozenLayout } from "./columns.js";
import { render } from "./render.js";
import { isObj, tryParseJsonStringValue, valueText } from "./utils.js";
export function getNodeAtPath(path) {
  if (!path || path === "$") return state.json;

  var node = state.json;
  var re = /.([^.[]+)|[(d+)]/g;
  var match;
  while ((match = re.exec(path)) && node !== undefined && node !== null) {
    node = match[1] !== undefined ? node[match[1]] : node[Number(match[2])];
  }
  return node;
}

export function gridClass(tableId) {
  return "grid " + (tableId === state.tablePath ? "root-grid" : "nested-grid");
}

export function removeExpandedPathTree(path) {
  Object.keys(state.expandedDetailPaths).forEach(function (key) {
    if (key === path || key.indexOf(path + ".") === 0 || key.indexOf(path + "[") === 0) {
      delete state.expandedDetailPaths[key];
    }
  });
}

export function addExpandablePaths(v, path) {
  if (!hasExpandableValue(v)) return;
  state.expandedDetailPaths[path] = true;

  var parsedStringJson = tryParseJsonStringValue(v);
  if (parsedStringJson) {
    addExpandablePaths(parsedStringJson, path);
    return;
  }

  if (Array.isArray(v)) {
    v.forEach(function (item, index) {
      if (hasExpandableValue(item)) addExpandablePaths(item, path + "[" + index + "]");
    });
    return;
  }

  if (isObj(v)) {
    Object.keys(v).forEach(function (key) {
      var child = v[key];
      if (hasExpandableValue(child)) addExpandablePaths(child, path + "." + key);
    });
  }
}

export function collectSearchExpandedPaths(v, path, q) {
  var matched = valueText(v).toLowerCase().indexOf(q) >= 0;

  var parsedStringJson = tryParseJsonStringValue(v);
  if (parsedStringJson) {
    var parsedMatched = collectSearchExpandedPaths(parsedStringJson, path, q);
    if (parsedMatched) state.expandedDetailPaths[path] = true;
    return matched || parsedMatched;
  }

  if (Array.isArray(v)) {
    v.forEach(function (item, index) {
      var childPath = path + "[" + index + "]";
      var childMatched = collectSearchExpandedPaths(item, childPath, q);
      if (childMatched && hasExpandableValue(item)) state.expandedDetailPaths[childPath] = true;
      matched = matched || childMatched;
    });
    return matched;
  }

  if (isObj(v)) {
    Object.keys(v).forEach(function (key) {
      var child = v[key];
      var childPath = path + "." + key;
      var keyMatched = String(key).toLowerCase().indexOf(q) >= 0;
      var childMatched = collectSearchExpandedPaths(child, childPath, q);
      if ((keyMatched || childMatched) && hasExpandableValue(child)) state.expandedDetailPaths[childPath] = true;
      matched = matched || keyMatched || childMatched;
    });
  }

  return matched;
}

export function applySearchExpansion() {
  var q = dom.globalSearch.value.trim().toLowerCase();
  if (!q) return;
  state.expandedDetailPaths = {};
  collectSearchExpandedPaths(state.nodesByPath[state.selectedPath], state.selectedPath, q);
}

export function getPathDepth(path) {
  if (!path || path === "$") return 0;
  var normalized = path.replace(/[[^]]+]/g, ".[]");
  return normalized.split(".").length - 1;
}

export function syncExpandedDetailPaths() {
  Array.prototype.forEach.call(dom.content.querySelectorAll("details[data-path]"), function (item) {
    var path = item.getAttribute("data-path");
    if (!path) return;
    if (item.open) {
      state.expandedDetailPaths[path] = true;
    } else {
      delete state.expandedDetailPaths[path];
    }
  });
}

export function restoreExpandedDetails() {
  Array.prototype.forEach.call(dom.content.querySelectorAll("details[data-path]"), function (item) {
    var path = item.getAttribute("data-path");
    item.open = !!state.expandedDetailPaths[path];
  });
}

export function bindDetailsToggleEvents() {
  Array.prototype.forEach.call(dom.content.querySelectorAll("details[data-path]"), function (item) {
    item.ontoggle = function () {
      if (state.suppressDetailToggle) return;

      var path = item.getAttribute("data-path");
      if (!path) return;

      if (item.open) {
        state.expandedDetailPaths[path] = true;
        if (!item.querySelector(":scope > .detail-body")) {
          render();
        }
        return;
      }

      delete state.expandedDetailPaths[path];
      var body = item.querySelector(":scope > .detail-body");
      if (body && body.parentNode) body.parentNode.removeChild(body);
      // Folding can shrink an auto-width column, leaving frozen left
      // offsets stale (M2). Recompute them.
      applyFrozenLayout();
    };
  });
}

export function getTreeColumnIndex(table) {
  if (state.activeTreeColumnIndex >= 0) return state.activeTreeColumnIndex;
  return table && table.rows && table.rows[0] ? table.rows[0].cells.length - 1 : -1;
}

export function getColumnDetails(table, directOnly) {
  if (!table || !table.tBodies || !table.tBodies.length) return [];

  var details = [];
  var columnIndex = getTreeColumnIndex(table);
  Array.prototype.forEach.call(table.tBodies[0].children, function (row) {
    var cell = row.cells && row.cells[columnIndex];
    if (!cell) return;

    if (directOnly) {
      Array.prototype.forEach.call(cell.children, function (child) {
        if (child.matches && child.matches("details[data-depth]")) details.push(child);
      });
    } else {
      details = details.concat(Array.prototype.slice.call(cell.querySelectorAll("details[data-depth]")));
    }
  });

  return details;
}

export function getScopedDetails(scope) {
  var details = getColumnDetails(state.activeTreeTable, scope === "current");
  if (!details.length && scope !== "current") {
    details = Array.prototype.slice.call(dom.content.querySelectorAll("details[data-depth]"));
  }
  return details;
}

export function applyDetailsOpen(details, open, scope) {
  state.suppressDetailToggle = true;
  try {
    details.forEach(function (item) {
      var path = item.getAttribute("data-path");
      if (!path) return;

      item.open = open;
      if (open) {
        if (scope === "all") {
          addExpandablePaths(getNodeAtPath(path), path);
        } else {
          state.expandedDetailPaths[path] = true;
        }
      } else {
        removeExpandedPathTree(path);
      }
    });
  } finally {
    setTimeout(function () { state.suppressDetailToggle = false; }, 0);
  }
}

export function toggleDetailsOpen(scope) {
  var details = getScopedDetails(scope);
  var shouldOpen = details.some(function (item) {
    return !item.open;
  });
  applyDetailsOpen(details, shouldOpen, scope);
  render();
}

export function hasExpandableValue(v) {
  return !!(v && typeof v === "object") || !!tryParseJsonStringValue(v);
}

export function treeMenuHtml() {
  return '<div class="tree-menu">' +
    '<button class="tree-action" data-scope="current">展开/折叠本层</button>' +
    '<button class="tree-action" data-scope="all">展开/折叠全部</button>' +
  '</div>';
}

export function closeTreeMenu() {
  state.treeMenuOpen = false;
  state.activeTreeTable = null;
  state.activeTreeColumnIndex = -1;
  Array.prototype.forEach.call(document.querySelectorAll(".tree-menu"), function (menu) {
    if (menu.parentNode) menu.parentNode.removeChild(menu);
  });
  Array.prototype.forEach.call(dom.content.querySelectorAll(".tree-menu-btn"), function (btn) {
    btn.setAttribute("aria-expanded", "false");
  });
}

export function bindTreeActionEvents(root) {
  Array.prototype.forEach.call(root.querySelectorAll(".tree-menu"), function (menu) {
    menu.onclick = function (event) {
      event.stopPropagation();
    };
  });

  Array.prototype.forEach.call(root.querySelectorAll(".tree-action"), function (btn) {
    btn.onclick = function (event) {
      event.stopPropagation();
      toggleDetailsOpen(btn.getAttribute("data-scope"));
      closeTreeMenu();
    };
  });
}

export function positionTreeMenu(btn) {
  var menu = document.querySelector(".tree-menu");
  if (!menu) return;

  var rect = btn.getBoundingClientRect();
  var left = Math.min(rect.left, window.innerWidth - menu.offsetWidth - 8);
  var top = Math.min(rect.bottom + 6, window.innerHeight - menu.offsetHeight - 8);
  menu.style.left = Math.max(8, left) + "px";
  menu.style.top = Math.max(8, top) + "px";
}

export function bindTreeMenuEvents() {
  Array.prototype.forEach.call(dom.content.querySelectorAll(".tree-menu-btn"), function (btn) {
    btn.onclick = function (event) {
      event.stopPropagation();

      if (state.treeMenuOpen) {
        closeTreeMenu();
        return;
      }

      closeTreeMenu();
      state.activeFilterColumn = null;
      state.activeTreeTable = btn.closest("table.grid");
      state.activeTreeColumnIndex = btn.closest("th").cellIndex;
      document.body.insertAdjacentHTML("beforeend", treeMenuHtml());
      state.treeMenuOpen = true;
      btn.setAttribute("aria-expanded", "true");
      positionTreeMenu(btn);
      bindTreeActionEvents(document);
    };
  });

  bindTreeActionEvents(document);
}