<!--
 * @Author: 宋绍华
 * @Date: 2022-08-04 11:02:20
 * @LastEditTime: 2022-08-17 16:02:48
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\iteration\homePage\components\affiliateProgram.vue
-->
<template>
  <el-dialog title="按计划关联" v-model="programVisible" custom-class="program-dialog" :close-on-click-modal="false" :show-close="false">
    <div class="program">
      <div class="program-top">
        <div>选择计划 <span>若需求已关联迭代，再次关联将会覆盖；文档可关联多个迭代</span></div>
        <el-select ref="select" @change="onChange" style="width: 100%" v-model="planId" filterable placeholder="请选择计划">
          <el-option v-for="item in planList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </div>

      <div class="program-bottom">
        <el-table
          style="margin: 10px 0"
          border
          ref="table1"
          :data="assList.demand_list"
          @select-all="(row: AssociatedDemandItemResp[]) => onSelect(row, 1)"
          @select="(row: AssociatedDemandItemResp[]) => onSelect(row, 1)"
        >
          <el-table-column type="selection" />
          <el-table-column property="name" label="需求名称" />
          <el-table-column property="iteration_name" label="已关联迭代">
            <template #default="scope">
              <span>
                {{ scope.row.iteration_name || "-" }}
              </span></template
            >
          </el-table-column>
        </el-table>

        <div class="program-bottom-doc">
          <div style="margin-bottom: 10px">选择文档</div>
          <el-table
            :data="assList.doc_list"
            ref="table2"
            border
            @select-all="(row: AssociatedDemandItemResp[]) => onSelect(row, 2)"
            @select="(row: AssociatedDocItemResp[]) => onSelect(row, 2)"
          >
            <el-table-column type="selection" />
            <el-table-column property="title" label="文档名称" />
            <el-table-column property="iteration_name" label="已关联迭代">
              <template #default="scope">
                <span>
                  {{ scope.row.iteration_name || "-" }}
                </span></template
              >
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button @click="submit" type="primary">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { ref, defineProps, watch, computed, defineEmits, nextTick } from "vue";
import { useStore } from "@/store";
import { ElMessage } from "element-plus";
export default {
  name: "program"
};
</script>

<script lang="ts" setup>
import useHome from "@/composables/useHomePage";
import type { PlanSelectResp, AssociatedDemandDocResp, AssociatedDemandItemResp, AssociatedReq, AssociatedDocItemResp } from "@/composables/useHomePage";
const store = useStore();
const { useGetPlanList, useGetAssociatedDemandDoc, useUpdateAssociate } = useHome();
const productId = computed(() => store.getters.productId);
const iterateId = computed(() => store.getters.iterateId);

const props = defineProps({
  programVisible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["update:programVisible", "updateInfo"]);

const planId = ref<undefined | number>();
const planList = ref<PlanSelectResp[]>([]);
const table1 = ref();
const table2 = ref();
const select = ref();
const assList = ref<AssociatedDemandDocResp>({
  demand_list: [],
  doc_list: [],
  selected_demand_ids: [],
  selected_doc_ids: []
});
const demandSelectedList = ref<number[]>([]);
const docSelectedList = ref<number[]>([]);
let timer: ReturnType<typeof setTimeout>;

// 获取计划列表
const getPlanList = async (product_id: number) => {
  const data = await useGetPlanList({ product_id });

  if (data) {
    planList.value = data;
  }
};

// onChange事件
const onChange = (plan_id: number) => {
  if (timer) clearTimeout(timer);
  // 自动移出，防止切换tab 自动focus
  timer = setTimeout(() => {
    select.value.blur();
  }, 20);
  demandSelectedList.value.length = docSelectedList.value.length = 0;
  getDocs(plan_id);
};

// 获取需求文档
const getDocs = async (plan_id: number) => {
  const data = await useGetAssociatedDemandDoc({ plan_id, iteration_id: iterateId.value });
  if (data) {
    assList.value = data;
    demandSelectedList.value = data.selected_demand_ids;
    docSelectedList.value = data.selected_doc_ids;

    // 默认选中
    nextTick(() => {
      assList.value.demand_list.forEach((item) => {
        if (demandSelectedList.value.includes(item.id)) {
          table1.value.toggleRowSelection(item, true);
        }
      });
      assList.value.doc_list.forEach((item) => {
        if (docSelectedList.value.includes(item.id)) {
          table2.value.toggleRowSelection(item, true);
        }
      });
    });
  }
};

// 选择列表
const onSelect = (row: AssociatedDemandItemResp[] | AssociatedDocItemResp[], type: number) => {
  if (type === 1) {
    demandSelectedList.value = row.map((item) => item.id);
  } else {
    docSelectedList.value = row.map((item) => item.id);
  }
};

const submit = async () => {
  if (!demandSelectedList.value.length && !docSelectedList.value.length) {
    return ElMessage.warning("请选择需求或文档");
  }

  const params: AssociatedReq = {
    demand_ids: demandSelectedList.value,
    doc_ids: docSelectedList.value,
    plan_id: planId.value!,
    iteration_id: iterateId.value
  };
  const data = await useUpdateAssociate(params);
  if (data) {
    console.log(data);
    ElMessage.success("操作成功");
    close();
    emit("updateInfo");
  }
};

const close = () => {
  emit("update:programVisible", false);
};

watch(
  () => props.programVisible,
  async (v) => {
    if (v) {
      await getPlanList(productId.value);
      planId.value = planList.value[0].id;
      await getDocs(planId.value!);
    } else {
      planId.value = undefined;
    }
  }
);
</script>
<style lang="less" scoped>
:global(.program-dialog .el-dialog__body) {
  padding-top: 20px;
  min-height: 200px;
  max-height: 500px;
  overflow-y: scroll;
}

.program {
  &-top {
    font-size: 15px;

    span {
      font-size: 14px;
      color: #999;
      margin-bottom: 10px;
      display: inline-block;
    }
  }
}
</style>
