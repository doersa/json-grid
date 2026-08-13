(() => {
  // src/page/state.js
  var STORAGE_KEY = "json-table-split-input-v3";
  var SPLIT_KEY = "json-table-split-left-width-v1";
  var PANE_COLLAPSED_KEY = "json-table-split-input-collapsed-v1";
  var SPLIT_MIN_LEFT = 220;
  var SPLIT_MIN_RIGHT = 320;
  var SPLIT_HANDLE_WIDTH = 8;
  var el = {
    app: document.querySelector(".app"),
    input: document.getElementById("jsonInput"),
    preview: document.getElementById("preview"),
    status: document.getElementById("status"),
    splitResizer: document.getElementById("splitResizer"),
    paneToggleBtn: document.getElementById("paneToggleBtn")
  };
  var ui = {
    renderTimer: null,
    previewState: null,
    previewBridgeId: 0,
    previewRestoringUntil: 0,
    hasRenderedPreview: false,
    pendingPreviewFocus: null,
    previewFocusSeq: 0
  };

  // src/page/split-pane.js
  function setStatus(text, type) {
    el.status.textContent = text;
    el.status.className = "status" + (type ? " " + type : "");
  }
  function setInputPaneCollapsed(collapsed) {
    el.app.classList.toggle("input-collapsed", collapsed);
    el.paneToggleBtn.textContent = collapsed ? "\u663E\u793A" : "\u2039";
    el.paneToggleBtn.title = collapsed ? "\u663E\u793A\u5DE6\u4FA7 JSON" : "\u9690\u85CF\u5DE6\u4FA7 JSON";
    el.paneToggleBtn.setAttribute("aria-pressed", String(collapsed));
    localStorage.setItem(PANE_COLLAPSED_KEY, collapsed ? "1" : "0");
  }
  function initInputPaneToggle() {
    const collapsed = localStorage.getItem(PANE_COLLAPSED_KEY) === "1";
    setInputPaneCollapsed(collapsed);
    el.paneToggleBtn.addEventListener("click", () => {
      setInputPaneCollapsed(!el.app.classList.contains("input-collapsed"));
    });
  }
  function formatBytes(chars) {
    const bytes = new Blob([chars]).size;
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  }
  function clampLeftWidth(width) {
    const max = Math.max(SPLIT_MIN_LEFT, window.innerWidth - SPLIT_MIN_RIGHT - SPLIT_HANDLE_WIDTH);
    return Math.min(max, Math.max(SPLIT_MIN_LEFT, Math.round(width)));
  }
  function setLeftWidth(width, shouldPersist = true) {
    const nextWidth = clampLeftWidth(width);
    el.app.style.setProperty("--left-pane-width", nextWidth + "px");
    if (shouldPersist) localStorage.setItem(SPLIT_KEY, String(nextWidth));
  }
  function initSplitWidth() {
    const saved = Number(localStorage.getItem(SPLIT_KEY));
    if (Number.isFinite(saved) && saved > 0) {
      setLeftWidth(saved, false);
      return;
    }
    setLeftWidth(window.innerWidth * 0.25, false);
  }
  function bindSplitResizer() {
    el.splitResizer.addEventListener("pointerdown", (event) => {
      if (event.target === el.paneToggleBtn || el.app.classList.contains("input-collapsed")) return;
      event.preventDefault();
      document.body.classList.add("resizing-layout");
      el.splitResizer.classList.add("active");
      el.splitResizer.setPointerCapture(event.pointerId);
      const appRect = el.app.getBoundingClientRect();
      const onMove = (moveEvent) => {
        setLeftWidth(moveEvent.clientX - appRect.left);
      };
      const onUp = (upEvent) => {
        document.body.classList.remove("resizing-layout");
        el.splitResizer.classList.remove("active");
        if (el.splitResizer.hasPointerCapture(upEvent.pointerId)) {
          el.splitResizer.releasePointerCapture(upEvent.pointerId);
        }
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    });
    window.addEventListener("resize", () => {
      const current = Number(localStorage.getItem(SPLIT_KEY)) || window.innerWidth * 0.25;
      setLeftWidth(current, Boolean(localStorage.getItem(SPLIT_KEY)));
    });
  }

  // src/page/json-cursor.js
  function pathToSegments(path) {
    if (!path || path === "$") return [];
    const segments = [];
    String(path).replace(/^\$/, "").replace(/\.([^\.\[]+)|\[(\d+)\]/g, (_, key, index) => {
      segments.push(key !== void 0 ? key : Number(index));
      return "";
    });
    return segments;
  }
  function primitiveJsonText(value) {
    if (typeof value === "string") return JSON.stringify(value);
    if (value === void 0) return "";
    return JSON.stringify(value);
  }
  function displayBaseKey(root) {
    if (root && Object.prototype.hasOwnProperty.call(root, "DATA")) return "DATA";
    if (root && Object.prototype.hasOwnProperty.call(root, "data")) return "data";
    return "";
  }
  function sourcePathFromDisplayPath(displayPath, root) {
    const base = displayBaseKey(root);
    if (!base || !displayPath || displayPath === "$") return base ? "$." + base : displayPath || "$";
    return "$." + base + displayPath.slice(1);
  }
  function displayPathFromSourcePath(sourcePath, root) {
    const base = displayBaseKey(root);
    const prefix = "$." + base;
    if (!base || !sourcePath) return sourcePath || "$";
    if (sourcePath === prefix) return "$";
    if (sourcePath.startsWith(prefix + ".")) return "$" + sourcePath.slice(prefix.length);
    if (sourcePath.startsWith(prefix + "[")) return "$" + sourcePath.slice(prefix.length);
    return sourcePath;
  }
  function locateJsonPath(displayPath) {
    if (el.app.classList.contains("input-collapsed")) return;
    let root;
    try {
      root = JSON.parse(el.input.value);
    } catch (err) {
      setStatus("\u5DE6\u4FA7 JSON \u65E0\u6548\uFF0C\u65E0\u6CD5\u5B9A\u4F4D", "error");
      return;
    }
    const sourcePath = sourcePathFromDisplayPath(displayPath, root);
    const formatted = JSON.stringify(root, null, 2);
    if (el.input.value !== formatted) el.input.value = formatted;
    const location = resolveJsonLocation(root, formatted, sourcePath);
    if (!location || location.cursor < 0) {
      setStatus("\u672A\u80FD\u5B9A\u4F4D\uFF1A" + sourcePath, "error");
      return;
    }
    setInputPaneCollapsed(false);
    el.input.focus();
    el.input.setSelectionRange(location.cursor, location.cursor + location.length);
    el.input.scrollTop = estimateScrollTop(el.input, location.cursor);
    el.input.classList.remove("locating");
    requestAnimationFrame(() => el.input.classList.add("locating"));
    setStatus("\u5DF2\u5B9A\u4F4D \xB7 " + sourcePath, "ok");
  }
  function resolveJsonLocation(root, formatted, sourcePath) {
    const segments = pathToSegments(sourcePath);
    const value = getValueBySegments(root, segments);
    if (value !== void 0) {
      const target = primitiveJsonText(value);
      return { cursor: findJsonCursor(formatted, segments, target), length: target.length };
    }
    return resolveParsedStringLocation(root, formatted, segments);
  }
  function resolveParsedStringLocation(root, formatted, segments) {
    for (let split = segments.length - 1; split > 0; split -= 1) {
      const prefixSegments = segments.slice(0, split);
      const rawString = getValueBySegments(root, prefixSegments);
      if (typeof rawString !== "string") continue;
      let parsed;
      try {
        parsed = JSON.parse(rawString);
      } catch (err) {
        continue;
      }
      const innerSegments = segments.slice(split);
      const innerValue = getValueBySegments(parsed, innerSegments);
      if (innerValue === void 0) continue;
      const outerStart = findJsonCursor(formatted, prefixSegments, primitiveJsonText(rawString));
      const innerTarget = primitiveJsonText(innerValue);
      const innerStart = findJsonCursor(rawString, innerSegments, innerTarget);
      if (outerStart < 0 || innerStart < 0) continue;
      const cursor = mapStringIndexToJsonLiteral(rawString, outerStart, innerStart);
      const length = escapedSliceLength(rawString, innerStart, innerTarget.length);
      return { cursor, length: Math.max(1, length) };
    }
    return null;
  }
  function tryParseJsonStringValue(value) {
    if (typeof value !== "string") return null;
    const text = value.trim();
    if (!text || text[0] !== "{" && text[0] !== "[") return null;
    try {
      const parsed = JSON.parse(text);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (err) {
      return null;
    }
  }
  function deepestJsonPathSuffix(text, target) {
    let pos = 0;
    const skipWs = () => {
      while (pos < text.length && /\s/.test(text[pos])) pos += 1;
    };
    const readString = () => {
      let s = "";
      pos += 1;
      while (pos < text.length) {
        const c = text[pos];
        if (c === "\\") {
          pos += 2;
        } else if (c === '"') {
          pos += 1;
          break;
        } else {
          s += c;
          pos += 1;
        }
      }
      return s;
    };
    const parseNode = (path) => {
      skipWs();
      const start = pos;
      const ch = text[pos];
      if (ch === "{") {
        pos += 1;
        skipWs();
        if (text[pos] === "}") {
          pos += 1;
          return path;
        }
        let chosen = path;
        while (true) {
          skipWs();
          const key = readString();
          skipWs();
          pos += 1;
          skipWs();
          const cStart = pos;
          const childPath = path + "." + key;
          const childResult = parseNode(childPath);
          const cEnd = pos;
          if (target >= cStart && target < cEnd) chosen = childResult;
          skipWs();
          if (text[pos] === ",") {
            pos += 1;
            skipWs();
            continue;
          }
          if (text[pos] === "}" || pos >= text.length) {
            if (text[pos] === "}") pos += 1;
            break;
          }
          pos += 1;
        }
        return chosen;
      }
      if (ch === "[") {
        pos += 1;
        skipWs();
        if (text[pos] === "]") {
          pos += 1;
          return path;
        }
        let chosen = path;
        let idx = 0;
        while (true) {
          skipWs();
          const cStart = pos;
          const childPath = path + "[" + idx + "]";
          const childResult = parseNode(childPath);
          const cEnd = pos;
          if (target >= cStart && target < cEnd) chosen = childResult;
          skipWs();
          if (text[pos] === ",") {
            pos += 1;
            skipWs();
            idx += 1;
            continue;
          }
          if (text[pos] === "]" || pos >= text.length) {
            if (text[pos] === "]") pos += 1;
            break;
          }
          pos += 1;
        }
        return chosen;
      }
      if (ch === '"') readString();
      else {
        while (pos < text.length && !/[\s,}\]]/.test(text[pos])) pos += 1;
      }
      return path;
    };
    return parseNode("");
  }
  function resolveParsedStringCursorPath(root, formatted, item, cursor) {
    const segments = pathToSegments(item.path);
    const rawString = getValueBySegments(root, segments);
    if (typeof rawString !== "string") return null;
    let parsed;
    try {
      parsed = JSON.parse(rawString);
    } catch (err) {
      return null;
    }
    if (!parsed || typeof parsed !== "object") return null;
    const literalStart = item.valueStart;
    if (cursor < literalStart + 1) return null;
    let rawIndex = 0;
    let i = literalStart + 1;
    const literalEnd = item.valueEnd;
    while (i < cursor && i < literalEnd) {
      if (formatted[i] === "\\") i += 2;
      else i += 1;
      rawIndex += 1;
    }
    const innerSuffix = deepestJsonPathSuffix(rawString, rawIndex);
    return item.path + innerSuffix;
  }
  function mapStringIndexToJsonLiteral(rawString, literalStart, innerIndex) {
    const escapedPrefix = JSON.stringify(rawString.slice(0, innerIndex)).slice(1, -1);
    return literalStart + 1 + escapedPrefix.length;
  }
  function escapedSliceLength(rawString, innerStart, rawLength) {
    return JSON.stringify(rawString.slice(innerStart, innerStart + rawLength)).slice(1, -1).length;
  }
  function collectJsonPaths(value, path, output, depth = 0) {
    if (output.length > 5e3 || depth > 80) return output;
    output.push(path);
    if (Array.isArray(value)) {
      value.forEach((item, index) => collectJsonPaths(item, path + "[" + index + "]", output, depth + 1));
      return output;
    }
    if (value && typeof value === "object") {
      Object.keys(value).forEach((key) => collectJsonPaths(value[key], path + "." + key, output, depth + 1));
    }
    return output;
  }
  function pathFromInputCursor() {
    let root;
    try {
      root = JSON.parse(el.input.value);
    } catch (err) {
      return "";
    }
    const formatted = JSON.stringify(root, null, 2);
    if (el.input.value !== formatted) return "";
    const cursor = el.input.selectionEnd > el.input.selectionStart ? Math.floor((el.input.selectionStart + el.input.selectionEnd) / 2) : el.input.selectionStart || 0;
    const index = buildTextPathIndex(root, formatted);
    const lineHit = findLinePathHit(index, cursor, root, formatted);
    if (lineHit) return displayPathFromSourcePath(lineHit, root);
    const rangeHit = findRangePathHit(index, cursor, root, formatted);
    return displayPathFromSourcePath(rangeHit || "$", root);
  }
  function buildTextPathIndex(root, formatted) {
    return collectJsonPaths(root, "$", []).map((path) => {
      const segments = pathToSegments(path);
      const value = getValueBySegments(root, segments);
      const valueStart = findJsonCursor(formatted, segments, primitiveJsonText(value));
      const keyStart = findJsonKeyCursor(formatted, root, segments);
      const anchor = keyStart >= 0 ? keyStart : valueStart;
      const lineStart = anchor >= 0 ? formatted.lastIndexOf("\n", Math.max(0, anchor - 1)) + 1 : -1;
      const nextLine = anchor >= 0 ? formatted.indexOf("\n", anchor) : -1;
      const lineEnd = nextLine >= 0 ? nextLine : formatted.length;
      const parsedStringJson = typeof value === "string" ? tryParseJsonStringValue(value) : null;
      return {
        path,
        depth: segments.length,
        keyStart,
        valueStart,
        valueEnd: valueStart >= 0 ? findJsonValueEnd(formatted, valueStart) : -1,
        lineStart,
        lineEnd,
        parsedStringJson
      };
    }).filter((item) => item.valueStart >= 0 || item.keyStart >= 0);
  }
  function findLinePathHit(index, cursor, root, formatted) {
    let best = null;
    let parsedHit = null;
    for (let k = 0; k < index.length; k += 1) {
      const item = index[k];
      if (item.keyStart < 0) continue;
      if (cursor < item.lineStart || cursor > item.lineEnd) continue;
      if (item.parsedStringJson && cursor >= item.valueStart && cursor <= item.valueEnd) {
        const hit = resolveParsedStringCursorPath(root, formatted, item, cursor);
        if (hit) parsedHit = hit;
      }
      if (!best || item.depth > best.depth || item.depth === best.depth && item.keyStart > best.keyStart) {
        best = item;
      }
    }
    if (parsedHit) return parsedHit;
    return best && best.path;
  }
  function findRangePathHit(index, cursor, root, formatted) {
    let best = null;
    let parsedHit = null;
    for (let k = 0; k < index.length; k += 1) {
      const item = index[k];
      if (item.valueStart < 0 || item.valueEnd < item.valueStart) continue;
      if (cursor < item.valueStart || cursor > item.valueEnd) continue;
      if (item.parsedStringJson) {
        const hit = resolveParsedStringCursorPath(root, formatted, item, cursor);
        if (hit) parsedHit = hit;
      }
      if (!best || item.depth > best.depth || item.depth === best.depth && item.valueStart > best.valueStart) {
        best = item;
      }
    }
    if (parsedHit) return parsedHit;
    return best && best.path;
  }
  function findJsonValueEnd(text, start) {
    if (start < 0) return -1;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = start; i < text.length; i += 1) {
      const ch = text[i];
      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') inString = true;
      else if (ch === "{" || ch === "[") depth += 1;
      else if (ch === "}" || ch === "]") {
        if (depth === 0) return i;
        depth -= 1;
      } else if ((ch === "," || ch === "\n") && depth === 0) {
        return i;
      }
    }
    return text.length;
  }
  function getValueBySegments(root, segments) {
    let value = root;
    for (const segment of segments) {
      if (value == null) return void 0;
      value = value[segment];
    }
    return value;
  }
  function findJsonKeyCursor(text, root, segments) {
    const key = segments[segments.length - 1];
    if (typeof key !== "string") return -1;
    const parentSegments = segments.slice(0, -1);
    const parentValue = getValueBySegments(root, parentSegments);
    if (!parentValue || typeof parentValue !== "object" || Array.isArray(parentValue)) return -1;
    const parentStart = findJsonCursor(text, parentSegments, primitiveJsonText(parentValue));
    if (parentStart < 0 || text[parentStart] !== "{") return -1;
    return findDirectObjectKeyStart(text, parentStart, JSON.stringify(key));
  }
  function findDirectObjectKeyStart(text, objectStart, keyText) {
    let pos = firstNonSpace(text, objectStart + 1);
    while (pos >= 0 && pos < text.length && text[pos] !== "}") {
      if (text[pos] !== '"') return -1;
      const keyEnd = findStringEnd(text, pos);
      if (keyEnd < 0) return -1;
      const colon = firstNonSpace(text, keyEnd + 1);
      if (text.slice(pos, keyEnd + 1) === keyText) return pos;
      if (text[colon] !== ":") return -1;
      const valueStart = firstNonSpace(text, colon + 1);
      const next = findNextSiblingStart(text, valueStart);
      if (next < 0) return -1;
      pos = next;
    }
    return -1;
  }
  function findStringEnd(text, start) {
    let escaped = false;
    for (let i = start + 1; i < text.length; i += 1) {
      const ch = text[i];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === '"') return i;
    }
    return -1;
  }
  function findJsonCursor(text, segments, target) {
    let pos = 0;
    for (const segment of segments) {
      if (typeof segment === "number") {
        pos = findArrayItemStart(text, pos, segment);
      } else {
        const keyText = JSON.stringify(segment);
        const keyPos = text.indexOf(keyText, pos);
        if (keyPos < 0) return -1;
        const colonPos = text.indexOf(":", keyPos + keyText.length);
        if (colonPos < 0) return -1;
        pos = firstNonSpace(text, colonPos + 1);
      }
      if (pos < 0) return -1;
    }
    if (!target) return pos;
    if (text.slice(pos, pos + target.length) === target) return pos;
    const nearby = text.indexOf(target, pos);
    return nearby >= 0 ? nearby : pos;
  }
  function findArrayItemStart(text, valueStart, index) {
    const arrayStart = text.indexOf("[", valueStart);
    if (arrayStart < 0) return -1;
    let pos = firstNonSpace(text, arrayStart + 1);
    for (let i = 0; i < index; i += 1) {
      pos = findNextSiblingStart(text, pos);
      if (pos < 0) return -1;
    }
    return pos;
  }
  function findNextSiblingStart(text, start) {
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = start; i < text.length; i += 1) {
      const ch = text[i];
      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') inString = true;
      else if (ch === "{" || ch === "[") depth += 1;
      else if (ch === "}" || ch === "]") depth -= 1;
      else if (ch === "," && depth === 0) return firstNonSpace(text, i + 1);
    }
    return -1;
  }
  function firstNonSpace(text, start) {
    let pos = start;
    while (/\s/.test(text[pos] || "")) pos += 1;
    return pos;
  }
  function estimateScrollTop(textarea, cursor) {
    const before = textarea.value.slice(0, cursor);
    const line = before.split("\n").length - 1;
    const lineHeight = 18.6;
    return Math.max(0, line * lineHeight - textarea.clientHeight * 0.35);
  }

  // src/page/preview.js
  function errorPreview(message) {
    ui.hasRenderedPreview = false;
    ui.previewBridgeId += 1;
    ui.previewRestoringUntil = 0;
    el.preview.srcdoc = '<div class="error-preview"></div>';
    el.preview.onload = () => {
      const el2 = el2.preview.contentDocument && el2.preview.contentDocument.querySelector(".error-preview");
      if (el2) el2.textContent = message;
    };
  }
  function focusPreviewPath(path) {
    if (!path) return;
    ui.pendingPreviewFocus = {
      path,
      bridgeId: ui.previewBridgeId,
      focusId: ++ui.previewFocusSeq,
      attempts: 0
    };
    flushPreviewFocus();
  }
  function flushPreviewFocus() {
    const focus = ui.pendingPreviewFocus;
    if (!focus || focus.bridgeId !== ui.previewBridgeId || !el.preview.contentWindow) return;
    el.preview.contentWindow.postMessage({
      type: "json-table-focus-path",
      path: focus.path,
      focusId: focus.focusId,
      bridgeId: focus.bridgeId
    }, "*");
    if (focus.attempts >= 5) return;
    focus.attempts += 1;
    setTimeout(() => {
      if (ui.pendingPreviewFocus && ui.pendingPreviewFocus.focusId === focus.focusId) flushPreviewFocus();
    }, 180);
  }
  function capturePreviewStateFromDom() {
    try {
      const doc = el.preview.contentDocument;
      if (!doc) return ui.previewState;
      const pathSelect = doc.getElementById("pathSelect");
      const globalSearch = doc.getElementById("globalSearch");
      const content = doc.getElementById("content");
      return {
        path: pathSelect ? pathSelect.value : "",
        search: globalSearch ? globalSearch.value : "",
        scrollTop: content ? content.scrollTop : 0,
        scrollLeft: content ? content.scrollLeft : 0,
        openPaths: Array.from(doc.querySelectorAll("details[data-path][open]")).map((item) => item.getAttribute("data-path"))
      };
    } catch (err) {
      return ui.previewState;
    }
  }
  function restorePreviewState(state, bridgeId) {
    if (!state || !el.preview.contentWindow || bridgeId !== ui.previewBridgeId) return;
    ui.previewRestoringUntil = Date.now() + 900;
    el.preview.contentWindow.postMessage({ type: "json-table-restore-state", state, bridgeId }, "*");
    setTimeout(() => {
      if (bridgeId === ui.previewBridgeId) {
        ui.previewState = capturePreviewStateFromDom() || state;
        ui.previewRestoringUntil = 0;
      }
    }, 950);
  }
  function iframeBridgeScript(bridgeId) {
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
        var re = /.([^.[]+)|[(d+)]/g;
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

  // src/page/sample-data.json
  var sample_data_default = {
    request_id: "demo-request-20260806-001",
    code: 0,
    message: "ok",
    data: {
      list: [
        {
          project_id: 1001,
          title: "North Star Demo",
          lifecycle: "active",
          channel: "mobile",
          category: "analysis",
          priority_score: 98.5,
          enabled: true,
          owner_display: "User A",
          budget_units: 12e4,
          daily_limit: 3e3,
          labels: [
            "hot",
            "new",
            "mobile"
          ],
          settings_json: '{"maxItems":2,"routing":{"timeoutMs":1000,"levels":[{"name":"Level 1","price":45,"weight":70},{"name":"Level 2","price":30,"weight":30}]},"flags":{"parseJsonString":true,"fallback":false}}',
          broken_json: '{"a":1,',
          metrics: {
            views: 288812,
            actions: 14722,
            rate: 0.05097,
            amount: 9182.45
          },
          batches: [
            {
              batch_code: "BATCH-DEMO-01",
              channel: "partner-a",
              region: "east",
              items: [
                {
                  item_code: "DEMO-30016",
                  item_style: "compact",
                  item_type: 1,
                  unit_cost: 10.48,
                  unit_price: 4500,
                  rate: 0.4292,
                  display_price: "45.00",
                  terminal_node: false,
                  suppressed: 0
                },
                {
                  item_code: "DEMO-30016-A",
                  item_style: "rich",
                  item_type: 2,
                  unit_cost: 8.35,
                  unit_price: 3e3,
                  rate: 0.3589,
                  display_price: "30.00",
                  terminal_node: false,
                  suppressed: 0
                },
                {
                  item_code: "DEMO-1001-LOW",
                  item_style: "standard",
                  item_type: 3,
                  unit_cost: 4.56,
                  unit_price: 1500,
                  rate: 0.329,
                  display_price: "15.00",
                  terminal_node: true,
                  suppressed: 1
                }
              ]
            },
            {
              batch_code: "BATCH-DEMO-02",
              channel: "direct",
              region: "south",
              items: [
                {
                  item_code: "MOBILE-1001",
                  item_style: "reward",
                  item_type: 4,
                  unit_cost: 11.2,
                  unit_price: 5200,
                  rate: 0.442,
                  display_price: "52.00",
                  terminal_node: false,
                  suppressed: 0
                },
                {
                  item_code: "MOBILE-EMPTY",
                  item_style: "",
                  item_type: 1,
                  unit_cost: 0,
                  unit_price: 0,
                  rate: 0,
                  display_price: "0.00",
                  terminal_node: true,
                  suppressed: 1
                }
              ]
            }
          ],
          history: [
            {
              date: "2026-08-01",
              lifecycle: "draft",
              priority_score: 82
            },
            {
              date: "2026-08-05",
              lifecycle: "active",
              priority_score: 98.5
            }
          ]
        },
        {
          project_id: 1002,
          title: "Return Flow Demo",
          lifecycle: "paused",
          channel: "web",
          category: "commerce",
          priority_score: 72,
          enabled: false,
          owner_display: null,
          budget_units: 8e4,
          daily_limit: null,
          labels: [
            "return",
            "discount"
          ],
          settings_json: '[{"slot":"home","enabled":true,"limit":3},{"slot":"detail","enabled":false,"limit":1}]',
          broken_json: "not-json",
          metrics: {
            views: 158002,
            actions: 5001,
            rate: 0.03165,
            amount: 2380.18
          },
          batches: [
            {
              batch_code: "BATCH-DEMO-03",
              channel: "partner-b",
              region: "north",
              items: [
                {
                  item_code: "WEB-2002-A",
                  item_style: "compact",
                  item_type: 1,
                  unit_cost: 6.5,
                  unit_price: 2200,
                  rate: 0.295,
                  display_price: "22.00",
                  terminal_node: false,
                  suppressed: 0
                },
                {
                  item_code: "WEB-2002-B",
                  item_style: "rich",
                  item_type: 2,
                  unit_cost: 7.9,
                  unit_price: 2600,
                  rate: 0.314,
                  display_price: "26.00",
                  terminal_node: true,
                  suppressed: 0
                }
              ]
            }
          ],
          history: [
            {
              date: "2026-07-27",
              lifecycle: "active",
              priority_score: 80
            },
            {
              date: "2026-08-03",
              lifecycle: "paused",
              priority_score: 72
            }
          ]
        },
        {
          project_id: 1003,
          title: "Video Layout Demo",
          lifecycle: "active",
          channel: "partner-a",
          category: "finance",
          priority_score: 88.25,
          enabled: true,
          owner_display: "User B",
          budget_units: 15e4,
          daily_limit: 4500,
          labels: [],
          settings_json: '{"media":{"autoplay":true,"mute":true,"durationSec":15},"experiment":{"group_id":"GROUP-DEMO-20555","rule_id":12395}}',
          broken_json: "{maxItems:2}",
          metrics: {
            views: 301245,
            actions: 12066,
            rate: 0.04005,
            amount: 7221.01
          },
          batches: [
            {
              batch_code: "BATCH-DEMO-04",
              channel: "partner-a",
              region: "west",
              items: [
                {
                  item_code: "PARTNER-3003-H",
                  item_style: "rich",
                  item_type: 2,
                  unit_cost: 9.8,
                  unit_price: 4100,
                  rate: 0.419,
                  display_price: "41.00",
                  terminal_node: false,
                  suppressed: 0
                },
                {
                  item_code: "PARTNER-3003-N",
                  item_style: "standard",
                  item_type: 3,
                  unit_cost: 5.1,
                  unit_price: 1800,
                  rate: 0.352,
                  display_price: "18.00",
                  terminal_node: true,
                  suppressed: 0
                }
              ]
            }
          ],
          history: [
            {
              date: "2026-08-01",
              lifecycle: "active",
              priority_score: 86
            },
            {
              date: "2026-08-06",
              lifecycle: "active",
              priority_score: 88.25
            }
          ]
        },
        {
          project_id: 1004,
          title: "Empty Value Demo",
          lifecycle: "testing",
          channel: "api",
          category: "education",
          priority_score: 0,
          enabled: true,
          owner_display: "",
          budget_units: 0,
          daily_limit: 0,
          labels: [
            "empty",
            null,
            "api"
          ],
          settings_json: "{}",
          broken_json: "[1,2,",
          metrics: {
            views: 0,
            actions: 0,
            rate: 0,
            amount: 0
          },
          batches: [
            {
              batch_code: "BATCH-EMPTY",
              channel: "api",
              region: null,
              items: [
                {
                  item_code: "",
                  item_style: "",
                  item_type: 0,
                  unit_cost: 0,
                  unit_price: 0,
                  rate: 0,
                  display_price: "",
                  terminal_node: true,
                  suppressed: 0
                }
              ]
            }
          ],
          history: []
        },
        {
          project_id: 1005,
          title: "Legacy Mix Demo",
          lifecycle: "archived",
          channel: "mobile",
          category: "news",
          priority_score: 63.75,
          enabled: false,
          owner_display: "User C",
          budget_units: 64e3,
          daily_limit: 1200,
          labels: [
            "legacy",
            "mobile",
            "low-price"
          ],
          settings_json: '{"fallbackList":["DEMO-1001","DEMO-1005"],"limits":{"min":0,"max":5}}',
          broken_json: "",
          metrics: {
            views: 91002,
            actions: 1801,
            rate: 0.01979,
            amount: 814.3
          },
          batches: [
            {
              batch_code: "BATCH-DEMO-05",
              channel: "direct",
              region: "central",
              items: [
                {
                  item_code: "LEGACY-1005-A",
                  item_style: "compact",
                  item_type: 1,
                  unit_cost: 2.2,
                  unit_price: 900,
                  rate: 0.21,
                  display_price: "9.00",
                  terminal_node: false,
                  suppressed: 0
                },
                {
                  item_code: "LEGACY-1005-B",
                  item_style: "feed",
                  item_type: 5,
                  unit_cost: 1.1,
                  unit_price: 300,
                  rate: 0.11,
                  display_price: "3.00",
                  terminal_node: true,
                  suppressed: 1
                }
              ]
            }
          ],
          history: [
            {
              date: "2026-06-01",
              lifecycle: "active",
              priority_score: 75
            },
            {
              date: "2026-07-01",
              lifecycle: "archived",
              priority_score: 63.75
            }
          ]
        }
      ],
      experiment: {
        control_ids: [
          "DEMO-30016",
          "DEMO-1001",
          "DEMO-1002"
        ],
        assignment: {
          group_id: "GROUP-DEMO-20555",
          experiment_json: '{"rule":{"timeoutPair":"1000,1000","retry":3,"sampleSize":3000},"weights":{"mobile":"1,1","web":3},"display":{"maxItems":2,"requestCount":99999,"showCount":999,"mediaShowCount":1}}',
          rule_id: 12395
        },
        segments: [
          {
            segment: "new_user",
            channel: "mobile",
            count: 12001,
            enabled: true
          },
          {
            segment: "paid_user",
            channel: "web",
            count: 820,
            enabled: false
          },
          {
            segment: "silent_user",
            channel: "partner-a",
            count: 30016,
            enabled: true
          }
        ]
      },
      summary_rows: [
        {
          path: "$.data.list",
          rows: 5,
          purpose: "\u9ED8\u8BA4\u6839\u8DEF\u5F84\u5019\u9009"
        },
        {
          path: "$.data.list[0].batches[0].items",
          rows: 3,
          purpose: "\u591A\u5C42 array \u5D4C\u5957\u8FC7\u6EE4"
        },
        {
          path: "$.data.experiment.segments",
          rows: 3,
          purpose: "\u77ED\u8868\u683C\u6392\u5E8F"
        }
      ],
      meta: {
        generated_at: "2026-08-06T15:00:00+08:00",
        total: 5,
        flags: {
          parseJsonString: true,
          freezeHeader: false,
          stickyHeader: true
        },
        notes: "\u901A\u7528\u8131\u654F\u793A\u4F8B\uFF1A\u5305\u542B\u5BF9\u8C61\u6570\u7EC4\u3001\u5D4C\u5957\u6570\u7EC4\u3001JSON \u5B57\u7B26\u4E32\u3001\u574F JSON\u3001\u7A7A\u5B57\u7B26\u4E32\u3001null\u3001number\u3001boolean\uFF0C\u7528\u4E8E\u9A8C\u8BC1\u8FC7\u6EE4/\u6392\u5E8F/\u5C55\u5F00/\u590D\u5236\u3002"
      }
    },
    debug: {
      nullable: null,
      empty_string: "",
      empty_array: [],
      empty_object: {},
      large_number: 9007199254740991
    }
  };

  // src/page/sample-data.js
  var sampleJson = JSON.stringify(sample_data_default, null, 2);

  // src/page/main.js
  function renderNow(options = {}) {
    const replaceOnInvalid = options.replaceOnInvalid === true;
    const stateBeforeRender = ui.hasRenderedPreview ? capturePreviewStateFromDom() : ui.previewState;
    if (stateBeforeRender) ui.previewState = stateBeforeRender;
    const responseText = el.input.value.trim();
    localStorage.setItem(STORAGE_KEY, el.input.value);
    if (!responseText) {
      setStatus("\u8BF7\u8F93\u5165 JSON", "error");
      if (replaceOnInvalid || !ui.hasRenderedPreview) errorPreview("\u8BF7\u8F93\u5165 JSON");
      return;
    }
    try {
      JSON.parse(responseText);
    } catch (err) {
      setStatus("JSON \u89E3\u6790\u5931\u8D25\uFF0C\u53F3\u4FA7\u4FDD\u6301\u4E0A\u6B21\u6709\u6548\u8868\u683C", "error");
      if (replaceOnInvalid || !ui.hasRenderedPreview) {
        errorPreview(err && (err.message || String(err)));
      }
      return;
    }
    let capturedTemplate = "";
    let capturedData = { raw: responseText };
    const pm = {
      response: {
        text: () => responseText,
        json: () => JSON.parse(responseText)
      },
      visualizer: {
        set: (template, data) => {
          capturedTemplate = template;
          capturedData = data || { raw: responseText };
        }
      }
    };
    try {
      window.__jsonGridVisualizer(pm);
      const raw = JSON.stringify(capturedData.raw || responseText).replace(/<\//g, "</");
      const pmShim = "<script>window.pm={getData:function(cb){cb(null,{raw:" + raw + "});}};<\/script>";
      const bridgeId = ++ui.previewBridgeId;
      const stateToRestore = ui.previewState && JSON.parse(JSON.stringify(ui.previewState));
      ui.previewRestoringUntil = stateToRestore ? Date.now() + 1200 : 0;
      el.preview.onload = () => restorePreviewState(stateToRestore, bridgeId);
      el.preview.srcdoc = pmShim + capturedTemplate + iframeBridgeScript(bridgeId);
      ui.hasRenderedPreview = true;
      setStatus("\u5DF2\u6E32\u67D3 \xB7 " + formatBytes(responseText), "ok");
    } catch (err) {
      setStatus("\u6E32\u67D3\u5931\u8D25", "error");
      errorPreview(err && (err.stack || err.message || String(err)));
    }
  }
  function scheduleRender() {
    clearTimeout(ui.renderTimer);
    ui.renderTimer = setTimeout(renderNow, 260);
  }
  window.addEventListener("message", (event) => {
    const data = event.data || {};
    if (data.bridgeId && data.bridgeId !== ui.previewBridgeId) return;
    if (data.type === "json-table-state") {
      if (Date.now() < ui.previewRestoringUntil && data.reason !== "restored") return;
      ui.previewState = data.state || ui.previewState;
      if (data.reason === "ready" || data.reason === "restored") flushPreviewFocus();
      if (data.reason === "restored") ui.previewRestoringUntil = 0;
      return;
    }
    if (data.type === "json-table-focus-result") {
      if (ui.pendingPreviewFocus && data.focusId === ui.pendingPreviewFocus.focusId && data.ok) {
        ui.pendingPreviewFocus = null;
      }
      return;
    }
    if (data.type === "json-table-cell-click" && data.path) {
      locateJsonPath(data.path);
    }
  });
  document.getElementById("renderBtn").onclick = renderNow;
  document.getElementById("formatBtn").onclick = () => {
    try {
      el.input.value = JSON.stringify(JSON.parse(el.input.value), null, 2);
      renderNow();
    } catch (err) {
      setStatus("\u683C\u5F0F\u5316\u5931\u8D25\uFF1AJSON \u65E0\u6548", "error");
    }
  };
  document.getElementById("minifyBtn").onclick = () => {
    try {
      el.input.value = JSON.stringify(JSON.parse(el.input.value));
      renderNow();
    } catch (err) {
      setStatus("\u538B\u7F29\u5931\u8D25\uFF1AJSON \u65E0\u6548", "error");
    }
  };
  document.getElementById("sampleBtn").onclick = () => {
    el.input.value = sampleJson;
    renderNow();
  };
  document.getElementById("clearBtn").onclick = () => {
    el.input.value = "";
    renderNow({ replaceOnInvalid: true });
    el.input.focus();
  };
  el.input.addEventListener("input", scheduleRender);
  el.input.addEventListener("click", () => {
    setTimeout(() => {
      const path = pathFromInputCursor();
      if (!path) return;
      focusPreviewPath(path);
      setStatus("\u53F3\u4FA7\u5B9A\u4F4D \xB7 " + path, "ok");
    }, 0);
  });
  initInputPaneToggle();
  initSplitWidth();
  bindSplitResizer();
  el.input.value = localStorage.getItem(STORAGE_KEY) || sampleJson;
  renderNow();
})();
