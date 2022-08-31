export interface Pagation {
  pageIndex: number;
  pageSize: number;
}
export default function usePagation(cb: (pageIndex: number, pageSize: number, data?: Record<string, any>) => void, data?: Record<string, any>): any {
  const response = (pagationParams?: Pagation) => {
    pagationParams = pagationParams || { pageIndex: 1, pageSize: 20 };
    const { pageIndex, pageSize } = pagationParams;
    return cb && cb(pageIndex, pageSize, data);
  };
  return {
    response
  };
}
