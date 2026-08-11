// 光标定位：从左侧 textarea 光标位置计算 JSON 路径（含可解析字符串值的内部子路径）。
// 由单文件 index.html 拆分而来；DOM 句柄与 UI 状态集中在 state.js（el / ui）。

import { el } from "./state.js";
import { setInputPaneCollapsed, setStatus } from "./split-pane.js";
export function pathToSegments(path) {
  if (!path || path === '$') return [];
  const segments = [];
  String(path).replace(/^\$/, '').replace(/\.([^\.\[]+)|\[(\d+)\]/g, (_, key, index) => {
    segments.push(key !== undefined ? key : Number(index));
    return '';
  });
  return segments;
}

export function primitiveJsonText(value) {
  if (typeof value === 'string') return JSON.stringify(value);
  if (value === undefined) return '';
  return JSON.stringify(value);
}

export function displayBaseKey(root) {
  if (root && Object.prototype.hasOwnProperty.call(root, 'DATA')) return 'DATA';
  if (root && Object.prototype.hasOwnProperty.call(root, 'data')) return 'data';
  return '';
}

export function sourcePathFromDisplayPath(displayPath, root) {
  const base = displayBaseKey(root);
  if (!base || !displayPath || displayPath === '$') return base ? '$.' + base : (displayPath || '$');
  return '$.' + base + displayPath.slice(1);
}

export function displayPathFromSourcePath(sourcePath, root) {
  const base = displayBaseKey(root);
  const prefix = '$.' + base;
  if (!base || !sourcePath) return sourcePath || '$';
  if (sourcePath === prefix) return '$';
  if (sourcePath.startsWith(prefix + '.')) return '$' + sourcePath.slice(prefix.length);
  if (sourcePath.startsWith(prefix + '[')) return '$' + sourcePath.slice(prefix.length);
  return sourcePath;
}

export function locateJsonPath(displayPath) {
  let root;
  try {
    root = JSON.parse(el.input.value);
  } catch (err) {
    setStatus('左侧 JSON 无效，无法定位', 'error');
    return;
  }

  const sourcePath = sourcePathFromDisplayPath(displayPath, root);
  const formatted = JSON.stringify(root, null, 2);
  if (el.input.value !== formatted) el.input.value = formatted;

  const location = resolveJsonLocation(root, formatted, sourcePath);
  if (!location || location.cursor < 0) {
    setStatus('未能定位：' + sourcePath, 'error');
    return;
  }

  setInputPaneCollapsed(false);
  el.input.focus();
  el.input.setSelectionRange(location.cursor, location.cursor + location.length);
  el.input.scrollTop = estimateScrollTop(el.input, location.cursor);
  el.input.classList.remove('locating');
  requestAnimationFrame(() => el.input.classList.add('locating'));
  setStatus('已定位 · ' + sourcePath, 'ok');
}

export function resolveJsonLocation(root, formatted, sourcePath) {
  const segments = pathToSegments(sourcePath);
  const value = getValueBySegments(root, segments);
  if (value !== undefined) {
    const target = primitiveJsonText(value);
    return { cursor: findJsonCursor(formatted, segments, target), length: target.length };
  }

  return resolveParsedStringLocation(root, formatted, segments);
}

export function resolveParsedStringLocation(root, formatted, segments) {
  for (let split = segments.length - 1; split > 0; split -= 1) {
    const prefixSegments = segments.slice(0, split);
    const rawString = getValueBySegments(root, prefixSegments);
    if (typeof rawString !== 'string') continue;

    let parsed;
    try {
      parsed = JSON.parse(rawString);
    } catch (err) {
      continue;
    }

    const innerSegments = segments.slice(split);
    const innerValue = getValueBySegments(parsed, innerSegments);
    if (innerValue === undefined) continue;

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

// 在父窗口作用域内提供 parsed 字符串解析能力（visualizerScript 内的同名函数
// 仅在 new Function 作用域中可用，父窗口拿不到，会导致点击左侧 JSON 时抛 ReferenceError）。
export function tryParseJsonStringValue(value) {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (!text || (text[0] !== '{' && text[0] !== '[')) return null;
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (err) {
    return null;
  }
}

// 给定一段 JSON 文本与目标字符下标，返回“最内层包含该下标的节点”的路径后缀。
export function deepestJsonPathSuffix(text, target) {
  let pos = 0;
  const skipWs = () => { while (pos < text.length && /\s/.test(text[pos])) pos += 1; };
  const readString = () => {
    let s = '';
    pos += 1;
    while (pos < text.length) {
      const c = text[pos];
      if (c === '\\') { pos += 2; }
      else if (c === '"') { pos += 1; break; }
      else { s += c; pos += 1; }
    }
    return s;
  };
  const parseNode = (path) => {
    skipWs();
    const start = pos;
    const ch = text[pos];
    if (ch === '{') {
      pos += 1;
      skipWs();
      if (text[pos] === '}') { pos += 1; return path; }
      let chosen = path;
      while (true) {
        skipWs();
        const key = readString();
        skipWs();
        pos += 1; // 跳过冒号
        skipWs();
        const cStart = pos;
        const childPath = path + '.' + key;
        const childResult = parseNode(childPath);
        const cEnd = pos;
        if (target >= cStart && target < cEnd) chosen = childResult;
        skipWs();
        if (text[pos] === ',') { pos += 1; skipWs(); continue; }
        if (text[pos] === '}' || pos >= text.length) { if (text[pos] === '}') pos += 1; break; }
        pos += 1;
      }
      return chosen;
    }
    if (ch === '[') {
      pos += 1;
      skipWs();
      if (text[pos] === ']') { pos += 1; return path; }
      let chosen = path;
      let idx = 0;
      while (true) {
        skipWs();
        const cStart = pos;
        const childPath = path + '[' + idx + ']';
        const childResult = parseNode(childPath);
        const cEnd = pos;
        if (target >= cStart && target < cEnd) chosen = childResult;
        skipWs();
        if (text[pos] === ',') { pos += 1; skipWs(); idx += 1; continue; }
        if (text[pos] === ']' || pos >= text.length) { if (text[pos] === ']') pos += 1; break; }
        pos += 1;
      }
      return chosen;
    }
    // 基础值（字符串/数字/布尔/null）：自身即节点路径
    if (ch === '"') readString();
    else { while (pos < text.length && !/[\s,}\]]/.test(text[pos])) pos += 1; }
    return path;
  };
  return parseNode('');
}

// 光标落在某个“可解析字符串值”内部时，计算其在解析后 JSON 里的内部子路径，
// 返回形如 $.data.list[0].settings_json.routing.timeoutMs 的完整源路径。
export function resolveParsedStringCursorPath(root, formatted, item, cursor) {
  const segments = pathToSegments(item.path);
  const rawString = getValueBySegments(root, segments);
  if (typeof rawString !== 'string') return null;
  let parsed;
  try {
    parsed = JSON.parse(rawString);
  } catch (err) {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;

  const literalStart = item.valueStart;
  if (cursor < literalStart + 1) return null;
  // 把外层面板里（位于转义字符串字面量内部）的光标位置，映射回原始未转义字符串的下标
  let rawIndex = 0;
  let i = literalStart + 1;
  const literalEnd = item.valueEnd;
  while (i < cursor && i < literalEnd) {
    if (formatted[i] === '\\') i += 2;
    else i += 1;
    rawIndex += 1;
  }

  const innerSuffix = deepestJsonPathSuffix(rawString, rawIndex);
  return item.path + innerSuffix;
}

export function mapStringIndexToJsonLiteral(rawString, literalStart, innerIndex) {
  const escapedPrefix = JSON.stringify(rawString.slice(0, innerIndex)).slice(1, -1);
  return literalStart + 1 + escapedPrefix.length;
}

export function escapedSliceLength(rawString, innerStart, rawLength) {
  return JSON.stringify(rawString.slice(innerStart, innerStart + rawLength)).slice(1, -1).length;
}

export function collectJsonPaths(value, path, output, depth = 0) {
  if (output.length > 5000 || depth > 80) return output;
  output.push(path);
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectJsonPaths(item, path + '[' + index + ']', output, depth + 1));
    return output;
  }
  if (value && typeof value === 'object') {
    Object.keys(value).forEach((key) => collectJsonPaths(value[key], path + '.' + key, output, depth + 1));
  }
  return output;
}

export function pathFromInputCursor() {
  let root;
  try {
    root = JSON.parse(el.input.value);
  } catch (err) {
    return '';
  }

  const formatted = JSON.stringify(root, null, 2);
  if (el.input.value !== formatted) return '';

  const cursor = el.input.selectionEnd > el.input.selectionStart
    ? Math.floor((el.input.selectionStart + el.input.selectionEnd) / 2)
    : (el.input.selectionStart || 0);
  const index = buildTextPathIndex(root, formatted);
  const lineHit = findLinePathHit(index, cursor, root, formatted);
  if (lineHit) return displayPathFromSourcePath(lineHit, root);

  const rangeHit = findRangePathHit(index, cursor, root, formatted);
  return displayPathFromSourcePath(rangeHit || '$', root);
}

export function buildTextPathIndex(root, formatted) {
  return collectJsonPaths(root, '$', []).map((path) => {
    const segments = pathToSegments(path);
    const value = getValueBySegments(root, segments);
    const valueStart = findJsonCursor(formatted, segments, primitiveJsonText(value));
    const keyStart = findJsonKeyCursor(formatted, root, segments);
    const anchor = keyStart >= 0 ? keyStart : valueStart;
    const lineStart = anchor >= 0 ? formatted.lastIndexOf('\n', Math.max(0, anchor - 1)) + 1 : -1;
    const nextLine = anchor >= 0 ? formatted.indexOf('\n', anchor) : -1;
    const lineEnd = nextLine >= 0 ? nextLine : formatted.length;
    const parsedStringJson = typeof value === 'string' ? tryParseJsonStringValue(value) : null;
    return {
      path,
      depth: segments.length,
      keyStart,
      valueStart,
      valueEnd: valueStart >= 0 ? findJsonValueEnd(formatted, valueStart) : -1,
      lineStart,
      lineEnd,
      parsedStringJson: parsedStringJson
    };
  }).filter((item) => item.valueStart >= 0 || item.keyStart >= 0);
}

export function findLinePathHit(index, cursor, root, formatted) {
  let best = null;
  let parsedHit = null;
  for (let k = 0; k < index.length; k += 1) {
    const item = index[k];
    if (item.keyStart < 0) continue;
    if (cursor < item.lineStart || cursor > item.lineEnd) continue;
    // 命中可解析字符串值时，优先落到 parsed 内部子路径
    if (item.parsedStringJson && cursor >= item.valueStart && cursor <= item.valueEnd) {
      const hit = resolveParsedStringCursorPath(root, formatted, item, cursor);
      if (hit) parsedHit = hit;
    }
    if (!best || item.depth > best.depth || (item.depth === best.depth && item.keyStart > best.keyStart)) {
      best = item;
    }
  }
  if (parsedHit) return parsedHit;
  return best && best.path;
}

export function findRangePathHit(index, cursor, root, formatted) {
  let best = null;
  let parsedHit = null;
  for (let k = 0; k < index.length; k += 1) {
    const item = index[k];
    if (item.valueStart < 0 || item.valueEnd < item.valueStart) continue;
    if (cursor < item.valueStart || cursor > item.valueEnd) continue;
    // 命中可解析字符串值时，优先落到 parsed 内部子路径
    if (item.parsedStringJson) {
      const hit = resolveParsedStringCursorPath(root, formatted, item, cursor);
      if (hit) parsedHit = hit;
    }
    if (!best || item.depth > best.depth || (item.depth === best.depth && item.valueStart > best.valueStart)) {
      best = item;
    }
  }
  if (parsedHit) return parsedHit;
  return best && best.path;
}

export function findJsonValueEnd(text, start) {
  if (start < 0) return -1;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];
    if (inString) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{' || ch === '[') depth += 1;
    else if (ch === '}' || ch === ']') {
      if (depth === 0) return i;
      depth -= 1;
    } else if ((ch === ',' || ch === '\n') && depth === 0) {
      return i;
    }
  }
  return text.length;
}

export function getValueBySegments(root, segments) {
  let value = root;
  for (const segment of segments) {
    if (value == null) return undefined;
    value = value[segment];
  }
  return value;
}

export function findJsonKeyCursor(text, root, segments) {
  const key = segments[segments.length - 1];
  if (typeof key !== 'string') return -1;

  const parentSegments = segments.slice(0, -1);
  const parentValue = getValueBySegments(root, parentSegments);
  if (!parentValue || typeof parentValue !== 'object' || Array.isArray(parentValue)) return -1;

  const parentStart = findJsonCursor(text, parentSegments, primitiveJsonText(parentValue));
  if (parentStart < 0 || text[parentStart] !== '{') return -1;
  return findDirectObjectKeyStart(text, parentStart, JSON.stringify(key));
}

export function findDirectObjectKeyStart(text, objectStart, keyText) {
  let pos = firstNonSpace(text, objectStart + 1);
  while (pos >= 0 && pos < text.length && text[pos] !== '}') {
    if (text[pos] !== '"') return -1;
    const keyEnd = findStringEnd(text, pos);
    if (keyEnd < 0) return -1;
    const colon = firstNonSpace(text, keyEnd + 1);
    if (text.slice(pos, keyEnd + 1) === keyText) return pos;
    if (text[colon] !== ':') return -1;
    const valueStart = firstNonSpace(text, colon + 1);
    const next = findNextSiblingStart(text, valueStart);
    if (next < 0) return -1;
    pos = next;
  }
  return -1;
}

export function findStringEnd(text, start) {
  let escaped = false;
  for (let i = start + 1; i < text.length; i += 1) {
    const ch = text[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (ch === '"') return i;
  }
  return -1;
}

export function findJsonCursor(text, segments, target) {
  let pos = 0;
  for (const segment of segments) {
    if (typeof segment === 'number') {
      pos = findArrayItemStart(text, pos, segment);
    } else {
      const keyText = JSON.stringify(segment);
      const keyPos = text.indexOf(keyText, pos);
      if (keyPos < 0) return -1;
      const colonPos = text.indexOf(':', keyPos + keyText.length);
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

export function findArrayItemStart(text, valueStart, index) {
  const arrayStart = text.indexOf('[', valueStart);
  if (arrayStart < 0) return -1;
  let pos = firstNonSpace(text, arrayStart + 1);
  for (let i = 0; i < index; i += 1) {
    pos = findNextSiblingStart(text, pos);
    if (pos < 0) return -1;
  }
  return pos;
}

export function findNextSiblingStart(text, start) {
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
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{' || ch === '[') depth += 1;
    else if (ch === '}' || ch === ']') depth -= 1;
    else if (ch === ',' && depth === 0) return firstNonSpace(text, i + 1);
  }
  return -1;
}

export function firstNonSpace(text, start) {
  let pos = start;
  while (/\s/.test(text[pos] || '')) pos += 1;
  return pos;
}

export function estimateScrollTop(textarea, cursor) {
  const before = textarea.value.slice(0, cursor);
  const line = before.split('\n').length - 1;
  const lineHeight = 18.6;
  return Math.max(0, line * lineHeight - textarea.clientHeight * 0.35);
}