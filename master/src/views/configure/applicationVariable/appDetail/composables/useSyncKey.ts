import { getConfigSync } from "@/api/request-modules/configure";
import { ResponseParams } from "@/types/response";
import { Ref, ref } from "vue";
import { RequestParams } from "@/types/request";
import { getSession } from "@/utils";
import { ElMessageBox, ElMessage } from "element-plus";
const dialogSyncVisible = ref(false);

const ruleSync = {
  src_env_id: [{ required: true, message: "请输入简要描述", trigger: "change" }],
  type: [{ required: true, message: "请选择开发语言", trigger: "change" }]
};
const formRefSync = ref<HTMLElement & { validate: (...args: Array<unknown>) => void; resetFields: () => void }>();
export default function useSyncUpdate(
  getData: (...args: any) => void,
  pageTableRef: Ref<HTMLElement & { getCurrentPage: () => void }>,
  dialogSyncParams: RequestParams.CreateSyncConfigList
): Record<string, any> {
  const handleSyncShowDialog = () => {
    dialogSyncVisible.value = true;
  };
  const handleCloseSyncDialog = () => {
    formRefSync.value!.resetFields();
    dialogSyncParams.name = "";
    dialogSyncParams.env = "";
    dialogSyncParams.src_env_id = 0;
    dialogSyncParams.type = 0;
    dialogSyncVisible.value = false;
  };
  const appDetailMsg = getSession("appDetail", true) as any;

  // 保存同步键值
  const handleSyncConfig = (tipMessage: (code: number) => void) => {
    formRefSync.value &&
      formRefSync.value.validate((valid: boolean) => {
        if (valid) {
          getConfigSync<ResponseParams.ResponseDataSuccess>(dialogSyncParams).then((res) => {
            tipMessage(res.code);
            getData(pageTableRef.value.getCurrentPage());
            dialogSyncVisible.value = false;
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
  };
  // 同步键值
  const handleSyncUpdate = (tipMessage: (code: number, value?: string) => void) => {
    const currentEnvironment = getSession("currentEnvironment", true) as any;
    const syncEnvlist = getSession("allTabSyncEnvList", true) as any;
    // 如果当前环境有一个，不能进行同步
    if (syncEnvlist && syncEnvlist.length) {
      dialogSyncParams.name = appDetailMsg.name;
      dialogSyncParams.type = 0;
      dialogSyncParams.appId = appDetailMsg.id;
      dialogSyncParams.env = currentEnvironment.name;
      dialogSyncParams.src_env_id = syncEnvlist[0].value;
      dialogSyncParams.envId = currentEnvironment.id * 1;
      dialogSyncVisible.value = true;
    } else {
      tipMessage(400, "暂无其它环境可同步，请新增环境");
    }
  };

  const handleDelete = (row: RequestParams.CreateAndUpdateConfigList) => {
    ElMessageBox.confirm("此操作将永久删除, 是否继续?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(() => {
        console.log(row.id);
        ElMessage({
          type: "success",
          message: "删除成功!"
        });
      })
      .catch(() => {
        ElMessage({
          type: "info",
          message: "已取消删除"
        });
      });
  };
  return {
    handleCloseSyncDialog,
    ruleSync,
    handleSyncShowDialog,
    dialogSyncVisible,
    dialogSyncParams,
    handleSyncConfig,
    formRefSync,
    handleSyncUpdate,
    handleDelete
  };
}
