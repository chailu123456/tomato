/*
 * @Author: 宋绍华
 * @Date: 2022-04-21 10:45:39
 * @LastEditTime: 2022-05-30 16:45:54
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\store\actions.ts
 */
import { State } from "./state";
import { ActionTree, ActionContext, ActionPayload } from "vuex";
import { getEnvList, getPermission } from "@/api/request-modules/configure";
import { getEmployeeList } from "@/api/request-modules/common";
import { ResponseParams } from "@/types/response";
import { setSession } from "@/utils";
import useCommon from "@/composables/useCommon";
import { MutationType } from "./mutation-types";
import useBoardBase from "@/composables/useBoardBase";
const { useGetProjectList } = useCommon();
const { useGetIterateList } = useBoardBase();

export type Actions<State> = {
  EMPLOYEE_LIST(context: ActionContext<State, State>, payload: ActionPayload): void;
  GETENV_LIST(context: ActionContext<State, State>, payload: ActionPayload): void;
  GETPRODUCTLIST(context: ActionContext<State, State>, payload: ActionPayload): void;
};

type EnvironmentList = {
  value: number;
  label: string;
};

export type EnvironmentListItem = {
  id: number;
  code: string;
  create_time: string;
  is_sys: string;
  name: string;
  update_time: string;
  remark: string;
};

const actions: ActionTree<State, State> = {
  EMPLOYEE_LIST(state) {
    getEmployeeList<ResponseParams.ResponseDataSuccess>().then(({ data }) => {
      state.commit("EMPLOYEE_LIST", data);
    });
  },
  GETENV_LIST(state) {
    getEnvList<ResponseParams.ResponseDataSuccess>().then(({ data }) => {
      const environmentListSlide: EnvironmentList[] = [];
      if (data.length) {
        data.forEach((item: EnvironmentListItem) => {
          environmentListSlide.push({
            value: item.id,
            label: item.name
          });
        });
      }
      setSession("envList", JSON.stringify(environmentListSlide));
      state.commit("ENVLIST", environmentListSlide);
    });
  },
  GET_PERMISSION(state) {
    return new Promise((resolve) => {
      // 获取访问配置模块权限
      getPermission<ResponseParams.ResponsePermissionSuccess>().then(({ data }) => {
        state.commit("PERMISSION", data);
        resolve(data);
      });
    });
  },
  async GETPRODUCTLIST(state) {
    // 获取项目list
    const data = await useGetProjectList();
    if (data) {
      state.commit(MutationType.updateProductList, data);
    }
  },
  async GETITERATELIST(state, product_id: number) {
    // 获取迭代list
    const data = await useGetIterateList({ product_id });
    if (data) {
      state.commit(MutationType.updateIterateList, data);
    }
  }
};

export default actions;
