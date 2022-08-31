<template>
  <div>
    <page-table :tableData="list" @handlePagationChange="getData" :total="total" ref="pageTableRef">
      <template #header>
        <el-form :inline="true" :model="searchParams">
          <el-form-item label="姓名">
            <el-input
              @keyup.enter="handleConditionSearch"
              @change="handleName"
              @blur="handleConditionSearch"
              v-model.trim="searchParams.staff_name"
              placeholder="请输入姓名"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="部门" class="rp-select">
            <el-cascader
              placeholder=""
              @visible-change="handleConditionSearch"
              @remove-tag="handleConditionSearch"
              @change="handleChange"
              :options="allPeople"
              collapse-tags
              ref="cascaderVal"
              filterable
              clearable
              :props="{ multiple: true, value: `id` }"
            ></el-cascader>
          </el-form-item>
          <el-form-item label="当前迭代">
            <el-select
              v-model="searchParams.iteration_ids"
              placeholder="请选择"
              @change="handleIterationSearch"
              clearable
              multiple
              collapse-tags
              @visible-change="handleConditionSearch"
              @remove-tag="handleConditionSearch"
            >
              <el-option v-for="item in currentIterationList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="迭代计划">
            <el-select
              v-model="searchParams.plan_ids"
              @change="handlePlan"
              placeholder="请选择"
              clearable
              multiple
              collapse-tags
              @visible-change="handleConditionSearch"
              @remove-tag="handleConditionSearch"
            >
              <el-option v-for="item in iterationPlan" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item>
            <el-button type="primary" @click="handleConditionSearch">搜 索</el-button>
          </el-form-item> -->
        </el-form>
      </template>
      <template #main>
        <el-table-column prop="staff_id" label="序号" width="80"> </el-table-column>

        <el-table-column prop="staff_name" width="80" label="姓名">
          <template #default="scoped">
            <span>{{ scoped.row.staff_name }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="iteration_list" label="当前迭代" min-width="150">
          <template #default="scoped">
            <div v-for="(item, index) in scoped.row.iteration_list" :key="index" style="text-align: left">
              <p style="margin: 0px">{{ item.iteration_name }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="finished_time" label="完成时间" width="100"></el-table-column>
        <el-table-column prop="next_plan" label="下个迭代计划" min-width="100">
          <template #default="scoped">
            <div v-for="(item, index) in scoped.row.next_plan" :key="index">
              <p>{{ item.name }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="remark" min-width="150" class-name="table-column-left" label="备注"> </el-table-column>
        <el-table-column label="操作" class-name="table-column-center">
          <template #default="scope">
            <el-button type="text" @click="handleRelatePlan(scope.row)">关联迭代计划</el-button>
            <el-button type="text" @click="handleAddRemark(scope.row)">备注</el-button>
          </template>
        </el-table-column>
      </template>
    </page-table>
    <!-- 备注弹框 -->
    <el-dialog title="备注" v-model="statusModal" width="30%" center>
      <el-form class="rp-dialog-remark">
        <el-form-item prop="remark">
          <el-input rows="8" show-word-limit placeholder="请输入备注" type="textarea" v-model="temp_rowData.remark" maxlength="100"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handleConfirmChange">保 存</el-button>
          <el-button @click="statusModal = false">取 消</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 关联迭代计划弹框 -->
    <el-dialog title="关联迭代计划" custom-class="plan-dialog" v-model="planModal" width="50%" center>
      <el-form class="rp-dialog-plan">
        <div class="rp-plan-label">
          <span class="title">所属项目</span>
          <el-input v-model="relatePlan.name" @keyup.enter="handleConditionSearch" disabled></el-input>
        </div>
        <div class="rp-plan-label">
          <span class="title">关联需求</span>
          <el-tree
            @check="handleCheckBoxEventByText"
            default-expand-all
            show-checkbox
            :data="demandDataTree"
            ref="tree"
            node-key="id"
            :props="{ id: `id`, label: `name`, children: `child_list`, is_product: false }"
            :default-checked-keys="checkedArr"
          ></el-tree>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handleConfirmPlan">保 存</el-button>
          <el-button @click="planModal = false">取 消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, toRefs } from "vue";
import useFetchSearch from "./hooks/useFetchSearch";
import { relativePeoplePlan, updateRelativePeoplePlan, getDemandSelectList, getPlanSelect } from "@/api/request-modules/iteration";
import { ResponseParams } from "@/types/response";
import useGetTableData from "@/composables/useGetTableData";
import { updatePeopleRemark } from "@/api/request-modules/iteration";
import useMessageTip from "@/composables/useMessageTip";
import useWatchChangeProduct from "@/composables/useWatchChangeProduct";
import { getDepartmentList } from "@/api/request-modules/common";

type SearchParams = {
  department_code_list: string[];
  iteration_ids: string[];
  plan_ids: string[];
  product_id: number;
  staff_name: string;
};
export default defineComponent({
  name: "peopleArrangument",
  setup() {
    const iterationPlan = ref([]);

    const pageTableRef = ref();
    const searchParams = reactive<SearchParams>({
      department_code_list: [],
      iteration_ids: [],
      plan_ids: [],
      product_id: 0,
      staff_name: ""
    });

    const { tipMessage } = useMessageTip();

    let allPeople: any = ref(null);
    const cascaderVal = ref();
    const handleChange = () => {
      const val = cascaderVal?.value.getCheckedNodes();
      let code: string[] = [];
      if (val && val.length) {
        val.forEach((item: Record<string, any>) => {
          code.push(item.value);
        });
      }
      searchParams.department_code_list = code;
      if (!val.length) getData();
    };

    const { getData, tableData, stopAutoGetData } = useGetTableData(useFetchSearch, searchParams);
    // getData();
    let timer: ReturnType<typeof setTimeout>;
    const handleConditionSearch = async (isHiddenSelect?: boolean) => {
      if (isHiddenSelect === true) {
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(async () => {
        // 获取当前page_size，如果有缓存，不设置，没有缓存默认第一页
        await getData(1, true, searchParams);
        stopAutoGetData.value = false;
      }, 300);
    };
    const statusModal = ref(false);
    const planModal = ref(false);

    let temp_rowData = reactive({
      product_id: 0,
      staff_no: "",
      remark: ""
    });
    const handleAddRemark = (row: Record<string, any>) => {
      temp_rowData.staff_no = row.staff_no;
      temp_rowData.remark = row.remark;
      statusModal.value = true;
    };
    // 关联迭代计划
    const demandDataTree = ref<Record<string, any>[]>([]);
    demandDataTree.value = [];
    const checkedArr = ref<number[]>([]);
    const tree = ref();

    const relatePlan: any = reactive({
      product_id: 0,
      name: "",
      plan_ids: [],
      staff_no: ""
    });
    const handleCheckBoxEventByText = () => {
      // const allCheckNodes = tree?.value.getCheckedNodes();
      const keys = tree?.value.getCheckedKeys();
      checkedArr.value = keys;
    };
    const handleRelatePlan = (row: Record<string, any>) => {
      planModal.value = true;
      relatePlan.staff_no = row.staff_no;
      checkedArr.value = [];
      demandDataTree.value = [];
      relativePeoplePlan({ product_id: row.product_id, staff_no: row.staff_no }).then((res: any) => {
        let checkIds: number[] = [];
        if (res.data && res.data.child_list.length) {
          checkedArr.value = res.data.child_list.filter((item: Record<string, any>) => {
            if (item.checked) checkIds.push(item.id);
          });
          checkedArr.value = checkIds;
          relatePlan.name = res.data.name;
        }
        demandDataTree.value.push(res.data);
      });
    };
    const handleName = (val: string) => {
      if (!val) {
        searchParams.staff_name = "";
        handleConditionSearch();
      }
    };
    // 关联迭代计划--弹窗点击确定
    const handleConfirmPlan = () => {
      relatePlan.product_id = searchParams.product_id;
      relatePlan.plan_ids = checkedArr.value;
      updateRelativePeoplePlan<ResponseParams.ResponseDataSuccess>(relatePlan).then((res) => {
        tipMessage(res.code);
        getData(pageTableRef.value.getCurrentPage());
      });
      planModal.value = false;
    };
    // 备注--弹窗点击确定
    const handleConfirmChange = () => {
      updatePeopleRemark<ResponseParams.ResponseDataSuccess>(temp_rowData).then((res) => {
        tipMessage(res.code);
        getData(pageTableRef.value.getCurrentPage());
      });
      statusModal.value = false;
    };

    const handlePlan = (val: number[]) => {
      if (!val.length) {
        searchParams.plan_ids = [];
        handleConditionSearch();
      }
    };

    let currentIterationList = ref([]);

    useWatchChangeProduct(handleConditionSearch, (newValue) => {
      searchParams.product_id = newValue as number;
      temp_rowData.product_id = newValue as number;
      // 重置searchParams
      // searchParams.department_code_list = [];
      searchParams.iteration_ids = [];
      searchParams.plan_ids = [];
      handleConditionSearch();
      // 获取当前迭代下拉列表数据
      getDemandSelectList({ product_id: newValue as number, status: -1 }).then((res: any) => {
        currentIterationList.value = res.data;
      });
      // 获取迭代计划下拉列表数据
      getPlanSelect({ product_id: newValue as number, status_list: [1, 2, 3, 8] }).then((res: any) => {
        console.log(res.data);
        iterationPlan.value = res.data;
      });
    });

    const dataReverse = (people: Array<Record<string, any>>) => {
      let newArr: Array<Record<string, any>> = [];
      for (let i = 0; i < people.length; i += 1) {
        let obj: Record<string, any> = {};
        obj.id = people[i].department_code;
        obj.label = people[i].name;
        if (people[i].son && people[i].son.length) {
          obj.children = dataReverse(people[i].son);
        }
        newArr.push(obj);
      }
      return newArr;
    };

    // 部门列表
    getDepartmentList<ResponseParams.ResponseDataSuccess>().then((res) => {
      allPeople.value = dataReverse(res.data);
    });

    const handleIterationSearch = (val: number[]) => {
      if (!val.length) {
        searchParams.iteration_ids = [];
        handleConditionSearch();
      }
    };

    return {
      getData,
      currentIterationList,
      handleAddRemark,
      handleConditionSearch,
      iterationPlan,
      ...toRefs(tableData),
      searchParams,
      pageTableRef,
      statusModal,
      planModal,
      handleConfirmChange,
      temp_rowData,

      handleRelatePlan,
      handleConfirmPlan,
      relatePlan,
      demandDataTree,
      checkedArr,
      handleCheckBoxEventByText,
      tree,

      allPeople,
      handleChange,
      cascaderVal,
      handleIterationSearch,
      handlePlan,
      handleName
    };
  }
});
</script>

<style scoped lang="less">
.status-enabled {
  color: rgb(108, 188, 1);
}
.app-name {
  color: @rp-color-text-link;
  &:hover {
    cursor: pointer;
  }
}
:deep(.rp-select) {
  .el-input {
    min-width: 360px;
    height: 32px;
  }
  .el-select__tags {
    min-width: 300px !important;
  }
  .el-cascader__tags {
    min-width: 320px !important;
  }
  .el-select__tags-text {
    min-width: 300px !important;
  }
  span.el-tag {
    margin-top: 6px;
  }
  .el-cascader__search-input {
    width: 300px;
    // position: absolute;
    // top: -16px;
    // height: 0;
    // padding: 1.2em 0.5em;
    // background-clip: content-box;
  }
}
:deep(.el-tree__empty-text) {
  width: 121px;
  margin-left: 40px;
}
.dialog-footer {
  margin-top: -26px;
  display: inline-block;
}
:deep(.plan-dialog) {
  .rp-dialog-plan {
    display: flex;
    flex-wrap: wrap;
    .rp-plan-label {
      display: flex;
      width: 100%;
      margin-top: 10px;
      span.title {
        width: 80px;
        line-height: 30px;
      }
    }
  }
}
:deep(.page) {
  bottom: 22px;
}
</style>
<style lang="less">
.el-cascader-menu__wrap {
  height: 400px !important;
}
</style>
