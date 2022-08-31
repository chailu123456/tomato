/*
 * @Author: 宋绍华
 * @Date: 2022-04-21 10:45:39
 * @LastEditTime: 2022-06-01 16:38:05
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\store\mutation-types.ts
 */
export enum MutationType {
  increment = "INCREMENT",
  iterateContentVisible = "ITERATECONTENT",
  addMemberVisible = "ADDMEMBERVISIBLE",
  user = "USER",
  employeeLists = "EMPLOYEE_LIST",
  envList = "ENVLIST",
  permission = "PERMISSION",
  include = "INCLUDE",
  updateCalendarDay = "UPDATECALENDARDAY",
  updateProductInfo = "UPDATEPRODUCTINFO",
  updateCurrentIter = "UPDATECURRENTITER",
  updateProductList = "UPDATEPRODUCTLIST",
  updateProductId = "UPDATEPRODUCTID", // 项目Id
  updateIterateId = "UPDATEITERATEID", // 迭代Id
  updateIterateList = "UPDATEITERATELIST" // 迭代LIST
}
