/*
 * @Author: 柴璐
 * @Date: 2022-09-01 20:16:32
 * @LastEditTime: 2022-01-01 20:16:32
 * @LastEditors: 柴璐
 * @Description:
        参数注释: (fileName: string, url: string, exportDate?: boolean)
        fileName: 下载文件名
        url： 文件地址
        exportDate： 是否是导出文件流(导入excal用到，主要作用与任务、需求、BUG、用例增加导出功能)
 */

import { ElMessage } from "element-plus";
import { getSession } from "@/utils";
import { USER } from "../store/state";
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function (fileName: string, url: string, exportDate?: boolean) {
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
  if (exportDate) {
    const session = getSession("user", true) as USER;
    if (session) {
      x.setRequestHeader("Authorization", `Bearer ${session.token}`);
    }
  }

  x.responseType = "blob";

  x.onload = function () {
    let xlsxName = null;
    if (exportDate) {
      xlsxName = fileNameHeader(x.getResponseHeader("Content-Disposition"));
    }
    const url = window.URL.createObjectURL(x.response);
    const a = document.createElement("a");
    a.href = url;
    if (exportDate) {
      a.download = xlsxName || "file";
    } else {
      a.download = fileName || "file";
    }

    a.click();
  };
  x.send();
}

function fileNameHeader(d: any) {
  let result = null;
  if (d && /filename=.*/gi.test(d)) {
    result = d.match(/filename=.*/gi);
    return decodeURI(result[0].split("=")[1]);
  }
}
