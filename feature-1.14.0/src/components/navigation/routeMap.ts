/*
 * @Author: niuhangkai
 * @Date: 2021-09-27 11:12:51
 * @Last Modified by: niuhangkai
 * @Last Modified time: 2021-09-30 09:22:02
 * 记录tomao中的显示iframe路径和yapi中路径的映射，tomato一个iframe，通过name匹配决定什么时候展示iframe
 * tomatoPath:在tomato中包含iframe的页面路由名称
 */

const routes = [
  /**
   * 项目-设置-测试环境 =
   */
  {
    tomatoRouteName: "projectEnv",
    // yapiRoutePath: "/project/:id/setting"
    params: {
      // 需要yapi跳转的路径-环境设置页面
      path: "/project/16/env",
      query: {
        title: "设置"
      }
    }
  },
  {
    tomatoRouteName: "interfaceDoc",
    params: {
      // 需要yapi跳转的路径
      path: "/project/16/interface/api",
      query: {
        title: "接口文档"
      }
    }
  },
  {
    tomatoRouteName: "interface",
    params: {
      // 需要yapi跳转的路径
      path: "/project/16/interface/api",
      query: {
        title: "接口"
      }
    }
  }
];
export default routes;

/**
 * 记录原来yapi的路径
 * 接口-/project/16/interface/api
 * 动态-/project/16/activity
 * 数据管理-/project/16/data
 * 设置-/project/16/setting
 * 环境配置-/project/16/env
 * wiki-/project/16/wiki
 * 个人空间-/group/11
 */
