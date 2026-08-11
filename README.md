# JSON Grid

把 JSON 响应渲染成可交互表格的工具，同一份渲染逻辑支持两种运行模式：

- **Web 页面**：双击打开 `index.html`，左侧粘贴/编辑 JSON，右侧 iframe 实时渲染表格。
- **Apifox / Postman 可视化**：把 `dist/visualizer.js` 全文粘贴到接口的「可视化」脚本中即可。

功能：路径导航、列过滤、排序、冻结列、列宽拖拽、嵌套表展开、JSON 字符串解析、
复制/导出 CSV/JSON、状态持久化（localStorage）。

## 目录结构

```
index.html               Web 宿主页面（结构 + 引用，双击即可打开）
src/
  page/                  宿主页面源码（仅 Web 模式）
    page.css             页面样式
    state.js             DOM 句柄（el）、UI 状态（ui）、持久化键
    sample-data.json     示例数据（可直接编辑）
    sample-data.js       示例数据入口
    split-pane.js        左右分栏：拖拽调宽、面板折叠、状态栏
    json-cursor.js       光标定位：左侧 textarea 光标 → JSON 路径
    preview.js           预览 iframe：错误页、状态保持、父子窗口桥接
    main.js              页面入口：渲染调度、事件绑定、初始化
  visualizer/            可视化源码（Web / Apifox 双模式单真源）
    index.js             双模式入口：组装模板、解包 DATA/data、pm.visualizer.set
    visualizer.css       模板样式
    skeleton.html        模板骨架 DOM
    engine/              渲染引擎（模板内联 <script> 的源码）
      state.js           共享状态（state）、DOM 句柄（dom）、常量、持久化
      utils.js           转义、格式化、剪贴板、下载、CSV
      paths.js           路径导航：路径候选、下拉、面包屑、收藏
      sticky-header.js   浮动表头与层级上下文条
      details-tree.js    details 展开树与树形操作菜单
      filter-sort.js     列过滤、过滤 chips、排序
      columns.js         列模型：收集、显隐、冻结、列宽
      render.js          渲染主流程（值/对象/数组/记录表 → HTML）
      settings.js        设置面板
      main.js            引擎入口：pm.getData → 初始化 → 首次渲染
scripts/
  build.mjs              构建（esbuild 打包 → dist/）
tests/
  equivalence.mjs        行为等价测试（jsdom 逐 DOM 比对旧版）
  page-smoke.mjs         宿主页面冒烟测试
  fixtures/
    legacy-template.txt  旧版（单文件时代）模板快照，作为等价基准
dist/                    构建产物（提交入库；Web 双击打开与 Apifox 粘贴都依赖它）
  visualizer.js
  page.js
```

## 开发

```bash
npm install        # 仅开发依赖：esbuild + jsdom
npm run build      # 构建 dist/visualizer.js + dist/page.js
npm run dev        # watch 模式，改 src/ 自动重建
npm test           # 行为等价测试 + 页面冒烟测试（自动先构建）
```

改了 `src/` 任意文件都要重新 `npm run build` 并**连同 dist/ 一起提交**。

## 架构要点

**同一份模板，两种喂数据的方式。** 渲染产物是自包含 HTML 模板
（`<style>` + 骨架 + `<script>` 引擎）。Apifox 运行时原生提供全局 `pm`，
`dist/visualizer.js` 检测到 `pm.visualizer` 存在就自动执行；Web 页面里没有 `pm`，
产物仅暴露 `window.__jsonGridVisualizer`，页面用 pm 桩调用它截获模板，
再拼上 pm 桩脚本和桥接脚本写入预览 iframe 的 `srcdoc`。

**引擎只认 `pm.getData`。** 模板内引擎取数据的唯一入口是
`window.pm.getData(cb)` → `cb(null, { raw })`。Web 侧的 pm 桩必须模拟这个契约。

**转义守卫。** 两个场景都经过 `<script>` 字节扫描，源码中不能出现裸 `</script`：
引擎内联进模板时（`src/visualizer/index.js`）和 dist 写出时（`scripts/build.mjs`）
都会把 `</script` 转义为 `<\/script`（JS 字符串中两者等价）。
注意**不能全文替换 `</`**：正则字面量 `/</g` 中的 `/` 是闭合符，转义后会吞掉后续代码。

**测试即迁移安全网。** `tests/equivalence.mjs` 用 jsdom 分别执行旧版模板快照与
新构建的模板，对多组 JSON 样本逐 DOM 比对（含交互）；样式与骨架额外做逐字节比对。
日常改动引擎后只需 `npm test` 通过即可，不需要更新快照——除非是有意的 UI 变更。
