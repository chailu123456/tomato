import { App } from "vue";
import ProgressBar from "./progressBar/index.vue";
// import WangEditor from "./wangEditor/index.vue";
import RpCalendar from "./expand/calendar/index.vue";
import Pagination from "./pagination/index.vue";
import PageTable from "./pageTable/index.vue";
import BackBtn from "./back-btn/index.vue";
import SelectTree from "./select-tree/index.vue";
import Tab from "./tab/index.vue";
const componentsLists = [ProgressBar, RpCalendar, Pagination, PageTable, BackBtn, SelectTree, Tab];
export const registerGlobComp = (app: App): void => {
  componentsLists.forEach((comp) => {
    if (comp.name) {
      app.component(comp.name, comp);
    } else {
      console.error("组件未定义name！");
    }
  });
};
