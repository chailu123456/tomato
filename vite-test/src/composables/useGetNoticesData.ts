import { getSiteMessage, updateSiteAllMsgStatus } from "@/api/request-modules/common";
import { RequestParams } from "@/types/request";
export interface SiteMsgInter {
  count: number;
  list: Array<MsgItemsIter>;
  unread: number;
}

export interface MsgItemsIter {
  content: string;
  create_time: string;
  id: number;
  is_read: boolean;
  module: string;
  obj_id: number;
  obj_name: string;
}

// 获取列表信息
export async function getMessage(params: RequestParams.GetAppList): Promise<SiteMsgInter> {
  const { pageIndex = 1, pageSize = 10 } = params;
  const { data, code } = await getSiteMessage({ pageIndex, pageSize });
  if (code !== 200) return Promise.reject(false);

  return data;
}

// 更新所有的消息通知状态
export async function updateAllMsgStatus(): Promise<boolean> {
  const { code } = await updateSiteAllMsgStatus();
  if (code !== 200) return false;
  return true;
}
