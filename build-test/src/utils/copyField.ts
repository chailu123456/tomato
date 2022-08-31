import { ElMessage } from "element-plus";

export default function (val: string): void {
  if (!val) {
    ElMessage({
      type: "warning",
      message: "字段为空，无法复制"
    });
    return;
  }
  const dom = document.createElement("input");
  dom.setAttribute("type", "text");
  dom.setAttribute("style", "position:absolute;top:0;left:0;z-index:-999");
  dom.setAttribute("value", val);
  document.body.appendChild(dom);
  dom.select(); // 复制文本
  document.execCommand("Copy");
  ElMessage({
    type: "success",
    message: "复制成功"
  });
  setTimeout(() => {
    document.body.removeChild(dom);
  }, 200);
}
