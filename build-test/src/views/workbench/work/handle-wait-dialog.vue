<template>
  <el-dialog
    :before-close="handleDialog"
    :close-on-press-escape="false"
    append-to-body
    v-model="visible"
    custom-class="handle-wait-dialog"
    :title="reactiveItem.edit ? '编辑待办' : '新建待办'"
    width="500px"
  >
    <el-form ref="ruleFormRef" :model="form" label-position="left" label-width="60px">
      <el-form-item label-width="0" prop="name">
        <el-input v-model.trim="form.name" autofocus="autofocus" maxlength="50" placeholder="待办、日程、备忘名称"></el-input>
      </el-form-item>
      <el-form-item label-width="0" prop="remark">
        <el-input rows="3" type="textarea" maxlength="300" v-model.trim="form.remark" placeholder="备注，非必填"></el-input>
      </el-form-item>
      <div v-show="reactiveItem.showMore">
        <el-form-item label="参与人">
          <el-input readonly placeholder="请选择" v-model="form.outName" class="handle-person__input" />
          <span class="handle-person__input-span" @click="onFocus"></span>
        </el-form-item>
        <el-form-item prop="start_time_min" class="wait-form-time" label="开始">
          <el-date-picker v-model="form.start_time" size="default" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" placeholder="请选择开始时间">
          </el-date-picker>
          <el-time-select v-model="form.start_time_min" start="00:00" step="00:05" end="24:00" placeholder="请选择时间" />
        </el-form-item>
        <el-form-item label="结束" prop="end_time_min" class="wait-form-time" v-if="form.duration === 7">
          <el-date-picker v-model="form.end_time" size="default" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" placeholder="请选择结束时间">
          </el-date-picker>
          <el-time-select v-model="form.end_time_min" start="00:00" step="00:05" end="24:00" placeholder="请选择时间" />
        </el-form-item>
        <el-form-item label="时长" prop="duration">
          <el-select v-model="form.duration" placeholder="请选择时长" class="wait-form-item">
            <el-option v-for="item in timeOpts" :key="item.id" :label="item.label" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="提醒" prop="remind_time">
          <el-select v-model="form.ahead_time_enum" placeholder="请选择提醒时间" class="wait-form-item">
            <el-option v-for="item in noticeOpts" :key="item.id" :label="item.label" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="重复" prop="filter_holiday">
          <div class="wait-repeat">
            <el-select class="wait-repeat__select" v-model="form.is_repeat" placeholder="Select">
              <el-option v-for="item in repeatOpt" :key="item.id" :label="item.label" :value="item.id"> </el-option>
            </el-select>
            <el-checkbox v-model="form.filter_holiday" :false-label="0" :true-label="1" class="wait-repeat__check">过滤节假日 </el-checkbox>
          </div>
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <span class="wait-footer">
        <el-button @click="handleDialog(2)" class="wait-footer__btn">{{ reactiveItem.cancelText }}</el-button>
        <el-button @click="handleDialog(1)" class="wait-footer__btn" type="primary">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { ElForm, ElMessage } from "element-plus";
import { defineEmits, defineProps, PropType, reactive, ref, watch } from "vue";
import dayjs from "dayjs";
import useDashboard from "@/composables/useDashboard";
import { BackLogItemInter } from "@/composables/useDashboard";
export default {
  name: "waitDialog"
};
</script>
<script lang="ts" setup>
const emit = defineEmits(["show", "update:visible", "updateData"]);
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  personInfo: {
    type: Object,
    default: () => ({})
  },
  item: {
    type: Object as PropType<BackLogItemInter>,
    default: () => ({})
  }
});
type FormInstance = InstanceType<typeof ElForm>;
const ruleFormRef = ref<FormInstance>();
const reactiveItem = reactive({
  cancelText: "更多 (参与人、提醒等)",
  showMore: false,
  title: "新建待办",
  edit: false
});
const form = reactive({
  name: "", // 名称
  remark: "", // 备注
  start_time: "", // 开始时间
  start_time_min: "", // 开始时间
  end_time: "", // 结束时间
  end_time_min: "", // 结束时间
  duration: 1, // 自定义时长
  ahead_time_enum: 2, // 提醒时长
  is_repeat: 0, // 重复
  outName: "",
  filter_holiday: 0, // 过滤节假日 0 不过滤，1 过滤
  department: [], // 参与部门
  participant: [] // 员工编号
});

const { useSaveBackLog, timeOpts, noticeOpts, repeatOpt } = useDashboard();

// 更新开始结束时间,hasMin 是否需要分钟
const updateTime = (t: Date | string) => {
  const _t = t || Date.now();
  form.start_time = dayjs(_t).format("YYYY-MM-DD");
  const endT = Date.now() + 30 * 60 * 1000;
  form.end_time = dayjs(endT).format("YYYY-MM-DD");
  const m = dayjs().format("mm");
  const m2 = m[1];
  const lessFive = parseInt(m2) <= 5 ? 5 : 0;
  const m3 = parseInt(lessFive ? `${m[0]}5` : `${parseInt(m[0]) + 1}0`);
  // 如果差额0，则默认1分钟
  const minus = m3 - parseInt(m);
  form.start_time_min = dayjs(new Date(_t).getTime() + minus * 60 * 1000).format("HH:mm");
  form.end_time_min = dayjs(new Date(endT).getTime() + minus * 60 * 1000).format("HH:mm");
};

watch(
  () => props.personInfo,
  (newVal) => {
    form.outName = newVal.selectPerson?.map((item: Record<string, any>) => item.staff_name).join("，");
    form.department = newVal.department;
    form.participant = newVal.team_worker;
    if (!props.item.id) {
      if (newVal.fromType === "calendar") {
        updateCurDate();
      } else {
        // 更新每日时间
        updateTime(newVal?.day?.date);
      }
    }
  },
  {
    deep: true,
    immediate: true
  }
);
watch(
  () => props.item,
  (newVal) => {
    if (newVal && Object.keys(newVal).length) {
      reactiveItem.showMore = true;
      reactiveItem.cancelText = "取消";
      reactiveItem.edit = true;
      Object.keys(form).forEach((key) => {
        if (key === "outName") {
          const n = newVal.department?.map((i) => i.staff_name)?.join("，");
          const m = newVal.participant?.map((i) => i.staff_name)?.join("，");
          setTimeout(() => {
            form.outName = `${m}${n ? `，${n}` : ""}`;
          }, 200);
        } else if (key === "end_time" || key === "start_time") {
          const t = dayjs(newVal[key]);
          if (key === "start_time") {
            form.start_time = dayjs(newVal.start_time).format("YYYY-MM-DD");
            form.start_time_min = t.format("HH:mm");
          } else {
            form.end_time_min = t.format("HH:mm");
            form.end_time = dayjs(newVal.end_time).format("YYYY-MM-DD");
          }
        } else if (key === "department" || key === "participant") {
          const list = newVal[key].map((i) => (key === "department" ? parseInt(i.staff_no, 10) : i.staff_no));
          // @ts-ignore
          form[key].push(...list);
        } else if (key !== "end_time_min" && key !== "start_time_min") {
          // @ts-ignore
          form[key] = newVal[key];
        }
      });
    } else {
      reactiveItem.edit = false;
    }
  },
  {
    deep: true,
    immediate: true
  }
);

const onFocus = () => {
  emit("show", true);
};

const resetReativeItem = (reset = false) => {
  reactiveItem.showMore = false;
  reactiveItem.cancelText = "更多 (参与人、提醒等)";
  if (reset) {
    ruleFormRef.value?.resetFields();
    form.participant = [];
    form.department = [];
    form.start_time = dayjs().format("YYYY-MM-DD");
    form.end_time = dayjs().format("YYYY-MM-DD");
    form.is_repeat = 0;
    form.outName = "";
    reactiveItem.edit = false;
  }
};

const handleDialog = async (index: number) => {
  // 提交表单
  if (index === 1) {
    const isSucc: any = await saveBackLog();
    if (!isSucc) return;
  } else if (index === 2 && !reactiveItem.showMore) {
    reactiveItem.showMore = true;
    reactiveItem.cancelText = "取消";
    if (props.personInfo.fromType) {
      updateCurDate();
    }
    return;
  }
  emit("update:visible", false);
  resetReativeItem(true);
};

// 更新当前的时间
const updateCurDate = () => {
  const hours = dayjs().format("HH:mm");
  // 更新开始结束时间
  updateTime(`${props.personInfo?.day?.day} ${hours}`);
};

// 校验表单
const valideForm = () => {
  const { start_time, end_time, duration, start_time_min, end_time_min } = form;
  if (duration !== 7) return true;
  return new Date(`${start_time} ${start_time_min}`).getTime() < new Date(`${end_time} ${end_time_min}`).getTime();
};

// 创建待办
const saveBackLog = async () => {
  const edit = reactiveItem.edit;
  const params = Object.assign({ id: edit ? props.item.id : undefined }, form);
  if (params.name === "") params.name = "待办事项";
  if (params.start_time && params.start_time_min) {
    params.start_time += ` ${params.start_time_min}`;
  } else {
    ElMessage.warning("请选择开始时间");
    return false;
  }
  if (params.duration === 7) {
    if (params.end_time && params.end_time_min) {
      params.end_time += ` ${params.end_time_min}`;
    } else {
      ElMessage.warning("请选择结束时间");
      return false;
    }
  }

  if (!valideForm()) {
    ElMessage.warning("开始时间不能大于结束时间");
    return;
  }

  // @ts-ignore
  delete params.start_time_min;
  // @ts-ignore
  delete params.end_time_min;
  // @ts-ignore
  delete params.outName;
  const data = await useSaveBackLog(params);
  if (!data) return;
  emit("updateData", 2, { ...data, type: 4 });
  return true;
};
</script>

<style lang="less" scoped>
.wait {
  &-repeat {
    display: flex;
    align-items: center;

    &__select {
      flex: 3;
    }

    &__check {
      flex: 1;
      padding-left: 20px;
    }
  }

  &-footer {
    display: flex;
    align-items: center;
    justify-content: center;

    &__btn {
      width: 50%;
    }
  }
}

.handle-person {
  &__input {
    width: calc(100% - 60px);
    position: relative;

    &:before {
      position: absolute;
      right: 10px;
      top: 4px;
      content: "+";
      font-size: 20px;
    }

    &-span {
      width: 86%;
      height: 32px;
      display: inline-block;
      background-color: transparent;
      position: absolute;
      right: 0;
      top: 0;
      cursor: pointer;
    }
  }
}
</style>

<style lang="less">
.handle-wait-dialog {
  .wait-form-item {
    width: 100%;
  }
  .wait-repeat {
    width: 100%;
  }

  .wait-form-time {
    .el-form-item__content {
      display: flex;
      flex-wrap: nowrap;
    }
  }

  .handle-person__input {
    width: calc(100% - 0px) !important;
    .el-input__inner {
      padding-right: 25px;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
}
</style>
