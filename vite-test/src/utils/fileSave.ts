import { ElMessage } from "element-plus";
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function (fileName: string, url: string) {
  if (!url) {
    ElMessage({
      type: "warning",
      message: "下载地址为空，无法下载"
    });
    return;
  }
  url = url.replace(/http:/, "");
  const x = new XMLHttpRequest();
  x.open("GET", url, true);
  x.responseType = "blob";
  x.onload = function () {
    const url = window.URL.createObjectURL(x.response);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "file";
    a.click();
  };
  x.send();
}
