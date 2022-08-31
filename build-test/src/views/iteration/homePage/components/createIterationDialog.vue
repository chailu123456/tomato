<template>
  <!-- 新增迭代弹窗 -->
  <el-dialog custom-class="iterationDialog" :close-on-press-escape="false" :title="title" v-model="isShowIteration" width="740px" :close-on-click-modal="false">
    <span>
      <el-form :model="formData" label-width="100px" label-position="top" :rules="rules" ref="ruleFormRef">
        <div class="flex-layout iteration-msg">
          <el-form-item label="迭代版本号" label-width="100px" prop="version">
            <el-input placeholder="如2.9.3" v-model="formData.version">
              <template #prepend>V</template>
            </el-input>
          </el-form-item>
          <el-form-item label="迭代名称" label-width="100px" prop="name">
            <el-input placeholder="请输入简称" v-model="formData.name" maxlength="12"></el-input>
          </el-form-item>
        </div>
        <div class="flex-layout">
          <el-form-item label="产品负责人" label-width="100px" prop="iteration_manager.staff_name">
            <el-select v-model="formData.iteration_manager.staff_name" filterable placeholder="请选择" @change="setFiled($event, 'iteration_manager')">
              <el-option-group v-for="group in productManagerList" :key="group.staff_no" :label="group.label">
                <el-option v-for="item in group.options" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"></el-option>
              </el-option-group>
            </el-select>
          </el-form-item>
          <el-form-item label="后端负责人" label-width="100px" prop="backend_manager.staff_name">
            <el-select v-model="formData.backend_manager.staff_name" filterable placeholder="请选择" @change="setFiled($event, 'backend_manager')">
              <el-option-group v-for="group in backendManagerList" :key="group.staff_no" :label="group.label">
                <el-option v-for="item in group.options" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"></el-option>
              </el-option-group>
            </el-select>
          </el-form-item>
          <el-form-item label="前端负责人" label-width="100px" prop="frontend_manager.staff_name">
            <el-select v-model="formData.frontend_manager.staff_name" filterable placeholder="请选择" @change="setFiled($event, 'frontend_manager')">
              <el-option-group v-for="group in frontendManagerList" :key="group.staff_no" :label="group.label">
                <el-option v-for="item in group.options" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"></el-option>
              </el-option-group>
            </el-select>
          </el-form-item>
          <el-form-item label="测试负责人" label-width="100px" prop="test_manager.staff_name">
            <el-select v-model="formData.test_manager.staff_name" filterable placeholder="请选择" @change="setFiled($event, 'test_manager')">
              <el-option-group v-for="group in testManagerList" :key="group.staff_no" :label="group.label">
                <el-option v-for="item in group.options" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"></el-option>
              </el-option-group>
            </el-select>
          </el-form-item>
        </div>

        <div class="flex-layout" v-if="!checkBoxStatus">
          <el-form-item label="开发时间" label-width="100px" prop="dev_time">
            <el-date-picker
              size="default"
              @change="handleChangeDevTime"
              value-format="YYYY-MM-DD"
              v-model="formData.dev_time"
              type="date"
              placeholder="选择日期"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="联调时间" label-width="100px" prop="union_time">
            <el-date-picker
              @change="handleChangeUnionTime"
              :disabledDate="disabledUnionDateTime"
              value-format="YYYY-MM-DD"
              v-model="formData.union_time"
              type="date"
              placeholder="选择日期"
              size="default"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="提测时间" label-width="100px" prop="test_time">
            <el-date-picker
              @change="handleChangeTestTime"
              :disabledDate="disabledTestDateTime"
              value-format="YYYY-MM-DD"
              v-model="formData.test_time"
              type="date"
              size="default"
              placeholder="选择日期"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="发布时间" label-width="100px" prop="release_time">
            <el-date-picker
              @change="handleChangeReleaseTime"
              :disabledDate="disabledReleaseDateTime"
              value-format="YYYY-MM-DD"
              v-model="formData.release_time"
              type="date"
              size="default"
              placeholder="选择日期"
            >
            </el-date-picker>
          </el-form-item>
        </div>
        <div>
          <span>暂不排期</span>
          <el-checkbox style="margin-left: 14px" v-model="checkBoxStatus" label=""></el-checkbox>
        </div>
        <el-form-item label="提醒地址" label-width="100px" prop="notify_url">
          <el-input placeholder="提醒群机器人地址，多个地址用','隔开" v-model="formData.notify_url"></el-input>
        </el-form-item>
      </el-form>
    </span>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleCreateIteration" v-debounce :disabled="isDisable">确 定</el-button>
        <el-button @click="handleChangeDialogStatus(true)">取 消</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog custom-class="iterationDialog" title="迭代添加成功" v-model="isSuccessAfter" width="500px" :close-on-click-modal="true">
    <div>
      迭代 <span style="font-weight: 700; margin: 0 8px"> {{ iterationName }} </span>添加成功，您还可以：
    </div>
    <template #footer>
      <span class="dialog-footer" style="display: inline-block; height: 50px">
        <el-button type="primary" v-debounce @click="handleConfirmGo('addmember')">添加成员</el-button>
        <el-button type="primary" v-debounce @click="handleConfirmGo('homepage')">关联需求</el-button>
        <el-button type="primary" v-debounce @click="handleConfirmGo('exploitation')">拆分任务</el-button>
        <el-button type="primary" v-debounce @click="handleConfirmGo('useCase')">新增用例</el-button>
        <el-button @click="handleConfirmGo()">稍后设置</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from "vue";
import { useStore } from "@/store/index";
import { createIteration } from "@/api/request-modules/iteration";
import useMessageTip from "@/composables/useMessageTip";
import { ResponseParams } from "@/types/response";
import useAddOrEditDIalogForm from "./composables/useAddOrEditDIalogForm";
import useMixin, { productId } from "../../useMixin";
import useGetDemandList from "../../useGetDemandList";
import router from "@/router";
import { getEmployeeList, getStaffList } from "@/api/request-modules/common";
import { getSession, setSession } from "@/utils";
import { MutationType } from "@/store/mutation-types";
export default defineComponent({
  emits: ["refresh"],
  setup() {
    const store = useStore();
    const isDisable = ref(false);
    const isSuccessAfter = ref(false);
    const employeeLists = ref();
    const productManagerList = ref();
    const frontendManagerList = ref();
    const backendManagerList = ref();
    const testManagerList = ref();
    const { rules, handleChangeDialogStatus, isShowIteration, title, ruleFormRef, formData, hasTime, checkBoxStatus } = useAddOrEditDIalogForm();
    const { tipMessage } = useMessageTip();
    const currentIter = computed(() => store.getters.currentIter);

    const setFiled = (staff_name: string, filed: string) => {
      const staff_no = employeeLists.value.find((list: Record<string, any>) => list.staff_name === staff_name).staff_no;
      (formData as any)[filed].staff_no = staff_no;
    };

    watch(
      () => isShowIteration.value,
      (newValue) => {
        if (newValue) {
          // 获取信息技术部员工列表
          getEmployeeList<ResponseParams.ResponseDataSuccess>().then((res) => {
            employeeLists.value = res.data;
          });
          // 获取产品负责人员工列表
          getStaffList<ResponseParams.ResponseDataSuccess>({
            product_id: productId.value as number,
            iteration_id: formData.id ? currentIter.value?.id : undefined,
            search_type: 1
          }).then((res) => {
            productManagerList.value = res.data;
          });
          // 获取前端负责人员工列表
          getStaffList<ResponseParams.ResponseDataSuccess>({
            product_id: productId.value as number,
            iteration_id: formData.id ? currentIter.value?.id : undefined,
            search_type: 2
          }).then((res) => {
            frontendManagerList.value = res.data;
          });
          // 获取后端负责人员工列表
          getStaffList<ResponseParams.ResponseDataSuccess>({
            product_id: productId.value as number,
            iteration_id: formData.id ? currentIter.value?.id : undefined,
            search_type: 3
          }).then((res) => {
            backendManagerList.value = res.data;
          });
          // 获取测试负责人员工列表
          getStaffList<ResponseParams.ResponseDataSuccess>({
            product_id: productId.value as number,
            iteration_id: formData.id ? currentIter.value?.id : undefined,
            search_type: 4
          }).then((res) => {
            testManagerList.value = res.data;
          });
        } else {
          checkBoxStatus.value = false;
        }
      }
    );
    // val跳转路由名字  num代表跳转后是否进行其他时间
    const handleConfirmGo = (val?: string) => {
      if (!val) return (isSuccessAfter.value = false);
      if (val && val !== "homepage" && val !== "addmember") {
        router.push({ name: val });
      } else if (val === "homepage") {
        // 需要先跳转到迭代主页
        if (router.currentRoute.value.path !== "/project/iteration/homepage") {
          router.push({
            name: "homepage"
          });
          isSuccessAfter.value = false;
          setTimeout(() => {
            store.commit(MutationType.iterateContentVisible, true);
          }, 1000);
          return;
        }
        store.commit(MutationType.iterateContentVisible, true);
      } else if (val === "addmember") {
        // 需要先跳转到迭代主页
        if (router.currentRoute.value.path !== "/project/iteration/homepage") {
          router.push({
            name: "homepage"
          });
          isSuccessAfter.value = false;
          setTimeout(() => {
            store.commit(MutationType.addMemberVisible, true);
          }, 2000);
          return;
        }
        store.commit(MutationType.addMemberVisible, true);
      }
      isSuccessAfter.value = false;
    };

    const iterationName = ref("");
    const { searchParams, setIterationDetail, demandList } = useMixin(true);
    const handleCreateIteration = () => {
      ruleFormRef.value!.validate((valid: boolean) => {
        if (valid) {
          if (Reflect.toString.call(formData.plan_id) == "[object Array]") {
            formData.plan_id = (formData.plan_id as any)[1];
          }
          formData.product_id = productId.value as number;
          const newFormData: any = JSON.parse(JSON.stringify(formData));
          if (checkBoxStatus.value) {
            delete newFormData.dev_time;
            delete newFormData.release_time;
            delete newFormData.test_time;
            delete newFormData.union_time;
            newFormData.is_schedule = 0;
          } else {
            newFormData.is_schedule = 1;
          }
          // 创建迭代/更新迭代
          isDisable.value = true;
          createIteration<ResponseParams.ResponseDataSuccess>(newFormData).then(async (res) => {
            if (res.code !== 200) return;
            tipMessage(res.code);
            handleChangeDialogStatus(true);
            // 获取最新迭代列表
            await store.dispatch("GETITERATELIST", formData.product_id);
            // 新增的时候，需要切换到新的迭代
            const iterationId = (res.data as Record<string, any>).id;
            getDemandListFn(productId.value!, iterationId);
            setIterationDetail(res.data);
            isDisable.value = false;
            if (!newFormData.id) {
              isSuccessAfter.value = true;
              iterationName.value = newFormData.name;
            }
          });
        } else {
          return false;
        }
      });
    };
    // 重新获取需求列表
    const getDemandList = useGetDemandList();
    const getDemandListFn = (projectId: number, iterationId: number) => {
      getDemandList(projectId).then((res) => {
        // 需要先更新id在更改列表
        searchParams.demand = iterationId;
        demandList.value = res;
        const curIter = res.find((i: Record<string, any>) => i.id === iterationId);
        store.commit(MutationType.updateCurrentIter, curIter);
        store.commit(MutationType.updateIterateId, iterationId);
        const _cache = getSession("cacheProject", true) as Array<any>;
        _cache.forEach((v, index) => {
          if (v.projectId === projectId) {
            _cache[index].iterationId = iterationId;
          }
        });
        setSession("cacheProject", JSON.stringify(_cache));
      });
    };
    const handleChangeDevTime = () => {
      formData.union_time = null;
      formData.test_time = null;
      formData.release_time = null;
    };
    const handleChangeUnionTime = () => {
      if (!formData.dev_time) {
        formData.union_time = null;
        return tipMessage(500, "请按顺序选择时间(开发-联调-提测-发布)");
      }
      formData.test_time = null;
      formData.release_time = null;
    };
    const handleChangeTestTime = () => {
      if (!formData.dev_time || !formData.union_time) {
        formData.test_time = null;
        return tipMessage(500, "请按顺序选择时间(开发-联调-提测-发布)");
      }
      formData.release_time = null;
    };
    const handleChangeReleaseTime = () => {
      if (!formData.dev_time || !formData.union_time || !formData.test_time) {
        formData.release_time = null;
        return tipMessage(500, "请按顺序选择时间(开发-联调-提测-发布)");
      }
    };
    const disabledUnionDateTime = (pickerTime: Date) => {
      if (formData.dev_time) {
        return pickerTime.getTime() <= new Date(formData.dev_time).getTime() - 86400000;
      }
    };
    const disabledTestDateTime = (pickerTime: Date) => {
      if (formData.union_time) {
        return pickerTime.getTime() <= new Date(formData.union_time).getTime() - 86400000;
      }
    };
    const disabledReleaseDateTime = (pickerTime: Date) => {
      if (formData.test_time) {
        return pickerTime.getTime() <= new Date(formData.test_time).getTime() - 86400000;
      }
    };
    //#endregion
    return {
      isDisable,
      handleChangeDevTime,
      handleChangeUnionTime,
      handleChangeTestTime,
      handleChangeReleaseTime,
      disabledReleaseDateTime,
      disabledTestDateTime,
      disabledUnionDateTime,
      ruleFormRef,
      rules,
      title,
      formData,
      isShowIteration,
      handleCreateIteration,
      handleChangeDialogStatus,
      employeeLists,
      setFiled,
      frontendManagerList,
      productManagerList,
      testManagerList,
      backendManagerList,
      hasTime,
      checkBoxStatus,
      isSuccessAfter,
      handleConfirmGo,
      iterationName
    };
  }
});
</script>

<style scoped lang="less">
.flex-layout {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  :deep(.el-form-item) {
    width: 46%;
    margin-bottom: 10px;
    .el-form-item__label {
      margin-bottom: 0 !important;
    }
  }
}
.iteration-msg {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  :deep(.el-form-item:first-child) {
    width: 33%;
  }
  :deep(.el-form-item:last-child) {
    width: 60%;
  }
}
:deep(.el-select) {
  width: 100%;
}
:deep(.el-input) {
  width: 100%;
}
// :deep(.el-form-item) {
//   display: flex;
// }
:deep(.el-form-item__content) {
  flex-grow: 1;
}
:deep(.el-cascader) {
  width: 100%;
}
:deep(.el-overlay) {
  z-index: 30000 !important;
}
:deep(.el-date-editor--date) {
  width: 100% !important;
}
:global(.iterationDialog .el-dialog__footer .dialog-footer) {
  border-top: none !important;
  text-align: center;
}
</style>
