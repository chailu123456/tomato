#!/usr/bin/env node

/*
 * @Author: 宋绍华
 * @Date: 2022-04-23 11:23:18
 * @LastEditTime: 2022-05-09 21:40:50
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \createApi\request.js
 */

const axios = require('axios');
const config = require('./config.json');
axios.defaults.withCredentials = true;

// 获取yapi接口
async function getApiInfo(project_id) {
  const arr = [];
  const data = await getYapiList(project_id);
  console.log(data)
  if (typeof data === 'string') return data;
  if (data && Array.isArray(data.list) && data.list.length) {
    for (let item of data.list) {
      const d = await getYapiDetailById(item._id);
      if (d) arr.push(d);
    }
  }
  return arr;
}
// 获取yapi列表接口，
async function getYapiList(project_id) {
  console.log(config.Cookie)
  const url = config.getYapiList + project_id;
  const { data } = await axios({
    method: 'get',
    url,
    headers: {
      Cookie: config.Cookie,
    },
  });
  if (data.errcode === 0) return data.data;
  return data.errmsg;
}

// 获取yapi详情
async function getYapiDetailById(id) {
  const url = config.getYapiDetailById + id;
  const { data } = await axios({
    method: 'get',
    url,
    headers: {
      Cookie: config.Cookie,
    },
  });

  if (data.errcode === 0) return data.data;
  return null;
}

module.exports = {
  getApiInfo,
};
