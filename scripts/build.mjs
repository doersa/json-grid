// 构建：把 src/ 下的 ES 模块打包为经典 script 产物。
//
//   dist/visualizer.js  可视化（双模式）：Apifox 直接粘贴；Web 页面经 <script src> 加载
//   dist/page.js        Web 宿主页面逻辑
//
// 两个产物都会把 "</" 转义为 "<\/"：它们经 <script src> 加载时，
// 浏览器 HTML 解析器扫描原始字节，裸 "</script" 会提前闭合脚本标签。
import esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const watch = process.argv.includes("--watch");

// 引擎（src/visualizer/engine/）先单独打包成单文件文本，
// 再作为字符串注入可视化入口（引擎以源码文本形式内联进模板 <script>）。
const engineBundlePlugin = {
  name: "engine-bundle",
  setup(build) {
    build.onResolve({ filter: /^virtual:engine-bundle$/ }, () => ({
      path: "virtual:engine-bundle",
      namespace: "engine-bundle",
    }));
    build.onLoad({ namespace: "engine-bundle", filter: /.*/ }, async () => {
      const result = await esbuild.build({
        entryPoints: [path.join(root, "src/visualizer/engine/main.js")],
        bundle: true,
        write: false,
        format: "iife",
        target: "es2017",
        logLevel: "warning",
      });
      return {
        contents: `export default ${JSON.stringify(result.outputFiles[0].text)};`,
        watchDirs: [path.join(root, "src/visualizer/engine")],
      };
    });
  },
};

const shared = {
  bundle: true,
  write: false,
  format: "iife",
  target: "es2017",
  logLevel: "warning",
};

/** 转义裸 "</script"（防 <script src> 加载被 HTML 解析截断），并断言无残留。 */
function guardCloseTags(label, text) {
  const out = text.replace(/<\/script/gi, "<\\/script");
  if (/<\/script/i.test(out)) throw new Error(`${label} 含有未转义的 </script`);
  return out;
}

async function buildAll() {
  const [viz, page] = await Promise.all([
    esbuild.build({
      ...shared,
      entryPoints: [path.join(root, "src/visualizer/index.js")],
      loader: { ".css": "text", ".html": "text" },
      plugins: [engineBundlePlugin],
    }),
    esbuild.build({
      ...shared,
      entryPoints: [path.join(root, "src/page/main.js")],
    }),
  ]);
  fs.mkdirSync(path.join(root, "dist"), { recursive: true });
  fs.writeFileSync(path.join(root, "dist/visualizer.js"), guardCloseTags("dist/visualizer.js", viz.outputFiles[0].text));
  fs.writeFileSync(path.join(root, "dist/page.js"), guardCloseTags("dist/page.js", page.outputFiles[0].text));

  // 宿主页样式并进 dist/，使 dist/ 成为自包含目录。
  // 注意：根 index.html 仍引用 src/page/page.css（改 CSS 免构建即可刷新预览），
  // 这里只让 dist/ 单独自包含，不影响本地开发流程。
  fs.copyFileSync(path.join(root, "src/page/page.css"), path.join(root, "dist/page.css"));

  // 生成 dist/index.html：把根 index.html 的资源引用改写为相对 ./ 路径，
  // 使 dist/ 单目录即可直接双击打开（运行时零外部依赖、无网络请求）。
  const pageHtml = fs
    .readFileSync(path.join(root, "index.html"), "utf8")
    .replace(/dist\/visualizer\.js/g, "./visualizer.js")
    .replace(/dist\/page\.js/g, "./page.js")
    .replace(/src\/page\/page\.css/g, "./page.css");
  fs.writeFileSync(path.join(root, "dist/index.html"), pageHtml);

  console.log("构建完成: dist/visualizer.js, dist/page.js, dist/page.css, dist/index.html");
}

if (watch) {
  // 简化实现：监听 src/ 递归变更，防抖后全量重建（保证转义守卫始终生效）
  await buildAll();
  let timer = null;
  fs.watch(path.join(root, "src"), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      buildAll().catch((err) => console.error("构建失败:", err.message));
    }, 120);
  });
  console.log("watch 模式：监听 src/ 变更（Ctrl+C 退出）");
} else {
  await buildAll();
}
