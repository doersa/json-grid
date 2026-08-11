// 预览 iframe：错误页、状态捕获/恢复、父窗口 ⇄ iframe 桥接脚本。
// 由单文件 index.html 拆分而来；DOM 句柄与 UI 状态集中在 state.js（el / ui）。

import { el, ui } from "./state.js";
export function errorPreview(message) {
  ui.hasRenderedPreview = false;
  ui.previewBridgeId += 1;
  ui.previewRestoringUntil = 0;
  el.preview.srcdoc = '<div class="error-preview"></div>';
  el.preview.onload = () => {
    const el = el.preview.contentDocument && el.preview.contentDocument.querySelector('.error-preview');
    if (el) el.textContent = message;
  };
}

export function focusPreviewPath(path) {
  if (!path) return;
  ui.pendingPreviewFocus = {
    path,
    bridgeId: ui.previewBridgeId,
    focusId: ++ui.previewFocusSeq,
    attempts: 0
  };
  flushPreviewFocus();
}

export function flushPreviewFocus() {
  const focus = ui.pendingPreviewFocus;
  if (!focus || focus.bridgeId !== ui.previewBridgeId || !el.preview.contentWindow) return;
  el.preview.contentWindow.postMessage({
    type: 'json-table-focus-path',
    path: focus.path,
    focusId: focus.focusId,
    bridgeId: focus.bridgeId
  }, '*');
  if (focus.attempts >= 5) return;
  focus.attempts += 1;
  setTimeout(() => {
    if (ui.pendingPreviewFocus && ui.pendingPreviewFocus.focusId === focus.focusId) flushPreviewFocus();
  }, 180);
}

export function capturePreviewStateFromDom() {
  try {
    const doc = el.preview.contentDocument;
    if (!doc) return ui.previewState;
    const pathSelect = doc.getElementById('pathSelect');
    const globalSearch = doc.getElementById('globalSearch');
    const content = doc.getElementById('content');
    return {
      path: pathSelect ? pathSelect.value : '',
      search: globalSearch ? globalSearch.value : '',
      scrollTop: content ? content.scrollTop : 0,
      scrollLeft: content ? content.scrollLeft : 0,
      openPaths: Array.from(doc.querySelectorAll('details[data-path][open]')).map((item) => item.getAttribute('data-path'))
    };
  } catch (err) {
    return ui.previewState;
  }
}

export function restorePreviewState(state, bridgeId) {
  if (!state || !el.preview.contentWindow || bridgeId !== ui.previewBridgeId) return;
  ui.previewRestoringUntil = Date.now() + 900;
  el.preview.contentWindow.postMessage({ type: 'json-table-restore-state', state, bridgeId }, '*');
  setTimeout(() => {
    if (bridgeId === ui.previewBridgeId) {
      ui.previewState = capturePreviewStateFromDom() || state;
      ui.previewRestoringUntil = 0;
    }
  }, 950);
}

export function iframeBridgeScript(bridgeId) {
  return `<script>
    (function () {
      var BRIDGE_ID = ${bridgeId};
      var pendingStateTimer = null;
      var restoreInProgress = false;
      var focusRequestId = 0;
      var activeFocusToken = 0;
      var activeFocusTimer = null;

      function cellPath(cell) {
        var row = cell && cell.closest('tr[data-row-path]');
        if (!row) return '';
        var rowPath = row.getAttribute('data-row-path') || '';
        if (!rowPath) return '';
        var table = row.closest('table');
        var cellIndex = Array.prototype.indexOf.call(row.children, cell);
        var header = table && table.tHead && table.tHead.rows[0] && table.tHead.rows[0].cells[cellIndex];
        var col = header && header.getAttribute('data-col-key');
        if (!col || col === 'Key' || col === 'Type' || col === '#' || col === 'Value') return rowPath;
        return rowPath + '.' + col;
      }

      function cssEscape(value) {
        if (window.CSS && CSS.escape) return CSS.escape(value);
        return String(value).replace(/"/g, '\\"');
      }


      function installFocusStyle() {
        if (document.getElementById('jsonTableFocusStyle')) return;
        var style = document.createElement('style');
        style.id = 'jsonTableFocusStyle';
        style.textContent = [
          '.json-focus-row > td {',
          '  background: #eff6ff !important;',
          '}',
          '.json-focus-target {',
          '  background: #dbeafe !important;',
          '  outline: 3px solid #2563eb;',
          '  outline-offset: -3px;',
          '  position: relative;',
          '  z-index: 6;',
          '}',
          '.json-focus-row > td.json-focus-target {',
          '  background: #dbeafe !important;',
          '}'
        ].join('\\n');
        document.head.appendChild(style);
      }

      function findRowByPath(path) {
        var rows = document.querySelectorAll('tr[data-row-path]');
        for (var i = 0; i < rows.length; i += 1) {
          if (rows[i].getAttribute('data-row-path') === path) return rows[i];
        }
        return null;
      }

      function findTableByPath(path) {
        var tables = document.querySelectorAll('table[data-table-id]');
        for (var i = 0; i < tables.length; i += 1) {
          if (tables[i].getAttribute('data-table-id') === path) return tables[i];
        }
        return null;
      }

      function collectState() {
        var pathSelect = document.getElementById('pathSelect');
        var globalSearch = document.getElementById('globalSearch');
        var content = document.getElementById('content');
        return {
          path: pathSelect ? pathSelect.value : '',
          search: globalSearch ? globalSearch.value : '',
          scrollTop: content ? content.scrollTop : 0,
          scrollLeft: content ? content.scrollLeft : 0,
          openPaths: Array.prototype.map.call(document.querySelectorAll('details[data-path][open]'), function (item) {
            return item.getAttribute('data-path');
          })
        };
      }

      function emitState(reason) {
        parent.postMessage({ type: 'json-table-state', state: collectState(), bridgeId: BRIDGE_ID, reason: reason || '' }, '*');
      }

      function scheduleEmitState() {
        if (restoreInProgress) return;
        clearTimeout(pendingStateTimer);
        pendingStateTimer = setTimeout(function () { emitState('change'); }, 120);
      }

      function optionExists(select, value) {
        return Array.prototype.some.call(select.options || [], function (option) {
          return option.value === value;
        });
      }

      function setRootPath(path) {
        var select = document.getElementById('pathSelect');
        if (!select || !path || select.value === path || !optionExists(select, path)) return false;
        select.value = path;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }

      function bestRootPathFor(path) {
        var select = document.getElementById('pathSelect');
        if (!select) return '';
        var best = '';
        Array.prototype.forEach.call(select.options || [], function (option) {
          var value = option.value;
          var inside = path === value || path.indexOf(value + '.') === 0 || path.indexOf(value + '[') === 0;
          if (inside && value.length > best.length) best = value;
        });
        return best || '$';
      }

      function ensureRootForPath(path) {
        var select = document.getElementById('pathSelect');
        var best = bestRootPathFor(path);
        if (!select || !best || select.value === best) return false;
        return setRootPath(best);
      }

      function setSearch(search) {
        var input = document.getElementById('globalSearch');
        if (!input || input.value === (search || '')) return;
        input.value = search || '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }

      function restoreOpenPaths(paths) {
        (paths || []).forEach(function (path) {
          var details = document.querySelector('details[data-path="' + cssEscape(path) + '"]');
          if (details && !details.open) details.open = true;
        });
      }

      function restoreScroll(state) {
        var content = document.getElementById('content');
        if (!content) return;
        content.scrollTop = Number(state.scrollTop || 0);
        content.scrollLeft = Number(state.scrollLeft || 0);
      }

      function restoreState(state) {
        if (!state) return;
        restoreInProgress = true;
        setRootPath(state.path);
        setTimeout(function () {
          setSearch(state.search);
          setTimeout(function () {
            restoreOpenPaths(state.openPaths);
            setTimeout(function () {
              restoreOpenPaths(state.openPaths);
              restoreScroll(state);
              restoreInProgress = false;
              emitState('restored');
            }, 120);
          }, 120);
        }, 120);
      }

      function ancestorPaths(path) {
        var result = [];
        var re = /\.([^\.\[]+)|\[(\d+)\]/g;
        var current = '$';
        var match;
        while ((match = re.exec(path))) {
          current += match[0];
          result.push(current);
        }
        result.pop();
        return result;
      }

      function findTarget(path) {
        var cell = findCellByPath(path);
        if (cell) return cell;
        var row = findRowByPath(path);
        if (row) return preferredCellForRow(row);
        return null;
      }

      function findCellByPath(path) {
        var cells = document.querySelectorAll('tbody td');
        var first = null;
        for (var i = 0; i < cells.length; i += 1) {
          if (cellPath(cells[i]) !== path) continue;
          if (!first) first = cells[i];
          if (isPreferredFocusCell(cells[i])) return cells[i];
        }
        return first;
      }

      function isPreferredFocusCell(cell) {
        if (!cell || !cell.classList) return false;
        return cell.classList.contains('value-col') ||
          (!cell.classList.contains('key-col') && !cell.classList.contains('index-col') && !cell.classList.contains('type-col'));
      }

      function preferredCellForRow(row) {
        if (!row || !row.cells || !row.cells.length) return row;
        var table = row.closest('table');
        var headers = table && table.tHead && table.tHead.rows[0] && table.tHead.rows[0].cells;
        if (!headers) return row.cells[row.cells.length - 1] || row;
        for (var i = 0; i < headers.length; i += 1) {
          if (headers[i].getAttribute('data-col-key') === 'Value') return row.cells[i] || row;
        }
        return row.cells[row.cells.length - 1] || row;
      }

      function clearFocusVisuals() {
        activeFocusToken += 1;
        if (activeFocusTimer) {
          clearTimeout(activeFocusTimer);
          activeFocusTimer = null;
        }
        Array.prototype.forEach.call(document.querySelectorAll('.json-focus-target'), function (item) {
          item.classList.remove('json-focus-target');
        });
        Array.prototype.forEach.call(document.querySelectorAll('.json-focus-row'), function (item) {
          item.classList.remove('json-focus-row');
        });
      }

      function highlightTarget(target, focusId) {
        installFocusStyle();
        clearFocusVisuals();
        var token = activeFocusToken;
        target.scrollIntoView({ block: 'center', inline: 'center' });
        var row = target.closest && target.closest('tr');
        if (row) row.classList.add('json-focus-row');
        target.classList.add('json-focus-target');
        activeFocusTimer = setTimeout(function () {
          if (token !== activeFocusToken) return;
          target.classList.remove('json-focus-target');
          if (row) row.classList.remove('json-focus-row');
          activeFocusTimer = null;
        }, 2200);
        parent.postMessage({ type: 'json-table-focus-result', ok: true, focusId: focusId, bridgeId: BRIDGE_ID }, '*');
        emitState('focused');
      }

      function rootFallbackTarget(path) {
        var select = document.getElementById('pathSelect');
        var selected = select && select.value;
        if (path !== selected) return null;
        return findTableByPath(path) || document.getElementById('content');
      }

      function focusPath(path, requestId, attempt, focusId) {
        if (requestId !== focusRequestId) return;
        attempt = attempt || 0;
        if (attempt > 8) {
          parent.postMessage({ type: 'json-table-focus-result', ok: false, focusId: focusId, bridgeId: BRIDGE_ID }, '*');
          return;
        }

        if (ensureRootForPath(path)) {
          setTimeout(function () { focusPath(path, requestId, attempt + 1, focusId); }, 140);
          return;
        }

        var target = findTarget(path) || rootFallbackTarget(path);
        if (!target) {
          restoreOpenPaths(ancestorPaths(path));
          setTimeout(function () { focusPath(path, requestId, attempt + 1, focusId); }, 120);
          return;
        }

        highlightTarget(target, focusId);
      }

      document.addEventListener('click', function (event) {
        var cell = event.target && event.target.closest && event.target.closest('td');
        if (!cell) return;
        var path = cellPath(cell);
        if (!path) return;
        parent.postMessage({ type: 'json-table-cell-click', path: path, bridgeId: BRIDGE_ID }, '*');
        scheduleEmitState();
      }, true);

      document.addEventListener('toggle', scheduleEmitState, true);
      document.addEventListener('change', scheduleEmitState, true);
      document.addEventListener('input', scheduleEmitState, true);
      var content = document.getElementById('content');
      if (content) content.addEventListener('scroll', scheduleEmitState, { passive: true });

      window.addEventListener('message', function (event) {
        var data = event.data || {};
        if (data.bridgeId && data.bridgeId !== BRIDGE_ID) return;
        if (data.type === 'json-table-restore-state') restoreState(data.state);
        if (data.type === 'json-table-focus-path') {
          focusRequestId += 1;
          focusPath(data.path, focusRequestId, 0, data.focusId);
        }
      });

      emitState('ready');
    })();
  <\/script>`;
}