export type UploadStatus = "ready" | "uploading" | "success" | "fail";

export type UploadResponse = {
  file_type: string;
  filename: string;
  url: string;
  width: number;
  height?: number;
  size?: number;
};
export type UploadFile = {
  name: string;
  percentage?: number;
  status: UploadStatus;
  size: number;
  response?: UploadResponse;
  uid: number;
  url?: string;
  raw: ElFile;
};

export interface ElFile extends File {
  uid: number;
}

export const UploadImgStatus = {
  success: "success",
  fail: "fail"
};
