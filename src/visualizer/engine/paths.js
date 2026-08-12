// 路径导航：表格路径候选、路径下拉、面包屑、最近/收藏路径。
// 由单文件 index.html 拆分而来；共享状态集中在 state.js（state / dom 两个对象）。

import { dom, savePersistedState, state } from "./state.js";
import { render } from "./render.js";
import { updateSettingsPanel } from "./settings.js";
import { esc, isObj, summarize } from "./utils.js";
export function isRecordArray(v) {
  return Array.isArray(v) && v.length > 0 && v.every(function (item) {
    return isObj(item);
  });
}

export function findFirstRecordArray(v, path) {
  if (isRecordArray(v)) {
    return { rows: v, path: path || "$" };
  }

  if (Array.isArray(v)) {
    for (var i = 0; i < v.length; i++) {
      var foundInArray = findFirstRecordArray(v[i], (path || "$") + "[" + i + "]");
      if (foundInArray) return foundInArray;
    }
  }

  if (isObj(v)) {
    var keys = Object.keys(v);
    for (var j = 0; j < keys.length; j++) {
      var key = keys[j];
      var foundInObject = findFirstRecordArray(v[key], (path || "$") + "." + key);
      if (foundInObject) return foundInObject;
    }
  }

  return null;
}

export function buildPathOptions(v, path) {
  state.nodesByPath[path] = v;

  // 路径选择只展示可作为根路径的字段路径。
  // 数组本身可以选中，例如 $.list；但不要继续展开 $.list[0] / $.list[1]。
  if (Array.isArray(v)) {
    return;
  }

  if (isObj(v)) {
    Object.keys(v).forEach(function (key) {
      var child = v[key];
      if (child && typeof child === "object") {
        buildPathOptions(child, path + "." + key);
      }
    });
  }
}

export function refreshPathSelect() {
  var paths = Object.keys(state.nodesByPath);
  var html = "";

  paths.forEach(function (path) {
    var node = state.nodesByPath[path];
    var selected = path === state.selectedPath ? " selected" : "";
    html += '<option value="' + esc(path) + '" title="' + esc(summarize(node)) + '"' + selected + '>' + esc(path) + '</option>';
  });

  dom.pathSelect.innerHTML = html;
}

export function setRootPath(path) {
  if (!Object.prototype.hasOwnProperty.call(state.nodesByPath, path)) return;

  state.selectedPath = path;
  dom.pathSelect.value = path;
  addRecentPath(path);
  state.currentAllColumns = [];
  state.currentColumns = [];
  state.currentRows = [];
  state.expandedDetailPaths = {};
  state.columnFilters = {};
  state.sortState = { col: null, dir: null };
  state.activeFilterColumn = null;
  state.treeMenuOpen = false;
  dom.globalSearch.value = "";
  render({ preserveDetails: false });
}

export function getPathCrumbs(path) {
  var crumbs = [{ label: "$", path: "$" }];
  if (!path || path === "$") return crumbs;

  var current = "$";
  path.slice(2).split(".").forEach(function (part) {
    current += "." + part;
    crumbs.push({ label: part, path: current });
  });

  return crumbs;
}

export function renderMetaPath(path) {
  return '<span class="meta-path">' + getPathCrumbs(path).map(function (crumb, index) {
    var sep = index === 0 ? "" : '<span class="meta-path-sep">.</span>';
    var disabled = Object.prototype.hasOwnProperty.call(state.nodesByPath, crumb.path) ? "" : " disabled";
    return sep + '<button class="meta-path-btn" data-path="' + esc(crumb.path) + '"' + disabled + '>' + esc(crumb.label) + '</button>';
  }).join("") + '</span>';
}

export function parentPath(path) {
  if (!path || path === "$" || path.indexOf(".") < 0) return "$";
  return path.slice(0, path.lastIndexOf("."));
}

export function addRecentPath(path) {
  state.recentPaths = [path].concat(state.recentPaths.filter(function (item) {
    return item !== path;
  })).slice(0, 6);
  savePersistedState();
}

export function toggleFavoritePath(path) {
  if (state.favoritePaths[path]) {
    delete state.favoritePaths[path];
  } else {
    state.favoritePaths[path] = true;
  }
  savePersistedState();
  updateSettingsPanel();
}