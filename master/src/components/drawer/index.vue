<!--
 * @Author: 宋绍华
 * @Date: 2022-05-12 15:28:26
 * @LastEditTime: 2022-08-18 11:15:20
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\components\drawer\index.vue
-->
<template>
  <el-drawer
    custom-class="drawer"
    :modal="false"
    v-model="drawer"
    size="100%"
    :with-header="false"
    :close-on-press-escape="false"
    :modal-class="`rp-drawer-${toPoint(widthPercent) * 100}`"
  >
    <div style="height: 100%">
      <!-- 顶部标题栏 -->
      <div class="drawer-top">
        <div class="drawer-top-left">
          <el-icon @click="closeModal" class="drawer-icon-back">
            <DArrowRight />
          </el-icon>
          <span class="drawer-top-title">{{ headerTitle }}</span>
        </div>
        <div class="drawer-top-right" v-if="!currentRt.id">
          <div v-if="!hasBtnSlot">
            <el-button plain @click="handleDrawer('cancel')">取消</el-button>
            <el-button plain @click="handleDrawer('save')" debounce type="primary">保存</el-button>
          </div>
          <slot name="btn" :data="currentRt" v-else></slot>
        </div>
        <div class="drawer-top-right" v-else>
          <!-- 这里是抽屉的设置功能 -->
          <SettingWidth :widthPercent="widthPercent" @change="changeWidthPercent"></SettingWidth>
        </div>
      </div>
      <div style="height: calc(100% - 40px); width: 100%; overflow: hidden" v-loading="loading">
        <transition name="fade">
          <!-- 主体部分 -->
          <div class="drawer-body">
            <div class="drawer-body-left" id="drawer-body-left">
              <div class="drawer-body-left-title">
                <span class="drawer-body-left-title-num" :class="{ 'drawer-body-left-title-empty': !currentRt.id }">{{ currentRt.id || "" }}</span
                ><el-input
                  ref="input"
                  @focus="onMouseover"
                  @change="onChange"
                  @blur="onBlur"
                  debounce
                  :class="{ 'reset-select': !isHover && currentRt.id }"
                  class="drawer-body-left-title-input"
                  v-trim
                  v-model="currentRt.title"
                  placeholder="请输入标题，可简要概括功能"
                  @keyup.enter="onBlur"
                  :maxlength="maxlength"
                ></el-input>
              </div>
              <slot name="associate"></slot>
              <RichText @handleRich="handleRich" :html="currentRt.rich" :placeholder="currentRt.placeholder" :status="currentRt.richStatus" type="rich" />
              <RichText @handleRich="handleRich" :html="currentRt.rich2" :status="currentRt.rich2Status" type="rich2" class="rich2" title="备注" />
              <Dynamic v-if="currentRt.status_list.length" :list="currentRt.status_list" />
            </div>
            <div class="drawer-body-right"><slot name="form"></slot></div>
          </div>
        </transition>
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts">
import { defineProps, defineEmits, reactive, watch, useSlots, computed, ref } from "vue";
import { DArrowRight } from "@element-plus/icons";
import { toPoint, toPercent } from "@/utils";
import RichText from "./rich-text.vue";
import Dynamic from "./dynamic.vue";
import VueEvent from "@/utils/mitt";
import SettingWidth from "./setting.vue";
import { setSession, getSession } from "@/utils/sesssion";
import { debounce } from "lodash";

export interface DrawerRt {
  headerTitle: string;
  id: number;
  title: string;
  rich: string;
  rich2: string;
  richStatus: string;
  rich2Status: string;
  status_list: any;
  who?: string;
}
export default {
  name: "drawer"
};
</script>

<script lang="ts" setup>
const emit = defineEmits(["update:drawer", "onHandle"]);
const props = defineProps({
  maxlength: {
    type: Number,
    default: 50
  },
  drawer: {
    type: Boolean,
    default: false
  },
  id: {
    type: Number,
    default: null
  },
  headerTitle: {
    type: String,
    default: "新增"
  },
  title: {
    type: String,
    default: ""
  },
  rich: {
    type: String,
    default: ""
  },
  rich2: {
    type: String,
    default: ""
  },
  // 动态列表、时间线
  statusList: {
    type: Array,
    default: () => []
  },
  richStatus: {
    // 三种状态，view, add, edit
    type: String,
    default: "view"
  },
  rich2Status: {
    // 三种状态，view, add, edit
    type: String,
    default: "view"
  },
  placeholder: {
    type: String,
    default: "请输入正文"
  },
  loading: {
    type: Boolean,
    default: false
  }
});
const currentRt = reactive<{
  headerTitle: string;
  id: number;
  title: string;
  rich: string;
  rich2: string;
  richStatus: string;
  rich2Status: string;
  status_list: any;
  who?: string;
  placeholder?: string;
}>({
  headerTitle: props.headerTitle,
  id: props.id,
  title: props.title || "",
  rich: props.rich,
  rich2: props.rich2,
  richStatus: props.richStatus,
  status_list: props.statusList,
  rich2Status: props.rich2Status,
  placeholder: props.placeholder
});

const isHover = ref(false);
const input = ref();
const hasBtnSlot = computed(() => useSlots().btn);
let timer: ReturnType<typeof setTimeout>;
let timer2: ReturnType<typeof setTimeout>;
let widthPercent = ref<string>(toPercent(0.8)); // 当前宽度的百分比
let currentRichStatus = "";
let currentRich2Status = "";
let isSameId = true;

watch(
  () => props,
  debounce(() => {
    const { headerTitle, id, title, rich, rich2, richStatus, rich2Status, statusList, placeholder } = props;
    currentRt.headerTitle = headerTitle;
    currentRt.id = id;
    currentRt.title = title;
    currentRt.rich = rich;
    currentRt.rich2 = rich2;
    // 新增状态持续保持
    if (richStatus === "add") {
      currentRt.richStatus = "add";
    } else {
      // 如果是是可编辑的状态
      if (currentRichStatus === "edit" && isSameId) {
        currentRt.richStatus = "edit";
      } else {
        currentRt.richStatus = richStatus;
      }
    }
    // 新增状态持续保持
    if (rich2Status === "add") {
      currentRt.rich2Status = "add";
    } else {
      // 如果是是可编辑的状态
      if (currentRich2Status === "edit" && isSameId) {
        currentRt.rich2Status = "edit";
      } else {
        currentRt.rich2Status = rich2Status;
      }
    }

    currentRt.status_list = statusList;
    currentRt.placeholder = placeholder;
    if (timer) clearTimeout(timer);
    if (!props.id) {
      timer = setTimeout(() => {
        input.value?.focus();
      }, 1000);
    }
  }, 100),
  {
    deep: true
  }
);
let pageTable = ref();
// 接受table组件的方法用于抽屉关闭取消选中颜色
VueEvent.on("pageTableMethods", (val) => {
  pageTable.value = val;
});

watch(
  () => props.id,
  (newId, oldId) => {
    // 编辑时，获取文本状态需要用到
    if (oldId) {
      isSameId = newId === oldId;
    }
    if (newId && oldId && newId !== oldId) {
      // 滚动到顶部
      if (timer2) clearTimeout(timer2);
      timer2 = setTimeout(() => {
        // 需要延时执行，要不然drawer动画抖动厉害
        document.querySelector(".drawer-top")?.scrollIntoView();
      }, 300);
    }
  }
);

watch(
  () => props.drawer,
  (newValue) => {
    //  调用事件
    VueEvent.emit("drawStatus", newValue);
    if (newValue) {
      if (getSession("drawerWidthPercent") as string) {
        widthPercent.value = getSession("drawerWidthPercent");
      }
      // setTimeout(() => document.addEventListener("click", outSideClickClose, false), 400);
    } else {
      // setTimeout(() => document.removeEventListener("click", outSideClickClose), 400);
      pageTable.value?.setCurrentRow();
    }
  },
  {
    immediate: true
  }
);

// const outSideClickClose = (e: any) => {
//   const { clientX, clientY } = e;
//   const maxX = document.body.clientWidth;
//   const maxY = document.body.clientHeight;
//   const isRangeX = clientX > 0 && clientX < maxX * (1 - toPoint(widthPercent.value));
//   const isRangeY = clientY > 0 && clientY < maxY;
//   if (isRangeX && isRangeY && props.drawer) {
//     e.stopPropagation();
//     closeModal();
//   }
// };

// 关闭弹窗
const closeModal = () => {
  // document.removeEventListener("click", outSideClickClose);
  emit("update:drawer", false);
};

// 修改宽度百分比
const changeWidthPercent = (val: string) => {
  widthPercent.value = val;
  setSession("drawerWidthPercent", val);
};

// 处理富文本编辑器
const handleRich = (type: "save" | "cancel" | "toggle" | "html", who: "rich" | "rich2", data: string) => {
  if (type === "save") {
    currentRt[who] = data;
    if (currentRt[`${who}Status`] === "edit") {
      currentRt[`${who}Status`] = "view";
    }
    currentRt.who = who;
    if (who === "rich") {
      currentRichStatus = "view";
    } else {
      currentRich2Status = "view";
    }

    handleDrawer("save", who);
  } else if (type === "toggle") {
    currentRt[`${who}Status`] = currentRt[`${who}Status`] === "edit" ? "view" : "edit";
    if (who === "rich") {
      currentRichStatus = currentRt[`${who}Status`];
      isSameId = currentRichStatus === "edit";
    } else {
      currentRich2Status = currentRt[`${who}Status`];
      isSameId = currentRich2Status === "edit";
    }
  } else {
    currentRt[who] = data;
  }
};

// 保存
const handleDrawer = (type: "save" | "cancel", who?: "rich" | "rich2" | "title") => {
  emit("onHandle", type, currentRt, who);
};

const onMouseover = () => {
  isHover.value = true;
  input.value.focus();
};

const onBlur = () => {
  isHover.value = false;
};

const onChange = () => {
  isHover.value = false;
  if (!props.id || props.title === currentRt.title) return;
  handleDrawer("save", "title");
};
</script>
<style lang="less" scoped>
.drawer {
  display: flex;
  flex-direction: column;
  padding: 0;
  &-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #ddd;
    height: 40px;

    &-left {
      height: 40px;
      line-height: 40px;
      display: flex;
    }

    &-title {
      margin-left: 15px;
      font-size: 15px;
      color: #666;
    }

    &-right {
      margin-right: 15px;
    }
  }

  &-icon {
    &-back {
      height: 100%;
      width: 50px;
      border-right: 1px solid #ddd;
      color: var(--el-color-primary);
      cursor: pointer;
    }
  }

  &-body {
    height: 100%;
    flex: 1;
    display: flex;
    overflow: hidden;

    &-left {
      flex: 5;
      overflow-y: scroll;
      border-right: 1px solid #ddd;
      padding: 15px;

      &-title {
        margin-bottom: 15px;
        display: flex;
        align-items: center;

        &-num {
          width: 40px;
          height: 24px;
          line-height: 24px;
          text-align: center;
          border: 1px solid #ddd;
          border-radius: 5px;
          margin-right: 10px;
          font-size: 12px;
          padding: 0 2px;
        }
        :deep(.el-input__inner) {
          font-size: 16px;
        }

        &-empty {
          background-color: #a99e9e;
        }
      }
    }
    &-right {
      padding: 15px;
      flex: 2;
      overflow-y: scroll;
      max-width: 400px;
    }
  }
}

:global(.drawer .el-drawer__body) {
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:global(.rich2 .editor .w-e-text-container) {
  min-height: 200px !important;
  max-height: 100% !important;
}

:global(.drawer .el-input__inner) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
