// import defaultLang from "@/locales/lang/en";
// import { reactive, ref, Ref } from "vue";
// const cn = require("@/locales/lang/zh-cn");
// const en = require("@/locales/lang/en");
// const tw = require("@/locales/lang/zh-tw");
// const ja = require("@/locales/lang/ja");
// // // type R = typeof defaultLang;
// // /**
// //  *
// //  * @param l 语言 zh-cn zh-tw.....
// //  */
// // const locale = (l: string): void => {
// //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
// //   lang = require("@/locales/lang/" + l);
// //   // t("router.allVersions", lang.default);
// // };

// const lang = reactive({
//   "zh-cn": cn,
//   en: en,
//   "zh-tw": tw,
//   ja: ja
// });
// /**
//  *
//  * @param str 文字字符串
//  */
// // const t = (path: string, lang: typeof defaultLang): string => {
// //   let current = lang || defaultLang;
// //   const array = path.split(".");
// //   const value: Ref = ref("");
// //   for (let i = 0; i < array.length; i++) {
// //     const property = array[i] as string;
// //     value.value = (current as any)[property] as string;
// //     current = value.value as any;
// //   }
// //   return value.value || "";
// // };

// const languageMap = {
//   中文: "zh-cn",
//   English: "en",
//   "中文(繁体)": "zh-tw",
//   日本語: "ja"
// };
// export { t, languageMap, locale };
