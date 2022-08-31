// 列表数组数据
export interface TableData {
  index: number;
  id: number | string;
  name: string;
  describe: string;
  status: boolean;
}
export interface PageParams {
  currentPage: number;
  pageSize: number;
}
export interface Options {
  id: number;
  productName?: string;
  productId?: number;
  status?: number;
}
