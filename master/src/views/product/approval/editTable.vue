<!--
 * @Author: 宋绍华
 * @Date: 2022-01-19 14:24:53
 * @LastEditTime: 2022-04-16 16:07:35
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\product\approval\editTable.vue
-->
<template>
  <div class="edit-table">
    <span class="title" :class="{ 'title-plus': canEdit }" @click="() => handleItem()">需求列表</span>
    <div id="editTable" class="editTable-wrap">
      <el-table class="table" :data="tableData" border @row-click="rowClick">
        <el-table-column prop="name" label="需求" width="180">
          <template #default="scope">
            <el-select
              no-match-text=" "
              filterable
              :disabled="!canEdit"
              v-model="scope.row.name"
              @focus="() => onFocus(scope.row)"
              @change="onChange($event, scope.$index)"
              placeholder="请选择需求"
            >
              <el-option v-for="item in demendOpts" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="优先级" width="110">
          <template #default="scope">
            <el-select :disabled="!canEdit" @focus="() => onFocus(scope.row)" v-model="scope.row.level" class="m-2" placeholder="优先级">
              <el-option v-for="item in PRIORITY" :key="item.id" :label="item.value" :value="item.id"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="需求类型" width="140">
          <template #default="scope">
            <el-select :disabled="!canEdit" @focus="() => onFocus(scope.row)" v-model="scope.row.type" class="m-2" placeholder="选择需求类型">
              <el-option v-for="item in requireTypes" :key="item.id" :label="item.value" :value="item.id"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="origin_path" label="需求来源" width="200"></el-table-column>
        <el-table-column prop="target_value" label="目标价值" min-width="250">
          <template #default="scope">
            <el-input
              rows="4"
              show-word-limit
              type="textarea"
              :maxlength="500"
              :disabled="!canEdit"
              v-model="scope.row.target_value"
              placeholder="请输入目标价值"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200">
          <template #default="scope">
            <el-input
              rows="4"
              show-word-limit
              type="textarea"
              :maxlength="500"
              :disabled="!canEdit"
              v-model="scope.row.description"
              placeholder="请输入描述"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="estimate" label="估算时间" min-width="200">
          <template #default="scope">
            <el-input
              rows="4"
              show-word-limit
              type="textarea"
              :disabled="!canEdit"
              :maxlength="500"
              v-model="scope.row.estimate"
              placeholder="请输入估算时间"
            ></el-input>
          </template>
        </el-table-column>
      </el-table>
      <!-- 操作按钮 -->
      <div id="editTable-options" class="options" v-if="isActive && canEdit" :style="optStyle">
        <span class="options-add" @click="handleOpt('add')"></span>
        <span class="options-copy iconfont icon-copy" @click="handleOpt('copy')"></span>
        <span class="options-del" @click="handleOpt('del')"></span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export interface RequestTableData {
  tableData: RequestInter[];
}

import { PRIORITY, requireTypes } from "@/utils/contantOptions";
import { computed, ref, defineExpose, defineEmits, defineProps, withDefaults, watch } from "vue";
import { cloneDeep } from "lodash";
import type { DemandApprovalItem } from "@/types/interface";
import { RequestInter } from "@/types/interface";
import useApproval from "@/composables/useApproval";
import { useRoute } from "vue-router";
import { inject } from "vue";
import { ElMessage } from "element-plus";

export default {
  name: "editTable"
};
</script>

<script lang="ts" setup>
const autoIds = ref(inject("autoIds"));
const autoNames = ref(inject("autoNames"));
const props = withDefaults(
  defineProps<{
    demandList: RequestInter[];
    canEdit: boolean;
  }>(),
  {
    canEdit: false,
    demandList: () => []
  }
);
const emit = defineEmits(["changeTableForm", "updateTitle"]);
const route = useRoute();
// 新增模板
const templateData: RequestInter = {
  name: "",
  level: undefined,
  type: undefined,
  origin_path: "",
  description: "",
  estimate: "",
  target_value: "",
  id: 0
};

const { useGetDemandList } = useApproval();
// table
const tableData = ref<RequestInter[]>([
  {
    name: "",
    level: undefined,
    type: undefined,
    origin_path: "",
    description: "",
    estimate: "",
    target_value: "",
    id: 0
  }
]);
// 当前的位置
const index = ref(0);
const posY = ref(63);
// 是否激活状态
const isActive = ref(false);
// 需求列表
const demendOpts = ref<DemandApprovalItem[]>([]);
let originDemendOpts: DemandApprovalItem[] = [];
let originDemendList: RequestInter[] | null = null;
// 操作按钮的位置
const optStyle = computed(() => {
  return `top: ${posY.value}px`;
});
// 获取需求单列表
const getList = async () => {
  const { productId: product_id } = route.query as Record<string, any>;
  const data = await useGetDemandList(product_id);

  demendOpts.value.length = 0;
  originDemendOpts.length = 0;
  if (!data || (Array.isArray(data) && !data.length)) return;
  demendOpts.value.push(...data);
  originDemendOpts = cloneDeep(demendOpts.value);
};

/**
 * select onchange 事件
 * @param val 当前id
 * @param index 当前column index
 */
const onChange = (val: number, index: number) => {
  const demendOptsItem = demendOpts.value.find((n) => n.id === val);
  if (demendOptsItem) {
    const item = tableData.value[index];
    Object.keys(item).forEach((i: string) => {
      // @ts-ignore
      if (typeof demendOptsItem[i] !== "undefined") item[i] = demendOptsItem[i];
    });
  }

  handleDemendOpts();
};

/**
 * 有三个数组
 * 1. 源数据，不会变动 originDemendOpts
 * 2. 使用数据，会经常变动 demendOpts
 *
 * 获取tableList里面的id 集合，与目前使用的集合匹配，找到未使用的数据
 */
const handleDemendOpts = () => {
  const usedTableIds = tableData.value.map((i) => i.id);
  demendOpts.value = originDemendOpts.filter((i) => !usedTableIds.includes(i.id));
};

// 操作item
const handleItem = (item?: RequestInter | null, isDel = false) => {
  if (!props.canEdit) return;
  isActive.value = false;
  const n = item || templateData;
  if (isDel) {
    tableData.value.splice(index.value, 1);
  } else {
    tableData.value.push({ ...n });
  }
  tableData.value.forEach((item, idx) => {
    item.index = idx;
  });

  handleDemendOpts();
};

// 自动创建table
const autoCreateTableData = () => {
  const idsArr = (autoIds.value as string).split(",");
  const nameArr = (autoNames.value as string).split(",");
  const depIds = demendOpts.value.map((i) => i.id);
  // 获取未关联id，和已关联name，name需要给出提示
  const hasIdsArr: string[] = [];
  const namesArr: string[] = [];

  idsArr.forEach((item, index) => {
    if (depIds.includes(parseInt(item, 10))) {
      hasIdsArr.push(item);
    } else {
      namesArr.push(nameArr[index]);
    }
  });

  if (hasIdsArr.length) {
    tableData.value.length = 0;
    hasIdsArr.forEach((n, index) => {
      const id = parseInt(n, 10);
      handleItem(templateData);
      onChange(id, index);
    });
    // 清空掉
    autoNames.value = "";

    if (namesArr.length) {
      ElMessage.warning(`${namesArr.join("、")}，已关联审批单`);
    }
  }
};

watch(
  () => props.demandList,
  async (newVal) => {
    if (Array.isArray(newVal) && newVal.length) {
      const list = cloneDeep(newVal);
      list.forEach((item: RequestInter, index) => (item.index = index));
      tableData.value = list;
      // 拷贝一份原始数组，作为对比的参考
      originDemendList = cloneDeep(list);
    } else {
      posY.value = 63;
      index.value = 0;
      tableData.value.length = 0;
      tableData.value.push({ ...templateData, index: 0 });
    }
    await getList();
    if (autoIds.value && autoNames.value) {
      autoCreateTableData();
    }
  },
  { deep: true, immediate: true }
);

// 监听tableData 变化
watch(
  () => tableData.value,
  (newVal) => {
    // 是否改变form
    emit("changeTableForm", JSON.stringify(newVal) !== JSON.stringify(originDemendList));
  },
  { deep: true, immediate: true }
);

const onFocus = (row: Required<RequestInter>) => {
  rowClick(row);

  if (!demendOpts.value.length) handleDemendOpts();
};

// row click 事件
const rowClick = (row: Required<RequestInter>) => {
  const editTable = document.getElementById("editTable");
  const rowEls = editTable?.querySelectorAll(".el-table__row");
  let h = 0;
  isActive.value = true;
  index.value = row.index;

  // 因为每一行的高度都不一样，因此需要获取你点击的当前行高度的一半，加上当前行前面存在的行数高度总和
  if (rowEls) {
    // 获取当前点击项的高度一半
    h = rowEls[row.index].getBoundingClientRect().height / 2 + 10;

    for (let i = 0; i < row.index; i++) {
      h += rowEls[i].getBoundingClientRect().height;
    }

    posY.value = h;
  }
};

/**
 * 操作栏
 * @param type 类型 add添加，copy 复制，del 删除
 */
const handleOpt = (type: string) => {
  isActive.value = false;
  if (!props.canEdit) return;
  if (type === "add") {
    handleItem();
  } else if (type === "copy") {
    const curItem = cloneDeep(tableData.value[index.value]);
    handleItem(curItem);
  } else {
    // 只剩一条不让删除
    if (tableData.value.length === 1) return;
    handleItem(null, true);
    if (tableData.value.length === 1) {
      index.value = 0;
    } else if (tableData.value.length === index.value) {
      index.value--;
    }
  }

  handleDemendOpts();
};

defineExpose({
  tableData,
  demendOpts
});
</script>

<style lang="less">
.edit-table {
  .title {
    &-plus {
      .icon-circle();
    }
    display: inline-block;
    margin-bottom: 20px;
    cursor: pointer;
  }

  .editTable-wrap {
    position: relative;
  }

  .options {
    position: absolute;
    display: flex;
    flex-direction: column;
    left: -20px;
    top: 0;

    &-add {
      .icon-circle("+", #1f9f85, 0, unset, 13px, 11px);
    }
    &-copy {
      color: #63b1df;
      margin-top: 15px;
      cursor: pointer;
      font-size: 18px;
    }
    &-del {
      .icon-circle("-", #d24f46, 0, unset, 13px, 10px);
      margin-top: 15px;
    }
  }
}

.editTable-wrap {
  .el-table__row {
    position: relative;
  }
}
</style>
