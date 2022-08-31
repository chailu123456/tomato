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

import axios from "axios";
import JSZip from "jszip";
import FileSaver from "file-saver";

const getFile = (url: string) => {
  return new Promise((resolve, reject) => {
    axios({
      method: "get",
      url,
      responseType: "arraybuffer"
    })
      .then((data) => {
        resolve(data.data);
      })
      .catch((error) => {
        reject(error.toString());
      });
  });
};

export default function batchDownload(urlArr: any, name?: string, arrChildName?: string[]) {
  const data: string[] = urlArr; // 需要下载打包的路径, 可以是本地相对路径, 也可以是跨域的全路径
  const zip = new JSZip();
  const cache: any = {};
  const promises: string[] = [];
  data.forEach((item, index) => {
    const promise: any = getFile(item).then((data: any) => {
      // 下载文件, 并存成ArrayBuffer对象
      const arr_name = item.split("/");
      let file_name = arr_name[arr_name.length - 1]; // 获取文件名
      if (arrChildName && arrChildName.length) {
        file_name = arrChildName[index];
      }
      zip.file(file_name, data, { binary: true }); // 逐个添加文件
      cache[file_name] = data;
    });
    promises.push(promise);
  });

  Promise.all(promises).then(() => {
    zip.generateAsync({ type: "blob" }).then((content) => {
      // 生成二进制流
      FileSaver.saveAs(content, name || "打包下载.zip"); // 利用file-saver保存文件
    });
  });
}
