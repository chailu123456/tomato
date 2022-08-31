/*
 * @Author: 宋绍华
 * @Date: 2022-05-30 17:58:02
 * @LastEditTime: 2022-06-07 12:10:41
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\components\index.ts
 */
import { App } from "vue";
import ProgressBar from "./progressBar/index.vue";
// import WangEditor from "./wangEditor/index.vue";
import RpCalendar from "./expand/calendar/index.vue";
import Pagination from "./pagination/index.vue";
import PageTable from "./pageTable/index.vue";
import BackBtn from "./back-btn/index.vue";
import SelectTree from "./select-tree/index.vue";
import Tab from "./tab/index.vue";
import SearchForm from "./searchForm/index.vue";
import RelativeDialog from "./relative-dialog/index.vue";
import PriorityPopup from "./priorityPopup/index.vue";
import SearchCascader from "./search-cascader/index.vue";

const componentsLists = [ProgressBar, RpCalendar, Pagination, PageTable, BackBtn, SelectTree, Tab, SearchForm, RelativeDialog, PriorityPopup, SearchCascader];
export const registerGlobComp = (app: App): void => {
  componentsLists.forEach((comp) => {
    if (comp.name) {
      // @ts-ignore
      app.component(comp.name, comp);
    } else {
      console.error("组件未定义name！");
    }
  });
};
