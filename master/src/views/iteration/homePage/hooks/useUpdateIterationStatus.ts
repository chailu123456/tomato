/*
 * @Author: 宋绍华
 * @Date: 2022-05-30 17:58:03
 * @LastEditTime: 2022-06-01 17:09:54
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\iteration\homePage\hooks\useUpdateIterationStatus.ts
 */
import { updateIterationStatus, reductionIterationStatus } from "@/api/request-modules/iteration";
import { ResponseParams } from "@/types/response";
import { ref, watch, computed } from "vue";
import { STATUS } from "@/utils/index";
import { useStore } from "@/store/index";

export default function useUpdateIterationStatus(
  tipMessage: (...args: Array<any>) => void,
  result: Record<string, any>,
  getIterationDetail: (...args: Array<any>) => void
): Record<string, any> {
  const REAL_STATUS = [...STATUS];
  REAL_STATUS.forEach((v: Record<string, any>) => {
    if (v.value !== -1 && v.value > 3 && v.value !== 7) {
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

  const store = useStore();
  const currentIter = computed(() => store.getters.currentIter);

  const updateStatusDialog = ref<boolean>(false);
  const changeUpdateIterationStatus = (e: any) => {
    let target = e.target;
    if (target.nodeName == "SPAN" || target.nodeName == "I") {
      target = e.target.parentNode;
    }
    target.blur();
    updateStatusDialog.value = true;
  };
  const handleConfirmStatusChange = () => {
    if (checkInterStatus.value) {
      reductionIterationStatus<ResponseParams.ResponseDataSuccess>({ iteration_id: currentIter.value?.id }).then((res) => {
        if (res.code === 200) {
          tipMessage(res.code);
        }
        getIterationDetail(currentIter.value?.id);
        updateStatusDialog.value = false;
        checkInterStatus.value = false;
      });
      return;
    }
    const params = Object.assign({ iteration_id: currentIter.value?.id, status: status.value });
    updateIterationStatus<ResponseParams.ResponseDataSuccess>(params).then((res) => {
      if (res.code === 200) {
        tipMessage(res.code);
      }
      updateStatusDialog.value = false;

      getIterationDetail(currentIter.value?.id);
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
