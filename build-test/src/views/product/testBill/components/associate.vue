<!--
 * @Author: 宋绍华
 * @Date: 2022-05-19 15:49:21
 * @LastEditTime: 2022-06-23 15:01:34
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\product\testBill\components\associate.vue
-->
<template>
  <div class="associate">
    <div class="associate-top">
      <template v-if="!data?.id || currentRt.canEdit">
        <div class="associate-top-left">
          <span class="associate-top-left-s">关联：</span
          ><el-select v-model="currentRt.val" placeholder="请选择" @change="onChange">
            <el-option v-for="item in currentRt.options" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <el-input @input="filterText" style="width: 200px" :prefix-icon="Search" v-model.trim="currentRt.searchVal" placeholder="请搜索关联内容"></el-input>
        <span class="associate-top-left" v-if="currentRt.canEdit"
          ><el-button @click="closeEdit" plain>取消</el-button><el-button plain @click="submit" type="primary">保存</el-button></span
        >
      </template>
      <template v-else>
        <div class="associate-top-view">
          <div class="associate-top-left-s">
            关联<el-button
              class="associate-top-left-s-btn"
              plain
              v-if="!currentRt.canEdit"
              @click="
                currentRt.canEdit = true;
                onChange(props.data?.type);
              "
              type="primary"
              >编辑</el-button
            >
          </div>
          <div class="associate-top-left-btn">
            <div class="associate-top-view-item">
              {{ currentRt.options[data?.type - 1]?.label }}：<span
                class="associate-top-view-item-span"
                v-for="(item, index) in data?.quote_list"
                :key="item.id"
                >{{ index + 1 }}、{{ item.value }}</span
              >
            </div>
          </div>
        </div>
      </template>
    </div>
    <div class="associate-list" v-if="!data?.id || currentRt.canEdit">
      <el-checkbox-group v-model="currentRt.checks" v-if="currentRt.list?.length">
        <el-checkbox v-for="item in currentRt.list" :key="item.id" :label="item.id">{{ item.value }}</el-checkbox>
      </el-checkbox-group>
      <div class="empty-text" v-else>{{ currentRt.emptyTextMap[currentRt.val] }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType, reactive, defineProps, defineEmits, watch, defineExpose, toRef } from "vue";
import { Search } from "@element-plus/icons";
import { AssociatedSelectResp } from "@/composables/useTestBill";
import { cloneDeep } from "lodash";
interface Rt {
  options: { label: string; value: number }[];
  val: number;
  searchVal: string;
  checks: number[];
  list: AssociatedSelectResp[];
  canEdit: boolean;
  tempList: AssociatedSelectResp[];
  isFirstTime: boolean;
  id: number;
  emptyTextMap: Record<number, string>;
}

export default {
  name: "associate"
};
</script>

<script lang="ts" setup>
const emit = defineEmits(["change", "submit"]);
const props = defineProps({
  list: {
    type: Array as PropType<AssociatedSelectResp[]>,
    default: () => []
  },
  data: {
    type: Object,
    default: () => {
      return {};
    }
  }
});
const currentRt = reactive<Rt>({
  options: [
    {
      label: "需求",
      value: 1
    },
    {
      label: "任务",
      value: 2
    },
    {
      label: "生产环境BUG",
      value: 3
    }
  ],
  val: 1,
  id: 0,
  searchVal: "",
  checks: [],
  tempList: [],
  list: props.list,
  canEdit: false,
  isFirstTime: true,
  emptyTextMap: { 1: "暂无已完成的需求，请修改需求状态后重试", 2: "暂无已完成的任务，请修改任务状态后重试", 3: "暂无已解决的生产环境BUG，请修改BUG状态后重试" }
});

defineExpose({
  checks: toRef(currentRt, "checks"),
  type: toRef(currentRt, "val")
});

watch(
  () => props.list,
  (newArr) => {
    currentRt.list = newArr;

    if (currentRt.isFirstTime) {
      currentRt.isFirstTime = false;
      currentRt.tempList = cloneDeep(newArr);
    }
    if (!props.data?.id) {
      currentRt.checks.length = 0;
    }
  },
  {
    deep: true
  }
);

watch(
  () => props.data,
  (newVal) => {
    currentRt.searchVal = "";
    if (typeof newVal === "object" && Object.keys(newVal).length) {
      const { id, type, quote_list, canEdit } = newVal;
      if (id) {
        currentRt.val = type;
        currentRt.id = id;
        currentRt.checks = quote_list.map((item: { id: number; value: string }) => item.id);
        currentRt.canEdit = canEdit;
      }
    } else {
      currentRt.checks = [];
      currentRt.val = 1;
    }
  },
  {
    immediate: true,
    deep: true
  }
);

const onChange = (val: number) => {
  currentRt.searchVal = "";
  emit("change", val || currentRt.val);
};

// 过滤
const filterText = () => {
  currentRt.list = props.list!.filter((item) => currentRt.searchVal === "" || item.value.includes(currentRt.searchVal));
  // 还原初始阶段数据
  if (currentRt.searchVal?.trim()) {
    currentRt.checks = props.data.quote_list?.map((item: { id: number; value: string }) => item.id);
  }
};

const closeEdit = () => {
  currentRt.searchVal = "";
  currentRt.canEdit = false;
  currentRt.val = props.data.type;
  currentRt.checks = props.data.quote_list?.map((item: { id: number; value: string }) => item.id);
  currentRt.list = cloneDeep(currentRt.tempList);
  filterText();
};

const submit = () => {
  currentRt.searchVal = "";
  currentRt.canEdit = false;
  const checks = getChecks();
  emit("submit", { id: props.data.id, quote_ids: checks, type: currentRt.val });

  closeEdit();
};

// 获取最终的checks
const getChecks = () => {
  const checks = currentRt.checks;
  const baseList = currentRt.list;
  // 如果在该迭代中选中了数据，再次切到其他的迭代时，这中间有可能会有交集，因此需要过滤下数据
  return checks.filter((item) => baseList.map((item) => item.id).includes(item));
};
</script>
<style lang="less" scoped>
.associate {
  &-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    &-left {
      display: flex;
      align-items: center;

      &-s {
        color: #666;
        font-size: 14px;
        // margin-bottom: 10px;
        position: relative;

        &-btn {
          position: absolute;
          right: 0;
          top: 0;
        }
      }

      &-btn {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }

    &-view {
      font-size: 14px;
      color: #333;
      width: 100%;

      &-item {
        width: 90%;
        word-break: break-word;
        margin-top: 10px;

        &-span {
          display: block;
          margin-left: 10px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
      }
    }
  }

  &-list {
    max-height: 360px;
    overflow-y: scroll;
    border: 1px solid #ddd;
    padding: 10px 20px;
    margin-top: 10px;

    &-ul {
      display: flex;
      flex-direction: column;
    }
  }
}

:global(.associate .el-checkbox-group) {
  max-height: 200px;
  overflow-y: scroll;
}

:global(.associate .el-checkbox) {
  display: flex;
}
</style>
