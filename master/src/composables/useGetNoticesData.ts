import { getSiteMessage, updateSiteAllMsgStatus, updateSiteMsgStatusById } from "@/api/request-modules/common";
import { shortCode } from "@/api/request-modules/document";
import router from "@/router";
import { RequestParams } from "@/types/request";
import { ResponseParams } from "@/types/response";
// import { getSession } from "@/utils";
import { LinkType, NotificationType } from "@/utils/enum";
import { ElNotification } from "element-plus";

// 创建消息通知
export interface CreateNotify {
  title: string;
  options?: NotificationOptions | undefined;
  cb?: (e: Notification) => void;
}

// 请求更新消息接口消息体
export interface returnModal {
  code: number;
  data: any;
  message: string;
}

export interface SiteMsgInter {
  count: number;
  list: Array<MsgItemsIter>;
  unread: number;
}

export interface MsgItemsIter {
  apply_staff_name: string;
  wiki_content_id: string;
  content: string;
  create_time: string;
  id: number;
  is_read: boolean;
  module: string;
  obj_id: number;
  obj_name: string;
  iteration_id: number;
  product_id: number;
  demand_approval_id: number;
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

// 更新单个消息通知状态
export async function updateMsgStatusById(id: number): Promise<boolean> {
  const { code }: returnModal = await updateSiteMsgStatusById(id);
  if (code !== 200) return false;
  return true;
}

// socket
export function socket(cb?: (e: MessageEvent) => void): void {
  const { staff_no } = localStorage.user ? JSON.parse(localStorage.user) : "";
  const { host, protocol } = window.location;
  const ws = protocol === "https:" ? "wss" : "ws";
  const url = `${ws}://${host}/api/tomato/ws/site-message/${staff_no}`;

  const socket = new WebSocket(url);
  const connectTimes = 5;
  // 创建连接
  connectSocket(url, socket, staff_no, connectTimes, cb);
}

// socket 连接
export function connectSocket(url: string, socket: WebSocket, staff_no: string, times: number, cb?: (e: MessageEvent) => void): void {
  if (!socket) return;
  socket.onopen = () => {
    times = 5; // 恢复连接次数
    socket.send(
      JSON.stringify({
        type: "connected",
        sender: staff_no
      })
    );
  };

  socket.onmessage = (e: MessageEvent) => {
    const { data: d } = e;
    const { data } = typeof d === "string" ? JSON.parse(d) : "";
    typeof cb === "function" && cb(data);
  };

  socket.onerror = (e: Event) => {
    console.log(e, "error");
  };

  socket.onclose = () => {
    // socket 有时候会自动断开，监听断开之后需要重新发送，但是重新连接次数少不超过5次
    if (times <= 5 && times >= 0) {
      socket = new WebSocket(url);
      connectSocket(url, socket, staff_no, --times, cb);
    }
  };
}

// 获取浏览器消息通知权限
export async function getBrowserNotificationPermission(): Promise<boolean> {
  const { DENIED, DEFAULT } = NotificationType;
  const result = await Notification.requestPermission();
  // console.log(result);
  // 如果被拒绝
  if (result === DENIED) return false;
  // 默认
  else if (result === DEFAULT) {
    console.log("The permission request was dismissed.");
    return false;
  }
  // 成功返回
  return true;
}

// 创建一个浏览器消息通知
export function createNotification(params: CreateNotify): void {
  const { title, options, cb } = params;
  const notify = new Notification(title, options);
  // 如果cb是函数，就执行回调函数
  typeof cb === "function" && cb(notify);
}

export function filterItems(item: MsgItemsIter): string {
  const { content, obj_id, obj_name } = item;
  return content.replace(/{{(.*)}}/g, () => `<a style='color: #3370ff'># ${obj_id} ${obj_name}</a>`);
}

// 发送消息
export async function sendNotification(item: MsgItemsIter): Promise<void> {
  // 过滤下内容
  const content = filterItems(item);
  // 获取权限
  const hasPer = await getBrowserNotificationPermission();

  const routeMap = {
    [LinkType.APPLYTESTMODULE]: {
      baseName: "applyTest",
      query: { id: item.iteration_id }
    },
    [LinkType.BUGMODULE]: {
      baseName: "test",
      query: {
        productId: item.product_id,
        detailId: item.obj_id
      }
    },
    [LinkType.TASKMODULE]: {
      baseName: "projectExploitation",
      query: {
        where: "notices",
        detailId: item.obj_id
      }
    },
    [LinkType.DEMANDAPPROVAL]: {
      baseName: "approval",
      query: {
        productId: item.product_id,
        auto: 1,
        ids: item.demand_approval_id,
        fromNotices: true
      }
    },
    [LinkType.APPLYTEST]: {
      baseName: "testBill",
      query: {
        productId: item.product_id,
        testApplyId: item.obj_id
      }
    },
    wiki: {
      baseName: "padIframe",
      query: {
        docId: item.obj_id,
        content_id: item.wiki_content_id
      }
    }
  } as Record<string, any>;

  const path = routeMap[item.module].baseName;
  let href: string;

  if (path === "padIframe") {
    // 转换为短链接
    const link = "docId=" + item.obj_id + "&content_id=" + item.wiki_content_id + "&type=update&is_link_share=1";
    shortCode<ResponseParams.ResponseDataSuccess>({ content: link }).then((res) => {
      if (res.code === 200) {
        // 在文档页面打开时需要重新加载
        if (routeMap[item.module].baseName === "padIframe") {
          href = window.location.origin + "/document/padIframe?" + res.data.code;
        }
      }
    });
  }
  // 跳转页面
  const jumpPage = () => {
    if (path === "padIframe") {
      window.location.href = href;
      location.reload();
    } else {
      router.push({
        name: routeMap[item.module].baseUrl,
        query: routeMap[item.module].query
      });
    }
  };

  // 有消息通知的权限
  if (hasPer) {
    createNotification({
      title: "番茄系统",
      options: {
        body: `# ${item.obj_id} ${item.obj_name}`,
        icon: "/img/collapse-logo.bff2f349.png"
      },
      cb(notify: Notification) {
        console.log(notify);
        notify.onclick = jumpPage;
      }
    });
  } else {
    // 不支持浏览器消息，退而求其次页面的消息提示
    ElNotification({
      title: "番茄系统",
      dangerouslyUseHTMLString: true,
      message: content,
      onClick: jumpPage
    });
  }
}
