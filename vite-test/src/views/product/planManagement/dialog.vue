<template>
  <div>
    <div class="form-margin">
      <el-form label-width="100px" ref="ruleFormRef" :rules="rules" :model="dialogParams">
        <el-form-item label="产品名称:" prop="product">
          <el-select v-model="dialogParams.product" placeholder="请选择" value-key="name" @change="handleProductChange">
            <el-option v-for="item in productList" :key="item.id" :label="item.name" :value="item"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关联需求:" prop="demand_ids">
          <el-scrollbar height="300px">
            <el-tree :data="dialogDemandList" node-key="id" :default-checked-keys="dialogParams.demand_ids" @check="handleCheckChange" show-checkbox default-expand-all :props="defaultProps">
            </el-tree>
          </el-scrollbar>
        </el-form-item>
        <div class="layout-flex">
          <el-form-item label="计划版本:" class="inline-form" prop="version">
            <el-input v-model="dialogParams.version" placeholder="请输入内容"></el-input>
          </el-form-item>
          <el-form-item label="预估交付:" class="inline-form" prop="deliver_time">
            <el-input v-model="dialogParams.deliver_time" placeholder="请输入内容"></el-input>
          </el-form-item>
        </div>
        <el-form-item label="计划简称:" prop="name">
          <div>
            <el-input placeholder="请输入内容" v-model="dialogParams.name"> </el-input>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts">
import useGetSelectList from "@/composables/useGetSelectList";
import useCreateAndEditPlan from "./composables/useCreateAndEditPlan";
import { defineComponent, toRefs } from "vue";

export default defineComponent({
  name: "dialogPlanManagement",
  setup() {
    const defaultProps = {
      children: "child_list",
      label: "name"
    };
    const { dialogDemandList, dialogParams, handleProductChange, handleCheckChange, ruleFormRef, rules } = useCreateAndEditPlan();
    //获取下拉列表
    const lists = useGetSelectList("productList");
    return {
      rules,
      ruleFormRef,
      handleCheckChange,
      handleProductChange,
      dialogDemandList,
      defaultProps,
      dialogParams,
      ...toRefs(lists)
    };
  }
});
</script>

<style scoped lang="less">
.inline-form {
  width: 50%;
  display: inline-block;
}
.form-margin {
  margin-top: 40px;
}
.layout-flex {
  display: flex;
}
::v-deep(.el-form-item) {
  display: flex;
}
::v-deep(.el-form-item__content) {
  flex-grow: 1;
}
::v-deep(.el-select) {
  width: 100%;
}
</style>
