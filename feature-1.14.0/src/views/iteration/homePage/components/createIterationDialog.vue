<template>
  <!-- 新增迭代弹窗 -->
  <el-dialog custom-class="iterationDialog" :title="title" v-model="isShowIteration" width="740px" center :close-on-click-modal="false">
    <span>
      <el-form :model="formData" label-width="100px" :rules="rules" ref="ruleFormRef">
        <div class="flex-layout">
          <el-form-item label="关联计划" prop="plan_id" label-width="100px">
            <el-select v-model="formData.plan_id" placeholder="请选择" @change="handleSetPlanVersion">
              <el-option v-for="item in resultProductList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="迭代版本号" label-width="100px" prop="id">
            <el-input placeholder="" disabled v-model="formData.id"></el-input>
          </el-form-item>
        </div>
        <div class="flex-layout">
          <el-form-item label="迭代名称" label-width="100px" prop="name">
            <el-input placeholder="请输入简称" v-model="formData.name" maxlength="12"></el-input>
          </el-form-item>
          <!-- <el-cascader :disabled="Boolean(formData.id)" :props="selectProps" v-model="formData.plan_id" :options="resultProductList"></el-cascader> -->
          <el-form-item label="计划版本号" label-width="100px" prop="version">
            <el-input placeholder="" disabled v-model="formData.version"></el-input>
          </el-form-item>
        </div>
        <div class="flex-layout">
          <el-form-item label="产品负责人" label-width="100px" prop="iteration_manager.staff_name">
            <el-select v-model="formData.iteration_manager.staff_name" filterable placeholder="请选择" @change="setFiled($event, 'iteration_manager')">
              <!-- <el-option v-for="item in employeeLists" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"> </el-option> -->
              <el-option-group v-for="group in productManagerList" :key="group.staff_no" :label="group.label">
                <el-option v-for="item in group.options" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"></el-option>
              </el-option-group>
            </el-select>
          </el-form-item>
          <el-form-item label="前端负责人" label-width="100px" prop="frontend_manager.staff_name">
            <el-select v-model="formData.frontend_manager.staff_name" filterable placeholder="请选择" @change="setFiled($event, 'frontend_manager')">
              <!-- <el-option v-for="item in employeeLists" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"> </el-option> -->
              <el-option-group v-for="group in frontendManagerList" :key="group.staff_no" :label="group.label">
                <el-option v-for="item in group.options" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"></el-option>
              </el-option-group>
            </el-select>
          </el-form-item>
          <el-form-item label="后端负责人" label-width="100px" prop="backend_manager.staff_name">
            <el-select v-model="formData.backend_manager.staff_name" filterable placeholder="请选择" @change="setFiled($event, 'backend_manager')">
              <!-- <el-option v-for="item in employeeLists" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"> </el-option> -->
              <el-option-group v-for="group in backendManagerList" :key="group.staff_no" :label="group.label">
                <el-option v-for="item in group.options" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"></el-option>
              </el-option-group>
            </el-select>
          </el-form-item>
          <el-form-item label="测试负责人" label-width="100px" prop="test_manager.staff_name">
            <el-select v-model="formData.test_manager.staff_name" filterable placeholder="请选择" @change="setFiled($event, 'test_manager')">
              <!-- <el-option v-for="item in employeeLists" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"> </el-option> -->
              <el-option-group v-for="group in testManagerList" :key="group.staff_no" :label="group.label">
                <el-option v-for="item in group.options" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"></el-option>
              </el-option-group>
            </el-select>
          </el-form-item>
        </div>

        <div class="flex-layout" v-if="!checkBoxStatus">
          <el-form-item label="开发时间" label-width="100px" prop="dev_time">
            <el-date-picker @change="handleChangeDevTime" value-format="YYYY-MM-DD" v-model="formData.dev_time" type="date" placeholder="选择日期">
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
              placeholder="选择日期"
            >
            </el-date-picker>
          </el-form-item>
        </div>
        <div style="margin: 0 18px 12px" v-if="!hasTime">
          <span style="margin-left: 12px">暂不排期</span>
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
  <el-dialog custom-class="iterationDialog" title="迭代添加成功" v-model="isSuccessAfter" width="600px" center :close-on-click-modal="true">
    <div>
      迭代 <span style="font-weight: 700; margin: 0 8px"> {{ iterationName }} </span>添加成功，您还可以：
    </div>
    <template #footer>
      <span class="dialog-footer" style="display: inline-block; height: 50px">
        <el-button type="primary" v-debounce @click="handleConfirmGo('homepage', 1)">添加成员</el-button>
        <el-button type="primary" v-debounce @click="handleConfirmGo('homepage')">关联仓库</el-button>
        <el-button type="primary" v-debounce @click="handleConfirmGo('exploitation')">拆分任务</el-button>
        <el-button type="primary" v-debounce @click="handleConfirmGo('useCase')">新增用例</el-button>
        <el-button @click="handleConfirmGo()">稍后设置</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { getIterationPlanList, createIteration } from "@/api/request-modules/iteration";
import useMessageTip from "@/composables/useMessageTip";
import { ResponseParams } from "@/types/response";
import useAddOrEditDIalogForm from "./composables/useAddOrEditDIalogForm";
import useMixin, { productId } from "../../useMixin";
import useGetDemandList from "../../useGetDemandList";
import router from "@/router";
import { getEmployeeList, getStaffList } from "@/api/request-modules/common";
// import { useRouter } from "vue-router";
import { getSession, setSession } from "@/utils";
import VueEvent from "@/utils/mitt";
export default defineComponent({
  emits: ["refresh"],
  setup() {
    const isDisable = ref(false);
    const isSuccessAfter = ref(false);

    const employeeLists = ref();
    const productManagerList = ref();
    const frontendManagerList = ref();
    const backendManagerList = ref();
    const testManagerList = ref();
    const { rules, handleChangeDialogStatus, isShowIteration, title, ruleFormRef, formData, hasTime, checkBoxStatus } = useAddOrEditDIalogForm();
    // const router = useRouter();
    const { tipMessage } = useMessageTip();

    const setFiled = (staff_name: string, filed: string) => {
      const staff_no = employeeLists.value.find((list: Record<string, any>) => list.staff_name === staff_name).staff_no;
      (formData as any)[filed].staff_no = staff_no;
    };
    // 获取产品计划列表
    let resultProductList: Record<string, any> = ref([]);

    watch(
      () => isShowIteration.value,
      (newValue) => {
        if (newValue) {
          // 获取关联计划
          setTimeout(() => {
            // 获取可关联计划
            getIterationPlanList<ResponseParams.ResponseDataSuccess>({
              product_id: productId.value as number,
              plan_id: formData.plan_id
            }).then((res) => {
              resultProductList.value = res.data;
            });
            // getPlanCascader<ResponseParams.ResponseDataSuccess>(flag).then((res) => {
            //   resultProductList.value = res.data;
            //   // 不是当前项目的禁用掉
            //   const projectId = getSession("productId", true);
            //   console.log(res.data);
            //   res.data.forEach((v: Record<string, any>) => {
            //     if (v.id !== projectId) {
            //       v.disabled = true;
            //     }
            //   });
            // });
          }, 0);

          // 获取信息技术部员工列表
          getEmployeeList<ResponseParams.ResponseDataSuccess>().then((res) => {
            employeeLists.value = res.data;
          });
          // 获取产品负责人员工列表
          getStaffList<ResponseParams.ResponseDataSuccess>({
            product_id: productId.value as number,
            iteration_id: searchParams.demand,
            search_type: 1
          }).then((res) => {
            productManagerList.value = res.data;
          });
          // 获取前端负责人员工列表
          getStaffList<ResponseParams.ResponseDataSuccess>({
            product_id: productId.value as number,
            iteration_id: searchParams.demand,
            search_type: 2
          }).then((res) => {
            frontendManagerList.value = res.data;
          });
          // 获取后端负责人员工列表
          getStaffList<ResponseParams.ResponseDataSuccess>({
            product_id: productId.value as number,
            iteration_id: searchParams.demand,
            search_type: 3
          }).then((res) => {
            backendManagerList.value = res.data;
          });
          // 获取测试负责人员工列表
          getStaffList<ResponseParams.ResponseDataSuccess>({
            product_id: productId.value as number,
            iteration_id: searchParams.demand,
            search_type: 4
          }).then((res) => {
            testManagerList.value = res.data;
          });
        }
      }
    );
    // val跳转路由名字  num代表跳转后是否进行其他时间
    const handleConfirmGo = (val?: string, num?: number) => {
      if (!val) return (isSuccessAfter.value = false);
      if (val && val !== "homepage") {
        router.push({ name: val });
      } else {
        setTimeout(() => {
          const a = document.getElementsByClassName("main")[0];
          a.scrollTop = 800;
          if (num === 1) {
            VueEvent.emit("btn", "人员弹框弹出");
          }
        }, 1000);
      }
      isSuccessAfter.value = false;
    };

    const iterationName = ref("");

    // const selectProps = { expandTrigger: "hover", label: "name", value: "id", children: "child_list" };
    const { searchParams, setIterationDetail, demandList } = useMixin(true);
    const handleCreateIteration = () => {
      ruleFormRef.value!.validate((valid: boolean) => {
        if (valid) {
          if (Reflect.toString.call(formData.plan_id) == "[object Array]") {
            formData.plan_id = (formData.plan_id as any)[1];
          }
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
          createIteration<ResponseParams.ResponseDataSuccess>(newFormData).then((res) => {
            tipMessage(res.code);
            handleChangeDialogStatus(true);
            const iterationId = (res.data as Record<string, any>).id;
            getDemandListFn(productId.value!, iterationId);
            setIterationDetail(res.data);
            isDisable.value = false;
            if (!newFormData.id) {
              isSuccessAfter.value = true;
              iterationName.value = newFormData.name;
            }
            // setSession("iterationId", iterationId.toString());
            // emit("refresh", Number(route.query.id));
            // 更新当前列表
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
        const _cache = getSession("cacheProject", true) as Array<any>;
        _cache.forEach((v, index) => {
          if (v.projectId === projectId) {
            _cache[index].iterationId = iterationId;
            console.log(v.projectId, projectId, _cache[index]);
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
    //#region 关联计划下拉获取获取计划版本号
    const handleSetPlanVersion = (val: number) => {
      const item = resultProductList.value.find((v: Record<string, any>) => v.id === val);
      if (!formData.id) formData.name = item.name;

      formData.version = item.version;
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
      resultProductList,
      // selectProps,
      rules,
      title,
      formData,
      isShowIteration,
      handleCreateIteration,
      handleChangeDialogStatus,
      employeeLists,
      setFiled,
      handleSetPlanVersion,
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
  :deep(.el-form-item) {
    flex: 0 0 49.8%;
  }
}
:deep(.el-select) {
  width: 100%;
}
:deep(.el-input) {
  width: 100%;
}
:deep(.el-form-item) {
  display: flex;
}
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
</style>
