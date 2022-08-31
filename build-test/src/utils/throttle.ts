/**
 * 节流
 */
import { getCurrentInstance } from "vue";

const throttle = (func: any, wait: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function () {
    const context = getCurrentInstance();
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;
    if (!timeout) {
      timeout = setTimeout(() => {
        timeout = null;
        func.apply(context, args);
      }, wait);
    }
  };
};
export default throttle;
