#!/usr/bin/env node

/*
 * @Author: 宋绍华
 * @Date: 2022-04-23 15:55:42
 * @LastEditTime: 2022-05-09 21:39:13
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \createApi\template.js
 */
const fs = require('fs');
const chalk = require('chalk');
const index = require('./request');
const { getApiInfo } = index;
// 获取是否需要req
function getNeedReqObj(reqInfo) {
  const { req_query, method, req_body_other } = reqInfo;
  const req_params = req_body_other && JSON.parse(req_body_other).properties;
  if (!req_params) return false;
  const m = method.toLowerCase();
  const needParams =
    m === 'get' ? !!req_query.length : Object.keys(req_params).length;
  return needParams;
}

// 请求函数模板
function requireFuncTemplate(reqInfo) {
  if (!reqInfo) return '';
  const { path } = reqInfo;
  // 类型
  const inter = generateInterName(path);
  const needParams = getNeedReqObj(reqInfo);
  // 接口访问类型
  const type = reqInfo.method.toLowerCase();
  return `
  export function getList<T>(${
    needParams ? `params: ${inter}` : ''
  }): Promise<T> {
    return axiosInstance.${type}<T>(api.getDepartmentList, ${
    needParams ? 'params' : ''
  });
  }`;
}

// 获取响应interface
function getRespInter(reqInfo) {
  if (!reqInfo) return '';
  const { res_body, path } = reqInfo;
  if (res_body && typeof res_body === 'string') {
    const body = JSON.parse(res_body);
    const data = body.properties.data;
    if (!data) return '';
    const info =
      data.type === 'array'
        ? data[Object.keys(data).filter((i) => i !== 'type')[0]]
        : data;

    const { properties, required } = info;

    const name = generateInterName(path) + 'Resp';
    return createRespInter(name, properties, required);
  }
}

// 生成响应类型interface
function createRespInter(title, properties, required = []) {
  if (!title || !properties) return '';
  let inter = `export interface ${title} {${createPropertesInter(
    properties,
    required
  )}
  }`;
  return inter;
}

// 产生interface 属性
function createPropertesInter(props, required = []) {
  if (!props) return '';
  let inter = ``;
  Object.keys(props).forEach((item) => {
    const n = props[item];
    // 是否必须
    const req = !required.includes(item) ? '?' : '';
    // string，int，number 三种类型
    if (['number', 'integer', 'string'].includes(n.type)) {
      inter += `
      ${item}${req}: ${n.type === 'integer' ? 'number' : n.type} ${
        n.title || n.description ? `// ${n.title || n.description}` : ''
      };`;
    } else if (n.type === 'object') {
      // 对象类型
      const wrapInter = createPropertesInter(n.properties, n.required);
      inter += `
      ${item}${req}: {${wrapInter}
      }`;
    } else if (n.type === 'array') {
      // 数组类型
      const wrapInter = Object.keys(n)
        .filter((i) => i !== 'type')
        .map((m) => {
          return createPropertesInter(n[m].properties, n[m].required);
        });

      inter += `
        ${item}${req}: {${wrapInter}
      }[]`;
    }
  });

  return inter;
}

// use 函数模板
function createUseFuncTemplate(reqInfo) {
  if (!reqInfo) return '';
  const { path } = reqInfo;
  const iterName = generateInterName(path);
  const title = generateInterName(reqInfo.path) + 'Resp';
  const needParams = getNeedReqObj(reqInfo);
  const hasResp = getRespInter(reqInfo);
  const resp = hasResp ? title : 'void';
  return `
  export default function useCommon() {
    // ${reqInfo.title}
    const useGetList = async (${
      needParams ? `params: ${iterName}` : ''
    }): Promise<${resp} | null> => {
      const [err, data]: [unknown, ${resp} | null] = await awaitFunc<${
    needParams ? `${iterName}` : 'void'
  }, ${resp}>({
        asyncFunc: getList,
        ${needParams ? `args: params` : ''}
      });
      if (err || !data) return null;
      return data;
    };
  
    return {
      useGetList
    };
  }
  `;
}

// 生成请求参数
function createRequireParams(reqInfo) {
  if (!reqInfo) return '';
  let params = `
  /**
   * @description ${reqInfo.title} `;
  Array.isArray(reqInfo.req_query) &&
    reqInfo.req_query.forEach((item) => {
      params += `
   * @param {string} ${item.name} ${item.desc}`;
    });

  params += `
   * @returns {Promise<T>}
   */
  `;
  return params;
}

// 生成interface
function createParams(reqInfo) {
  if (!reqInfo) return '';
  const { method, req_query, req_body_other, path } = reqInfo;
  const name = generateInterName(path);
  let inter = `export interface ${name} {`;
  const m = method?.toLowerCase();
  if (m === 'post' || m === 'put') {
    const { properties } = JSON.parse(req_body_other);
    inter += createParamsInterface(properties);
  } else {
    Array.isArray(req_query) &&
      req_query.forEach((item) => {
        inter += `
        ${item.name}${item.required !== '0' ? '?' : ''}: string // ${
          item.desc
        }`;
      });
  }
  inter += `
    }`;
  return inter;
}

function createParamsInterface(props, required = []) {
  if (!props) return '';
  let inter = ``;
  Object.keys(props).forEach((item) => {
    const n = props[item];
    // 是否必须
    const req = !required.includes(item) ? '?' : '';
    // string，int，number 三种类型
    if (['number', 'integer', 'string'].includes(n.type)) {
      inter += `
      ${item}${req}: ${n.type === 'integer' ? 'number' : n.type} ${
        n.title || n.description ? `// ${n.title || n.description}` : ''
      };`;
    } else if (n.type === 'object') {
      // 对象类型
      const wrapInter = createParamsInterface(n.properties, n.required);
      inter += `
      ${item}${req}: {${wrapInter}
      }`;
    } else if (n.type === 'array') {
      // 数组类型
      const wrapInter = Object.keys(n)
        .filter((i) => i === 'items')
        .map((m) => {
          return createParamsInterface(n[m].properties, n[m].required);
        });

      inter += `
        ${item}${req}: {${wrapInter}
      }[]`;
    }
  });

  return inter;
}

// 生成interface name
function generateInterName(path) {
  if (typeof path !== 'string') return;
  const name = path.slice(path.lastIndexOf('/') + 1, path.length);
  const n = name.replaceAll(/(-[a-z])/g, (s) => {
    return s.replaceAll('-', '').toUpperCase();
  });
  return n.replace(/^\S/, (s) => s.toUpperCase());
}

// 生成引入函数
function createRequire() {
  return `
  import axiosInstance from "@/api/index";
  import api from "@/api/dict";
  import { awaitFunc } from "@/utils";
  `;
}

// 文件写入
function createFile(filename, file = '') {
  fs.writeFile(`./${filename}.ts`, file, (err) => {
    if (err) throw err;
    console.log('create success');
  });
}

// 生成请求函数
function createRequireFunc(reqInfo) {
  return `
    ${createRequire(reqInfo)}
    ${getRespInter(reqInfo)}
    ${createParams(reqInfo)}
    ${createRequireParams(reqInfo)}
    ${requireFuncTemplate(reqInfo)}
    ${createUseFuncTemplate(reqInfo)}
  `;
}

// function test(file) {
//   fs.writeFile(`./test.ts`, createRequireFunc(file), (err) => {
//     if (err) throw err;
//     console.log('create success');
//   });
// }
// const json = {
//   method: 'PUT',
//   path: '/tomato/docs',
//   query_path: { path: '/tomato/docs', params: [] },
//   req_body_other:
//     '{"$schema":"http://json-schema.org/draft-04/schema#","type":"object","properties":{"quote_id":{"type":"number","description":"引用ID"},"category":{"type":"number","description":"文档类别：1:需求文档；2:原型文档；3:ui设计图；4:详细设计；5:测试用例"},"docs":{"type":"array","items":{"type":"object","properties":{"url":{"type":"string","description":"文档地址"},"name":{"type":"string","description":"文档名称"},"size":{"type":"number","description":"文档大小"},"type":{"type":"number","description":"文档类型：1:链接；2:文件"},"remark":{"type":"string","description":"文档备注"}},"required":["url","name","size","type","remark"]}}}}',
//   req_params: [],
//   req_query: [],
//   res_body:
//     '{"$schema":"http://json-schema.org/draft-04/schema#","type":"object","properties":{"code":{"type":"number"},"message":{"type":"string"},"data":{"type":"null"}}}',
//   title: '批量更新文档',
// };
// 主函数
async function main(id) {
  if (!id) return console.log(chalk.red('请填写项目id'));
  const list = await getApiInfo(id);
  if (typeof list === 'string') return console.log(chalk.red(list));
  if (list && Array.isArray(list) && list.length) {
    list.forEach((item) => {
      // 获取输出模板
      const tpl = createRequireFunc(item);
      createFile(item.title, tpl);
    });
  }
}

module.exports = {
  main,
};
