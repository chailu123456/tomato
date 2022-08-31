import { deleteDemand } from "@/api/request-modules/product";
import { getCurrentInstance } from "vue";

export default function useDelete(): any {
  const internalInstance = getCurrentInstance();
  const global: any = internalInstance?.appContext.config.globalProperties;
  const deleteFn = (id: number) => {
    return new Promise((resolve, reject) => {
      deleteDemand<ResponseData>(id)
        .then((res: ResponseData) => {
          if (res.code === 200) {
            console.log(getCurrentInstance, "globalglobal");
            global.$message({
              message: "操作成功",
              type: "success"
            });
          }
          resolve(true);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
  return { deleteFn };
}
