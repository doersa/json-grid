(() => {
  // src/visualizer/visualizer.css
  var visualizer_default = `
  html, body {
    margin: 0;
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
  }

  .app {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f7f8fb;
    color: #172033;
  }

  .bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
  }

  .title {
    font-weight: 700;
  }

  .meta {
    margin-right: auto;
    color: #6b7280;
    font-size: 12px;
  }

  .meta-path {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }

  .meta-path-btn {
    border: 0;
    background: transparent;
    padding: 0 2px;
    color: #2563eb;
    font: inherit;
    cursor: pointer;
  }

  .meta-path-btn:hover {
    text-decoration: underline;
    background: transparent;
  }

  .meta-path-sep {
    color: #9ca3af;
  }

  .search {
    width: 260px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 7px 10px;
  }

  button {
    border: 1px solid #d1d5db;
    background: #fff;
    border-radius: 8px;
    padding: 7px 10px;
    cursor: pointer;
  }

  button:hover {
    background: #f3f4f6;
  }

  .settings-wrap {
    position: relative;
  }

  .settings-btn {
    width: 34px;
    height: 34px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    color: #4b5563;
    background: #fff;
    transition: background .14s ease, border-color .14s ease, color .14s ease, box-shadow .14s ease;
  }

  .settings-btn svg {
    width: 16px;
    height: 16px;
    display: block;
  }

  .settings-btn:hover,
  .settings-btn.active {
    color: #1d4ed8;
    border-color: #bfdbfe;
    background: #eff6ff;
    box-shadow: 0 1px 2px rgba(37, 99, 235, 0.08);
  }

  .settings-menu {
    position: absolute;
    top: 38px;
    right: 0;
    width: 240px;
    padding: 8px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
    z-index: 50;
  }

  .settings-menu[hidden] {
    display: none;
  }

  .settings-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 2px 8px 7px;
    color: #6b7280;
    font-size: 11px;
    font-weight: 700;
  }

  .reset-col-order {
    background: none;
    border: 0;
    padding: 0;
    font: inherit;
    font-size: 11px;
    font-weight: 400;
    color: #2563eb;
    cursor: pointer;
  }

  .reset-col-order:hover {
    text-decoration: underline;
  }

  .reset-col-order[hidden] {
    display: none;
  }

  .setting-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-radius: 8px;
    font-size: 12px;
    color: #172033;
  }

  .setting-row .col-label {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
    cursor: pointer;
  }

  .setting-row:hover {
    background: #f3f4f6;
  }

  .setting-row .col-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .freeze-toggle {
    border: 0;
    background: transparent;
    padding: 3px;
    cursor: pointer;
    color: #9ca3af;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    opacity: 0.55;
    transition: opacity .15s ease, background .15s ease, color .15s ease;
  }

  .freeze-toggle svg {
    width: 14px;
    height: 14px;
    display: block;
  }

  .freeze-toggle:hover {
    opacity: 1;
    color: #4b5563;
    background: #eef0f3;
  }

  .freeze-toggle.active {
    color: #2563eb;
    background: #dbeafe;
    opacity: 1;
  }

  .freeze-toggle.active:hover {
    background: #bfdbfe;
  }

  .freeze-toggle.active .lock-body {
    fill: currentColor;
  }

  .settings-section {
    border-top: 1px solid #eef0f3;
    margin-top: 7px;
    padding-top: 7px;
  }

  .settings-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .settings-actions button,
  .path-chip {
    padding: 6px 7px;
    font-size: 12px;
  }

  .column-list,
  .path-list {
    max-height: 150px;
    overflow: auto;
  }

  .path-chip {
    width: 100%;
    margin-top: 4px;
    overflow: hidden;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .search-hit {
    background: #fef08a;
    border-radius: 3px;
    padding: 0 1px;
  }

  .filter-chips {
    display: none;
    gap: 6px;
    padding: 7px 12px;
    background: #fff;
    border-bottom: 1px solid #eef0f3;
    flex-wrap: wrap;
  }

  .filter-chips.active {
    display: flex;
  }

  .filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    max-width: 260px;
    padding: 4px 7px;
    border: 1px solid #bfdbfe;
    border-radius: 999px;
    color: #1d4ed8;
    background: #eff6ff;
    font-size: 12px;
  }

  .filter-chip-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .filter-chip-remove {
    width: 18px;
    height: 18px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    color: #1d4ed8;
    background: transparent;
    line-height: 1;
  }

  .filter-chip-remove:hover {
    background: #dbeafe;
  }

  .value-th-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    gap: 6px;
  }

  .tree-menu-btn {
    width: 26px;
    height: 22px;
    padding: 0;
    border-radius: 5px;
    border-color: #bfdbfe;
    color: #1d4ed8;
    background: #eff6ff;
    font-size: 13px;
    line-height: 1;
  }

  .tree-menu-btn:hover {
    background: #dbeafe;
  }

  .tree-menu {
    position: fixed;
    width: 150px;
    display: flex;
    flex-direction: column;
    padding: 6px;
    background: #fff;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.16);
    z-index: 9999;
  }

  .tree-action {
    border: 0;
    border-radius: 6px;
    padding: 7px 8px;
    text-align: left;
    font-size: 12px;
    background: #fff;
  }

  .tree-action:hover {
    background: #f3f4f6;
  }

  .content {
    flex: 1;
    overflow: auto;
    padding: 12px;
  }

  table.grid {
    width: 100%;
    border-collapse: collapse;
    background: #fff;
    border: 1px solid #e5e7eb;
  }

  table.grid th,
  table.grid td {
    border-bottom: 1px solid #eef0f3;
    border-right: 1px solid #eef0f3;
    padding: 8px 10px;
    vertical-align: top;
    word-break: break-word;
  }

  table.grid th {
    padding-right: 18px;
  }

  table.grid th:last-child,
  table.grid td:last-child {
    border-right: 0;
  }

  table.grid th {
    background: #f3f4f6;
    text-align: left;
    font-size: 12px;
    color: #4b5563;
    min-width: 80px;
  }

  .content.freeze-header table.root-grid > thead th {
    position: sticky;
    top: 0;
    z-index: 3;
  }

  table.grid .key-col,
  table.grid .type-col,
  table.grid .index-col {
    width: 1%;
    white-space: nowrap;
  }

  table.grid .key-col {
    min-width: 90px;
  }

  table.grid .type-col {
    min-width: 72px;
  }

  table.grid .value-col {
    width: auto;
  }

  /* Frozen columns stick to the left edge of the nearest scroll container.
     Applies to root AND nested grids so nested tables can freeze columns too.
     Backgrounds are CSS-only so dynamic row/zebra/selected backgrounds (added
     later) won't be clobbered by inline styles (L6). */
  table.grid th.frozen-col,
  table.grid td.frozen-col {
    position: sticky;
    left: 0;
  }

  table.grid thead th.frozen-col {
    background: #f3f4f6;
  }

  table.grid tbody td.frozen-col {
    background: #fff;
  }

  table.grid.nested-grid th {
    position: static;
    top: auto;
    z-index: auto;
    background: #f3f4f6;
  }

  table.grid.nested-grid td:first-child {
    position: static;
    left: auto;
    z-index: auto;
  }

  table.grid.nested-grid th:first-child {
    position: static;
    left: auto;
    z-index: auto;
  }

  /* Frozen columns must beat the nested-grid static resets above (equal
     specificity, later source order wins) so a frozen nested column still
     sticks instead of being reset to static. */
  table.grid.nested-grid th.frozen-col,
  table.grid.nested-grid td.frozen-col {
    position: sticky;
    left: 0;
    z-index: 8;
  }

  .col-resizer {
    position: absolute;
    top: 0;
    right: -3px;
    width: 7px;
    height: 100%;
    cursor: col-resize;
    z-index: 4;
  }

  .col-resizer:hover {
    background: rgba(37, 99, 235, 0.16);
  }

  body.resizing-col {
    cursor: col-resize;
    user-select: none;
  }

  /* \u5217\u62D6\u62FD\u6362\u5E8F\uFF1A\u8868\u5934\u53EF\u6293\u53D6\uFF08.col-reorderable\uFF09\uFF0C\u62D6\u52A8\u65F6\u5168\u5C40 grabbing \u5149\u6807\u3001
     \u6E90\u5217\u534A\u900F\u660E\u3001\u76EE\u6807\u8FB9\u754C\u9AD8\u4EAE\u3002\u4EC5\u8BB0\u5F55\u6570\u7EC4\u8868\u7684\u6570\u636E\u5217\u5E26 .col-reorderable\uFF1B
     \u4F5C\u7528\u57DF\u5230 table.grid \u4EE5\u907F\u5F00\u6D6E\u52A8\u8868\u5934\u514B\u9686\uFF08\u514B\u9686\u65E0 .grid \u7C7B\uFF09\u3002 */
  table.grid th.col-reorderable {
    cursor: grab;
  }

  table.grid th.col-reorderable .filter-btn,
  table.grid th.col-reorderable .tree-menu-btn {
    cursor: pointer;
  }

  body.dragging-col {
    cursor: grabbing;
    user-select: none;
  }

  body.dragging-col table.grid th.col-reorderable {
    cursor: grabbing;
  }

  body.dragging-col table.grid th.col-dragging {
    opacity: 0.45;
  }

  table.grid th.col-reorderable.col-drop-before {
    box-shadow: inset 2px 0 0 #2563eb;
  }

  table.grid th.col-reorderable.col-drop-after {
    box-shadow: inset -2px 0 0 #2563eb;
  }

  .th-wrap {
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
    justify-content: flex-start;
  }

  .th-left {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .th-title {
    border: 0;
    background: transparent;
    padding: 0;
    color: inherit;
    font: inherit;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .th-title:hover {
    background: transparent;
    color: #2563eb;
    text-decoration: underline;
  }

  .sort-mark {
    color: #2563eb;
    font-size: 11px;
  }

  .filter-btn {
    width: 22px;
    height: 22px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    font-size: 12px;
    line-height: 1;
  }

  .filter-btn svg {
    width: 13px;
    height: 13px;
    display: block;
  }

  .filter-btn.active {
    color: #fff;
    background: #2563eb;
    border-color: #2563eb;
  }

  .col-freeze-btn {
    width: 22px;
    height: 22px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: 5px;
    background: transparent;
    color: #9ca3af;
    cursor: pointer;
    font-size: 12px;
    line-height: 1;
  }

  .col-freeze-btn svg {
    width: 14px;
    height: 14px;
    display: block;
  }

  .col-freeze-btn:hover {
    color: #4b5563;
    background: #eef0f3;
  }

  .col-freeze-btn.active {
    color: #fff;
    background: #2563eb;
    border-color: #2563eb;
  }

  /* \u8868\u5934\u52A8\u4F5C\u6309\u94AE\u5BC6\u5EA6\u63A7\u5236\uFF1A\u9ED8\u8BA4\u53EA\u9732\u51FA\u201C\u6FC0\u6D3B\u6001\u201D\u4F5C\u4E3A\u72B6\u6001\u6307\u793A
     \uFF08\u8FC7\u6EE4\u6FC0\u6D3B\u7684 filter-btn\u3001\u5DF2\u51BB\u7ED3\u7684 col-freeze-btn\uFF09\uFF0C\u5176\u4F59
     \u975E\u6FC0\u6D3B\u6309\u94AE opacity:0 \u9690\u85CF\uFF0Chover/focus \u6574\u4E2A <th> \u65F6\u624D\u6DE1\u5165\u3002
     \u7528 opacity \u800C\u975E display\uFF0C\u4FDD\u7559\u5E03\u5C40\u5360\u4F4D\uFF0C\u907F\u514D hover \u65F6\u5217\u5BBD/\u6807\u9898\u8DF3\u52A8\u3002 */
  .th-left .filter-btn:not(.active),
  .th-left .col-freeze-btn:not(.active),
  .th-left .tree-menu-btn {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.12s ease;
  }

  th:hover .th-left .filter-btn:not(.active),
  th:focus-within .th-left .filter-btn:not(.active),
  th:hover .th-left .col-freeze-btn:not(.active),
  th:focus-within .th-left .col-freeze-btn:not(.active),
  th:hover .th-left .tree-menu-btn,
  th:focus-within .th-left .tree-menu-btn {
    opacity: 1;
    pointer-events: auto;
  }

  /* \u89E6\u6478\u8BBE\u5907\u65E0 hover\uFF0C\u4FDD\u6301\u6309\u94AE\u5E38\u9A7B\u53EF\u70B9\uFF08\u542B\u952E\u76D8 focus \u4E4B\u5916\u7684\u89E6\u63A7\u573A\u666F\uFF09\u3002 */
  @media (hover: none) {
    .th-left .filter-btn:not(.active),
    .th-left .col-freeze-btn:not(.active),
    .th-left .tree-menu-btn {
      opacity: 1;
      pointer-events: auto;
    }
  }

  .filter-menu {
    position: fixed;
    top: -9999px;
    left: -9999px;
    right: auto;
    width: 260px;
    max-height: 360px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    background: #fff;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    box-shadow: 0 18px 42px rgba(15, 23, 42, 0.20);
    z-index: 10050;
    color: #172033;
    visibility: hidden;
  }

  .filter-menu input[type="text"],
  .filter-menu select {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 6px 8px;
    font-size: 12px;
    background: #fff;
  }

  .filter-condition {
    display: grid;
    grid-template-columns: 108px 1fr;
    gap: 6px;
  }

  .filter-actions {
    display: flex;
    gap: 6px;
  }

  .filter-actions button {
    flex: 1;
    padding: 5px 6px;
    font-size: 12px;
  }

  .value-list {
    max-height: 180px;
    overflow: auto;
    border: 1px solid #eef0f3;
    border-radius: 8px;
  }

  .check-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-bottom: 1px solid #f1f3f5;
    font-weight: 400;
    color: #172033;
  }

  .check-row:last-child {
    border-bottom: 0;
  }

  .check-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .check-count {
    color: #6b7280;
    font-size: 11px;
  }

  .type {
    color: #6b7280;
    font-size: 12px;
  }

  .number-value,
  .type-number {
    font-weight: 700;
  }

  .key-jump {
    border: 0;
    background: transparent;
    padding: 0;
    color: #2563eb;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  .key-jump:hover {
    text-decoration: underline;
    background: transparent;
  }

  .json-string-badge,
  .json-parse-warn-badge {
    display: inline-flex;
    align-items: center;
    margin-right: 5px;
    padding: 1px 5px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
  }

  .json-string-badge {
    color: #166534;
    background: #dcfce7;
  }

  .json-parse-warn-badge {
    color: #92400e;
    background: #fef3c7;
  }

  .summary-main {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .node-actions {
    display: inline-flex;
    gap: 4px;
    margin-left: 8px;
    vertical-align: middle;
  }

  .node-action {
    padding: 1px 5px;
    border-radius: 5px;
    font-size: 11px;
    color: #4b5563;
    background: #fff;
  }

  .node-action:hover {
    color: #1d4ed8;
    border-color: #bfdbfe;
    background: #eff6ff;
  }

  .node-action[disabled] {
    display: none;
  }

  details {
    margin: 0;
  }

  summary {
    cursor: pointer;
    color: #2563eb;
    list-style: none;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  .muted {
    color: #6b7280;
  }

  pre {
    margin: 0;
    padding: 12px;
    background: #fff;
    border: 1px solid #e5e7eb;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .empty {
    margin-top: 12px;
    padding: 24px;
    color: #6b7280;
    background: #fff;
    border: 1px dashed #d1d5db;
    border-radius: 10px;
  }

  .perf-note {
    margin: 8px 0;
    padding: 8px 10px;
    color: #92400e;
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 8px;
    font-size: 12px;
  }
  
  .path-select {
    max-width: 260px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 7px 10px;
    background: #fff;
  }

  .sticky-context {
    display: none;
    align-items: center;
    gap: 8px;
    min-height: 32px;
    padding: 6px 12px;
    color: #1f2937;
    background: rgba(255, 255, 255, .96);
    border-bottom: 1px solid #dbeafe;
    box-shadow: 0 6px 18px rgba(15, 23, 42, .08);
    z-index: 8;
    font-size: 12px;
  }

  .sticky-context.active {
    display: flex;
  }

  .sticky-context-label {
    color: #6b7280;
    font-weight: 600;
  }

  .sticky-context-path {
    overflow: hidden;
    color: #2563eb;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sticky-context-summary {
    color: #6b7280;
    white-space: nowrap;
  }

  .sticky-context button {
    margin-left: auto;
    padding: 3px 7px;
    border-radius: 6px;
    font-size: 12px;
  }

  .sticky-table-head {
    position: fixed;
    display: none;
    overflow: hidden;
    background: #f3f4f6;
    border-bottom: 1px solid #dbe3ef;
    box-shadow: 0 4px 12px rgba(15, 23, 42, .06);
    z-index: 40;
  }

  .sticky-table-head.active {
    display: block;
  }

  .sticky-table-head.multi {
    inset: 0 auto auto 0;
    width: 100vw !important;
    height: 100vh !important;
    overflow: visible;
    background: transparent;
    border-bottom: 0;
    box-shadow: none;
    pointer-events: none;
  }

  .sticky-table-head-inner {
    pointer-events: none;
  }

  .sticky-head-layer {
    position: fixed;
    overflow: hidden;
    background: #f3f4f6;
    border: 1px solid #dbe3ef;
    border-radius: 6px;
    box-shadow: 0 6px 16px rgba(15, 23, 42, .08);
    pointer-events: none;
  }

  .sticky-head-layer-inner {
    height: 100%;
    pointer-events: none;
  }

  .sticky-table-head table {
    height: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    background: #f3f4f6;
  }

  .sticky-table-head thead,
  .sticky-table-head tr {
    height: 100%;
  }

  .sticky-table-head th {
    box-sizing: border-box;
    height: 100%;
    border-right: 1px solid #eef0f3;
    padding: 8px 10px;
    overflow: hidden;
    color: #4b5563;
    background: #f3f4f6;
    font-size: 12px;
    text-align: left;
    vertical-align: middle;
  }

  .sticky-table-head .th-wrap,
  .sticky-table-head .th-left {
    height: 100%;
    overflow: hidden;
    align-items: center;
  }

  .sticky-table-head .filter-menu,
  .sticky-table-head .col-resizer {
    display: none;
  }

  .toast {
    position: fixed;
    right: 14px;
    bottom: 14px;
    padding: 8px 10px;
    color: #fff;
    background: rgba(15, 23, 42, .9);
    border-radius: 8px;
    font-size: 12px;
    z-index: 10000;
  }
`;

  // src/visualizer/skeleton.html
  var skeleton_default = '\n\n<div class="app">\n  <div class="bar">\n    <div class="title">JSON Table</div>\n    <div class="meta" id="meta"></div>\n    <button id="pathUp" title="\u4E0A\u4E00\u7EA7\u8DEF\u5F84">\u4E0A\u7EA7</button>\n    <select id="pathSelect" class="path-select"></select>\n    <input id="globalSearch" class="search" placeholder="\u5168\u5C40\u641C\u7D22">\n    <button id="resetFilters">\u91CD\u7F6E\u8FC7\u6EE4</button>\n    <button id="toggle">\u539F\u59CB</button>\n    <div class="settings-wrap" id="settingsWrap">\n      <button id="settingsBtn" class="settings-btn" title="\u8BBE\u7F6E" aria-label="\u8BBE\u7F6E" aria-expanded="false">\n        <svg viewBox="0 0 16 16" aria-hidden="true">\n          <path d="M3 4.5h10M3 11.5h10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>\n          <circle cx="6" cy="4.5" r="1.7" fill="#fff" stroke="currentColor" stroke-width="1.2"/>\n          <circle cx="10" cy="11.5" r="1.7" fill="#fff" stroke="currentColor" stroke-width="1.2"/>\n        </svg>\n      </button>\n      <div id="settingsMenu" class="settings-menu" hidden>\n        <div class="settings-title">\u8BBE\u7F6E</div>\n        <label class="setting-row">\n          <input id="showTypeCheck" type="checkbox">\n          <span>\u663E\u793A Type \u5217</span>\n        </label>\n        <label class="setting-row" title="\u6EDA\u52A8\u65F6\u4FDD\u6301\u8868\u5934\u884C\u56FA\u5B9A\u5728\u9876\u90E8\uFF08\u4EC5\u56FA\u5B9A\u884C\uFF1B\u51BB\u7ED3\u5217\u8BF7\u7528\u5404\u5217\u8BBE\u7F6E\u91CC\u7684\u9501\u56FE\u6807\uFF09">\n          <input id="freezeHeaderCheck" type="checkbox">\n          <span>\u56FA\u5B9A\u8868\u5934\u884C</span>\n        </label>\n        <label class="setting-row">\n          <input id="showStickyHeaderCheck" type="checkbox">\n          <span>\u663E\u793A\u5C42\u7EA7\u6D6E\u52A8\u8868\u5934</span>\n        </label>\n        <label class="setting-row">\n          <input id="parseJsonStringCheck" type="checkbox">\n          <span>\u89E3\u6790 JSON \u5B57\u7B26\u4E32</span>\n        </label>\n        <label class="setting-row">\n          <span>\u6D6E\u52A8\u8868\u5934\u6A21\u5F0F</span>\n          <select id="headerModeSelect" style="margin-left:auto;max-width:96px">\n            <option value="single">\u5355\u5C42</option>\n            <option value="multi">\u591A\u5C42</option>\n          </select>\n        </label>\n        <div class="settings-section">\n          <div class="settings-title">\u5B57\u6BB5\u663E\u793A<button type="button" class="reset-col-order" id="resetColOrderBtn" title="\u6062\u590D\u5217\u7684\u539F\u59CB\u987A\u5E8F" hidden>\u91CD\u7F6E\u987A\u5E8F</button></div>\n          <div id="columnSettings" class="column-list"></div>\n        </div>\n        <div class="settings-section">\n          <div class="settings-title">\u590D\u5236 / \u5BFC\u51FA</div>\n          <div class="settings-actions">\n            <button id="copyPathBtn">\u590D\u5236\u8DEF\u5F84</button>\n            <button id="copyJsonBtn">\u590D\u5236 JSON</button>\n            <button id="exportJsonBtn">\u5BFC\u51FA JSON</button>\n            <button id="exportCsvBtn">\u5BFC\u51FA CSV</button>\n          </div>\n        </div>\n        <div class="settings-section">\n          <div class="settings-title">\u8DEF\u5F84</div>\n          <button id="favPathBtn" class="path-chip">\u6536\u85CF\u5F53\u524D\u8DEF\u5F84</button>\n          <div id="pathShortcuts" class="path-list"></div>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class="filter-chips" id="filterChips"></div>\n  <div class="sticky-context" id="stickyContextBar" title="\u5F53\u524D\u6EDA\u52A8\u5C42\u7EA7">\n    <span class="sticky-context-label">\u5F53\u524D\u5C42\u7EA7</span>\n    <span class="sticky-context-path" id="stickyContextPath"></span>\n    <span class="sticky-context-summary" id="stickyContextSummary"></span>\n    <button id="stickyContextJump" type="button">\u5B9A\u4F4D</button>\n  </div>\n  <div class="sticky-table-head" id="stickyTableHead">\n    <div class="sticky-table-head-inner" id="stickyTableHeadInner"></div>\n  </div>\n  <div class="content" id="content"></div>\n</div>\n\n';

  // engine-bundle:virtual:engine-bundle
  var virtual_engine_bundle_default = `(() => {
  // src/visualizer/engine/columns.js
  function collectColumns(rows) {
    var cols = [];
    rows.forEach(function(row) {
      if (!isObj(row)) return;
      Object.keys(row).forEach(function(k) {
        if (cols.indexOf(k) < 0) cols.push(k);
      });
    });
    return cols;
  }
  function getHiddenColumns(path) {
    state.hiddenColumnsByPath[path] = state.hiddenColumnsByPath[path] || {};
    return state.hiddenColumnsByPath[path];
  }
  function getVisibleColumns(cols, path) {
    var hidden = getHiddenColumns(path);
    var visible = cols.filter(function(col) {
      return !hidden[col];
    });
    return visible.length ? visible : cols;
  }
  function getOrderedColumns(cols, path) {
    var order = state.columnOrderByPath[path];
    if (!order || !order.length) return cols;
    var colSet = {};
    cols.forEach(function(c) {
      colSet[c] = true;
    });
    var seen = {};
    var result = [];
    order.forEach(function(c) {
      if (colSet[c] && !seen[c]) {
        result.push(c);
        seen[c] = true;
      }
    });
    cols.forEach(function(c) {
      if (!seen[c]) {
        result.push(c);
        seen[c] = true;
      }
    });
    return result;
  }
  function setColumnOrder(path, orderedCols) {
    state.columnOrderByPath[path] = orderedCols.slice();
    savePersistedState();
    render();
  }
  function resetColumnOrder(path) {
    if (!state.columnOrderByPath[path]) return;
    delete state.columnOrderByPath[path];
    savePersistedState();
    render();
  }
  function setColumnVisible(path, col, visible) {
    var hidden = getHiddenColumns(path);
    if (visible) {
      delete hidden[col];
    } else {
      hidden[col] = true;
    }
    savePersistedState();
    render();
  }
  function getFrozenColumns(path) {
    return state.frozenColumnsByPath[path] || {};
  }
  function ensureFrozenColumns(path) {
    if (!state.frozenColumnsByPath[path]) state.frozenColumnsByPath[path] = {};
    return state.frozenColumnsByPath[path];
  }
  function isColumnFrozen(path, col) {
    return !!getFrozenColumns(path)[col];
  }
  function setColumnFrozen(path, col, frozen) {
    var frozenSet = ensureFrozenColumns(path);
    if (frozen) {
      frozenSet[col] = true;
    } else {
      delete frozenSet[col];
    }
    if (frozen && path === state.tablePath) {
      var visible = getVisibleColumns(state.currentAllColumns, path);
      if (visible.length && visible.every(function(c) {
        return frozenSet[c];
      })) {
        showToast("\\u5DF2\\u51BB\\u7ED3\\u5168\\u90E8\\u5217\\uFF0C\\u6A2A\\u5411\\u6EDA\\u52A8\\u5C06\\u5931\\u6548\\uFF08\\u5EFA\\u8BAE\\u81F3\\u5C11\\u4FDD\\u7559\\u4E00\\u5217\\u975E\\u51BB\\u7ED3\\uFF09");
      }
    }
    savePersistedState();
    render();
  }
  function setColumnWidth(table, index, width) {
    var tableId = table.getAttribute("data-table-id") || "$";
    var th = table.tHead && table.tHead.rows[0] && table.tHead.rows[0].cells[index];
    var colKey = th ? th.getAttribute("data-col-key") || String(index) : String(index);
    state.columnWidths[tableId + "::" + colKey] = width;
    Array.prototype.forEach.call(table.rows, function(row) {
      var cell = row.cells && row.cells[index];
      if (!cell) return;
      cell.style.width = width + "px";
      cell.style.minWidth = width + "px";
    });
    if (th && th.classList.contains("frozen-col")) {
      applyFrozenLayout();
    }
  }
  function applyFrozenLayout() {
    var tables = dom.content.querySelectorAll("table.grid");
    var plan = [];
    for (var t = 0; t < tables.length; t++) {
      var table = tables[t];
      if (!table.tHead || !table.tHead.rows.length) continue;
      var ths = table.tHead.rows[0].cells;
      var rows = table.tBodies[0] ? table.tBodies[0].rows : [];
      var widths = new Array(ths.length);
      var firstW = -1;
      for (var i = 0; i < ths.length; i++) {
        var th = ths[i];
        if (!th.classList.contains("frozen-col")) {
          widths[i] = -1;
          continue;
        }
        var w = th.getBoundingClientRect().width;
        if (firstW < 0) firstW = w;
        widths[i] = w;
      }
      if (firstW <= 0) continue;
      plan.push({ ths, rows, widths });
    }
    for (var p = 0; p < plan.length; p++) {
      var item = plan[p];
      var left = 0;
      for (var j = 0; j < item.ths.length; j++) {
        if (item.widths[j] < 0) continue;
        item.ths[j].style.left = left + "px";
        item.ths[j].style.zIndex = 8;
        for (var r = 0; r < item.rows.length; r++) {
          var td = item.rows[r].cells[j];
          if (td) {
            td.style.left = left + "px";
            td.style.zIndex = 2;
          }
        }
        left += Math.round(item.widths[j]);
      }
    }
  }
  function scheduleFrozenLayout() {
    if (state.frozenLayoutTicking) return;
    state.frozenLayoutTicking = true;
    requestAnimationFrame(function() {
      applyFrozenLayout();
      state.frozenLayoutTicking = false;
    });
  }
  function bindColumnResizeEvents() {
    Array.prototype.forEach.call(dom.content.querySelectorAll(".col-resizer"), function(handle) {
      handle.onmousedown = function(event) {
        event.preventDefault();
        event.stopPropagation();
        var th = handle.closest("th");
        var table = handle.closest("table.grid");
        if (!th || !table) return;
        var index = th.cellIndex;
        var startX = event.clientX;
        var startWidth = th.getBoundingClientRect().width;
        document.body.classList.add("resizing-col");
        var resizeTicking = false;
        var lastMoveEvent = null;
        function onMove(moveEvent) {
          lastMoveEvent = moveEvent;
          if (resizeTicking) return;
          resizeTicking = true;
          requestAnimationFrame(function() {
            resizeTicking = false;
            var me = lastMoveEvent;
            if (!me) return;
            var width = Math.max(48, Math.round(startWidth + me.clientX - startX));
            setColumnWidth(table, index, width);
          });
        }
        function onUp() {
          document.body.classList.remove("resizing-col");
          document.removeEventListener("mousemove", onMove);
          document.removeEventListener("mouseup", onUp);
          savePersistedState();
        }
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
      };
    });
  }
  function bindColumnFreezeEvents() {
    Array.prototype.forEach.call(dom.content.querySelectorAll(".col-freeze-btn"), function(btn) {
      btn.onclick = function(event) {
        event.preventDefault();
        event.stopPropagation();
        var tid = btn.getAttribute("data-table-id");
        var col = btn.getAttribute("data-col");
        setColumnFrozen(tid, col, !isColumnFrozen(tid, col));
      };
    });
  }
  function bindColumnReorderEvents() {
    Array.prototype.forEach.call(dom.content.querySelectorAll("table.grid thead th.col-reorderable"), function(th) {
      th.onmousedown = function(event) {
        if (event.button !== 0) return;
        if (event.target.closest && event.target.closest(".filter-btn, .col-freeze-btn, .tree-menu-btn, .col-resizer, .filter-menu")) return;
        var table = th.closest("table.grid");
        if (!table || !table.tHead || !table.tHead.rows[0]) return;
        var tableId = table.getAttribute("data-table-id") || "$";
        var headerCells = Array.prototype.slice.call(table.tHead.rows[0].cells);
        var srcIdx = headerCells.indexOf(th);
        if (srcIdx < 0) return;
        var N = headerCells.length;
        var frozenCount = 0;
        for (var i = 0; i < N; i++) {
          if (headerCells[i].classList.contains("frozen-col")) frozenCount++;
          else break;
        }
        var srcIsFrozen = th.classList.contains("frozen-col");
        var startX = event.clientX;
        var startY = event.clientY;
        var dragging = false;
        var currentIndicator = null;
        var lastInsertAt = null;
        var moveTicking = false;
        var lastMoveEvent = null;
        function clearDropClasses() {
          for (var k = 0; k < headerCells.length; k++) {
            headerCells[k].classList.remove("col-drop-before", "col-drop-after");
          }
        }
        function indicatorFor(insertAt) {
          if (insertAt <= 0) return { th: headerCells[0], side: "before" };
          if (insertAt >= N) return { th: headerCells[N - 1], side: "after" };
          if (srcIsFrozen && insertAt === frozenCount) {
            return { th: headerCells[frozenCount - 1], side: "after" };
          }
          return { th: headerCells[insertAt], side: "before" };
        }
        function computeInsertAt(clientX) {
          var insertAt = N;
          for (var i2 = 0; i2 < N; i2++) {
            var rect = headerCells[i2].getBoundingClientRect();
            if (clientX < rect.right) {
              insertAt = clientX < (rect.left + rect.right) / 2 ? i2 : i2 + 1;
              break;
            }
          }
          if (srcIsFrozen) {
            insertAt = Math.max(0, Math.min(insertAt, frozenCount));
          } else {
            insertAt = Math.max(frozenCount, Math.min(insertAt, N));
          }
          return insertAt;
        }
        function applyIndicator(clientX) {
          var insertAt = computeInsertAt(clientX);
          var ind = indicatorFor(insertAt);
          if (currentIndicator && currentIndicator.th === ind.th && currentIndicator.side === ind.side) return insertAt;
          clearDropClasses();
          ind.th.classList.add(ind.side === "before" ? "col-drop-before" : "col-drop-after");
          currentIndicator = ind;
          return insertAt;
        }
        function onMove(me) {
          lastMoveEvent = me;
          if (moveTicking) return;
          moveTicking = true;
          requestAnimationFrame(function() {
            moveTicking = false;
            var e = lastMoveEvent;
            if (!e) return;
            if (!dragging) {
              var dx = e.clientX - startX;
              var dy = e.clientY - startY;
              if (dx * dx + dy * dy < 25) return;
              dragging = true;
              document.body.classList.add("dragging-col");
              th.classList.add("col-dragging");
              var sel = window.getSelection && window.getSelection();
              if (sel && sel.removeAllRanges) sel.removeAllRanges();
            }
            lastInsertAt = applyIndicator(e.clientX);
          });
        }
        function onUp() {
          document.removeEventListener("mousemove", onMove);
          document.removeEventListener("mouseup", onUp);
          if (!dragging) return;
          dragging = false;
          document.body.classList.remove("dragging-col");
          th.classList.remove("col-dragging");
          clearDropClasses();
          currentIndicator = null;
          suppressNextClick();
          if (lastInsertAt == null) return;
          if (lastInsertAt === srcIdx || lastInsertAt === srcIdx + 1) return;
          var renderCols = headerCells.map(function(c) {
            return c.getAttribute("data-col-key") || "";
          });
          var actual = lastInsertAt > srcIdx ? lastInsertAt - 1 : lastInsertAt;
          var moved = renderCols.splice(srcIdx, 1)[0];
          renderCols.splice(actual, 0, moved);
          setColumnOrder(tableId, renderCols);
        }
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
      };
    });
  }
  function suppressNextClick() {
    function teardown() {
      window.removeEventListener("click", suppress, true);
      document.removeEventListener("mousedown", teardown, true);
    }
    function suppress(ev) {
      ev.stopPropagation();
      ev.preventDefault();
      teardown();
    }
    window.addEventListener("click", suppress, true);
    document.addEventListener("mousedown", teardown, true);
  }

  // src/visualizer/engine/details-tree.js
  function getNodeAtPath(path) {
    if (!path || path === "$") return state.json;
    var node = state.json;
    var re = /.([^.[]+)|[(d+)]/g;
    var match;
    while ((match = re.exec(path)) && node !== void 0 && node !== null) {
      node = match[1] !== void 0 ? node[match[1]] : node[Number(match[2])];
    }
    return node;
  }
  function gridClass(tableId) {
    return "grid " + (tableId === state.tablePath ? "root-grid" : "nested-grid");
  }
  function removeExpandedPathTree(path) {
    Object.keys(state.expandedDetailPaths).forEach(function(key) {
      if (key === path || key.indexOf(path + ".") === 0 || key.indexOf(path + "[") === 0) {
        delete state.expandedDetailPaths[key];
      }
    });
  }
  function addExpandablePaths(v, path) {
    if (!hasExpandableValue(v)) return;
    state.expandedDetailPaths[path] = true;
    var parsedStringJson = tryParseJsonStringValue(v);
    if (parsedStringJson) {
      addExpandablePaths(parsedStringJson, path);
      return;
    }
    if (Array.isArray(v)) {
      v.forEach(function(item, index) {
        if (hasExpandableValue(item)) addExpandablePaths(item, path + "[" + index + "]");
      });
      return;
    }
    if (isObj(v)) {
      Object.keys(v).forEach(function(key) {
        var child = v[key];
        if (hasExpandableValue(child)) addExpandablePaths(child, path + "." + key);
      });
    }
  }
  function collectSearchExpandedPaths(v, path, q) {
    var matched = valueText(v).toLowerCase().indexOf(q) >= 0;
    var parsedStringJson = tryParseJsonStringValue(v);
    if (parsedStringJson) {
      var parsedMatched = collectSearchExpandedPaths(parsedStringJson, path, q);
      if (parsedMatched) state.expandedDetailPaths[path] = true;
      return matched || parsedMatched;
    }
    if (Array.isArray(v)) {
      v.forEach(function(item, index) {
        var childPath = path + "[" + index + "]";
        var childMatched = collectSearchExpandedPaths(item, childPath, q);
        if (childMatched && hasExpandableValue(item)) state.expandedDetailPaths[childPath] = true;
        matched = matched || childMatched;
      });
      return matched;
    }
    if (isObj(v)) {
      Object.keys(v).forEach(function(key) {
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
  function applySearchExpansion() {
    var q = dom.globalSearch.value.trim().toLowerCase();
    if (!q) return;
    state.expandedDetailPaths = {};
    collectSearchExpandedPaths(state.nodesByPath[state.selectedPath], state.selectedPath, q);
  }
  function getPathDepth(path) {
    if (!path || path === "$") return 0;
    var normalized = path.replace(/[[^]]+]/g, ".[]");
    return normalized.split(".").length - 1;
  }
  function syncExpandedDetailPaths() {
    Array.prototype.forEach.call(dom.content.querySelectorAll("details[data-path]"), function(item) {
      var path = item.getAttribute("data-path");
      if (!path) return;
      if (item.open) {
        state.expandedDetailPaths[path] = true;
      } else {
        delete state.expandedDetailPaths[path];
      }
    });
  }
  function restoreExpandedDetails() {
    Array.prototype.forEach.call(dom.content.querySelectorAll("details[data-path]"), function(item) {
      var path = item.getAttribute("data-path");
      item.open = !!state.expandedDetailPaths[path];
    });
  }
  function bindDetailsToggleEvents() {
    Array.prototype.forEach.call(dom.content.querySelectorAll("details[data-path]"), function(item) {
      item.ontoggle = function() {
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
        applyFrozenLayout();
      };
    });
  }
  function getTreeColumnIndex(table) {
    if (state.activeTreeColumnIndex >= 0) return state.activeTreeColumnIndex;
    return table && table.rows && table.rows[0] ? table.rows[0].cells.length - 1 : -1;
  }
  function getColumnDetails(table, directOnly) {
    if (!table || !table.tBodies || !table.tBodies.length) return [];
    var details = [];
    var columnIndex = getTreeColumnIndex(table);
    Array.prototype.forEach.call(table.tBodies[0].children, function(row) {
      var cell = row.cells && row.cells[columnIndex];
      if (!cell) return;
      if (directOnly) {
        Array.prototype.forEach.call(cell.children, function(child) {
          if (child.matches && child.matches("details[data-depth]")) details.push(child);
        });
      } else {
        details = details.concat(Array.prototype.slice.call(cell.querySelectorAll("details[data-depth]")));
      }
    });
    return details;
  }
  function getScopedDetails(scope) {
    var details = getColumnDetails(state.activeTreeTable, scope === "current");
    if (!details.length && scope !== "current") {
      details = Array.prototype.slice.call(dom.content.querySelectorAll("details[data-depth]"));
    }
    return details;
  }
  function applyDetailsOpen(details, open, scope) {
    state.suppressDetailToggle = true;
    try {
      details.forEach(function(item) {
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
      setTimeout(function() {
        state.suppressDetailToggle = false;
      }, 0);
    }
  }
  function toggleDetailsOpen(scope) {
    var details = getScopedDetails(scope);
    var shouldOpen = details.some(function(item) {
      return !item.open;
    });
    applyDetailsOpen(details, shouldOpen, scope);
    render();
  }
  function hasExpandableValue(v) {
    return !!(v && typeof v === "object") || !!tryParseJsonStringValue(v);
  }
  function treeMenuHtml() {
    return '<div class="tree-menu"><button class="tree-action" data-scope="current">\\u5C55\\u5F00/\\u6298\\u53E0\\u672C\\u5C42</button><button class="tree-action" data-scope="all">\\u5C55\\u5F00/\\u6298\\u53E0\\u5168\\u90E8</button></div>';
  }
  function closeTreeMenu() {
    state.treeMenuOpen = false;
    state.activeTreeTable = null;
    state.activeTreeColumnIndex = -1;
    Array.prototype.forEach.call(document.querySelectorAll(".tree-menu"), function(menu) {
      if (menu.parentNode) menu.parentNode.removeChild(menu);
    });
    Array.prototype.forEach.call(dom.content.querySelectorAll(".tree-menu-btn"), function(btn) {
      btn.setAttribute("aria-expanded", "false");
    });
  }
  function bindTreeActionEvents(root) {
    Array.prototype.forEach.call(root.querySelectorAll(".tree-menu"), function(menu) {
      menu.onclick = function(event) {
        event.stopPropagation();
      };
    });
    Array.prototype.forEach.call(root.querySelectorAll(".tree-action"), function(btn) {
      btn.onclick = function(event) {
        event.stopPropagation();
        toggleDetailsOpen(btn.getAttribute("data-scope"));
        closeTreeMenu();
      };
    });
  }
  function positionTreeMenu(btn) {
    var menu = document.querySelector(".tree-menu");
    if (!menu) return;
    var rect = btn.getBoundingClientRect();
    var left = Math.min(rect.left, window.innerWidth - menu.offsetWidth - 8);
    var top = Math.min(rect.bottom + 6, window.innerHeight - menu.offsetHeight - 8);
    menu.style.left = Math.max(8, left) + "px";
    menu.style.top = Math.max(8, top) + "px";
  }
  function bindTreeMenuEvents() {
    Array.prototype.forEach.call(dom.content.querySelectorAll(".tree-menu-btn"), function(btn) {
      btn.onclick = function(event) {
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

  // src/visualizer/engine/filter-sort.js
  function getValueCounts(rows, col) {
    var counts = {};
    rows.forEach(function(row) {
      var text = valueText(row ? row[col] : void 0);
      counts[text] = (counts[text] || 0) + 1;
    });
    return counts;
  }
  function globalFilterKey(col) {
    return "*::" + String(col);
  }
  function getColumnFilter(tableId, col) {
    return state.columnFilters[filterMenuKey(tableId, col)] || state.columnFilters[globalFilterKey(col)] || {};
  }
  function hasColumnFilter(filter) {
    return !!(filter && (filter.values && filter.values.length || filter.mode));
  }
  function formatFilterLabel(key, filter) {
    if (key === "__global_search__") return "\\u641C\\u7D22: " + dom.globalSearch.value.trim();
    var parts = key.split("::");
    var scope = parts[0] === "*" ? "\\u5168\\u90E8" : parts[0];
    var col = parts.slice(1).join("::");
    var bits = [];
    if (filter.values && filter.values.length) bits.push(filter.values.length + " \\u4E2A\\u503C");
    if (filter.mode && filter.mode !== "all") bits.push(filter.mode + (filter.query ? ": " + filter.query : ""));
    return col + " \\xB7 " + bits.join(" \\xB7 ") + (scope === "\\u5168\\u90E8" ? " \\xB7 \\u5168\\u90E8\\u540C\\u540D" : "");
  }
  function renderFilterChips() {
    var chips = [];
    var q = dom.globalSearch.value.trim();
    if (q) chips.push({ key: "__global_search__", text: formatFilterLabel("__global_search__", {}) });
    Object.keys(state.columnFilters).forEach(function(key) {
      var filter = state.columnFilters[key];
      if (hasColumnFilter(filter)) chips.push({ key, text: formatFilterLabel(key, filter) });
    });
    if (!chips.length) {
      dom.filterChips.classList.remove("active");
      dom.filterChips.innerHTML = "";
      return;
    }
    dom.filterChips.classList.add("active");
    dom.filterChips.innerHTML = chips.map(function(chip) {
      return '<span class="filter-chip" title="' + esc(chip.text) + '"><span class="filter-chip-text">' + esc(chip.text) + '</span><button class="filter-chip-remove" data-filter-key="' + esc(chip.key) + '" title="\\u79FB\\u9664\\u8FC7\\u6EE4\\u6761\\u4EF6">\\xD7</button></span>';
    }).join("");
    bindFilterChipEvents();
  }
  function bindFilterChipEvents() {
    Array.prototype.forEach.call(dom.filterChips.querySelectorAll(".filter-chip-remove"), function(btn) {
      btn.onclick = function(event) {
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
  function getActiveFilterCount() {
    var count = 0;
    Object.keys(state.columnFilters).forEach(function(key) {
      if (hasColumnFilter(state.columnFilters[key])) count++;
    });
    if (dom.globalSearch.value.trim()) count++;
    return count;
  }
  function conditionMatches(filter, text) {
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
  function rowMatches(row, cols, tableId) {
    var global = dom.globalSearch.value.trim().toLowerCase();
    if (global) {
      var wholeRow = cols.map(function(col2) {
        return valueText(row ? row[col2] : void 0);
      }).join(" ").toLowerCase();
      if (wholeRow.indexOf(global) < 0) return false;
    }
    for (var i = 0; i < cols.length; i++) {
      var col = cols[i];
      var filter = getColumnFilter(tableId, col);
      var text = valueText(row ? row[col] : void 0);
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
  function getFilteredRows(rows, cols, tableId) {
    return rows.filter(function(row) {
      return rowMatches(row, cols, tableId);
    });
  }
  function compareValues(a, b) {
    var av = valueText(a);
    var bv = valueText(b);
    var an = Number(av);
    var bn = Number(bv);
    if (av !== "" && bv !== "" && isFinite(an) && isFinite(bn)) {
      return an === bn ? 0 : an > bn ? 1 : -1;
    }
    return av.localeCompare(bv, "zh-Hans", { numeric: true });
  }
  function getSortedRows(rows) {
    if (!state.sortState.col || !state.sortState.dir) return rows;
    return rows.slice().sort(function(a, b) {
      var result = compareValues(a ? a[state.sortState.col] : void 0, b ? b[state.sortState.col] : void 0);
      return state.sortState.dir === "asc" ? result : -result;
    });
  }
  function toggleSort(col) {
    if (state.sortState.col !== col) {
      state.sortState = { col, dir: "asc" };
    } else if (state.sortState.dir === "asc") {
      state.sortState.dir = "desc";
    } else {
      state.sortState = { col: null, dir: null };
    }
    render();
  }
  function expandSearchMatches() {
  }
  function filterMenuKey(tableId, col) {
    return String(tableId || state.tablePath) + "::" + String(col);
  }
  function findFilterButtonByKey(menuKey) {
    var found = null;
    Array.prototype.some.call(dom.content.querySelectorAll(".filter-btn"), function(btn) {
      if (btn.getAttribute("data-filter-key") === menuKey) {
        found = btn;
        return true;
      }
      return false;
    });
    return found;
  }
  function positionFilterMenu() {
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
  function renderFilterMenu(col, rows, tableId) {
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
      filter.values.forEach(function(v) {
        selectedMap[v] = true;
      });
    }
    var html = '<div class="filter-menu" data-menu-col="' + esc(col) + '" data-table-id="' + esc(tableId || state.tablePath) + '" data-menu-key="' + esc(scopedKey) + '">';
    html += '<input type="text" class="menu-search" data-col="' + esc(col) + '" value="" placeholder="\\u641C\\u7D22\\u8FC7\\u6EE4\\u9879">';
    html += '<div class="filter-condition">';
    html += '<select class="condition-mode" data-col="' + esc(col) + '">';
    html += '<option value="all"' + (!filter.mode || filter.mode === "all" ? " selected" : "") + ">\\u6761\\u4EF6\\uFF1A\\u5168\\u90E8</option>";
    html += '<option value="contains"' + (filter.mode === "contains" ? " selected" : "") + ">\\u5305\\u542B</option>";
    html += '<option value="notContains"' + (filter.mode === "notContains" ? " selected" : "") + ">\\u4E0D\\u5305\\u542B</option>";
    html += '<option value="equals"' + (filter.mode === "equals" ? " selected" : "") + ">\\u7B49\\u4E8E</option>";
    html += '<option value="notEquals"' + (filter.mode === "notEquals" ? " selected" : "") + ">\\u4E0D\\u7B49\\u4E8E</option>";
    html += '<option value="empty"' + (filter.mode === "empty" ? " selected" : "") + ">\\u7A7A\\u503C</option>";
    html += '<option value="notEmpty"' + (filter.mode === "notEmpty" ? " selected" : "") + ">\\u975E\\u7A7A</option>";
    html += "</select>";
    html += '<input type="text" class="condition-value" data-col="' + esc(col) + '" value="' + esc(filter.query || "") + '" placeholder="\\u6761\\u4EF6\\u503C">';
    html += "</div>";
    html += '<label class="setting-row" style="padding:4px 2px"><input class="apply-all-filter" type="checkbox"' + (applyAllChecked ? " checked" : "") + "> <span>\\u5E94\\u7528\\u5230\\u6240\\u6709\\u540C\\u540D\\u5B57\\u6BB5</span></label>";
    html += '<div class="filter-actions">';
    html += '<button class="select-all" data-col="' + esc(col) + '">\\u5168\\u9009</button>';
    html += '<button class="select-none" data-col="' + esc(col) + '">\\u6E05\\u7A7A</button>';
    html += "</div>";
    html += '<div class="value-list">';
    values.forEach(function(value) {
      var checked = !selectedMap || selectedMap[value] ? " checked" : "";
      html += '<label class="check-row" data-filter-text="' + esc(String(value).toLowerCase()) + '">';
      html += '<input type="checkbox" class="value-check" data-col="' + esc(col) + '" value="' + esc(value) + '"' + checked + ">";
      html += '<span class="check-label" title="' + esc(value) + '">' + esc(value || "(\\u7A7A)") + "</span>";
      html += '<span class="check-count">' + counts[value] + "</span>";
      html += "</label>";
    });
    html += "</div>";
    html += '<div class="filter-actions">';
    html += '<button class="apply-filter" data-col="' + esc(col) + '">\\u5E94\\u7528</button>';
    html += '<button class="cancel-filter" data-col="' + esc(col) + '">\\u53D6\\u6D88</button>';
    html += "</div>";
    html += "</div>";
    return html;
  }
  function bindFilterEvents() {
    Array.prototype.forEach.call(dom.content.querySelectorAll(".key-jump"), function(btn) {
      btn.onclick = function(event) {
        event.stopPropagation();
        var path = btn.getAttribute("data-path");
        if (!Object.prototype.hasOwnProperty.call(state.nodesByPath, path)) return;
        setRootPath(path);
      };
    });
    Array.prototype.forEach.call(dom.content.querySelectorAll(".th-title"), function(btn) {
      btn.onclick = function(event) {
        event.stopPropagation();
        closeTreeMenu();
        state.activeFilterColumn = null;
        toggleSort(btn.getAttribute("data-col"));
      };
    });
    Array.prototype.forEach.call(dom.content.querySelectorAll(".filter-btn"), function(btn) {
      btn.onclick = function(event) {
        event.stopPropagation();
        var col = btn.getAttribute("data-col");
        var menuKey = btn.getAttribute("data-filter-key") || col;
        closeTreeMenu();
        state.activeFilterColumn = state.activeFilterColumn === menuKey ? null : menuKey;
        render();
      };
    });
    requestAnimationFrame(positionFilterMenu);
    Array.prototype.forEach.call(dom.content.querySelectorAll(".filter-menu"), function(menu) {
      menu.onclick = function(event) {
        event.stopPropagation();
      };
    });
    function applyMenuSearch(menu) {
      var input = menu.querySelector(".menu-search");
      var q = input ? input.value.trim().toLowerCase() : "";
      Array.prototype.forEach.call(menu.querySelectorAll(".check-row"), function(row) {
        var text = row.getAttribute("data-filter-text") || "";
        row.style.display = !q || text.indexOf(q) >= 0 ? "flex" : "none";
      });
    }
    Array.prototype.forEach.call(dom.content.querySelectorAll(".menu-search"), function(input) {
      input.oninput = function(event) {
        event.stopPropagation();
        applyMenuSearch(input.closest(".filter-menu"));
      };
      input.onkeyup = function(event) {
        event.stopPropagation();
        applyMenuSearch(input.closest(".filter-menu"));
      };
      input.onclick = function(event) {
        event.stopPropagation();
      };
    });
    Array.prototype.forEach.call(dom.content.querySelectorAll(".condition-mode, .condition-value"), function(input) {
      input.onclick = function(event) {
        event.stopPropagation();
      };
      input.oninput = function(event) {
        event.stopPropagation();
      };
    });
    Array.prototype.forEach.call(dom.content.querySelectorAll(".select-all"), function(btn) {
      btn.onclick = function(event) {
        event.stopPropagation();
        var menu = btn.closest(".filter-menu");
        Array.prototype.forEach.call(menu.querySelectorAll(".check-row"), function(row) {
          if (row.style.display !== "none") {
            var check = row.querySelector(".value-check");
            if (check) check.checked = true;
          }
        });
      };
    });
    Array.prototype.forEach.call(dom.content.querySelectorAll(".select-none"), function(btn) {
      btn.onclick = function(event) {
        event.stopPropagation();
        var menu = btn.closest(".filter-menu");
        Array.prototype.forEach.call(menu.querySelectorAll(".check-row"), function(row) {
          if (row.style.display !== "none") {
            var check = row.querySelector(".value-check");
            if (check) check.checked = false;
          }
        });
      };
    });
    Array.prototype.forEach.call(dom.content.querySelectorAll(".apply-filter"), function(btn) {
      btn.onclick = function(event) {
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
        var selected = checks.filter(function(check) {
          return check.checked;
        }).map(function(check) {
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
    Array.prototype.forEach.call(dom.content.querySelectorAll(".cancel-filter"), function(btn) {
      btn.onclick = function(event) {
        event.stopPropagation();
        state.activeFilterColumn = null;
        render();
      };
    });
    var portalMenu = dom.content.querySelector(".filter-menu");
    if (portalMenu && portalMenu.parentNode) {
      document.body.appendChild(portalMenu);
    }
  }

  // src/visualizer/engine/settings.js
  function updateSettingsPanel() {
    dom.showTypeCheck.checked = state.showTypeColumn;
    dom.freezeHeaderCheck.checked = state.freezeHeader;
    dom.showStickyHeaderCheck.checked = state.showStickyHeader;
    dom.parseJsonStringCheck.checked = state.parseJsonString;
    dom.headerModeSelect.value = state.stickyHeaderMode;
    dom.favPathBtn.textContent = state.favoritePaths[state.selectedPath] ? "\\u53D6\\u6D88\\u6536\\u85CF\\u5F53\\u524D\\u8DEF\\u5F84" : "\\u6536\\u85CF\\u5F53\\u524D\\u8DEF\\u5F84";
    renderColumnSettingsPanel();
    renderPathShortcuts();
  }
  function renderColumnSettingsPanel() {
    if (!state.currentAllColumns.length) {
      if (dom.resetColOrderBtn) dom.resetColOrderBtn.hidden = true;
      dom.columnSettings.innerHTML = '<div class="muted" style="padding:6px 8px">\\u5F53\\u524D\\u4E0D\\u662F\\u5BF9\\u8C61\\u6570\\u7EC4\\u8868\\u683C</div>';
      return;
    }
    var hidden = getHiddenColumns(state.tablePath);
    var frozenSet = getFrozenColumns(state.tablePath);
    if (dom.resetColOrderBtn) {
      var savedOrder = state.columnOrderByPath[state.tablePath];
      dom.resetColOrderBtn.hidden = !(savedOrder && savedOrder.length);
    }
    dom.columnSettings.innerHTML = state.currentAllColumns.map(function(col) {
      var checked = hidden[col] ? "" : " checked";
      var fz = frozenSet[col];
      var fzIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 7V5.5a3 3 0 0 1 6 0V7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path class="lock-body" d="M4 7h8a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';
      return '<div class="setting-row"><label class="col-label"><input class="column-check" type="checkbox" data-col="' + esc(col) + '"' + checked + '><span class="col-name">' + esc(col) + '</span></label><button class="freeze-toggle' + (fz ? " active" : "") + '" data-col="' + esc(col) + '" title="\\u51BB\\u7ED3/\\u89E3\\u51BB\\u6B64\\u5217">' + fzIcon + "</button></div>";
    }).join("");
  }
  function renderPathShortcuts() {
    var paths = Object.keys(state.favoritePaths).concat(state.recentPaths).filter(function(path, index, arr) {
      return path && arr.indexOf(path) === index;
    });
    if (!paths.length) {
      dom.pathShortcuts.innerHTML = '<div class="muted" style="padding:6px 8px">\\u6682\\u65E0\\u8DEF\\u5F84</div>';
      return;
    }
    dom.pathShortcuts.innerHTML = paths.map(function(path) {
      var star = state.favoritePaths[path] ? "\\u2605 " : "";
      return '<button class="path-chip path-shortcut" data-path="' + esc(path) + '" title="' + esc(path) + '">' + star + esc(path) + "</button>";
    }).join("");
  }
  function bindSettingsPanelEvents() {
    Array.prototype.forEach.call(dom.settingsMenu.querySelectorAll(".column-check"), function(input) {
      input.onchange = function() {
        setColumnVisible(state.tablePath, input.getAttribute("data-col"), input.checked);
      };
    });
    Array.prototype.forEach.call(dom.settingsMenu.querySelectorAll(".freeze-toggle"), function(btn) {
      btn.onclick = function(event) {
        event.preventDefault();
        event.stopPropagation();
        setColumnFrozen(state.tablePath, btn.getAttribute("data-col"), !isColumnFrozen(state.tablePath, btn.getAttribute("data-col")));
      };
    });
    var resetBtn = dom.settingsMenu.querySelector(".reset-col-order");
    if (resetBtn) {
      resetBtn.onclick = function(event) {
        event.preventDefault();
        event.stopPropagation();
        resetColumnOrder(state.tablePath);
      };
    }
    Array.prototype.forEach.call(dom.settingsMenu.querySelectorAll(".path-shortcut"), function(btn) {
      btn.onclick = function(event) {
        event.preventDefault();
        setRootPath(btn.getAttribute("data-path"));
        dom.settingsMenu.hidden = true;
      };
    });
  }
  function bindCopyEvents() {
    Array.prototype.forEach.call(dom.content.querySelectorAll("td"), function(cell) {
      cell.ondblclick = function(event) {
        event.stopPropagation();
        var value = cell.getAttribute("data-copy");
        copyText(value !== null ? value : cell.innerText || cell.textContent || "");
      };
      cell.title = cell.title || "\\u53CC\\u51FB\\u590D\\u5236\\u5355\\u5143\\u683C\\u503C";
    });
  }

  // src/visualizer/engine/sticky-header.js
  function isIndexContextPath(path) {
    return /[d+]$/.test(path || "");
  }
  function getContextName(path) {
    if (!path || path === "$") return "$";
    var base = String(path).replace(/([d+])+$/g, "");
    var keyMatch = base.match(/.([^.[]+)$/);
    if (keyMatch) return keyMatch[1];
    var indexMatch = String(path).match(/([d+])$/);
    return indexMatch ? indexMatch[1] : path;
  }
  function hideStickyTableHead() {
    state.stickyTableHeadKey = "";
    dom.stickyTableHead.classList.remove("active");
    dom.stickyTableHead.classList.remove("multi");
    dom.stickyTableHeadInner.innerHTML = "";
    dom.stickyTableHeadInner.style.marginLeft = "0px";
    dom.stickyTableHeadInner.style.width = "auto";
    dom.stickyTableHead.style.left = "0px";
    dom.stickyTableHead.style.top = "0px";
    dom.stickyTableHead.style.width = "0px";
    dom.stickyTableHead.style.height = "0px";
    dom.stickyTableHeadInner.style.height = "auto";
  }
  function hideStickyContextBar() {
    state.stickyContextPathValue = "";
    dom.stickyContextBar.classList.remove("active");
    dom.stickyContextPath.textContent = "";
    dom.stickyContextSummary.textContent = "";
    hideStickyTableHead();
  }
  function getActiveContextDetails() {
    var contentRect = dom.content.getBoundingClientRect();
    var top = getRootHeaderMetrics(contentRect).bottom + 2;
    var candidates = [];
    Array.prototype.forEach.call(dom.content.querySelectorAll("details[data-path][open]"), function(item) {
      var body = item.querySelector(":scope > .detail-body");
      if (!body) return;
      var itemRect = item.getBoundingClientRect();
      if (itemRect.top <= top && itemRect.bottom > top + 8) {
        candidates.push(item);
      }
    });
    if (!candidates.length) return [];
    var namedCandidates = candidates.filter(function(item) {
      return !isIndexContextPath(item.getAttribute("data-path"));
    });
    var pool = namedCandidates.length ? namedCandidates : candidates;
    pool.sort(function(a, b) {
      return Number(a.getAttribute("data-depth") || 0) - Number(b.getAttribute("data-depth") || 0);
    });
    return pool;
  }
  function findActiveContextDetail() {
    var items = getActiveContextDetails();
    return items.length ? items[items.length - 1] : null;
  }
  function getContextTable(item) {
    var body = item && item.querySelector(":scope > .detail-body");
    if (!body) return null;
    return body.querySelector("table.grid");
  }
  function cloneTableHead(table, tableRect, contentRect) {
    var head = table && table.tHead;
    if (!head || !head.rows.length) return "";
    var widths = Array.prototype.map.call(head.rows[0].cells, function(cell) {
      return Math.max(48, Math.round(cell.getBoundingClientRect().width));
    });
    var totalWidth = Math.max(Math.round(tableRect.width), widths.reduce(function(sum, width) {
      return sum + width;
    }, 0));
    var html = '<table style="width:' + totalWidth + 'px"><colgroup>';
    widths.forEach(function(width) {
      html += '<col style="width:' + width + 'px">';
    });
    html += "</colgroup><thead>" + head.innerHTML + "</thead></table>";
    return html;
  }
  function pinFrozenClones(container) {
    var ths = container.querySelectorAll("thead th.frozen-col");
    if (!ths.length) return;
    var cols = container.querySelectorAll("colgroup col");
    Array.prototype.forEach.call(ths, function(th) {
      var left = th.style.left || "0px";
      var col = cols[th.cellIndex];
      var width = col ? parseFloat(col.style.width) : 0;
      if (!width) width = th.getBoundingClientRect().width;
      th.style.position = "absolute";
      th.style.top = "0px";
      th.style.left = left;
      th.style.width = Math.round(width) + "px";
      th.style.height = "100%";
      th.style.zIndex = 8;
      th.style.boxSizing = "border-box";
    });
  }
  function getRootHeaderMetrics(contentRect) {
    var rootHead = dom.content.querySelector("table.root-grid > thead");
    if (!rootHead) return { bottom: contentRect.top, height: 36 };
    var rect = rootHead.getBoundingClientRect();
    var height = Math.max(28, Math.round(rect.height || 36));
    if (rect.bottom <= contentRect.top || rect.top > contentRect.top + 4) {
      return { bottom: contentRect.top, height };
    }
    return { bottom: rect.bottom, height };
  }
  function tableHeaderSignature(table) {
    var row = table && table.tHead && table.tHead.rows[0];
    if (!row) return "";
    return Array.prototype.map.call(row.cells, function(cell) {
      return cell.getAttribute("data-col-key") || cell.textContent.trim();
    }).join("|");
  }
  function getStickyHeadMetrics(item, contentRect, minTop) {
    var table = getContextTable(item);
    var tableRect = table ? table.getBoundingClientRect() : null;
    var head = table && table.tHead;
    var headRect = head ? head.getBoundingClientRect() : null;
    var headHeight = headRect ? Math.max(28, Math.round(headRect.height || 36)) : 36;
    if (!tableRect || !headRect || headRect.top > minTop || tableRect.bottom <= minTop + headHeight) return null;
    var left = Math.max(contentRect.left, tableRect.left);
    var width = Math.min(tableRect.right, contentRect.right) - left;
    if (width <= 0) return null;
    return { table, tableRect, height: headHeight, left, width };
  }
  function renderStickyHeadLayer(metric, top, contentRect) {
    var left = Math.round(contentRect.left);
    var width = Math.round(contentRect.width);
    var height = Math.round(metric.height);
    var marginLeft = Math.round(metric.tableRect.left - contentRect.left);
    var tableWidth = Math.round(metric.tableRect.width);
    return '<div class="sticky-head-layer" style="left:' + left + "px;top:" + Math.round(top) + "px;width:" + width + "px;height:" + height + 'px"><div class="sticky-head-layer-inner" style="margin-left:' + marginLeft + "px;width:" + tableWidth + "px;height:" + height + 'px">' + cloneTableHead(metric.table, metric.tableRect) + "</div></div>";
  }
  function updateSingleStickyTableHead(item) {
    var contentRect = dom.content.getBoundingClientRect();
    var rootHeader = getRootHeaderMetrics(contentRect);
    var items = getActiveContextDetails();
    var chosen = null;
    for (var i = items.length - 1; i >= 0; i--) {
      var m = getStickyHeadMetrics(items[i], contentRect, rootHeader.bottom);
      if (m) {
        chosen = { item: items[i], metric: m };
        break;
      }
    }
    if (!chosen) {
      hideStickyTableHead();
      return;
    }
    item = chosen.item;
    var metric = chosen.metric;
    var key = (item.getAttribute("data-path") || "") + "::" + Math.round(metric.tableRect.left) + "::" + Math.round(metric.tableRect.width) + "::" + dom.content.scrollLeft + "::single";
    var keyChanged = state.stickyTableHeadKey !== key;
    if (keyChanged) {
      dom.stickyTableHeadInner.innerHTML = cloneTableHead(metric.table, metric.tableRect);
      state.stickyTableHeadKey = key;
    }
    dom.stickyTableHead.classList.remove("multi");
    dom.stickyTableHead.style.left = Math.round(contentRect.left) + "px";
    dom.stickyTableHead.style.top = Math.round(rootHeader.bottom) + "px";
    dom.stickyTableHead.style.width = Math.round(contentRect.width) + "px";
    dom.stickyTableHead.style.height = Math.round(metric.height) + "px";
    dom.stickyTableHeadInner.style.height = Math.round(metric.height) + "px";
    dom.stickyTableHeadInner.style.marginLeft = Math.round(metric.tableRect.left - contentRect.left) + "px";
    dom.stickyTableHeadInner.style.width = Math.round(metric.tableRect.width) + "px";
    if (keyChanged) {
      pinFrozenClones(dom.stickyTableHeadInner);
    }
    dom.stickyTableHead.classList.add("active");
  }
  function updateMultiStickyTableHead() {
    var contentRect = dom.content.getBoundingClientRect();
    var rootHeader = getRootHeaderMetrics(contentRect);
    var items = getActiveContextDetails();
    var seen = {};
    var layers = [];
    var top = rootHeader.bottom;
    items.forEach(function(item) {
      var metric = getStickyHeadMetrics(item, contentRect, rootHeader.bottom);
      var signature = metric ? tableHeaderSignature(metric.table) : "";
      if (!metric || !signature || seen[signature]) return;
      seen[signature] = true;
      if (top + metric.height > contentRect.bottom) return;
      layers.push(renderStickyHeadLayer(metric, top, contentRect));
      top += metric.height + 6;
    });
    if (!layers.length) {
      hideStickyTableHead();
      return;
    }
    var key = layers.join("") + "::multi";
    if (state.stickyTableHeadKey !== key) {
      dom.stickyTableHeadInner.innerHTML = layers.join("");
      Array.prototype.forEach.call(dom.stickyTableHeadInner.querySelectorAll(".sticky-head-layer-inner"), function(inner) {
        pinFrozenClones(inner);
      });
      state.stickyTableHeadKey = key;
    }
    dom.stickyTableHead.classList.add("multi");
    dom.stickyTableHead.style.left = "0px";
    dom.stickyTableHead.style.top = "0px";
    dom.stickyTableHead.style.width = "100vw";
    dom.stickyTableHead.style.height = "100vh";
    dom.stickyTableHeadInner.style.marginLeft = "0px";
    dom.stickyTableHeadInner.style.width = "100vw";
    dom.stickyTableHeadInner.style.height = "100vh";
    dom.stickyTableHead.classList.add("active");
  }
  function updateStickyTableHead(item) {
    if (state.stickyHeaderMode === "multi") {
      updateMultiStickyTableHead();
      return;
    }
    updateSingleStickyTableHead(item);
  }
  function updateStickyOffsets() {
    var rootHead = dom.content.querySelector("table.root-grid > thead");
    var height = rootHead ? Math.max(28, Math.round(rootHead.getBoundingClientRect().height || 36)) : 36;
    dom.content.style.setProperty("--root-head-height", height + "px");
  }
  function updateStickyContextBar() {
    state.stickyContextTicking = false;
    if (!state.showTable) {
      hideStickyContextBar();
      return;
    }
    if (!state.showStickyHeader) {
      hideStickyContextBar();
      return;
    }
    var item = findActiveContextDetail();
    if (!item) {
      hideStickyContextBar();
      return;
    }
    var path = item.getAttribute("data-path") || "";
    var summary = item.getAttribute("data-context-summary") || "";
    state.stickyContextPathValue = path;
    dom.stickyContextPath.textContent = getContextName(path);
    dom.stickyContextPath.title = path;
    dom.stickyContextSummary.textContent = summary ? "\\xB7 " + summary : "";
    dom.stickyContextBar.title = path;
    dom.stickyContextBar.classList.add("active");
    updateStickyTableHead(item);
  }
  function requestStickyContextUpdate() {
    if (state.stickyContextTicking) return;
    state.stickyContextTicking = true;
    requestAnimationFrame(updateStickyContextBar);
  }
  function bindStickyContextEvents() {
    dom.content.onscroll = requestStickyContextUpdate;
    dom.stickyContextJump.onclick = function() {
      if (!state.stickyContextPathValue) return;
      var target = null;
      Array.prototype.some.call(dom.content.querySelectorAll("details[data-path]"), function(item) {
        if (item.getAttribute("data-path") === state.stickyContextPathValue) {
          target = item;
          return true;
        }
        return false;
      });
      if (!target) return;
      var summary = target.querySelector(":scope > summary");
      (summary || target).scrollIntoView({ block: "start" });
    };
  }

  // src/visualizer/engine/render.js
  function colWidthStyle(tableId, colKey) {
    var width = state.columnWidths[tableId + "::" + colKey];
    return width ? ' style="width:' + width + "px;min-width:" + width + 'px"' : "";
  }
  function resizeHandleHtml() {
    return '<span class="col-resizer" title="\\u62D6\\u62FD\\u8C03\\u6574\\u5217\\u5BBD"></span>';
  }
  function simpleHeader(label, className, tableId, colKey) {
    return '<th class="' + className + '" data-col-key="' + esc(colKey) + '"' + colWidthStyle(tableId, colKey) + '><div class="th-wrap"><span class="th-left"><span class="th-title-static">' + esc(label) + "</span></span></div>" + resizeHandleHtml() + "</th>";
  }
  function renderValueHeader(hasTreeActions, tableId) {
    var html = '<th class="value-col" data-col-key="Value"' + colWidthStyle(tableId, "Value") + ">";
    html += '<div class="value-th-wrap"><span>Value</span>';
    if (hasTreeActions) {
      html += '<button class="tree-menu-btn" title="\\u5C55\\u5F00/\\u6298\\u53E0\\u5C42\\u7EA7" aria-expanded="false">\\u2922</button>';
    }
    html += "</div>" + resizeHandleHtml() + "</th>";
    return html;
  }
  function filterIconSvg() {
    return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.2 3h11.6L9.4 8.2v4.1l-2.8 1.5V8.2L2.2 3z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';
  }
  function freezeIconSvg() {
    return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 7V5.5a3 3 0 0 1 6 0V7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M4 7h8a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  }
  function sortMark(col) {
    if (state.sortState.col !== col) return "";
    return '<span class="sort-mark">' + (state.sortState.dir === "asc" ? "\\u2191" : "\\u2193") + "</span>";
  }
  function renderHeader(col, rows, tableId) {
    var filter = getColumnFilter(tableId, col);
    var active = hasColumnFilter(filter);
    var hasTreeActions = rows.some(function(row) {
      return hasExpandableValue(row ? row[col] : void 0);
    });
    var html = "";
    var fz = !!getFrozenColumns(tableId)[col];
    html += '<th data-col-key="' + esc(col) + '"' + colWidthStyle(tableId, col) + ' class="col-reorderable' + (fz ? " frozen-col" : "") + '">';
    html += '<div class="th-wrap">';
    html += '<span class="th-left">';
    html += '<button class="th-title" data-col="' + esc(col) + '" title="\\u70B9\\u51FB\\u6392\\u5E8F">' + esc(col) + "</button>";
    html += sortMark(col);
    html += '<button class="filter-btn' + (active ? " active" : "") + '" data-col="' + esc(col) + '" data-filter-key="' + esc(filterMenuKey(tableId, col)) + '" title="\\u8FC7\\u6EE4">' + filterIconSvg() + "</button>";
    if (hasTreeActions) {
      html += '<button class="tree-menu-btn" title="\\u5C55\\u5F00/\\u6298\\u53E0\\u672C\\u5217\\u5C42\\u7EA7" aria-expanded="false">\\u2922</button>';
    }
    html += '<button class="col-freeze-btn' + (fz ? " active" : "") + '" data-table-id="' + esc(tableId) + '" data-col="' + esc(col) + '" title="\\u51BB\\u7ED3/\\u89E3\\u51BB\\u6B64\\u5217">' + freezeIconSvg() + "</button>";
    html += "</span>";
    html += renderFilterMenu(col, rows, tableId);
    html += "</div>";
    html += resizeHandleHtml();
    html += "</th>";
    return html;
  }
  function getDisplayNodeAtPath(path) {
    if (Object.prototype.hasOwnProperty.call(state.renderedNodesByPath, path)) return state.renderedNodesByPath[path];
    var node = getNodeAtPath(path);
    return tryParseJsonStringValue(node) || node;
  }
  function renderNodeActions(path) {
    return '<span class="node-actions"><button class="node-action" data-node-action="copy-json" data-path="' + esc(path) + '" title="\\u590D\\u5236\\u5F53\\u524D JSON">JSON</button></span>';
  }
  function bindNodeActionEvents() {
    Array.prototype.forEach.call(dom.content.querySelectorAll(".node-action"), function(btn) {
      btn.onclick = function(event) {
        event.preventDefault();
        event.stopPropagation();
        var path = btn.getAttribute("data-path");
        copyText(JSON.stringify(getDisplayNodeAtPath(path), null, 2));
      };
    });
  }
  function renderValue(v, path) {
    if (v === void 0) return '<span class="muted"></span>';
    if (v === null) return '<span class="muted">' + highlightText("null") + "</span>";
    if (typeof v === "string") {
      var parsedStringJson = tryParseJsonStringValue(v);
      if (!parsedStringJson) return highlightText(v);
      return renderExpandableValue(parsedStringJson, path, "", true);
    }
    if (typeof v === "number") return '<span class="number-value">' + highlightText(v) + "</span>";
    if (typeof v === "boolean") return highlightText(v);
    return renderExpandableValue(v, path, "", false);
  }
  function renderExpandableValue(v, path, prefix, parsedString) {
    var pathKey = path || "$";
    var depth = getPathDepth(pathKey);
    var summary = (prefix || "") + summarize(v);
    var badge = parsedString ? '<span class="json-string-badge">parsed</span>' : "";
    var expanded = !!state.expandedDetailPaths[pathKey];
    var body = expanded ? '<div class="detail-body">' + renderNode(v, pathKey) + "</div>" : "";
    return '<details data-path="' + esc(pathKey) + '" data-depth="' + depth + '" data-context-summary="' + esc(summary) + '"' + (expanded ? " open" : "") + '><summary><span class="summary-main">' + badge + esc(summary) + "</span>" + renderNodeActions(pathKey) + "</summary>" + body + "</details>";
  }
  function renderKeyCell(key, childPath) {
    if (!Object.prototype.hasOwnProperty.call(state.nodesByPath, childPath)) {
      return highlightText(key);
    }
    return '<button class="key-jump" data-path="' + esc(childPath) + '" title="\\u5207\\u6362\\u6839\\u8DEF\\u5F84\\u5230 ' + esc(childPath) + '">\\u21AA ' + highlightText(key) + "</button>";
  }
  function renderObject(obj, path) {
    var keys = Object.keys(obj);
    if (!keys.length) return '<div class="empty">{}</div>';
    var tableId = path || "$";
    var hasTreeActions = keys.some(function(key) {
      return hasExpandableValue(obj[key]);
    });
    var html = '<table class="' + gridClass(tableId) + '" data-table-id="' + esc(tableId) + '"><thead><tr>' + simpleHeader("Key", "key-col", tableId, "Key") + (state.showTypeColumn ? simpleHeader("Type", "type-col", tableId, "Type") : "") + renderValueHeader(hasTreeActions, tableId) + "</tr></thead><tbody>";
    keys.forEach(function(key) {
      var value = obj[key];
      var childPath = (path || "$") + "." + key;
      html += '<tr data-row-path="' + esc(childPath) + '">';
      html += '<td class="key-col" data-copy="' + esc(key) + '">' + renderKeyCell(key, childPath) + "</td>";
      if (state.showTypeColumn) {
        var typeName = typeOf(value);
        html += '<td class="type type-col' + (typeName === "number" ? " type-number" : "") + '" data-copy="' + esc(typeName) + '">' + esc(typeName) + "</td>";
      }
      html += '<td class="value-col" data-copy="' + esc(valueText(value)) + '">' + renderValue(value, childPath) + "</td>";
      html += "</tr>";
    });
    html += "</tbody></table>";
    return html;
  }
  function renderRecordArray(arr, path) {
    var pathKey = path || state.tablePath;
    var isRootTable = pathKey === state.tablePath;
    var allCols = collectColumns(arr);
    var cols = getVisibleColumns(allCols, pathKey);
    var frozenSet = getFrozenColumns(pathKey);
    if (frozenSet) {
      var pruned = false;
      Object.keys(frozenSet).forEach(function(k) {
        if (allCols.indexOf(k) < 0) {
          delete frozenSet[k];
          pruned = true;
        }
      });
      if (pruned) savePersistedState();
    }
    var savedOrder = state.columnOrderByPath[pathKey];
    if (savedOrder && savedOrder.length) {
      var prunedOrder = savedOrder.filter(function(c) {
        return allCols.indexOf(c) >= 0;
      });
      if (prunedOrder.length !== savedOrder.length) {
        state.columnOrderByPath[pathKey] = prunedOrder;
        savePersistedState();
      }
    }
    var exportColumns = cols;
    cols = getOrderedColumns(cols, pathKey);
    if (isRootTable && state.pendingFreezeFirstCol && allCols.length) {
      frozenSet = ensureFrozenColumns(pathKey);
      frozenSet[allCols[0]] = true;
      state.pendingFreezeFirstCol = false;
      savePersistedState();
      showToast("\\u5DF2\\u8FC1\\u79FB\\u65E7\\u7248\\u300E\\u51BB\\u7ED3\\u8868\\u5934\\u300F\\u4E3A\\u9996\\u5217\\u51BB\\u7ED3");
    }
    var renderCols = frozenSet ? cols.filter(function(c) {
      return frozenSet[c];
    }).concat(cols.filter(function(c) {
      return !frozenSet[c];
    })) : cols;
    var filtered = getFilteredRows(arr, allCols, pathKey);
    var sortedRows = getSortedRows(filtered);
    var visibleRows = sortedRows.slice(0, MAX_RENDER_ROWS);
    var activeCount = getActiveFilterCount();
    if (isRootTable) {
      state.currentAllColumns = allCols;
      state.currentColumns = exportColumns;
      state.currentRows = sortedRows;
      setMeta(filtered.length + " / " + arr.length + " \\u884C \\xB7 " + cols.length + " / " + allCols.length + " \\u5217 \\xB7 " + renderMetaPath(pathKey) + (activeCount ? " \\xB7 " + activeCount + " \\u4E2A\\u8FC7\\u6EE4\\u6761\\u4EF6" : ""));
    }
    if (!arr.length) return '<div class="empty">[]</div>';
    var html = "";
    if (isRootTable && sortedRows.length > MAX_RENDER_ROWS) {
      html += '<div class="perf-note">\\u6570\\u636E\\u91CF\\u8F83\\u5927\\uFF0C\\u4EC5\\u6E32\\u67D3\\u524D ' + MAX_RENDER_ROWS + " \\u884C\\uFF1B\\u5BFC\\u51FA\\u4ECD\\u5305\\u542B\\u5168\\u90E8\\u7B5B\\u9009\\u7ED3\\u679C\\u3002</div>";
    }
    html += '<table class="' + gridClass(pathKey) + '" data-table-id="' + esc(pathKey) + '"><thead><tr>';
    renderCols.forEach(function(col) {
      html += renderHeader(col, arr, pathKey);
    });
    html += "</tr></thead><tbody>";
    visibleRows.forEach(function(row) {
      var rowIndex = arr.indexOf(row);
      var rowPath = pathKey + "[" + rowIndex + "]";
      html += '<tr data-row-index="' + rowIndex + '" data-row-path="' + esc(rowPath) + '">';
      renderCols.forEach(function(col) {
        var fz = frozenSet && !!frozenSet[col];
        html += '<td data-copy="' + esc(valueText(row ? row[col] : void 0)) + '"' + (fz ? ' class="frozen-col"' : "") + ">" + renderValue(row ? row[col] : void 0, rowPath + "." + col) + "</td>";
      });
      html += "</tr>";
    });
    html += "</tbody></table>";
    if (!filtered.length) {
      html += '<div class="empty">\\u6CA1\\u6709\\u5339\\u914D\\u7ED3\\u679C</div>';
    }
    return html;
  }
  function renderArray(arr, path) {
    if (isRecordArray(arr)) {
      state.tableRows = arr;
      return renderRecordArray(arr, path || "$");
    }
    setMeta(arr.length + " \\u9879 \\xB7 " + renderMetaPath(state.tablePath));
    if (!arr.length) return '<div class="empty">[]</div>';
    var hasTreeActions = arr.some(function(value) {
      return hasExpandableValue(value);
    });
    var tableId = path || "$";
    var html = '<table class="' + gridClass(tableId) + '" data-table-id="' + esc(tableId) + '"><thead><tr>' + simpleHeader("#", "index-col", tableId, "#") + (state.showTypeColumn ? simpleHeader("Type", "type-col", tableId, "Type") : "") + renderValueHeader(hasTreeActions, tableId) + "</tr></thead><tbody>";
    arr.forEach(function(value, index) {
      html += '<tr data-row-path="' + esc((path || "$") + "[" + index + "]") + '">';
      html += '<td class="index-col" data-copy="' + index + '">' + index + "</td>";
      if (state.showTypeColumn) {
        var typeName = typeOf(value);
        html += '<td class="type type-col' + (typeName === "number" ? " type-number" : "") + '" data-copy="' + esc(typeName) + '">' + esc(typeName) + "</td>";
      }
      html += '<td class="value-col" data-copy="' + esc(valueText(value)) + '">' + renderValue(value, (path || "$") + "[" + index + "]") + "</td>";
      html += "</tr>";
    });
    html += "</tbody></table>";
    return html;
  }
  function renderNode(v, path) {
    state.renderedNodesByPath[path || "$"] = v;
    if (Array.isArray(v)) return renderArray(v, path || "$");
    if (isObj(v)) {
      return renderObject(v, path || "$");
    }
    return '<div class="empty">' + esc(String(v)) + "</div>";
  }
  function renderPerformanceNotes() {
    var notes = [];
    if (state.raw.length > LARGE_JSON_CHARS) notes.push("\\u54CD\\u5E94\\u8F83\\u5927\\uFF0C\\u590D\\u6742\\u641C\\u7D22/\\u5C55\\u5F00\\u5168\\u90E8\\u53EF\\u80FD\\u8F83\\u6162");
    if (dom.globalSearch.value.trim() && state.raw.length > LARGE_SEARCH_CHARS) notes.push("\\u6B63\\u5728\\u5927\\u54CD\\u5E94\\u4E0A\\u6267\\u884C\\u5168\\u5C40\\u641C\\u7D22\\uFF0C\\u5EFA\\u8BAE\\u7F29\\u5C0F\\u5173\\u952E\\u5B57");
    var failures = Object.keys(state.parseFailureSamples);
    if (state.parseJsonString && failures.length) {
      notes.push("\\u53D1\\u73B0 " + failures.length + " \\u7C7B\\u7591\\u4F3C JSON \\u5B57\\u7B26\\u4E32\\u89E3\\u6790\\u5931\\u8D25\\uFF1B\\u53EF\\u5728\\u8BBE\\u7F6E\\u4E2D\\u5173\\u95ED\\u81EA\\u52A8\\u89E3\\u6790");
    }
    if (!notes.length) return "";
    return '<div class="perf-note">' + notes.map(esc).join("\\uFF1B") + "</div>";
  }
  function render(options) {
    closeTreeMenu();
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
      bindColumnReorderEvents();
      applyFrozenLayout();
      bindCopyEvents();
      bindStickyContextEvents();
      updateStickyOffsets();
      updateStickyContextBar();
      updateSettingsPanel();
      renderFilterChips();
      bindSettingsPanelEvents();
      if (!state.tableRows) {
        setMeta("\\u6811\\u5F62\\u8868\\u683C \\xB7 " + renderMetaPath(state.tablePath));
      }
    } else {
      dom.meta.textContent = "\\u539F\\u59CB JSON";
      dom.filterChips.classList.remove("active");
      dom.filterChips.innerHTML = "";
      dom.content.classList.remove("freeze-header");
      hideStickyContextBar();
      dom.content.innerHTML = "<pre></pre>";
      dom.content.querySelector("pre").textContent = JSON.stringify(state.json, null, 2);
    }
    dom.toggle.textContent = state.showTable ? "\\u539F\\u59CB" : "\\u8868\\u683C";
    dom.showTypeCheck.checked = state.showTypeColumn;
  }

  // src/visualizer/engine/paths.js
  function isRecordArray(v) {
    return Array.isArray(v) && v.length > 0 && v.every(function(item) {
      return isObj(item);
    });
  }
  function buildPathOptions(v, path) {
    state.nodesByPath[path] = v;
    if (Array.isArray(v)) {
      return;
    }
    if (isObj(v)) {
      Object.keys(v).forEach(function(key) {
        var child = v[key];
        if (child && typeof child === "object") {
          buildPathOptions(child, path + "." + key);
        }
      });
    }
  }
  function refreshPathSelect() {
    var paths = Object.keys(state.nodesByPath);
    var html = "";
    paths.forEach(function(path) {
      var node = state.nodesByPath[path];
      var selected = path === state.selectedPath ? " selected" : "";
      html += '<option value="' + esc(path) + '" title="' + esc(summarize(node)) + '"' + selected + ">" + esc(path) + "</option>";
    });
    dom.pathSelect.innerHTML = html;
  }
  function setRootPath(path) {
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
  function getPathCrumbs(path) {
    var crumbs = [{ label: "$", path: "$" }];
    if (!path || path === "$") return crumbs;
    var current = "$";
    path.slice(2).split(".").forEach(function(part) {
      current += "." + part;
      crumbs.push({ label: part, path: current });
    });
    return crumbs;
  }
  function renderMetaPath(path) {
    return '<span class="meta-path">' + getPathCrumbs(path).map(function(crumb, index) {
      var sep = index === 0 ? "" : '<span class="meta-path-sep">.</span>';
      var disabled = Object.prototype.hasOwnProperty.call(state.nodesByPath, crumb.path) ? "" : " disabled";
      return sep + '<button class="meta-path-btn" data-path="' + esc(crumb.path) + '"' + disabled + ">" + esc(crumb.label) + "</button>";
    }).join("") + "</span>";
  }
  function parentPath(path) {
    if (!path || path === "$" || path.indexOf(".") < 0) return "$";
    return path.slice(0, path.lastIndexOf("."));
  }
  function addRecentPath(path) {
    state.recentPaths = [path].concat(state.recentPaths.filter(function(item) {
      return item !== path;
    })).slice(0, 6);
    savePersistedState();
  }
  function toggleFavoritePath(path) {
    if (state.favoritePaths[path]) {
      delete state.favoritePaths[path];
    } else {
      state.favoritePaths[path] = true;
    }
    savePersistedState();
    updateSettingsPanel();
  }

  // src/visualizer/engine/utils.js
  function esc(v) {
    return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function isPlainObject(v) {
    return v && typeof v === "object" && !Array.isArray(v);
  }
  function isObj(v) {
    return v && typeof v === "object" && !Array.isArray(v);
  }
  function safeStorageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }
  function safeStorageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
    }
  }
  function setMeta(html) {
    dom.meta.innerHTML = html;
    Array.prototype.forEach.call(dom.meta.querySelectorAll(".meta-path-btn"), function(btn) {
      btn.onclick = function(event) {
        event.stopPropagation();
        setRootPath(btn.getAttribute("data-path"));
      };
    });
  }
  function highlightText(text) {
    var rawText = String(text);
    var q = dom.globalSearch.value.trim();
    if (!q) return esc(rawText);
    var lower = rawText.toLowerCase();
    var needle = q.toLowerCase();
    var html = "";
    var from = 0;
    var index = lower.indexOf(needle);
    while (index >= 0) {
      html += esc(rawText.slice(from, index));
      html += '<span class="search-hit">' + esc(rawText.slice(index, index + q.length)) + "</span>";
      from = index + q.length;
      index = lower.indexOf(needle, from);
    }
    return html + esc(rawText.slice(from));
  }
  function typeOf(v) {
    if (Array.isArray(v)) return "array";
    if (v === null) return "null";
    return typeof v;
  }
  function valueText(v) {
    if (v === void 0) return "";
    if (v === null) return "null";
    if (typeof v === "string") return v;
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    return JSON.stringify(v);
  }
  function summarize(v) {
    if (v === void 0) return "";
    if (v === null) return "null";
    if (Array.isArray(v)) return "[" + v.length + " items]";
    if (isObj(v)) return "{" + Object.keys(v).length + " keys}";
    return String(v);
  }
  function tryParseJsonStringValue(v) {
    if (!state.parseJsonString || typeof v !== "string") return null;
    var text = v.trim();
    if (!text || text[0] !== "{" && text[0] !== "[") return null;
    try {
      var parsed = JSON.parse(text);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (e) {
      state.parseFailureSamples[text.slice(0, 120)] = true;
      return null;
    }
  }
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showToast("\\u5DF2\\u590D\\u5236");
      }).catch(function() {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch (e) {
    }
    document.body.removeChild(ta);
    showToast("\\u5DF2\\u590D\\u5236");
  }
  function showToast(text) {
    var old = document.querySelector(".toast");
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var div = document.createElement("div");
    div.className = "toast";
    div.textContent = text;
    document.body.appendChild(div);
    setTimeout(function() {
      if (div.parentNode) div.parentNode.removeChild(div);
    }, 1200);
  }
  function downloadFile(name, text, type) {
    var blob = new Blob([text], { type: type || "text/plain" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() {
      URL.revokeObjectURL(a.href);
    }, 1e3);
  }
  function csvEscape(value) {
    var text = valueText(value);
    return '"' + text.replace(/"/g, '""') + '"';
  }
  function rowsToCsv(rows, cols) {
    var lines = [cols.map(csvEscape).join(",")];
    rows.forEach(function(row) {
      lines.push(cols.map(function(col) {
        return csvEscape(row ? row[col] : void 0);
      }).join(","));
    });
    return lines.join("\\n");
  }
  function getExportRows() {
    if (state.currentRows && state.currentRows.length) return state.currentRows;
    var node = state.nodesByPath[state.selectedPath];
    return Array.isArray(node) ? node : [node];
  }

  // src/visualizer/engine/state.js
  var MAX_RENDER_ROWS = 2e3;
  var STORAGE_KEY = "apifox-json-table-state-v2";
  var LARGE_JSON_CHARS = 5e5;
  var LARGE_SEARCH_CHARS = 25e4;
  var dom = {};
  function initDomRefs() {
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
    dom.resetColOrderBtn = document.getElementById("resetColOrderBtn");
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
  var state = {
    raw: "",
    showTable: true,
    showTypeColumn: false,
    json: void 0,
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
    columnOrderByPath: {},
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
    frozenLayoutTicking: false
  };
  function loadPersistedState() {
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
      state.columnOrderByPath = isPlainObject(persisted.columnOrderByPath) ? persisted.columnOrderByPath : {};
      state.favoritePaths = isPlainObject(persisted.favoritePaths) ? persisted.favoritePaths : {};
      state.recentPaths = Array.isArray(persisted.recentPaths) && persisted.recentPaths.length ? persisted.recentPaths.slice(0, 6) : state.recentPaths;
      if (state.freezeHeader && !hadFrozenColumns) state.pendingFreezeFirstCol = true;
    } catch (e) {
    }
  }
  function savePersistedState() {
    safeStorageSet(STORAGE_KEY, JSON.stringify({
      showTypeColumn: state.showTypeColumn,
      freezeHeader: state.freezeHeader,
      showStickyHeader: state.showStickyHeader,
      parseJsonString: state.parseJsonString,
      stickyHeaderMode: state.stickyHeaderMode,
      columnWidths: state.columnWidths,
      hiddenColumnsByPath: state.hiddenColumnsByPath,
      frozenColumnsByPath: state.frozenColumnsByPath,
      columnOrderByPath: state.columnOrderByPath,
      favoritePaths: state.favoritePaths,
      recentPaths: state.recentPaths
    }));
  }

  // src/visualizer/engine/main.js
  pm.getData(function(err, data) {
    state.raw = data.raw || "";
    initDomRefs();
    try {
      state.json = JSON.parse(state.raw);
    } catch (e) {
      dom.meta.textContent = "\\u975E JSON \\u54CD\\u5E94";
      dom.content.innerHTML = "<pre></pre>";
      dom.content.querySelector("pre").textContent = state.raw;
      return;
    }
    loadPersistedState();
    buildPathOptions(state.json, "$");
    refreshPathSelect();
    window.addEventListener("resize", scheduleFrozenLayout);
    if (typeof ResizeObserver !== "undefined" && dom.content) {
      var frozenRO = new ResizeObserver(scheduleFrozenLayout);
      frozenRO.observe(dom.content);
    }
    document.addEventListener("visibilitychange", function() {
      if (!document.hidden) scheduleFrozenLayout();
    });
    dom.pathSelect.onchange = function() {
      setRootPath(dom.pathSelect.value);
    };
    dom.globalSearch.oninput = function() {
      closeTreeMenu();
      render();
    };
    dom.resetFilters.onclick = function() {
      state.columnFilters = {};
      state.activeFilterColumn = null;
      closeTreeMenu();
      dom.globalSearch.value = "";
      render();
    };
    dom.pathUp.onclick = function() {
      setRootPath(parentPath(state.selectedPath));
    };
    dom.copyPathBtn.onclick = function() {
      copyText(state.tablePath);
    };
    dom.copyJsonBtn.onclick = function() {
      copyText(JSON.stringify(getExportRows(), null, 2));
    };
    dom.exportJsonBtn.onclick = function() {
      downloadFile("json-table-export.json", JSON.stringify(getExportRows(), null, 2), "application/json");
    };
    dom.exportCsvBtn.onclick = function() {
      var fz = getFrozenColumns(state.tablePath);
      var fzCount = fz ? Object.keys(fz).filter(function(k) {
        return fz[k];
      }).length : 0;
      if (fzCount) {
        showToast("\\u5BFC\\u51FA\\u5217\\u987A\\u5E8F\\u4E3A\\u6570\\u636E\\u539F\\u59CB\\u987A\\u5E8F\\uFF08\\u51BB\\u7ED3\\u5217\\u5728\\u8868\\u683C\\u4E2D\\u524D\\u7F6E\\u663E\\u793A\\uFF0C\\u4E0D\\u5F71\\u54CD\\u5BFC\\u51FA\\u5185\\u5BB9\\uFF09");
      }
      downloadFile("json-table-export.csv", rowsToCsv(getExportRows(), state.currentColumns.length ? state.currentColumns : state.currentAllColumns), "text/csv;charset=utf-8");
    };
    dom.favPathBtn.onclick = function() {
      toggleFavoritePath(state.selectedPath);
    };
    dom.settingsBtn.onclick = function(event) {
      event.stopPropagation();
      state.activeFilterColumn = null;
      Array.prototype.forEach.call(document.body.querySelectorAll(".filter-menu"), function(menu) {
        if (menu.parentNode) menu.parentNode.removeChild(menu);
      });
      closeTreeMenu();
      dom.settingsMenu.hidden = !dom.settingsMenu.hidden;
      dom.settingsBtn.classList.toggle("active", !dom.settingsMenu.hidden);
      dom.settingsBtn.setAttribute("aria-expanded", String(!dom.settingsMenu.hidden));
    };
    dom.showTypeCheck.onchange = function() {
      state.showTypeColumn = dom.showTypeCheck.checked;
      savePersistedState();
      state.activeFilterColumn = null;
      closeTreeMenu();
      render();
    };
    dom.freezeHeaderCheck.onchange = function() {
      state.freezeHeader = dom.freezeHeaderCheck.checked;
      savePersistedState();
      state.activeFilterColumn = null;
      closeTreeMenu();
      render();
    };
    dom.showStickyHeaderCheck.onchange = function() {
      state.showStickyHeader = dom.showStickyHeaderCheck.checked;
      savePersistedState();
      state.activeFilterColumn = null;
      closeTreeMenu();
      hideStickyTableHead();
      updateStickyContextBar();
    };
    dom.parseJsonStringCheck.onchange = function() {
      state.parseJsonString = dom.parseJsonStringCheck.checked;
      savePersistedState();
      state.activeFilterColumn = null;
      closeTreeMenu();
      render();
    };
    dom.headerModeSelect.onchange = function() {
      state.stickyHeaderMode = dom.headerModeSelect.value === "multi" ? "multi" : "single";
      savePersistedState();
      state.activeFilterColumn = null;
      closeTreeMenu();
      hideStickyTableHead();
      updateStickyContextBar();
    };
    dom.toggle.onclick = function() {
      state.showTable = !state.showTable;
      state.activeFilterColumn = null;
      closeTreeMenu();
      render();
    };
    document.addEventListener("click", function(event) {
      var target = event.target;
      var inTreeLayer = target && target.closest && (target.closest(".tree-menu") || target.closest(".tree-menu-btn"));
      var inFilterLayer = target && target.closest && (target.closest(".th-wrap") || target.closest(".filter-menu") || target.closest(".filter-btn"));
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
        Array.prototype.forEach.call(document.body.querySelectorAll(".filter-menu"), function(menu) {
          if (menu.parentNode) menu.parentNode.removeChild(menu);
        });
      }
    });
    bindStickyContextEvents();
    render();
  });
})();
`;

  // src/visualizer/index.js
  function buildTemplate() {
    const engine = virtual_engine_bundle_default.replace(/<\/script/gi, "<\\/script");
    return "<style>" + visualizer_default + "</style>" + skeleton_default + "<script>" + engine + "<\/script>";
  }
  function run(pm2) {
    let raw = pm2.response.text();
    try {
      const root = pm2.response.json();
      const payload = root && Object.prototype.hasOwnProperty.call(root, "DATA") ? root.DATA : root && Object.prototype.hasOwnProperty.call(root, "data") ? root.data : root;
      raw = JSON.stringify(payload, null, 2);
    } catch (e) {
    }
    pm2.visualizer.set(buildTemplate(), { raw });
  }
  if (typeof pm !== "undefined" && pm && typeof pm.visualizer !== "undefined") {
    run(pm);
  } else if (typeof window !== "undefined") {
    window.__jsonGridVisualizer = run;
  }
})();
