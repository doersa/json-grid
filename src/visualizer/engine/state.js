// 全局共享状态与常量。
// 引擎原本运行在 pm.getData 的大闭包里，所有函数共享这批闭包变量；
// 拆分后集中在这里：state 为可变视图状态，dom 为骨架元素句柄（initDomRefs 在拿到数据后填充）。

import { isPlainObject, safeStorageGet, safeStorageSet } from "./utils.js";

export const MAX_RENDER_ROWS = 2000;
export const STORAGE_KEY = "apifox-json-table-state-v2";
export const LARGE_JSON_CHARS = 500000;
export const LARGE_SEARCH_CHARS = 250000;

export const dom = {};

export function initDomRefs() {
  dom.content = document.getElementById("content");
  dom.stickyContextBar = document.getElementById("stickyContextBar");
  dom.stickyContextPath = document.getElementById("stickyContextPath");
  dom.stickyContextSummary = document.getElementById("stickyContextSummary");
  dom.stickyContextJump = document.getElementById("stickyContextJump");
  dom.filterChips = document.getElementById("filterChips");
  dom.stickyTableHead = document.getElementById("stickyTableHead");
  dom.stickyTableHeadInner = document.getElementById("stickyTableHeadInner");
  dom.meta = document.getElementById("meta");
  dom.toggle = document.getElementById("toggle");
  dom.settingsWrap = document.getElementById("settingsWrap");
  dom.settingsBtn = document.getElementById("settingsBtn");
  dom.settingsMenu = document.getElementById("settingsMenu");
  dom.showTypeCheck = document.getElementById("showTypeCheck");
  dom.freezeHeaderCheck = document.getElementById("freezeHeaderCheck");
  dom.showStickyHeaderCheck = document.getElementById("showStickyHeaderCheck");
  dom.parseJsonStringCheck = document.getElementById("parseJsonStringCheck");
  dom.headerModeSelect = document.getElementById("headerModeSelect");
  dom.columnSettings = document.getElementById("columnSettings");
  dom.copyPathBtn = document.getElementById("copyPathBtn");
  dom.copyJsonBtn = document.getElementById("copyJsonBtn");
  dom.exportJsonBtn = document.getElementById("exportJsonBtn");
  dom.exportCsvBtn = document.getElementById("exportCsvBtn");
  dom.favPathBtn = document.getElementById("favPathBtn");
  dom.pathShortcuts = document.getElementById("pathShortcuts");
  dom.globalSearch = document.getElementById("globalSearch");
  dom.resetFilters = document.getElementById("resetFilters");
  dom.pathSelect = document.getElementById("pathSelect");
  dom.pathUp = document.getElementById("pathUp");
}

export const state = {
  raw: "",
  showTable: true,
  showTypeColumn: false,
  json: undefined,
  tableRows: null,
  tablePath: "$",
  selectedPath: "$",
  nodesByPath: {},
  columnFilters: {},
  activeFilterColumn: null,
  sortState: { col: null, dir: null },
  columnWidths: {},
  hiddenColumnsByPath: {},
  frozenColumnsByPath: {},
  pendingFreezeFirstCol: false,
  renderedNodesByPath: {},
  parseFailureSamples: {},
  currentAllColumns: [],
  currentColumns: [],
  currentRows: [],
  recentPaths: ["$"],
  favoritePaths: {},
  treeMenuOpen: false,
  activeTreeTable: null,
  activeTreeColumnIndex: -1,
  expandedDetailPaths: {},
  suppressDetailToggle: false,
  stickyContextPathValue: "",
  stickyContextTicking: false,
  stickyTableHeadKey: "",
  stickyHeaderMode: "single",
  showStickyHeader: true,
  parseJsonString: true,
  freezeHeader: false,
  frozenLayoutTicking: false,
};

// 从 localStorage 恢复视图状态（展开路径、列宽、冻结列、收藏等）。
export function loadPersistedState() {
  var saved = safeStorageGet(STORAGE_KEY);
  if (!saved) return;

  try {
    var persisted = JSON.parse(saved);
    if (!isPlainObject(persisted)) return;

    state.showTypeColumn = !!persisted.showTypeColumn;
    state.freezeHeader = !!persisted.freezeHeader;
    state.showStickyHeader = persisted.showStickyHeader !== false;
    state.parseJsonString = persisted.parseJsonString !== false;
    state.stickyHeaderMode = persisted.stickyHeaderMode === "multi" ? "multi" : "single";
    state.columnWidths = isPlainObject(persisted.columnWidths) ? persisted.columnWidths : {};
    state.hiddenColumnsByPath = isPlainObject(persisted.hiddenColumnsByPath) ? persisted.hiddenColumnsByPath : {};
    var hadFrozenColumns = Object.prototype.hasOwnProperty.call(persisted, "frozenColumnsByPath");
    state.frozenColumnsByPath = isPlainObject(persisted.frozenColumnsByPath) ? persisted.frozenColumnsByPath : {};
    state.favoritePaths = isPlainObject(persisted.favoritePaths) ? persisted.favoritePaths : {};
    state.recentPaths = Array.isArray(persisted.recentPaths) && persisted.recentPaths.length ? persisted.recentPaths.slice(0, 6) : state.recentPaths;
    if (state.freezeHeader && !hadFrozenColumns) state.pendingFreezeFirstCol = true;
  } catch (e) {}
}

// 把视图状态写回 localStorage。
export function savePersistedState() {
  safeStorageSet(STORAGE_KEY, JSON.stringify({
    showTypeColumn: state.showTypeColumn,
    freezeHeader: state.freezeHeader,
    showStickyHeader: state.showStickyHeader,
    parseJsonString: state.parseJsonString,
    stickyHeaderMode: state.stickyHeaderMode,
    columnWidths: state.columnWidths,
    hiddenColumnsByPath: state.hiddenColumnsByPath,
    frozenColumnsByPath: state.frozenColumnsByPath,
    favoritePaths: state.favoritePaths,
    recentPaths: state.recentPaths
  }));
}
