import { MESSAGE_TIP } from "@/utils";
import { getCurrentInstance } from "vue";
// 弹窗提示封装
export default function useMessageTip(): Record<any, any> {
  const internalInstance = getCurrentInstance();
  const global: any = internalInstance?.appContext.config.globalProperties;
  const tipMessage = (code: number, message?: string) => {
    let messageParams = {
      type: "success",
      message: message || MESSAGE_TIP.success
    };
    if (code !== 200) {
      messageParams = {
        type: "error",
        message: message || MESSAGE_TIP.fail
      };
    }
    global.$message(messageParams);
  };

  return {
    tipMessage
  };
}
