import { getCurrentInstance } from "vue";

export default function useGlobalProperties(): Record<string, any> {
  const internalInstance = getCurrentInstance();
  const global: any = internalInstance?.appContext.config.globalProperties;
  return { global };
}
