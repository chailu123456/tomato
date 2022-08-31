import { updateIterationStatus, reductionIterationStatus } from "@/api/request-modules/iteration";
import { ResponseParams } from "@/types/response";
import { ref, watch } from "vue";
import { STATUS } from "@/utils/index";
import { searchParams } from "../../useMixin";
export default function useUpdateIterationStatus(
  tipMessage: (...args: Array<any>) => void,
  result: Record<string, any>,
  getIterationDetail: (...args: Array<any>) => void
): Record<string, any> {
  const REAL_STATUS = [...STATUS];
  // REAL_STATUS.shift();
  REAL_STATUS.forEach((v: Record<string, any>) => {
    if (v.value !== -1 && v.value >= 3 && v.value !== 7) {
      v.disabled = true;
    }
  });
  const status = ref(null);
  watch(
    () => result.value,
    (newValue) => {
      status.value = newValue.status;
    },
    {
      deep: true
    }
  );
  const checkInterStatus = ref(false);
  watch(
    () => checkInterStatus.value,
    (newVal) => {
      checkInterStatus.value = newVal;
    }
  );

  const updateStatusDialog = ref<boolean>(false);
  const changeUpdateIterationStatus = () => {
    updateStatusDialog.value = true;
  };
  const handleConfirmStatusChange = () => {
    if (checkInterStatus.value) {
      reductionIterationStatus<ResponseParams.ResponseDataSuccess>({ iteration_id: searchParams.demand }).then((res) => {
        tipMessage(res.code);
        getIterationDetail(searchParams.demand);
        updateStatusDialog.value = false;
        checkInterStatus.value = false;
      });
      return;
    }
    const params = Object.assign({ iteration_id: searchParams.demand, status: status.value });
    updateIterationStatus<ResponseParams.ResponseDataSuccess>(params).then((res) => {
      tipMessage(res.code);
      updateStatusDialog.value = false;

      getIterationDetail(searchParams.demand);
    });
  };
  return {
    REAL_STATUS,
    changeUpdateIterationStatus,
    updateStatusDialog,
    handleConfirmStatusChange,
    status,
    checkInterStatus
  };
}
