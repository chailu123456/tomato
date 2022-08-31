<template>
  <div>
    <page-table :tableData="list" @handlePagationChange="getData" :total="total" ref="pageTableRef" :stopAutoGetData="stopAutoGetData">
      <template #header>
        <el-form :inline="true" :model="formParams" class="demo-form-inline">
          <el-form-item label="Bug标题">
            <el-input v-model="formParams.name" placeholder="请输入Bug标题"></el-input>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="formParams.status" placeholder="--所有--">
              <el-option v-for="item in BUG_STATUS" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="创建人">
            <el-select v-model="formParams.status" placeholder="--所有--">
              <el-option v-for="item in []" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="类型">
            <el-select v-model="formParams.status" placeholder="--所有--">
              <el-option v-for="item in []" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="指派给">
            <el-select v-model="formParams.staff_name" filterable placeholder="请选择" @change="setFiled" clearable>
              <el-option v-for="item in employeeLists" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleConditionSearch">查询</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleCreateBug">新增</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template #main>
        <!-- <el-table-column type="selection" width="55"></el-table-column> -->
        <el-table-column prop="id" label="ID" width="80"> </el-table-column>
        <el-table-column prop="name" label="Bug标题" #default="scope">
          <span class="rp-Table__bug" @click="handleShowDetail(scope.row)">{{ scope.row.name }}</span>
        </el-table-column>
        <el-table-column prop="level" label="级别" width="80" #default="scope">
          <span v-if="scope.row.level === 1" class="rp-Table__level--generally"> 一般 </span>
          <span v-else-if="scope.row.level === 2" class="rp-Table__level--moderate"> 中等 </span>
          <span v-else-if="scope.row.level === 3" class="rp-Table__level--severity"> 严重 </span>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="80" #default="scope">
          <span :style="getTextColor(scope.row.status)">{{ getStatus(scope.row.status) }}</span>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" width="100"> </el-table-column>
        <el-table-column prop="staff_name" label="指派给" width="100"> </el-table-column>
        <el-table-column prop="" label="类型" width="100"> </el-table-column>
        <el-table-column prop="create_time" label="创建日期" width="180"> </el-table-column>

        <el-table-column prop="end_time" label="解决日期" width="180"> </el-table-column>
        <el-table-column width="180" label="操作">
          <template #default="scope">
            <el-button type="text" @click="handleUpdateList(scope.row)">编辑</el-button>
            <el-button type="text" @click="handleChangeStatus(scope.row)">修改状态</el-button>
          </template>
        </el-table-column>
      </template>
    </page-table>
    <!-- 更改状态弹框 -->
    <el-dialog title="修改bug状态" v-model="statusModal" width="30%" center>
      <el-form label-width="70px" class="rp-Dialog__bugStatus">
        <el-form-item label="状态" prop="name">
          <el-select v-model="temp_rowData.status" placeholder="--所有--">
            <el-option v-for="item in BUG_STATUS_DELETE" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="name">
          <el-input show-word-limit placeholder="请输入备注" type="textarea" v-model="temp_rowData.remark" maxlength="50"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handleConfirmChange">保 存</el-button>
          <el-button @click="statusModal = false">取 消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, ref, computed, watch } from "vue";
import { BUG_STATUS, setSession } from "@/utils/index";
import { useStore } from "@/store";
import useMixin from "../useMixin";
import { Pagation } from "@/composables/usePagation";
import useRequest from "@/composables/useRequest";
import useRenderTable from "@/composables/useRenderTable";
import useFetchSearch from "./composables/useFetchSearch";
import { updateBugStatus } from "@/api//request-modules/test";
import { ResponseParams } from "@/types/response";
import { RequestParams } from "@/types/request";
import useMessageTip from "@/composables/useMessageTip";
import router from "@/router";
export default defineComponent({
  name: "test",
  setup() {
    const { tipMessage } = useMessageTip();
    const getStatus = (status: number) => {
      const list = BUG_STATUS.find((v: { value: number; label: string }) => v.value === status);
      return list?.label;
    };
    const getTextColor = (status: number) => {
      const list = BUG_STATUS.find((v: { value: number; label: string }) => v.value === status);
      return {
        color: list?.color
      };
    };
    const page = ref(1);
    const { searchParams } = useMixin();
    const formParams = reactive({
      iteration_id: null,
      status: -1,
      name: null,
      staff_no: null,
      staff_name: null
    });
    watch(
      () => searchParams.demand,
      () => {
        handleConditionSearch();
      }
    );
    let temp_rowData = ref({});
    // 所有员工列表
    const employeeLists = computed(() => useStore() && useStore().getters.employeeLists);
    const setFiled = (name: string) => {
      if (!name) {
        formParams.staff_no = null;
        return;
      }
      const staff_no = employeeLists.value.find((list: Record<string, any>) => list.staff_name === name).staff_no;
      formParams.staff_no = staff_no;
    };
    const tableData = reactive({
      list: [],
      total: 0
    });
    const pageTableRef = ref<any>();
    const stopAutoGetData = ref<boolean>(false);
    // 分页以及获取数据
    const getData = async (pagationParams?: Pagation, flag?: boolean, params?: any) => {
      stopAutoGetData.value = flag == undefined ? false : true;
      page.value = (pagationParams && pagationParams.pageIndex) || 1;
      const { response } = useRequest(useFetchSearch, params || Object.assign(formParams, { iteration_id: searchParams.demand }));
      const { pagation } = useRenderTable(response);
      let {
        data: { list, count }
      } = await pagation(pagationParams);
      tableData.total = count;
      tableData.list = list;
    };
    // const route = useRoute();
    // { pageIndex: Number(route.query.page) || 1, pageSize: 10 }
    getData();
    // 条件搜索
    const handleConditionSearch = async () => {
      await getData(undefined, true, Object.assign(formParams, { iteration_id: searchParams.demand }));
      stopAutoGetData.value = false;
    };
    // 修改状态
    const statusModal = ref(false);
    const handleChangeStatus = (row: any) => {
      temp_rowData.value = row;
      statusModal.value = true;
    };
    // 弹窗点击确定
    const handleConfirmChange = () => {
      updateBugStatus<ResponseParams.ResponseDataSuccess>(temp_rowData.value as RequestParams.UpdateBugStatus).then((res) => {
        tipMessage(res.code);
        getData(pageTableRef.value.getCurrentPage());
        statusModal.value = false;
      });
    };
    const BUG_STATUS_DELETE = BUG_STATUS.slice().splice(1, BUG_STATUS.length);

    const handleUpdateList = (row: any) => {
      setSession("editBug", row);
      router.push({ path: "/iteration/edit", query: { isEdit: 1, page: page.value } });
    };
    const handleCreateBug = () => {
      router.push({ path: "/iteration/edit", query: { page: page.value } });
    };
    // 查看详情
    const handleShowDetail = (row: any) => {
      setSession("detailBug", row);
      router.push({
        path: "/iteration/detail",
        query: { isDetail: 1, page: page.value }
      });
    };
    return {
      handleShowDetail,
      handleCreateBug,
      BUG_STATUS_DELETE,
      handleConditionSearch,
      BUG_STATUS,
      formParams,
      employeeLists,
      setFiled,
      ...toRefs(tableData),
      getData,
      pageTableRef,
      stopAutoGetData,
      getStatus,
      getTextColor,
      temp_rowData,
      handleConfirmChange,
      statusModal,
      handleChangeStatus,
      handleUpdateList
    };
  }
});
</script>
<style lang="less" scoped>
.main {
  .bugTitle {
    color: var(--theme-color);
    margin-left: 10px;
    cursor: pointer;
  }
  .rp-Table__bug {
    font-size: 14px;
    color: rgba(0, 18, 179);
    cursor: pointer;
    &:hover {
      text-decoration: underline;
      opacity: 0.8;
    }
  }
  .rp-Table__level--generally {
    color: #f8982d;
  }
  .rp-Table__level--moderate {
    color: #fa6e1a;
  }
  .rp-Table__level--severity {
    color: #ff0000;
  }
}
.rp-Dialog__bugStatus {
  ::v-deep(.el-form-item__content) {
    display: flex;
  }
  ::v-deep(.el-select) {
    width: 100%;
  }
}
</style>
