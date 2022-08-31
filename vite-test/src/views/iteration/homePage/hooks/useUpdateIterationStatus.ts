import { updateIterationStatus } from "@/api/request-modules/iteration";
import { ResponseParams } from "@/types/response";
import { ref } from "vue";
import router from "@/router";
import { STATUS } from "@/utils/index";
export default function useUpdateIterationStatus(tipMessage: (...args: Array<any>) => void): Record<string, any> {
  const REAL_STATUS = STATUS.slice();
  REAL_STATUS.pop();
  REAL_STATUS.shift();
  const status = ref(null);
  const updateStatusDialog = ref<boolean>(false);
  const changeUpdateIterationStatus = () => {
    updateStatusDialog.value = true;
  };
  const handleConfirmChange = () => {
    const params = Object.assign({ iteration_id: Number(router.currentRoute.value.query.id), status: status.value });
    updateIterationStatus<ResponseParams.ResponseDataSuccess>(params).then((res) => {
      tipMessage(res.code);
      updateStatusDialog.value = false;
      status.value = null;
    });
  };
  return {
    REAL_STATUS,
    changeUpdateIterationStatus,
    updateStatusDialog,
    handleConfirmChange,
    status
  };
}
