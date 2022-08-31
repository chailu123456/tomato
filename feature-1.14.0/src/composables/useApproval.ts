/*
 * @Author: 宋绍华
 * @Date: 2022-01-18 18:24:05
 * @LastEditTime: 2022-01-25 17:02:10
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\composables\useApproval.ts
 */
import {
  getApprovalApi,
  getDemandApprovalDetails,
  getDemandApprovalList,
  addApprovalApi,
  editApprovalApi,
  remindApproval,
  getDemandApprovalLogListApi,
  submitApprovalApi,
  withDrawApprovalApi
} from "@/api/request-modules/product";
import { ApprovalEditForm, DemandApprovalDetails, DemandApprovalItem, DemandApprovalLog } from "@/types/interface";
import { awaitFunc } from "@/utils";

export default function useApproval() {
  // 获取list
  const useGetList = async (useParams: any) => {
    const res = await getApprovalApi(useParams);

    return res;
  };
  // 新增form表单
  const useAddForm = async (saveParams: ApprovalEditForm) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [err, data]: [number | unknown, any] = await awaitFunc<ApprovalEditForm, any>({
      asyncFunc: addApprovalApi,
      args: saveParams
    });
    if (err) return null;
    return data.id;
  };
  // 编辑form表单
  const useEditForm = async (saveParams: ApprovalEditForm) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [err, _]: [number | unknown, any] = await awaitFunc<ApprovalEditForm, any>({
      asyncFunc: editApprovalApi,
      args: saveParams,
      needCode: true
    });
    if (typeof err === "number") return err === 200;
    return false;
  };
  // 提交form表单
  const useSubmitForm = async (saveParams: ApprovalEditForm) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [err, _]: [number | unknown, any] = await awaitFunc<ApprovalEditForm, any>({
      asyncFunc: submitApprovalApi,
      args: saveParams,
      needCode: true
    });
    if (typeof err === "number") return err === 200;
    return false;
  };
  // 撤回form表单
  const useWithDrawForm = async (id: number) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [err, _]: [number | unknown, any] = await awaitFunc<number, any>({
      asyncFunc: withDrawApprovalApi,
      args: id,
      needCode: true
    });
    if (typeof err === "number") return err === 200;
    return false;
  };

  // 获取需求审批单列表
  const useGetDemandList = async (product_id: string): Promise<DemandApprovalItem[] | null> => {
    const [err, data]: [unknown, DemandApprovalItem[] | null] = await awaitFunc<string, DemandApprovalItem[]>({
      asyncFunc: getDemandApprovalList,
      args: product_id,
      needLoading: false
    });
    if (err || !data) return null;
    return data;
  };
  // 获取审批单详情
  const useGetDemandDetails = async (id: number, needLoading = true): Promise<DemandApprovalDetails | null> => {
    const [err, data]: [unknown, DemandApprovalDetails | null] = await awaitFunc<number, DemandApprovalDetails>({
      asyncFunc: getDemandApprovalDetails,
      args: id,
      needLoading
    });
    if (err || !data) return null;
    return data;
  };

  // 提醒审批
  const useRemindApproval = async (id: number) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [err, _]: [number | unknown, any] = await awaitFunc({
      asyncFunc: remindApproval,
      args: { id },
      needCode: true
    });
    if (typeof err === "number") return err === 200;
    return false;
  };
  // 获取审批单记录
  const useGetLog = async (id: number) => {
    const [err, data]: [unknown, DemandApprovalLog[] | null] = await awaitFunc<number, DemandApprovalLog[]>({
      asyncFunc: getDemandApprovalLogListApi,
      args: id
    });
    if (err || !data) return null;
    return data;
  };

  return {
    useGetList,
    useAddForm,
    useEditForm,
    useGetDemandList,
    useGetDemandDetails,
    useRemindApproval,
    useGetLog,
    useSubmitForm,
    useWithDrawForm
  };
}
