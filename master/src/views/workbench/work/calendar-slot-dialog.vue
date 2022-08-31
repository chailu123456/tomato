<template>
  <div class="calendar-slot-tips">
    <el-dialog custom-class="calendar-slot-tips" v-model="visible" width="500px" append-to-body :show-close="false" :before-close="beforeClose">
      <p class="calendar-slot-tips__title">
        <span class="calendar-slot-tips__tag" :class="`calendar-slot-tips__tag-${dialogCurItem?.type}`">{{ dialogCurItem?.typeName }}</span
        >{{ dialogCurItem?.name }}
      </p>
      <span v-if="dialogCurItem?.remark">{{ dialogCurItem?.remark }}</span>
      <div class="calendar-slot-tips__body">
        <p v-for="item in dialogCurItem?.detailArr" :key="item.id">
          <span class="calendar-slot-tips__body-label" v-if="item.value">{{ item.label }}：</span>
          <span v-if="item.type !== 'time'" :style="`color: ${item.color}`">{{ item.value }}</span>
          <template v-else>
            <span :style="[item.index === 0 || item.index === 2 ? `color: ${item.color}` : '']">{{ item.value[0] }}</span>
            至
            <span :style="[item.index === 1 || item.index === 2 ? `color: ${item.color}` : '']">{{ item.value[1] }}</span>
          </template>
        </p>
      </div>
      <template #footer>
        <div class="calendar-slot-tips__footer">
          <el-button
            @click="handleBtns(btn.id)"
            v-for="btn in dialogCurItem?.btns"
            :disabled="btn.disabled"
            :key="btn.id"
            class="calendar-slot-tips__footer-icon"
            type="text"
            icon="el-icon-circle-check"
            >{{ btn.label }}</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import useDashboard from "@/composables/useDashboard";
import type { BackLogItemInter, BugItemInter, DialogType, IterationItemInter, TaskItemInter } from "@/composables/useDashboard";
import router from "@/router";
import { BUG_LEVEL, BUG_STATUS, ENVLIST, PRIORITY, STATUS, TASK_TYPE } from "@/utils/contantOptions";
import dayjs from "dayjs";
import VueEvent from "@/utils/mitt";
import { ElMessage, ElMessageBox } from "element-plus";
import { ref, defineProps, reactive, watch, defineEmits, computed } from "vue";
import type { PropType } from "vue";
import { searchParams, productId, demandList, setCache } from "@/views/iteration/useMixin";
import useGetDemandList from "@/views/iteration/useGetDemandList";
import { getSession, updateProjectCache } from "@/utils";
export default {
  name: "calendar-slot-dialog"
};
import { USER } from "@/store/state";
import { store } from "@/store";
import { MutationType } from "@/store/mutation-types";
</script>

<script lang="ts" setup>
const emit = defineEmits(["update:tipsVisible", "handleItem", "updateData"]);
const props = defineProps({
  tipsVisible: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object as PropType<BackLogItemInter | IterationItemInter | TaskItemInter | BugItemInter>,
    default: () => ({})
  },
  type: {
    type: Number,
    default: 0
  },
  personInfo: {
    type: Object,
    default: () => ({})
  }
});
const dialogType: DialogType[] = ["iteration", "task", "bug", "abeyancen"];
const dialogCurItem = ref();
const dialogOpts = reactive({
  abeyancen: {
    name: "",
    remark: "",
    type: "abeyancen",
    typeName: "待办",
    detailArr: [
      {
        id: 0,
        label: "参与人",
        value: ""
      },
      {
        id: 1,
        label: "时间",
        type: "time",
        value: "",
        color: "",
        index: 0
      },
      {
        id: 2,
        label: "提醒",
        value: ""
      },
      {
        id: 3,
        label: "重复",
        value: ""
      }
    ],
    btns: [
      {
        id: 0,
        label: "完成",
        icon: "circle-check",
        disabled: false
      },
      {
        id: 1,
        label: "编辑",
        icon: "edit",
        disabled: false
      },
      {
        id: 2,
        label: "删除",
        icon: "delete",
        disabled: false
      }
    ]
  },
  task: {
    name: "",
    type: "task",
    typeName: "任务",
    detailArr: [
      {
        id: 0,
        label: "迭代",
        value: ""
      },
      {
        id: 1,
        label: "时间",
        type: "time",
        value: "",
        color: "",
        index: 0
      },
      {
        id: 2,
        label: "工时",
        value: ""
      },
      {
        id: 3,
        label: "优先级",
        value: "",
        color: ""
      },
      {
        id: 4,
        label: "状态",
        value: "",
        color: ""
      }
    ],
    btns: [
      {
        id: 3,
        label: "完成",
        icon: "circle-check",
        disabled: false
      },
      {
        id: 4,
        label: "详情",
        icon: "view",
        disabled: false
      },
      {
        id: 5,
        label: "删除",
        icon: "delete",
        disabled: false
      }
    ]
  },
  iteration: {
    name: "",
    type: "iteration",
    typeName: "迭代",
    detailArr: [
      {
        id: 0,
        label: "项目",
        value: ""
      },
      {
        id: 1,
        label: "开发",
        value: "",
        type: "time",
        color: "",
        index: 0
      },
      {
        id: 2,
        label: "联调",
        value: "",
        type: "time",
        color: "",
        index: 0
      },
      {
        id: 3,
        label: "测试",
        value: "",
        type: "time",
        color: "",
        index: 0
      },
      {
        id: 4,
        label: "进度",
        value: "",
        color: ""
      }
    ],
    btns: [
      {
        id: 6,
        label: "查看详情",
        icon: "view",
        disabled: false
      }
    ]
  },
  bug: {
    name: "",
    type: "bug",
    typeName: "BUG",
    detailArr: [
      {
        id: 0,
        label: "迭代",
        value: ""
      },
      {
        id: 1,
        label: "时间",
        value: ""
      },
      {
        id: 2,
        label: "环境",
        value: ""
      },
      {
        id: 3,
        label: "级别",
        value: "",
        color: ""
      },
      {
        id: 4,
        label: "状态",
        value: ""
      }
    ],
    btns: [
      {
        id: 7,
        label: "解决",
        icon: "circle-check"
      },
      {
        id: 8,
        label: "详情",
        icon: "view"
      }
    ]
  }
});
const user = getSession("user", true) as USER;
const { noticeOpts, repeatOpt, useHandleBackLogStatus, useHandleTaskStatus, useUpdateBugStatus, useDelCalenderBackLog } = useDashboard();
// 不要删掉这个，如果这样转，生产会报错
const visible = computed(() => props.tipsVisible);
watch(
  () => props.tipsVisible,
  (newVal) => {
    if (newVal) {
      fillInDatas();
    }
  }
);

const handleBtns = async (index: number) => {
  let isSucc = true;
  const day = props.personInfo?.day;
  const month = day ? dayjs(day).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
  switch (index) {
    case 0: // 待办完成
      {
        const { id, status } = props.item;
        // 0 待办，1， 完成，2 删除
        if (status > 0) return;
        isSucc = await handleBackLogStatus(id!, 1, month);
      }
      break;
    case 1: // 待办编辑
      emit("handleItem", { ...props.item, type: 4, target_id: props.item.id });
      emit("update:tipsVisible", false);
      return;
    case 2: // 待办删除
      {
        const { id, is_repeat, name } = props.item;
        isSucc = false;
        ElMessageBox.confirm(name, "删除", {
          confirmButtonText: "删除将来所有的事件",
          cancelButtonText: "仅删除此事件",
          showConfirmButton: is_repeat > 0,
          distinguishCancelAndClose: true,
          callback: async (action: any) => {
            if (action === "confirm" || action === "cancel") {
              isSucc = await delCalenderBackLog(id!, action === "confirm" ? 2 : 1, month);
              if (!isSucc) return;
              VueEvent.emit("refreshBacklog");
            }
            beforeClose();
          }
        });
      }
      break;
    case 3: // 任务完成
      {
        const { id } = props.item;
        isSucc = await handleTaskStatus(id!, 2);
      }
      break;
    case 4: // 任务详情
      {
        // 设置当前项目和迭代
        if (productId.value === props.item?.product_id) {
          // 同一个项目内切换迭代id
          searchParams.demand = props.item?.iteration_id;
          store.commit(MutationType.updateIterateId, props.item?.iteration_id);
        } else {
          // 跨项目
          // @ts-ignore
          if (props.item?.product_id) {
            // @ts-ignore
            productId.value = props.item?.product_id;
            // 设置项目缓存
            // @ts-ignore
            updateProjectCache(props.item);
            store.commit(MutationType.updateProductId, props.item?.product_id);
            store.commit(MutationType.updateProductInfo);

            const getDemandList = useGetDemandList();
            // @ts-ignore
            getDemandList(props.item?.product_id).then((res) => {
              demandList.value = res;
              // @ts-ignore
              searchParams.demand = props.item?.iteration_id;
              store.commit(MutationType.updateIterateId, searchParams.demand);
            });
          }
        }
        // @ts-ignore
        if (props.item?.iteration_id) {
          // @ts-ignore
          setCache(props.item?.iteration_id);
          // @ts-ignore
          store.commit(MutationType.updateIterateId, props.item?.iteration_id);
        }
        router.push({
          name: "exploitation",
          query: {
            productId: props.item?.product_id,
            iteration_id: props.item?.iteration_id,
            name: props.item?.name
          }
        });
      }
      break;
    case 5: // 任务删除
      {
        const { id } = props.item;
        isSucc = false;
        ElMessageBox.confirm("请确认是否删除该任务？", "删除", {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "error",
          callback: async (action: any) => {
            if (action === "confirm") {
              isSucc = await handleTaskStatus(id!, 999);
              if (!isSucc) return;
              VueEvent.emit("refreshBacklog");
              beforeClose();
            }
          }
        });
      }
      break;
    case 6: // 迭代详情
      {
        // 设置当前项目和迭代
        if (productId.value === props.item?.product.id) {
          // 同一个项目内切换迭代id
          // @ts-ignore
          searchParams.demand = props.item?.id;
          store.commit(MutationType.updateIterateId, searchParams.demand);
        } else {
          // 跨项目
          if (props.item?.product.id) {
            productId.value = props.item?.product.id;
            // 设置项目缓存
            updateProjectCache(props.item);
            store.commit(MutationType.updateProductId, props.item?.product.id);
            store.commit(MutationType.updateProductInfo);

            const getDemandList = useGetDemandList();
            getDemandList(props.item?.product.id).then((res) => {
              demandList.value = res;
              // @ts-ignore
              searchParams.demand = props.item?.id;
              store.commit(MutationType.updateIterateId, searchParams.demand);
            });
          }
        }
        if (props.item?.id) {
          setCache(props.item?.id);
          store.commit(MutationType.updateIterateId, props.item?.id);
        }
        router.push({ name: "homepage", query: { productId: props.item?.product_id } });
      }
      break;
    case 7: // bug 解决
      {
        const { id } = props.item;
        isSucc = await handleBugStatus(id!, 2);
      }
      break;
    case 8: // bug详情
      {
        router.push({
          name: "test",
          query: { id: props.item?.id }
        });
      }
      break;
  }
  if (isSucc) {
    VueEvent.emit("refreshBacklog");
    beforeClose();
  }
};

// 操作待办状态
const handleBackLogStatus = async (id: number, status: number, month: string) => {
  const data = await useHandleBackLogStatus({ id, status, month });
  ElMessage.success(data ? "操作成功" : "操作失败");

  return !!data;
};
// 删除待办
const delCalenderBackLog = async (id: number, type: number, month: string) => {
  const data = await useDelCalenderBackLog({ id, type, month });
  ElMessage.success(data ? "操作成功" : "操作失败");

  return !!data;
};

// 操作Task状态
const handleTaskStatus = async (id: number, status: number) => {
  const data = await useHandleTaskStatus({ ids: [id], status });
  ElMessage.success(data ? "操作成功" : "操作失败");
  return !!data;
};
// 操作Bug状态
const handleBugStatus = async (id: number, status: number) => {
  const data = await useUpdateBugStatus({ id, status });
  ElMessage.success(data ? "操作成功" : "操作失败");
  return !!data;
};

const beforeClose = () => {
  emit("updateData");
  emit("update:tipsVisible", false);
};

// 检测时间有效期
const timeCheck = (params: Record<string, any>, type: number) => {
  const colorDefault = "";
  const colorOne = "#ff0000";
  const curTime = dayjs().format("YYYY-MM-DD");
  if (!type) {
    // 先判断状态没有开始，status=0
    if (!params.status) {
      if (curTime >= params.begin_time) return colorOne;
    }
    if (params.status === 5 && !params.real_begin_time) {
      if (curTime >= params.begin_time) return colorOne;
    }
    // 直接选延期（即状态还未进行中）
    if (params.status === 4 && !params.real_begin_time) return colorOne;
    // 状态开始，判断实际开始时间是否大于预计开始
    if (params.real_begin_time && params.real_begin_time > params.begin_time) return colorOne;

    return colorDefault;
  } else {
    if (params.real_end_time && params.real_end_time > params.end_time) return colorOne;
    // 直接选延期（即状态还未进行中）
    if (params.status === 4 && !params.real_end_time) return colorOne;

    if (!params.real_end_time && params.end_time < curTime) return colorOne;
    return colorDefault;
  }
};

// 获取迭代节点名称
const getIterationNodeText = () => {
  // @ts-ignore
  const { test_time, union_time, release_time } = props.item;
  const test = new Date(test_time).getTime();
  const union = new Date(union_time).getTime();
  const release = new Date(release_time).getTime();
  const day = props.personInfo?.day;
  const now = new Date(day).getTime();

  if (now >= union && now < test) return "联调";
  else if (now >= test && now < release) return "测试";
  else if (now >= release) return "发布";
  return "开发";
};

// const stypeStatus = (it: Record<string, any>) => {
//   if (it.type !== 3) {
//     if (it.status === 4) return "#ff777e";
//     const currentTime = dayjs(`${new Date()}`).format("YYYY-MM-DD HH:mm:ss");
//     if (it.start_time < currentTime) return "#ff777e";
//     return "#000";
//   }
// };

const handlePercent = () => {
  // @ts-ignore
  const { complete_percent, time_percent } = props.item;
  return complete_percent - time_percent;
};

const getStatus = (index: number) => {
  const status = STATUS.find((v) => v.value === index);
  return status?.label;
};

// 预计开始时间：没有实际开始时间且当前时间大于预计开始标红，有实际开始且实际开始大于预计开始标红；
// 预计结束时间：没有实际结束且当前时间大于预计结束时间标红，有实际结束且实际结束大于预计结束标红；
const getaBeColor = (index = 0) => {
  const { start_time, end_time } = props.item;
  const now = Date.now();
  const start = new Date(start_time).getTime();
  const end = new Date(end_time).getTime();
  const arr = [start, end];
  return now > arr[index];
};

/***
 *  这里分为开发、联调、测试 三个阶段，每个阶段都有两个时间段
 * 开发阶段：用real_dev_time > dev_time， 标红
 * 联调阶段：用real_union_time > union_time，标红
 * 测试阶段：用real_test_time > test_time，标红
 */
const getIterColor = (index = 0, pos = 1) => {
  const { test_time, union_time, release_time, dev_time, real_dev_time, real_test_time, real_union_time, real_release_time } = props.item;
  const dev = new Date(dev_time).getTime();
  const test = new Date(test_time).getTime();
  const union = new Date(union_time).getTime();
  const release = new Date(release_time).getTime();
  const rDev = new Date(real_dev_time).getTime();
  const rTest = new Date(real_test_time).getTime();
  const rUnion = new Date(real_union_time).getTime();
  const rRelease = new Date(real_release_time).getTime();

  // 开发阶段
  if (pos === 1) {
    if (index === 0) return rDev > dev;
    return rDev > union;
  } else if (pos === 2) {
    // 联调阶段
    if (index === 0) return rUnion > union;
    return rUnion > test;
  } else if (pos === 3) {
    // 测试阶段
    if (index === 0) return rTest > test;
    return rTest > release;
  }

  return false;
};

// 回显数据
const fillInDatas = () => {
  const type = dialogType[props.type - 1];
  dialogCurItem.value = dialogOpts[type];
  switch (type) {
    case "abeyancen": // 待办
      {
        // @ts-ignore
        const { create_by, name, department, participant, remark, start_time, end_time, ahead_time_enum, is_repeat, status } = props.item;
        const n = dialogCurItem.value;
        n.name = name;
        n.remark = remark;
        n.btns[0].label = status === 3 ? "已完成" : "完成";
        n.btns[0].disabled = status === 1 ? true : false;
        n.btns[1].disabled = user?.staff_no !== create_by;
        n.btns[1].disabled = status === 1 ? true : false; // 已完成的待办不能编辑

        const l1 = participant.map((i: Record<string, any>) => i.staff_name).join("，");
        const l2 = department.map((i: Record<string, any>) => i.staff_name).join("，");
        n.detailArr[0].value = `${l1}${l2 ? `，${l2}` : ""}`;
        n.detailArr[1].value = [start_time, end_time];
        n.detailArr[1].color = getaBeColor() ? "#ff0000" : "";
        // 获取是否开始和结束都为true的集合
        const l = [getaBeColor(), getaBeColor(1)].filter((i) => i);
        n.detailArr[1].index = l.length > 1 ? 2 : l.indexOf(true);
        n.detailArr[2].value = noticeOpts[ahead_time_enum - 1].label;
        n.detailArr[3].value = repeatOpt[is_repeat].label;
      }
      break;
    case "task": // 任务
      {
        // @ts-ignore
        const { name, iteration_name, begin_time, end_time, hours, level, status } = props.item;
        const n = dialogCurItem.value;
        n.name = name;
        n.detailArr[0].value = iteration_name;
        // 任务已完成 or 已关闭
        n.btns[0].disabled = status === 2 || status === 3 ? true : false;

        const l1 = [timeCheck(props.item, 0), timeCheck(props.item, 1)].filter((i) => i);
        n.detailArr[1].color = l1.length ? "#ff0000" : "";
        n.detailArr[1].index = l1.length > 1 ? 2 : l1.indexOf("#ff0000");

        n.detailArr[1].value = [begin_time, end_time];
        n.detailArr[2].value = `${hours}h`;
        n.detailArr[3].value = PRIORITY[level - 1].value;
        n.detailArr[4].value = TASK_TYPE[status].label;
      }
      break;
    case "iteration": // 迭代
      {
        // @ts-ignore
        const { product, name, dev_time, test_time, union_time, release_time, complete_percent, status } = props.item;
        const n = dialogCurItem.value;
        const statusText = getStatus(status);
        n.name = `${getIterationNodeText()}-${name}`;
        n.detailArr[0].value = product?.name;
        n.detailArr[1].value = [dev_time, union_time];
        const l1 = [getIterColor(0), getIterColor(1)].filter((i) => i);
        n.detailArr[1].color = l1.length ? "#ff0000" : "";
        n.detailArr[1].index = l1.length > 1 ? 2 : l1.indexOf(true);

        n.detailArr[2].value = [union_time, union_time];
        const l2 = [getIterColor(0, 2), getIterColor(1, 2)].filter((i) => i);
        n.detailArr[2].color = l2.length ? "#ff0000" : "";
        n.detailArr[2].index = l2.length > 1 ? 2 : l2.indexOf(true);

        n.detailArr[3].value = [test_time, release_time];
        const l3 = [getIterColor(0, 3), getIterColor(1, 3)].filter((i) => i);
        n.detailArr[3].color = l3.length ? "#ff0000" : "";
        n.detailArr[3].index = l3.length > 1 ? 2 : l3.indexOf(true);

        n.detailArr[4].value = `${complete_percent}% (${statusText}，${handlePercent() >= 0 ? "提前" : "落后"} ${Math.abs(handlePercent())}%)`;
        n.detailArr[4].color = handlePercent() > 0 ? "#1F9F85" : "#ff0000";
      }
      break;
    case "bug": // bug
      {
        // @ts-ignore
        const { name, iteration_name, create_time, level, status, env } = props.item;
        const n = dialogCurItem.value;
        n.name = name;
        n.btns[0].label = status === 2 ? "已解决" : "解决";
        n.btns[0].disabled = status === 2 ? true : false;
        n.detailArr[0].value = iteration_name || "主干";
        n.detailArr[1].value = create_time;
        n.detailArr[2].value = ENVLIST[env - 1].value;
        n.detailArr[3].value = BUG_LEVEL[level - 1].label;
        n.detailArr[3].color = BUG_LEVEL[level - 1].color;
        n.detailArr[4].value = BUG_STATUS[status + 1].label;
      }
      break;
  }
};
</script>

<style lang="less" scoped>
.calendar-slot-tips {
  &__title {
    margin-top: -10px;
    font-weight: bold;
  }

  &__tag {
    // display: inline-block;
    background-color: #6890ec;
    // font-size: 12px;
    // color: #fff;
    // padding: 0 3px;
    // margin-right: 5px;
    margin-right: 10px;
    display: inline-block;
    padding: 0 7px;
    font-size: 12px;
    line-height: 18px;
    white-space: nowrap;
    border-radius: 10px;
    line-height: 18px;
    color: #fff;

    &-task {
      background-color: #7fad0a;
    }
    &-iteration {
      background-color: #344844;
    }
    &-bug {
      background-color: #ff777e;
    }
  }
  &__body {
    &-label {
      font-weight: bold;
    }
  }
  &__footer {
    display: flex;
    width: calc(100% - 10px);
    border-top: 1px solid #ddd;
    margin: 0 5px;
    &-icon {
      flex: 1;
      margin: 6px 0;
      border-radius: 0;
      transition: all 0.3s;

      border-right: 1px solid #ddd;
      &:last-child {
        border: none;
      }
    }
  }
}
</style>

<style lang="less">
.calendar-slot-tips {
  .el-dialog__header {
    border-bottom: none !important;
  }
  .el-dialog__body {
    padding: 0 20px;
  }

  .el-dialog__footer {
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
  }
}
</style>
