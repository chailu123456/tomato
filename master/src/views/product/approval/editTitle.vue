<template>
  <div class="edit-title-com">
    <span class="title">需求审批单</span>
    <table class="approve-table" style="border-collapse: collapse; width: 100%; border: 1px solid #c6c6c6 !important; margin-bottom: 20px">
      <tr>
        <th align="left">标题</th>
        <th align="right">
          <el-input :disabled="!!details?.title && !isCopy" style="width: 200px" :maxlength="100" v-model="title" placeholder="请输入标题" />
        </th>
        <th align="right">单据编号</th>
        <th align="right">
          {{ details?.approval_no }}
        </th>
        <th align="right">单据状态</th>
        <th align="right">
          {{ statusVal }}
        </th>
      </tr>
      <tr>
        <th align="left">所属项目</th>
        <th align="right">{{ details?.product_name }}</th>
        <th align="right">提单人</th>
        <th align="right">{{ details?.create_name }}</th>
        <th align="right">填单时间</th>
        <th align="right">
          {{ details?.create_at }}
        </th>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
export interface EditTitleInter {
  title: string;
}
import { DemandApprovalDetails } from "@/types/interface";
import { APPROVALSTATUSLIST } from "@/utils/contantOptions";
import { ref, defineExpose, PropType, defineProps, watch } from "vue";
export default {
  name: "editTitle"
};
</script>

<script lang="ts" setup>
const title = ref("");
const props = defineProps({
  details: {
    type: Object as PropType<DemandApprovalDetails>
  },
  isCopy: {
    type: Boolean,
    default: false
  }
});

const statusVal = ref("待保存");

watch(
  () => props.details,
  (newVal) => {
    if (newVal?.title) {
      title.value = newVal.title;
      // 赋值title
      statusVal.value = APPROVALSTATUSLIST.find((n) => n.id === newVal?.status)!.value;
    } else {
      title.value = "";
      statusVal.value = "待保存";
    }
  },
  { deep: true, immediate: true }
);

// 输出title
defineExpose({
  title
});
</script>

<style lang="less">
.edit-title-com {
  .title {
    display: flex;
    justify-content: center;
    font-size: 24px;
    padding-bottom: 10px;
  }

  table.approve-table {
    border-collapse: collapse;
    width: 100%;
    border: 1px solid #c6c6c6 !important;
    margin-bottom: 20px;

    th {
      border-collapse: collapse;
      border-right: 1px solid #c6c6c6 !important;
      border-bottom: 1px solid #c6c6c6 !important;
      padding: 5px 9px;
      font-size: 14px;
      font-weight: normal;
      text-align: center;
    }
    td {
      border-collapse: collapse;
      border-right: 1px solid #c6c6c6 !important;
      border-bottom: 1px solid #c6c6c6 !important;
      padding: 5px 9px;
      font-size: 12px;
      font-weight: normal;
      text-align: center;
      word-break: break-all;
    }
  }
}
</style>
