<!--
 * @Author: 宋绍华
 * @Date: 2022-04-21 10:46:11
 * @LastEditTime: 2022-04-28 14:56:41
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\lookBoard\personal\jobEvaluation\index.vue
-->
<template>
  <div class="job-eva" id="job-eva">
    <div class="job-eva-form">
      <el-form v-if="showForm" :inline="true" :model="form" style="padding-right: 60px">
        <el-form-item>
          <el-input v-model.trim.lazy="form.staff_name" clearable placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="项目">
          <el-select v-model="form.product_id" clearable filterable @change="onProChange" placeholder="请选择项目">
            <el-option v-for="item in baseInfo.proList" :key="item.id" :label="item.name" :value="item.id">{{ item.name }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="迭代">
          <el-select v-model="form.iteration_id" clearable filterable placeholder="请选择迭代">
            <el-option v-for="item in baseInfo.IterList" :key="item.id" :label="item.name" :value="item.id">{{ item.name }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部门">
          <SelectDepartment @event="onEvent" />
        </el-form-item>
        <el-form-item label="岗位">
          <el-select v-model="form.position_type" collapse-tags clearable filterable multiple placeholder="请选择岗位">
            <el-option v-for="item in POST_TYPE" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间">
          <el-date-picker value-format="YYYY-MM" :disabled-date="disabledDate" v-model="form.month" type="month" placeholder="请选择月份" />
        </el-form-item>
      </el-form>
      <FullScreen v-model:fullscreen="isFullScreen" />
    </div>
    <Table class="job-eva-table" ref="jobTable" :fullscreen="isFullScreen" :hidden-pagation="showForm" :form="form" />
  </div>
</template>
<script lang="ts">
import { onMounted, reactive, ref, defineProps, watch } from "vue";
import Table from "./table.vue";
import FullScreen from "@/components/fullscreen/index.vue";
import { POST_TYPE } from "@/utils/contantOptions";
import SelectDepartment from "@/components/select-department/index.vue";
import useDashboard, { ProductItemInter } from "@/composables/useDashboard";
import useBoardBase, { Iterate } from "@/composables/useBoardBase";
import { useRoute } from "vue-router";

export default {
  name: "jobEvaluation"
};
</script>

<script setup lang="ts">
const props = defineProps({
  showForm: {
    type: Boolean,
    default: true
  },
  searchParams: {
    type: Object,
    default: () => ({})
  }
});
// form 表单
const form = reactive<{
  staff_name: string;
  product_id: number | string;
  iteration_id: number | string;
  department_code: string[];
  position_type: number[];
  month: string;
}>({
  staff_name: "", // 名称
  product_id: "", // 项目ID
  iteration_id: "", // 迭代ID
  department_code: [], // 部门编号
  position_type: [], // 岗位类型
  month: "" // 月份
});
const isFullScreen = ref(false);
const baseInfo = reactive<{ proList: ProductItemInter[]; IterList: Iterate[] }>({
  proList: [], // 项目列表
  IterList: [] // 迭代列表
});
const jobTable = ref();
// 迭代存储数据
const iterStorageMap = new Map();
const route = useRoute();
const { useGetProductList } = useDashboard();
const { useGetIterateList, disabledDate } = useBoardBase();

watch(
  () => props.searchParams,
  (newVal) => {
    if (Object.keys(newVal).length) {
      form.month = newVal.month;
      form.product_id = newVal.product_id;
    }
  },
  {
    deep: true,
    immediate: !props.showForm
  }
);

onMounted(() => {
  const { product_id = "", iterationId = "" } = route.query as Record<string, any>;
  getProductList();
  if (props.showForm) {
    form.product_id = product_id ? parseInt(product_id) : "";
    form.iteration_id = iterationId ? parseInt(iterationId) : "";
    form.product_id && onProChange(Number(form.product_id), Number(form.iteration_id));
  }
});

// 回调事件
const onEvent = (arr: string[]) => {
  if (Array.isArray(arr)) {
    form.department_code = arr;
  }
};

// 获取项目接口
const getProductList = async () => {
  const data = await useGetProductList();
  if (data) {
    baseInfo.proList = data;
  }
};

// 项目change 事件
const onProChange = async (id: number, iterationId?: number) => {
  baseInfo.IterList = [];
  form.iteration_id = iterationId ? iterationId : "";
  // 这里迭代数据是根据项目来切换的
  // 因此没必要一次性load所有的数据，
  // 如果这个数据不在，就load，然后把load的数据存在Map中
  // 下次再切到这个id，就直接拿Map的数据了
  if (iterStorageMap.get(id)) {
    baseInfo.IterList = iterStorageMap.get(id);
  } else {
    const data = await getIterateList(id);
    if (data) {
      baseInfo.IterList = data;
      iterStorageMap.set(id, data);
    }
  }
};
// 获取迭代列表
const getIterateList = async (product_id: number) => {
  return await useGetIterateList({ product_id });
};
</script>
<style scoped lang="less">
.job-eva {
  background-color: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  &-form {
    padding: 10px 0 0 20px;
    position: relative;
    box-sizing: border-box;
    max-height: 110px;
  }

  &-table {
    // height: 600px;
    padding-top: 0;
  }
}
</style>
