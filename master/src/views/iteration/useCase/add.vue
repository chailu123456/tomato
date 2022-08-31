<template>
  <div class="container">
    <div class="main">
      <el-button type="primary" style="float: right" v-debounce @click="handleConfirmSave">保 存</el-button>
      <el-table :data="tableData">
        <el-table-column prop="name" class-name="table-column-left" label="用例名称" width="350">
          <template #default="scope">
            <el-input
              v-model="scope.row.name"
              type="textarea"
              maxlength="100"
              :autosize="{ minRows: 2, maxRows: 4 }"
              placeholder="请输入不超过100字的用例标题"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="product_module_id" label="模块" width="130">
          <template #default="scope">
            <div class="default-form-item">
              <el-select v-if="!moduleTree?.length"></el-select>
              <module-select
                v-else
                :list="moduleTree"
                v-model:value="scope.row.product_module_id"
                @change="(val:any) => handleModuleClick(val, scope.row)"
                @updateUseCase="getModuleSelectTree"
              ></module-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="用例类型" width="130">
          <template #default="scope">
            <el-select v-model="scope.row.type" filterable placeholder="请选择" :disabled="scope.row.is_sys">
              <div v-if="scope.$index == 0">
                <el-option v-for="item in CASE_STATUS" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </div>
              <div v-else>
                <el-option v-for="item in CASE_STATUS_LAST" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </div>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="用例等级" width="130">
          <template #default="scope">
            <el-select v-model="scope.row.level" filterable placeholder="请选择" :disabled="scope.row.is_sys">
              <div v-if="scope.$index == 0">
                <el-option v-for="item in CASEPRIORITY" :key="item.value" :label="item.value" :value="item.id"> </el-option>
              </div>
              <div v-else>
                <el-option v-for="item in CASE_PRIORITY_LAST" :key="item.value" :label="item.value" :value="item.id"> </el-option>
              </div>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="指派给" width="120">
          <template #default="scope">
            <el-select :disabled="scope.row.is_sys" v-model="scope.row.staff_name" filterable placeholder="请选择">
              <div v-if="scope.$index == 0">
                <el-option v-for="item in newEmployeeLists" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"> </el-option>
              </div>
              <div v-else>
                <el-option v-for="item in employeeLists_last" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"> </el-option>
              </div>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="premise" label="前提">
          <template #default="scope">
            <el-input placeholder="请输入0-300字" type="textarea" :rows="3" :disabled="scope.row.is_sys" v-model="scope.row.premise" maxlength="300"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="input" label="输入">
          <template #default="scope">
            <el-input placeholder="请输入0-300字" type="textarea" :rows="3" :disabled="scope.row.is_sys" v-model="scope.row.input" maxlength="300"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="output" label="输出">
          <template #default="scope">
            <el-input placeholder="请输入0-300字" :rows="3" type="textarea" :disabled="scope.row.is_sys" v-model="scope.row.output" maxlength="300"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="remark" class-name="table-column-left" label="备注">
          <template #default="scope">
            <el-input placeholder="请输入0-300字" type="textarea" maxlength="300" :rows="3" v-model="scope.row.remark"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" v-if="!isEdit">
          <template #default="scope">
            <el-icon class="action" @click="handlePlusTable(scope.$index)">
              <CirclePlus />
            </el-icon>
            <el-divider direction="vertical"></el-divider>
            <el-icon
              class="action"
              :style="{ pointerEvents: scope.$index === 0 ? 'none' : '', color: scope.$index === 0 ? '#ccc' : '' }"
              :disable="scope.$index !== 0"
              @click="handleRemoveTable(scope.$index)"
            >
              <Remove />
            </el-icon>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script lang="ts">
import {} from "process";
import { defineComponent, ref, computed, onMounted } from "vue";
import { getSession } from "@/utils";

import { addUseCaseData } from "@/api/request-modules/iteration";
import { PRIORITY, STATUS } from "./contantOptions";
import { ResponseParams } from "@/types/response";
import useMessageTip from "@/composables/useMessageTip";
import { useRoute } from "vue-router";
import { CirclePlus, Remove } from "@element-plus/icons";
import fileSave from "@/utils/fileSave";
import { allMember } from "@/api/request-modules/product";
import { USER } from "@/store/state";
import { useStore } from "@/store";
import { getModuleData, ModuleNode } from "@/components/module-manage";

interface UseCase {
  id: number;
  input: string;
  iteration_id: number;
  level: number | string;
  name: string;
  output: string;
  premise: string;
  product_id: number;
  product_module_id: number;
  product_module_name: string;
  remark: string;
  staff_name: string;
  staff_no: string;
  type: number | string;
}

export default defineComponent({
  name: "useCaseAdd",
  components: { CirclePlus, Remove },

  setup() {
    const route = useRoute();
    const store = useStore();
    // 迭代id保存
    const iterateId = computed(() => store.getters.iterateId);
    const user = getSession("user", true) as USER;

    const idKey = ref(0);

    const curProductInfo = computed(() => store?.getters?.productInfo);
    const moduleTree = ref<ModuleNode[]>();

    const isEdit = ref(false);
    const rawTableData = {
      name: "", // 用例名称
      type: 1, // 用例类型 1.冒烟 2.功能
      input: "", // 输入
      level: 1, // 用例等级 1.P0 2.P1 3.P2 4.P3
      premise: "", // 输入
      output: "", // 输出
      product_module_id: 0,
      product_module_name: curProductInfo.value?.name,
      product_id: curProductInfo.value?.id, // 项目id
      iteration_id: iterateId.value, // 迭代id
      remark: "", // 备注
      staff_name: user?.name,
      staff_no: user?.staff_no,
      id: ++idKey.value
    };
    // 等级
    let priority = JSON.parse(JSON.stringify(PRIORITY));

    //
    const updateTableList = (id: number) => {
      tableData.value.forEach((item: UseCase) => {
        if (item.product_module_id === id) {
          item.product_module_id = 0;
          if (moduleTree.value && moduleTree.value[0].name) {
            item.product_module_name = moduleTree.value[0]?.name || "";
          }
        }
      });
    };

    // 获取指派人下拉列表
    const newEmployeeLists: any = ref([]);
    const employeeLists_last: any = ref([]);

    // 获取模块select树数据  id: 在新增模块弹窗中删除模块的id，回调与当前列表进去比较  parentId:删掉id的父级id，如果删除当前id，则默认挂载到parentId
    const getModuleSelectTree = async (id?: number) => {
      if (id) await updateTableList(id);
      const data = await getModuleData({
        id: curProductInfo.value?.id,
        name: curProductInfo.value?.name
      });
      if (data?.length) {
        moduleTree.value = data;
        moduleTree.value.unshift({
          value: -1,
          label: "管理模块",
          level: -1,
          id: -1,
          name: "管理模块"
        });
      }
      console.log(moduleTree.value);
    };

    onMounted(() => {
      getModuleSelectTree();
    });

    const getUserList = (pId: number) => {
      if (!pId) return;
      allMember<ResponseParams.ResponseDataSuccess>({ product_id: pId }).then((res: any) => {
        if (res.data && res.data.length) {
          newEmployeeLists.value = res.data[1]?.options || [];
          employeeLists_last.value = [{ staff_name: "同上", value: -1 }].concat(newEmployeeLists.value);
        } else {
          newEmployeeLists.value = [];
          employeeLists_last.value = [];
        }
      });
    };
    getUserList(curProductInfo.value?.id);
    // 获取指派人下拉列表

    const handleModuleClick = (val: any, data: UseCase) => {
      data.product_module_id = val.id;
    };

    const CASEPRIORITY = priority;
    const CASE_PRIORITY_LAST = [{ value: "同上", id: -1 }].concat(priority);
    // 用例类型
    let status = JSON.parse(JSON.stringify(STATUS));

    const CASE_STATUS = status;
    const CASE_STATUS_LAST = [{ label: "同上", value: -1 }].concat(status);

    const tableData: any = ref(
      Array(route.query.isEdit ? 1 : 2)
        .fill({})
        .map(() => {
          return { ...rawTableData };
        })
    );
    // 填充数据处理，将类型，指派给默认设置为同上
    tableData.value.forEach((v: UseCase, index: number) => {
      if (index >= 1) {
        v.type = "同上";
        v.level = "同上";
      }
    });

    const { tipMessage } = useMessageTip();

    // 新增一条用例
    const handlePlusTable = (index: number) => {
      tableData.value.splice(
        index + 1,
        0,
        Object.assign(
          { ...rawTableData },
          {
            level: "同上",
            type: "同上",
            id: ++idKey.value
          }
        )
      );
    };

    const handleRemoveTable = (item: number) => {
      if (tableData.value.length <= 1) {
        return;
      }
      tableData.value.splice(item, 1);
    };
    const handleConfirmSave = () => {
      const post_table = JSON.parse(JSON.stringify(tableData.value));
      const resultTable = post_table.filter((v: Record<string, any>) => v.name !== "");
      if (resultTable.length) {
        if (resultTable[0].type === "同上" || resultTable[0].type === -1) return tipMessage(400, `请选择第1条的用例类型`);
        if (resultTable[0].level === -1 || resultTable[0].level === "同上") return tipMessage(400, `请选择第1条的用例等级`);
      }
      resultTable.forEach((itemObj: Record<string, any>, index: number) => {
        if (!itemObj.name) {
          tipMessage(400, `请输入第${index + 1}条的用例名称`);
          throw new Error("未选择类型！");
        }

        for (let key in itemObj) {
          if (itemObj[key] === -1 || itemObj[key] === "同上") {
            itemObj[key] = resultTable[index - 1][key as keyof typeof rawTableData];
          }
          if (key === "staff_name" && itemObj[key] && itemObj[key] !== "所有人") {
            const staff_no = newEmployeeLists.value.find((employee: Record<string, any>) => employee.staff_name === itemObj[key])?.staff_no;
            resultTable[index].staff_no = staff_no;
          }
        }
        const typeArr = [1, 2];
        if (!typeArr.includes(itemObj.type)) {
          tipMessage(400, `请输入第${index + 1}条的用例类型`);
          throw new Error("未选择类型！");
        }
        if (!itemObj.level) {
          tipMessage(400, `请选择第${index + 1}条的用例等级`);
          throw new Error("未选择用例等级！");
        }
        itemObj.product_id = curProductInfo.value?.id;
        itemObj.iteration_id = iterateId.value;
      });
      if (resultTable.length) {
        resultTable.forEach((item: Record<string, any>) => {
          item.type = item.type * 1;
        });
        addUseCaseData<ResponseParams.ResponseDataSuccess>(resultTable).then((res) => {
          successCallBack(res.code);
        });
      } else {
        return tipMessage(400, "请添加用例");
      }

      const successCallBack = (code: number) => {
        tipMessage(code);
        if (code === 200) {
          localStorage.setItem("setUseCase", "caseOption");
          window.close();
        }
      };
    };
    return {
      moduleTree,
      fileSave,
      handleConfirmSave,
      CASE_PRIORITY_LAST,
      CASEPRIORITY,
      CASE_STATUS,
      CASE_STATUS_LAST,
      handleRemoveTable,
      handlePlusTable,
      tableData,
      isEdit,
      newEmployeeLists,
      employeeLists_last,
      handleModuleClick,
      idKey,
      getModuleSelectTree
    };
  }
});
</script>

<style scope lang="less">
.container {
  padding: 20px;
}
.main {
  display: inline-block !important;
  height: 99%;
  box-sizing: border-box;
}
.action {
  font-size: 20px;
  cursor: pointer;
}
:deep(.el-upload--text) {
  width: 100%;
}
:deep(.el-upload-dragger) {
  width: 100%;
  line-height: 180px;
}
</style>
