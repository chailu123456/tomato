// eslint-disable-next-line @typescript-eslint/no-var-requires
var fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-var-requires
var path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const qiniu = require("qiniu");

const setReg = new RegExp("[/\\\\]", "g");

//自己七牛云的秘钥
var accessKey = "RT39iF0FiM-ZAT_3_Rbt4AvH1gMiAPWc_Vj1Bdz8";
var secretKey = "vhX-rRoaJa1Ba7yRR0p_1kfMnIIJH_Rm6q1irXL_";
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
// let distPath = path.resolve(__dirname, "./", "dist"); // 测试地址（调试使用）
let distPath = path.resolve(__dirname, "../../../", "dist"); // tomato打测试、生产包地址
let projDirPath = path.resolve(distPath);
console.log(projDirPath);

let startIndex = 0;

let moduleDirs = [path.join("", "dist")];
console.log(moduleDirs);

let pushKeyArr = [];
function getFileKeys(dir) {
  let absDir = path.resolve(distPath, dir);
  let result = [];
  let files = fs.readdirSync(absDir);
  for (let i = 0; i < files.length; i++) {
    let fKey = path.join(dir, files[i]);
    let fPath = path.resolve(absDir, files[i]);
    let stat = fs.lstatSync(fPath);
    if (stat.isDirectory()) {
      Array.prototype.push.apply(result, getFileKeys(fKey));
    }
    if (stat.isFile()) {
      result.push(fKey);
    }
  }
  return result;
}

for (let i = 0; i < moduleDirs.length; i++) {
  Array.prototype.push.apply(pushKeyArr, getFileKeys(""));
}
// 去除index.html文件
pushKeyArr = pushKeyArr.filter((item) => !item.includes(".html"));
console.log(pushKeyArr);
console.log("上传文件集合");

var config = new qiniu.conf.Config();
// 空间对应的机房，zone_z1代表华北，其他配置参见七牛云文档
config.zone = qiniu.zone.Zone_z2;
// 是否使用https域名
config.useHttpsDomain = true;
// 上传是否使用cdn加速
config.useCdnDomain = true;

var formUploader = new qiniu.form_up.FormUploader(config);
var bucketManager = new qiniu.rs.BucketManager(mac, config);
var cdnManager = new qiniu.cdn.CdnManager(mac);

var options = {
  scope: "rvet_dc_file"
  // detectMime:0
  // MimeType: 'text/html;text/css;text/javascript;application/x-gzip',
};

var putPolicy = new qiniu.rs.PutPolicy(options);
var uploadToken = putPolicy.uploadToken(mac);

function callReject(i, count, resolve, refresh) {
  if (count < 3) {
    qiniuPushFile(i, count + 1, refresh).then(function (value) {
      resolve(value);
    });
  } else {
    resolve(false);
  }
}

function qiniuPushFile(i, count, refresh) {
  count = count || 0;
  let key = pushKeyArr[i].replace(setReg, "/");
  return new Promise(function (resolve, reject) {
    var putExtra = new qiniu.form_up.PutExtra();
    formUploader.putFile(uploadToken, key, path.resolve(distPath, pushKeyArr[i]), putExtra, function (respErr, respBody, respInfo) {
      if (respErr) {
        console.error(`Index: ${i}, Count: ${count}, file: ${pushKeyArr[i]}, Got error: ${respErr.message}`);
        callReject(i, count, resolve, refresh);
        return;
      }
      if (respInfo.statusCode == 200) {
        if (refresh) {
          cdnManager.refreshUrls([key], function (err, respBody, respInfo) {
            if (err) {
              console.error(`Index: ${i}, Count: ${count}, file: ${pushKeyArr[i]}, Got error: ${err.message}`);
              resolve(false);
              return;
            }
            if (respInfo.statusCode == 200) {
              resolve(true);
            } else {
              console.log(respInfo);
              resolve(false);
            }
          });
        } else {
          resolve(true);
        }
      } else if (respInfo.statusCode == 614) {
        console.log("删除重新上传");
        bucketManager.delete(options.scope, key, function (err, respBody, respInfo) {
          if (err) {
            console.error(`Index: ${i}, Count: ${count}, file: ${pushKeyArr[i]}, Got error: ${err.message}`);
            callReject(i, count, resolve, refresh);
          } else {
            callReject(i, count - 1, resolve, true);
          }
        });
      } else {
        console.log(respInfo);
        callReject(i, count, resolve, refresh);
      }
    });
  });
}

(async function start() {
  if (startIndex) {
    console.log(`续传文件  index: ${startIndex}`);
  }
  for (var i = startIndex; i < pushKeyArr.length; i++) {
    let res = await qiniuPushFile(i);
    if (!res) {
      console.log(`文件上传失败  index: ${i},    file: ${pushKeyArr[i]}`);
      process.exit(1);
    }
    console.log(`文件上传  index: ${i},    file: ${pushKeyArr[i]}`);
  }
  console.log(`所有文件上传成功`);
  process.exit(0);
})();
