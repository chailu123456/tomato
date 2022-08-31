<!--
 * @Author: 宋绍华
 * @Date: 2022-04-21 10:46:11
 * @LastEditTime: 2022-06-23 19:04:11
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\lookBoard\personal\jobEvaluation\index.vue
-->
<template>
  <div class="job-eva" id="job-eva">
    <div class="job-eva-form">
      <search-form
        v-if="showForm"
        ref="searchform"
        :searchArray="searchArray"
        @quickSeacrh="quickSeacrh"
        @changeSearch="changeSearch"
        @change="onChange"
        @resetSearch="resetSearch"
        :currentActive="currentActive"
        @click="getInitData"
      ></search-form>
      <FullScreen v-model:fullscreen="isFullScreen" />
    </div>
    <Table
      class="job-eva-table"
      :class="{ 'table-auto-height': !showForm }"
      ref="jobTable"
      :fullscreen="isFullScreen"
      :hidden-pagation="showForm"
      :form="form"
    />
  </div>
</template>
<script lang="ts">
import { onMounted, reactive, ref, defineProps, watch } from "vue";
import Table from "./table.vue";
import FullScreen from "@/components/fullscreen/index.vue";
import { POST_TYPE } from "@/utils/contantOptions";
import useDashboard, { ProductItemInter } from "@/composables/useDashboard";
import useBoardBase, { Iterate } from "@/composables/useBoardBase";
import { useRoute } from "vue-router";
import type { SearchArray } from "@/types/interface";
import dayjs from "dayjs";
import router from "@/router";

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
  staff_name: string | undefined;
  product_id: number | string | undefined;
  iteration_id: number | string | undefined;
  department_code: string[] | undefined;
  position_type: number[] | undefined;
  start_month: string | undefined;
  end_month: string | undefined;
  filter_type: number | undefined;
}>({
  filter_type: 2,
  staff_name: "", // 名称
  product_id: "", // 项目ID
  iteration_id: "", // 迭代ID
  department_code: [], // 部门编号
  position_type: [], // 岗位类型
  start_month: "",
  end_month: ""
});
const isFullScreen = ref(false);
const baseInfo = reactive<{ proList: ProductItemInter[]; IterList: Iterate[] }>({
  proList: [], // 项目列表
  IterList: [] // 迭代列表
});
const jobTable = ref();
const currentActive = ref("2");
// 迭代存储数据
const iterStorageMap = new Map();
const route = useRoute();
const { useGetProductList } = useDashboard();
const { useGetIterateList, disabledDate } = useBoardBase();

// @ts-ignore
const searchArray: SearchArray = reactive({
  btnArray: [
    { id: "-1", label: "所有", key: "filter_type" },
    { id: "1", label: "我的部门", key: "filter_type" },
    { id: "2", label: "我的项目", key: "filter_type" },
    { id: "3", label: "我的岗位", key: "filter_type" },
    { id: "4", label: "本月", key: "month" },
    { id: "5", label: "上月", key: "month" }
  ],
  searchForm: [
    {
      type: "input",
      label: "名称",
      key: "staff_name",
      val: "",
      placeholder: "请输入名称搜索"
    },
    {
      type: "customComponents",
      componentIndex: 1,
      label: "部门",
      key: "department_code",
      val: [],
      valueKey: ["id", "value"],
      listData: []
    },
    {
      type: "select",
      label: "项目",
      val: [],
      key: "product_id",
      valueKey: ["id", "name"],
      listData: []
    },
    {
      type: "select",
      label: "迭代",
      selectType: "virtual",
      val: "",
      key: "iteration_id",
      valueKey: ["value", "name"],
      listData: []
    },

    {
      type: "select",
      label: "岗位",
      multiple: true,
      key: "position_type",
      val: [],
      valueKey: ["value", "label"],
      listData: POST_TYPE
    },
    {
      type: "daterange",
      dateType: "monthrange",
      format: "YYYY-MM",
      label: "时间",
      val: [],
      key: "month",
      valueKey: [],
      placeholder: "请选择月份",
      disabledDate: disabledDate,
      isLink: true
    }
  ]
});

watch(
  () => props.searchParams,
  (newVal) => {
    if (Object.keys(newVal).length) {
      form.product_id = newVal.product_id;
      form.start_month = newVal.month;
      form.end_month = newVal.month;
    }
  },
  {
    deep: true,
    immediate: !props.showForm
  }
);

onMounted(async () => {
  /**
   * 工作评估有两个入口
   * 1. 人员-> 工作评估 需要默认选中我的项目
   * 2. 看板 -> 工作评估 需要选中我的项目、月份
   */
  const { productId, month, iterationId } = route.query as Record<string, any>;
  if (!props.showForm) {
    form.filter_type = undefined;
  }
  // 只有从看板跳转过来，并且带有month 才需要去请求
  else if (month || iterationId) {
    form.product_id = productId ? parseInt(productId) : undefined;
    form.filter_type = undefined;
    await getInitData(form.product_id as number);
    form.product_id && onProChange(Number(form.product_id), Number(form.iteration_id));
    searchArray.searchForm[2].val = form.product_id;
    if (iterationId) {
      form.iteration_id = parseInt(iterationId);
      searchArray.searchForm[3].val = form.iteration_id;
    }
    if (month) {
      form.start_month = month;
      form.end_month = month;
      searchArray.searchForm[5].val = [month, month];
    }

    if (month || iterationId) {
      router.replace({
        path: route.path,
        query: {
          ...route.query,
          iterationId: undefined,
          month: undefined
        }
      });
    }
  }
});

const quickSeacrh = (val: Record<string, any>) => {
  // 先把form 所有的数据清空
  Object.keys(form).forEach((key) => {
    form[key as keyof typeof form] = undefined;
  });
  if (val.key === "filter_type") {
    form.filter_type = val.id === "-1" ? undefined : Number(val.id);
  } else {
    if (val.id === "4") {
      // 本月
      form.start_month = dayjs().format("YYYY-MM");
      form.end_month = dayjs().format("YYYY-MM");
    } else {
      // 上个月
      form.start_month = dayjs().add(-1, "month").startOf("month").format("YYYY-MM");
      form.end_month = form.start_month;
    }
  }
};
const changeSearch = (val: Record<string, any>) => {
  Object.keys(form).forEach((key: string) => {
    if (val.month && (key === "start_month" || key === "end_month")) {
      form["start_month"] = val.month[0];
      form["end_month"] = val.month[1];
    } else {
      form[key as keyof typeof form] = val[key] || undefined;
    }
  });
};

// 获取项目接口
const getProductList = async () => {
  const data = await useGetProductList();
  if (data) {
    baseInfo.proList = data;
  }
};

// 获取初始化项目list，和 迭代list
const getInitData = async (productId: number | undefined) => {
  if (!baseInfo.proList.length) {
    await getProductList();
    const iterList = await getIterateList(productId);
    // @ts-ignore
    searchArray.searchForm[2].listData = baseInfo.proList;
    if (iterList) {
      baseInfo.IterList = iterList;
      iterStorageMap.set(form.product_id || -1, iterList);
      // @ts-ignore
      searchArray.searchForm[3].listData = baseInfo.IterList?.map((item) => {
        return {
          label: item.name,
          value: item.id
        };
      });
    }
  }
};

// 项目或迭代change 事件
const onChange = (item: Record<string, any>) => {
  if (item.type === "select" && item.key === "product_id") {
    searchArray.searchForm[3].val = "";
    onProChange(item.val);
  }
};

// 项目change 事件
const onProChange = async (id: number, iterationId?: number) => {
  baseInfo.IterList = [];
  form.iteration_id = iterationId || "";
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

  // @ts-ignore
  searchArray.searchForm[3].listData = baseInfo.IterList?.map((item) => {
    return {
      label: item.name,
      value: item.id
    };
  });
};
// 获取迭代列表
const getIterateList = async (product_id?: number) => {
  return await useGetIterateList({ product_id });
};

const resetSearch = () => {
  onProChange(-1);
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
    height: 100%;
    padding-top: 10;
  }
}

:global(.job-eva .container) {
  padding-top: 10px;
}

:global(.el-select-v2__placeholder) {
  font-size: 12px;
}
</style>
