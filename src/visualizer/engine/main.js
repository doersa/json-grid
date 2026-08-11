// 引擎入口：拿到 pm 数据后初始化 DOM 句柄、恢复持久化状态、绑定事件并首次渲染。

import { dom, initDomRefs, loadPersistedState, savePersistedState, state } from "./state.js";
import { getFrozenColumns, scheduleFrozenLayout } from "./columns.js";
import { closeTreeMenu } from "./details-tree.js";
import { buildPathOptions, parentPath, refreshPathSelect, setRootPath, toggleFavoritePath } from "./paths.js";
import { render } from "./render.js";
import { bindStickyContextEvents, hideStickyTableHead, updateStickyContextBar } from "./sticky-header.js";
import { copyText, downloadFile, getExportRows, rowsToCsv, showToast } from "./utils.js";

pm.getData(function (err, data) {
  state.raw = data.raw || "";
  initDomRefs();

  try {
    state.json = JSON.parse(state.raw);
  } catch (e) {
    dom.meta.textContent = "非 JSON 响应";
    dom.content.innerHTML = "<pre></pre>";
    dom.content.querySelector("pre").textContent = state.raw;
    return;
  }


  loadPersistedState();

  buildPathOptions(state.json, "$");

  refreshPathSelect();


  window.addEventListener("resize", scheduleFrozenLayout);


  // M1: container/panel resize (e.g. dragging a splitter in a non-iframe
  // embed) does not fire window.resize, so observe the content box directly.
  if (typeof ResizeObserver !== "undefined" && dom.content) {
    var frozenRO = new ResizeObserver(scheduleFrozenLayout);
    frozenRO.observe(dom.content);
  }


  // L2: a backgrounded tab throttles rAF and getBoundingClientRect can
  // return 0 on first paint; recompute offsets when the tab becomes visible.
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) scheduleFrozenLayout();
  });


  dom.pathSelect.onchange = function () {
    setRootPath(dom.pathSelect.value);
  };


  dom.globalSearch.oninput = function () {
    closeTreeMenu();
    render();
  };


  dom.resetFilters.onclick = function () {
    state.columnFilters = {};
    state.activeFilterColumn = null;
    closeTreeMenu();
    dom.globalSearch.value = "";
    render();
  };


  dom.pathUp.onclick = function () {
    setRootPath(parentPath(state.selectedPath));
  };


  dom.copyPathBtn.onclick = function () {
    copyText(state.tablePath);
  };


  dom.copyJsonBtn.onclick = function () {
    copyText(JSON.stringify(getExportRows(), null, 2));
  };


  dom.exportJsonBtn.onclick = function () {
    downloadFile("json-table-export.json", JSON.stringify(getExportRows(), null, 2), "application/json");
  };


  dom.exportCsvBtn.onclick = function () {
    // L7: frozen columns are shown front-and-center in the grid, but the
    // export keeps the data's original column order. Tell the user so the
    // reordering isn't mistaken for a data change.
    var fz = getFrozenColumns(state.tablePath);
    var fzCount = fz ? Object.keys(fz).filter(function (k) { return fz[k]; }).length : 0;
    if (fzCount) {
      showToast("导出列顺序为数据原始顺序（冻结列在表格中前置显示，不影响导出内容）");
    }
    downloadFile("json-table-export.csv", rowsToCsv(getExportRows(), state.currentColumns.length ? state.currentColumns : state.currentAllColumns), "text/csv;charset=utf-8");
  };


  dom.favPathBtn.onclick = function () {
    toggleFavoritePath(state.selectedPath);
  };


  dom.settingsBtn.onclick = function (event) {
    event.stopPropagation();
    state.activeFilterColumn = null;
    closeTreeMenu();
    dom.settingsMenu.hidden = !dom.settingsMenu.hidden;
    dom.settingsBtn.classList.toggle("active", !dom.settingsMenu.hidden);
    dom.settingsBtn.setAttribute("aria-expanded", String(!dom.settingsMenu.hidden));
  };


  dom.showTypeCheck.onchange = function () {
    state.showTypeColumn = dom.showTypeCheck.checked;
    savePersistedState();
    state.activeFilterColumn = null;
    closeTreeMenu();
    render();
  };


  dom.freezeHeaderCheck.onchange = function () {
    state.freezeHeader = dom.freezeHeaderCheck.checked;
    savePersistedState();
    state.activeFilterColumn = null;
    closeTreeMenu();
    render();
  };


  dom.showStickyHeaderCheck.onchange = function () {
    state.showStickyHeader = dom.showStickyHeaderCheck.checked;
    savePersistedState();
    state.activeFilterColumn = null;
    closeTreeMenu();
    hideStickyTableHead();
    updateStickyContextBar();
  };


  dom.parseJsonStringCheck.onchange = function () {
    state.parseJsonString = dom.parseJsonStringCheck.checked;
    savePersistedState();
    state.activeFilterColumn = null;
    closeTreeMenu();
    render();
  };


  dom.headerModeSelect.onchange = function () {
    state.stickyHeaderMode = dom.headerModeSelect.value === "multi" ? "multi" : "single";
    savePersistedState();
    state.activeFilterColumn = null;
    closeTreeMenu();
    hideStickyTableHead();
    updateStickyContextBar();
  };


  dom.toggle.onclick = function () {
    state.showTable = !state.showTable;
    state.activeFilterColumn = null;
    closeTreeMenu();
    render();
  };


  document.addEventListener("click", function (event) {
    var target = event.target;
    var inTreeLayer = target && target.closest &&
      (target.closest(".tree-menu") || target.closest(".tree-menu-btn"));
    var inFilterLayer = target && target.closest &&
      (target.closest(".th-wrap") || target.closest(".filter-menu") || target.closest(".filter-btn"));
    var inSettingsLayer = dom.settingsWrap && dom.settingsWrap.contains(target);

    if (!inSettingsLayer) {
      dom.settingsMenu.hidden = true;
      dom.settingsBtn.classList.remove("active");
      dom.settingsBtn.setAttribute("aria-expanded", "false");
    }

    if (state.treeMenuOpen && !inTreeLayer) {
      closeTreeMenu();
    }

    if (state.activeFilterColumn && !inFilterLayer) {
      state.activeFilterColumn = null;
      Array.prototype.forEach.call(document.body.querySelectorAll(".filter-menu"), function (menu) {
        if (menu.parentNode) menu.parentNode.removeChild(menu);
      });
    }
  });


  bindStickyContextEvents();

  render();
});
