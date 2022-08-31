import { replaceProductId } from "@/views/iteration/useMixin";
import { onActivated, onDeactivated, onUnmounted, watch, WatchStopHandle } from "vue";

/**
 * 切换导航栏首部的mixins
 */
type HandleConditionSearch = (...args: Array<any>) => void;
type WatchCallBack = (...args: Array<unknown>) => void;
export default function useWatchChangeProduct(handleConditionSearch: HandleConditionSearch, watchCallback: WatchCallBack): void {
  const { productId } = replaceProductId();
  // 组件被激活重新搜索。替换路由参数
  onActivated(() => {
    handleConditionSearch();
    replaceProductId();
    createWatch();
  });

  // 监听切换项目名称
  let unwatch: WatchStopHandle;
  const unwatchs = [] as Array<WatchStopHandle>;
  const createWatch = () => {
    unwatch = watch(
      () => productId.value,
      (newValue) => {
        watchCallback(newValue);
      },
      {
        immediate: true
      }
    );
    unwatchs.push(unwatch);
  };
  createWatch();

  onDeactivated(() => {
    unwatchsFn();
  });
  onUnmounted(() => {
    unwatchsFn();
  });

  const unwatchsFn = () => {
    unwatchs.forEach((stopWatch) => {
      stopWatch();
    });
  };
}
