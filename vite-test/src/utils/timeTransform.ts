import dayjs from "dayjs";

export const defaultPlaceholder = "--";

/**
 * 日期相关
 */
export const dateTimeFormatRfc3339 = "YYYY-MM-DDTHH:mm:ssZ";

function dateTimeFormat(value?: string, format?: string, defaultText: string = defaultPlaceholder): string {
  if (value) {
    return dayjs(value).format(format);
  }
  return defaultText;
}

export function dateTime(value?: string, defaultText: string = defaultPlaceholder): string {
  return dateTimeFormat(value, "YYYY-MM-DD HH:mm:ss", defaultText);
}

export function date(value?: string, defaultText: string = defaultPlaceholder): string {
  return dateTimeFormat(value, "YYYY-MM-DD", defaultText);
}

export function dateMonth(value?: string, defaultText: string = defaultPlaceholder): string {
  return dateTimeFormat(value, "YYYY-MM", defaultText);
}

export function toRfc3339String(value?: dayjs.ConfigType): string | null {
  if (!value) {
    return null;
  }
  return dayjs(value).format(dateTimeFormatRfc3339);
}
