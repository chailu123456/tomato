import { getByUserId } from "@/api/request-modules/common";
import { useStore } from "@/store/index";
import { setSession } from "@/utils";
import { getLocalhrefParams } from "@/utils/index";

const CONFIG = {
  id: "canvasRef",
  appid: "ww06fa03084e27ff22",
  agentid: "1000089",
  redirect_uri: encodeURIComponent("http://tomato.petrvet.com"),
  state: "",
  href: ""
};

export default function useLogin(drawEle: string): any {
  const store = useStore();
  const getQRCode = async () => {
    // 已经扫码授权过
    const { code } = getLocalhrefParams();
    if (code) {
      // 根据code获取成员信息
      const { data } = await getByUserId({ code: code });
      store.commit("USER", data);
      location.href = `/#/overview/allOverview`;
      setSession("user", data);
      return;
    }
    window.WwLogin(Object.assign(CONFIG, { id: drawEle }));
  };
  return { getQRCode };
}
