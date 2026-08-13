// 左侧单一 JSON 编辑器（CodeMirror 6）：编辑、语法高亮、行号、折叠箭头、
// 缩进引导、悬停高亮全部在同一个视图内完成，VS Code 风格。
// 由单文件 index.html 拆分而来；DOM 句柄与 UI 状态集中在 state.js（el / ui）。

import { EditorState } from "@codemirror/state";
import { EditorView, basicSetup } from "codemirror";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";
import { foldAll, unfoldAll } from "@codemirror/language";

let view = null;

// 与浅色应用主题一致的编辑器外观。
const appTheme = EditorView.theme(
  {
    "&": {
      height: "100%",
      fontSize: "13px",
      backgroundColor: "#fff",
      color: "#111827",
    },
    ".cm-scroller": {
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
      lineHeight: "1.5",
    },
    ".cm-gutters": {
      backgroundColor: "#fff",
      color: "#9ca3af",
      border: "none",
    },
    ".cm-activeLineGutter": { backgroundColor: "#f3f4f6" },
    ".cm-activeLine": { backgroundColor: "#f8fafc" },
    ".cm-foldGutter span": { color: "#6b7280", cursor: "pointer" },
    ".cm-foldPlaceholder": {
      backgroundColor: "#f3f4f6",
      border: "none",
      color: "#6b7280",
      borderRadius: "4px",
      padding: "0 4px",
      margin: "0 2px",
    },
    "&.cm-focused .cm-matchingBracket": { backgroundColor: "#dbeafe", outline: "none" },
  },
  { dark: false }
);

export function initEditor() {
  const host = document.getElementById("jsonEditor");
  if (!host) return;

  view = new EditorView({
    parent: host,
    state: EditorState.create({
      doc: "",
      extensions: [
        basicSetup,
        json(),
        linter(jsonParseLinter()),
        lintGutter(),
        appTheme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && typeof window.__scheduleJsonRender === "function") {
            window.__scheduleJsonRender();
          }
        }),
      ],
    }),
  });

  // 单击编辑器：用光标位置反查 JSON 路径并定位右侧表格。
  view.dom.addEventListener("click", () => {
    setTimeout(() => {
      const path = window.__pathFromEditorCursor ? window.__pathFromEditorCursor() : "";
      if (!path) return;
      if (typeof window.__focusPreviewPath === "function") {
        window.__focusPreviewPath(path);
        const status = document.getElementById("status");
        if (status) status.textContent = "右侧定位 · " + path;
      }
    }, 0);
  });
}

export function getEditorValue() {
  return view ? view.state.doc.toString() : "";
}

export function setEditorValue(text) {
  if (!view) return;
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: text || "" },
  });
}

export function focusEditor() {
  if (view) view.focus();
}

export function getCurrentCursor() {
  return view ? view.state.selection.main.head : 0;
}

export function setEditorSelection(from, to) {
  if (!view) return;
  view.dispatch({ selection: { anchor: from, head: to == null ? from : to } });
  view.focus();
}

export function revealEditorPosition(offset) {
  if (!view) return;
  view.dispatch({ effects: EditorView.scrollIntoView(offset, { y: "center" }) });
}

export function expandAll() {
  if (view) unfoldAll(view);
}

export function collapseAll() {
  if (view) foldAll(view);
}
