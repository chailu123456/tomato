// eslint-disable-next-line
import Vue from "vue";

declare global {
  interface ResponseData<T = unknown> {
    code?: number;
    data?: T;
    error?: string;
    message?: string;
    [key: string]: unknown;
  }
  interface HookReturnValue {
    [key: string]: any;
  }
  interface Window {
    WwLogin: (...args) => void;
  }
}
