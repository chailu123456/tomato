<!--
 * @Author: 宋绍华
 * @Date: 2022-05-12 15:28:26
 * @LastEditTime: 2022-06-14 11:19:13
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\components\drawer\index.vue
-->
<template>
  <el-drawer custom-class="drawer" :close-on-press-escape="false" :modal="false" modal-class="rp-drawer" v-model="drawer" size="100%" :with-header="false">
    <div>
      <!-- 顶部标题栏 -->
      <div class="drawer-top">
        <div class="drawer-top-left">
          <el-icon @click="closeModal" class="drawer-icon-back"><DArrowRight /></el-icon> <span class="drawer-top-title">{{ headerTitle }}</span>
        </div>
        <div class="drawer-top-right" v-if="!currentRt.id">
          <div v-if="!hasBtnSlot">
            <el-button plain @click="handleDrawer('cancel')">取消</el-button>
            <el-button plain @click="handleDrawer('save')" debounce type="primary">保存</el-button>
          </div>
          <slot name="btn" :data="currentRt" v-else></slot>
        </div>
      </div>
      <div style="height: 100%; width: 100%" v-loading="loading">
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
                  :maxlength="50"
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
import RichText from "./rich-text.vue";
import Dynamic from "./dynamic.vue";
import VueEvent from "@/utils/mitt";
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

watch(
  () => props,
  () => {
    const { headerTitle, id, title, rich, rich2, richStatus, rich2Status, statusList, placeholder } = props;
    currentRt.headerTitle = headerTitle;
    currentRt.id = id;
    currentRt.title = title;
    currentRt.rich = rich;
    currentRt.rich2 = rich2;
    currentRt.richStatus = richStatus;
    currentRt.rich2Status = rich2Status;
    currentRt.status_list = statusList;
    currentRt.placeholder = placeholder;
    if (timer) clearTimeout(timer);
    if (!props.id) {
      timer = setTimeout(() => {
        input.value?.focus();
      }, 1000);
    }
  },
  {
    deep: true
  }
);

watch(
  () => props.id,
  (newId, oldId) => {
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
  }
);

// const drawerUncloseable = (e: any) => {
//   const classname = "js-drawer-uncloseable";
//   try {
//     if (e.target.className.indexOf(classname) > -1 || e.target.closest(`.${classname}`)) {
//       console.log("该点击区域不自动关闭抽屉");
//     } else {
//       e.stopPropagation();
//       closeModal();
//     }
//   } catch (err) {
//     console.log("该点击区域目标对象不为html元素");
//   }
// };

// 关闭弹窗
const closeModal = () => {
  emit("update:drawer", false);
};

// 处理富文本编辑器
const handleRich = (type: "save" | "cancel" | "toggle" | "html", who: "rich" | "rich2", data: string) => {
  if (type === "save") {
    currentRt[who] = data;
    if (currentRt[`${who}Status`] === "edit") {
      currentRt[`${who}Status`] = "view";
    }
    currentRt.who = who;
    handleDrawer("save", who);
  } else if (type === "toggle") {
    currentRt[`${who}Status`] = currentRt[`${who}Status`] === "edit" ? "view" : "edit";
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
    }
  }
}

:global(.drawer .el-drawer__body) {
  padding: 0;
  display: flex;
  flex-direction: column;
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

<style lang="less">
.rp-drawer {
  position: fixed;
  inset: 0px;
  width: 80%;
  left: 20% !important;
}
</style>
