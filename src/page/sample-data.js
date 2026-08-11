// 示例数据（左侧输入框的默认演示 JSON）。
// 数据本体在同名 .json 文件里，可直接编辑；运行时按 2 空格缩进格式化。
import data from "./sample-data.json";

export const sampleJson = JSON.stringify(data, null, 2);
