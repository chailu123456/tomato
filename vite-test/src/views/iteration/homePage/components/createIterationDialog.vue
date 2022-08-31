<template>
  <!-- 新增迭代弹窗 -->
  <el-dialog :title="title" v-model="isShowIteration" width="38%" center :close-on-click-modal="false">
    <span>
      <el-form :model="formData" label-width="100px" :rules="rules" ref="ruleFormRef">
        <div class="flex-layout">
          <el-form-item label="迭代名称" label-width="100px" prop="name">
            <el-input placeholder="请输入简称" v-model="formData.name" maxlength="12"></el-input>
          </el-form-item>
          <el-form-item label="迭代版本号" label-width="100px" prop="id">
            <el-input placeholder="" disabled v-model="formData.id"></el-input>
          </el-form-item>
        </div>
        <div class="flex-layout">
          <el-form-item label="关联计划" prop="plan_id" label-width="100px">
            <el-cascader :disabled="formData.id" :props="selectProps" v-model="formData.plan_id" :options="resultProductList"></el-cascader>
          </el-form-item>
          <el-form-item label="计划版本号" label-width="100px" prop="id">
            <el-input placeholder="" disabled v-model="formData.id"></el-input>
          </el-form-item>
        </div>
        <div class="flex-layout">
          <el-form-item label="产品负责人" label-width="100px" prop="iteration_manager.staff_name">
            <el-select v-model="formData.iteration_manager.staff_name" filterable placeholder="请选择" @change="setFiled($event, 'iteration_manager')">
              <el-option v-for="item in employeeLists" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="前端负责人" label-width="100px" prop="frontend_manager.staff_name">
            <el-select v-model="formData.frontend_manager.staff_name" filterable placeholder="请选择" @change="setFiled($event, 'frontend_manager')">
              <el-option v-for="item in employeeLists" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="后端负责人" label-width="100px" prop="backend_manager.staff_name">
            <el-select v-model="formData.backend_manager.staff_name" filterable placeholder="请选择" @change="setFiled($event, 'backend_manager')">
              <el-option v-for="item in employeeLists" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="测试负责人" label-width="100px" prop="test_manager.staff_name">
            <el-select v-model="formData.test_manager.staff_name" filterable placeholder="请选择" @change="setFiled($event, 'test_manager')">
              <el-option v-for="item in employeeLists" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"> </el-option>
            </el-select>
          </el-form-item>
        </div>

        <div class="flex-layout">
          <el-form-item label="开发时间" label-width="100px" prop="dev_time">
            <el-date-picker value-format="YYYY-MM-DD" v-model="formData.dev_time" type="date" placeholder="选择日期"> </el-date-picker>
          </el-form-item>
          <el-form-item label="联调时间" label-width="100px" prop="union_time">
            <el-date-picker value-format="YYYY-MM-DD" v-model="formData.union_time" type="date" placeholder="选择日期"> </el-date-picker>
          </el-form-item>
          <el-form-item label="提测时间" label-width="100px" prop="test_time">
            <el-date-picker value-format="YYYY-MM-DD" v-model="formData.test_time" type="date" placeholder="选择日期"> </el-date-picker>
          </el-form-item>
          <el-form-item label="发布时间" label-width="100px" prop="release_time">
            <el-date-picker value-format="YYYY-MM-DD" v-model="formData.release_time" type="date" placeholder="选择日期"> </el-date-picker>
          </el-form-item>
        </div>
        <el-form-item label="提醒地址" label-width="100px" prop="address">
          <el-input placeholder="" v-model="formData.address"></el-input>
        </el-form-item>
      </el-form>
    </span>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleCreateIteration">确 定</el-button>
        <el-button @click="handleChangeDialogStatus(true)">取 消</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { getPlanCascader, createIteration } from "@/api/request-modules/iteration";
import { useStore } from "@/store";
import useMessageTip from "@/composables/useMessageTip";
import { ResponseParams } from "@/types/response";
import useAddOrEditDIalogForm from "./composables/useAddOrEditDIalogForm";
import useMixin from "../../useMixin";
import useGetDemandList from "../../useGetDemandList";

export default defineComponent({
  setup() {
    const employeeLists = computed(() => useStore() && useStore().getters.employeeLists);
    const { rules, handleChangeDialogStatus, isShowIteration, title, ruleFormRef, formData } = useAddOrEditDIalogForm();

    const { tipMessage } = useMessageTip();

    const setFiled = (staff_name: string, filed: string) => {
      const staff_no = employeeLists.value.find((list: Record<string, any>) => list.staff_name === staff_name).staff_no;
      (formData as any)[filed].staff_no = staff_no;
    };
    // 获取产品计划列表
    let resultProductList: Record<string, any> = ref([]);
    // 新增传true
    getPlanCascader<ResponseParams.ResponseDataSuccess>(true).then((res) => {
      resultProductList.value = res.data;
    });
    const selectProps = { expandTrigger: "hover", label: "name", value: "id", children: "child_list" };
    const handleCreateIteration = () => {
      ruleFormRef.value!.validate((valid: boolean) => {
        if (valid) {
          if (Reflect.toString.call(formData.plan_id) == "[object Array]") {
            formData.plan_id = (formData.plan_id as any)[1];
          }

          // 创建迭代
          createIteration<ResponseParams.ResponseDataSuccess>(formData).then((res) => {
            tipMessage(res.code);
            // handleConditionSearch();
            handleChangeDialogStatus(true);
            getDemandListFn();
            // 更新当前列表
          });
        } else {
          return false;
        }
      });
    };
    // 重新获取需求列表
    const { demandList, searchParams } = useMixin(false);
    const getDemandList = useGetDemandList();
    const getDemandListFn = () => {
      getDemandList(searchParams.status).then((res) => {
        demandList.value = res;
      });
    };
    return {
      ruleFormRef,
      resultProductList,
      selectProps,
      rules,
      title,
      formData,
      isShowIteration,
      handleCreateIteration,
      handleChangeDialogStatus,
      employeeLists,
      setFiled
    };
  }
});
</script>

<style scoped lang="less">
.flex-layout {
  display: flex;
  flex-wrap: wrap;
  ::v-deep(.el-form-item) {
    flex: 0 0 50%;
  }
}
// ::v-deep(.el-date-editor) {
//   width: 236px;
// }
::v-deep(.el-select) {
  width: 100%;
}
::v-deep(.el-input) {
  width: 100%;
}
::v-deep(.el-form-item) {
  display: flex;
}
::v-deep(.el-form-item__content) {
  flex-grow: 1;
}
::v-deep(.el-cascader) {
  width: 100%;
}
</style>
