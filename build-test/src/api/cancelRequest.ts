import axios from "axios";

// 声明一个 Map 用于存储每个请求的标识 和 取消函数
const pending = new Map();

export const addPending = (config: Record<string, any>): void => {
  const url = [config.method, config.url, JSON.stringify(config.params)].join("&");
  config.cancelToken =
    config.cancelToken ||
    new axios.CancelToken((cancel) => {
      if (!pending.has(url)) {
        // 如果 pending 中不存在当前请求，则添加进去
        pending.set(url, cancel);
      }
    });
};

/**
 * 移除请求
 * @param {Object} config
 */
export const removePending = (config: Record<string, any>): void => {
  const url = [config.method, config.url, JSON.stringify(config.params)].join("&");

  if (pending.has(url)) {
    // 如果在 pending 中存在当前请求标识，需要取消当前请求，并且移除
    const cancel = pending.get(url);
    cancel({ url, isCancel: true, error: "手动取消" });
    pending.delete(url);
  }
};

/**
 * 批量移除请求
 *
 */
export const clearPending = (): void => {
  for (const [url, cancel] of pending) {
    cancel(url);
  }
  pending.clear();
};
