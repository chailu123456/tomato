<template>
  <div class="rp-test">
    <page-table
      :tableData="list"
      @handlePagationChange="getData"
      :currentPage="page"
      @sort-change="sortChange"
      :total="total"
      :bugType="bugType"
      ref="pageTableRef"
      :stopAutoGetData="stopAutoGetData"
    >
      <template #header>
        <el-form :inline="true" :model="formParams" :class="[!arrow ? 'test-header-show' : 'test-header-hide']">
          <div class="test-search-main">
            <el-form-item class="search-input" label>
              <el-input
                v-model="formParams.name"
                class="bug-title"
                width="50"
                @change="handleName"
                @keyup.enter="handleConditionSearch"
                clearable
                placeholder="请输入Bug标题"
              ></el-input>
            </el-form-item>

            <el-form-item class="rp-select" label="状态">
              <el-select
                v-model="formParams.status"
                @change="handleStatus"
                clearable
                multiple
                collapse-tags
                @visible-change="handleConditionSearch"
                @remove-tag="handleConditionSearch"
                placeholder="--所有--"
              >
                <el-option v-for="item in BUG_STATUS_DELETE" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item class="rp-select" label="创建人">
              <el-select
                v-model="formParams.create_by"
                placeholder="--所有--"
                clearable
                multiple
                collapse-tags
                @change="handleCreate"
                @visible-change="handleConditionSearch"
                @remove-tag="handleConditionSearch"
              >
                <el-option-group v-for="group in employeeLists" :key="group.staff_no" :label="group.label">
                  <el-option v-for="item in group.options" :key="item.staff_no" :label="item.staff_name" :value="item.staff_no"></el-option>
                </el-option-group>
                <!-- <el-option v-for="item in employeeLists" :key="item.staff_no" :label="item.staff_name" :value="item.staff_no"> </el-option> -->
              </el-select>
            </el-form-item>
            <el-form-item label="指派给" class="rp-select">
              <el-select
                v-model="formParams.staff_no"
                filterable
                clearable
                multiple
                collapse-tags
                @visible-change="handleConditionSearch"
                @remove-tag="handleConditionSearch"
                placeholder="--所有--"
                @change="setFiled"
              >
                <el-option-group v-for="group in iterationPeopleList" :key="group.staff_no" :label="group.label">
                  <el-option v-for="item in group.options" :key="item.staff_no" :label="item.staff_name" :value="item.staff_no"></el-option>
                </el-option-group>
                <!-- <el-option v-for="item in iterationPeopleList" :key="item.staff_no" :label="item.staff_name" :value="item.staff_no"> </el-option> -->
              </el-select>
            </el-form-item>

            <el-form-item label="所属迭代">
              <el-select
                v-model="formParams.iteration_id"
                placeholder="请选择"
                @change="handleIteration"
                clearable
                filterable
                collapse-tags
                @visible-change="handleConditionSearch"
                @remove-tag="handleConditionSearch"
              >
                <el-option v-for="item in productLists" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-icon @click="showSearchList" :class="[!arrow ? 'arrow-down-list' : '', 'el-icon-d-arrow-left']">
              <DArrowRight />
            </el-icon>
            <el-icon @click="handleRefersh" :class="['el-icon-refresh', refersh ? 'icon-refresh' : 'icon-refresh-rotate']">
              <Refresh />
            </el-icon>
            <!-- <i @click="showSearchList" :class="[!arrow ? 'arrow-down-list' : '', 'el-icon-d-arrow-left']"></i> -->
            <!-- <i @click="handleRefersh" :class="['el-icon-refresh', refersh ? 'icon-refresh' : 'icon-refresh-rotate']"></i> -->
          </div>
          <div class="test-operation">
            <el-form-item style="float: right; display: flex">
              <el-button type="primary" @click="handleCreateBug">新 增</el-button>
              <el-button @click="exportTaskDate" type="primary">导 出</el-button>
            </el-form-item>
          </div>
          <div class="test-search-secondary">
            <el-form-item class="rp-select" label="级别">
              <el-select
                v-model="formParams.level"
                @change="handleLevel"
                clearable
                multiple
                collapse-tags
                @visible-change="handleConditionSearch"
                @remove-tag="handleConditionSearch"
                placeholder="--所有--"
              >
                <el-option v-for="item in BUG_LEVEL" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="类型" class="rp-select">
              <el-select
                v-model="formParams.type"
                placeholder="--所有--"
                @change="handleBugType"
                clearable
                multiple
                collapse-tags
                @visible-change="handleConditionSearch"
                @remove-tag="handleConditionSearch"
              >
                <el-option v-for="item in BUG_TYPE" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="创建时间" class="rp-select" prop="create_time">
              <el-date-picker
                v-model="formParams.create_time"
                @change="handleCreateTime"
                type="daterange"
                value-format="YYYY-MM-DD"
                end-placeholder="结束月份"
                start-placeholder="开始月份"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="完成时间" class="rp-select" prop="end_time">
              <el-date-picker
                v-model="formParams.end_time"
                @change="handleEndTime"
                type="daterange"
                value-format="YYYY-MM-DD"
                end-placeholder="结束月份"
                start-placeholder="开始月份"
              ></el-date-picker>
            </el-form-item>
            <el-form-item class="rp-select" label="状态">
              <el-select
                v-model="formParams.env"
                @change="handleEnv"
                clearable
                collapse-tags
                @visible-change="handleConditionSearch"
                @remove-tag="handleConditionSearch"
                placeholder="--所有--"
              >
                <el-option v-for="item in ENVLIST" :key="item.value" :label="item.value" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
          </div>
        </el-form>
      </template>
      <template #main>
        <el-table-column sortable="custom" prop="id" label="ID" width="80"></el-table-column>
        <el-table-column sortable="custom" prop="name" class-name="table-column-left table-title" min-width="300" label="Bug标题" #default="scope">
          <span class="rp-Table__bug" style="font-size: 14px" @click="handleShowDetail(scope.row)">{{ scope.row.name }}</span>
        </el-table-column>
        <el-table-column sortable="custom" prop="level" label="级别" width="80" #default="scope">
          <span v-if="scope.row.level === 1" class="rp-Table__level--generally">一般</span>
          <span v-else-if="scope.row.level === 2" class="rp-Table__level--moderate">中等</span>
          <span v-else-if="scope.row.level === 3" class="rp-Table__level--severity">严重</span>
        </el-table-column>

        <el-table-column sortable="custom" prop="status" label="状态" class-name="table-column-left" width="90" #default="scope">
          <span @click="handleChangeStatus(scope.row)" class="rp-test-status" :style="getTextColor(scope.row.status)">
            <i class="iconfont icon-shouzhi rotate-icon"></i>
            {{ getStatus(scope.row.status) }}
          </span>
        </el-table-column>
        <el-table-column sortable="custom" prop="env" label="所属环境" width="100" #default="scope">
          <span>{{ getEnv(scope.row.env) }}</span>
        </el-table-column>
        <el-table-column sortable="custom" prop="iteration_id" label="所属迭代" width="100" #default="scope">
          <span>{{ scope.row.iteration_id ? scope.row.iteration_name : "主干" }}</span>
        </el-table-column>
        <el-table-column sortable="custom" prop="creator" label="创建人" width="100"></el-table-column>
        <el-table-column sortable="custom" prop="create_time" label="创建日期" width="180"></el-table-column>
        <el-table-column sortable="custom" prop="staff_name" label="指派给" class-name="table-column-left" width="130" #default="scope">
          <template v-if="scope.row.status !== 999">
            <i class="iconfont icon-shouzhi rotate-icon" v-if="scope.row.staff_name"></i>
            <span
              :class="[staffNo === scope.row.staff_no && scope.row.status !== 3 ? `rp-Table__bugSelf` : `rp-Table__bug`]"
              @click="handleChangeAssign(scope.row)"
              >{{ scope.row.staff_name }}</span
            >
          </template>
          <template v-else>
            <span></span>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="end_time" label="解决日期" width="180"></el-table-column>
        <el-table-column label="操作" align="right" width="100">
          <template #default="scope">
            <el-button type="text" @click="handleUpdateList(scope.row)">编辑</el-button>
            <el-button type="text" @click="handleCopyList(scope.row)">复制</el-button>
          </template>
        </el-table-column>
      </template>
      <template #qucikSelect>
        <div class="rp-test-list-num">
          <span class="rp-test-num" @click="handleTypeList('serious', [3])">严重 {{ bugType.serious_num }} 条</span>
          <span class="rp-test-num" @click="handleTypeList('notVerified', [2, 5])">未验证 {{ bugType.unvalidated_num }} 条</span>
          <span class="rp-test-num" @click="handleTypeList('unResolved', [0, 1, 6])">未解决 {{ bugType.unsolved_num }} 条</span>
        </div>
      </template>
    </page-table>

    <!-- 更改状态弹框 -->
    <el-dialog title="修改bug状态" v-model="statusModal" width="30%" center>
      <el-form label-width="70px" class="rp-Dialog__bugStatus">
        <el-form-item label="状态" prop="status">
          <el-select v-model="temp_rowData.status" placeholder="--所有--">
            <el-option v-for="item in BUG_STATUS_DELETE" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input rows="5" show-word-limit placeholder="请输入备注" type="textarea" v-model="temp_rowData.remark" maxlength="200"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handleConfirmChange">保 存</el-button>
          <el-button @click="statusModal = false">取 消</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 更改指派弹框 -->
    <el-dialog title="修改指派" v-model="assignModal" width="30%" center>
      <el-form label-width="70px" class="rp-Dialog__bugStatus">
        <el-form-item label="指派给" prop="status">
          <el-select value-key="staff_no" filterable collapse-tagsvalue-key="staff_no" v-model="assignFormData.staff_no" placeholder="--所有--">
            <!-- <el-option v-for="item in iterationPeopleList" :key="item.staff_no" :label="item.staff_name" :value="item.staff_no"> </el-option> -->
            <el-option-group v-for="group in iterationPeopleList" :key="group.staff_no" :label="group.label">
              <el-option v-for="item in group.options" :key="item.staff_no" :label="item.staff_name" :value="item.staff_no"></el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input rows="5" show-word-limit placeholder="请输入备注" type="textarea" v-model="assignFormData.remark" maxlength="200"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handleConfirmChangeAssign">保 存</el-button>
          <el-button @click="assignModal = false">取 消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, ref, onActivated, computed } from "vue";
import { BUG_STATUS, BUG_LEVEL, BUG_TYPE, setSession, ENVLIST, setObjStringify } from "@/utils/index";
import { demandList } from "@/views/iteration/useMixin";
import { Pagation } from "@/composables/usePagation";
import useRequest from "@/composables/useRequest";
import useRenderTable from "@/composables/useRenderTable";
import useFetchSearch from "./composables/useFetchSearch";
import { updateAssignTask, updateBugStatus, getCreateBugPeople } from "@/api/request-modules/test";
import { getStaffList } from "@/api/request-modules/common";

import { ResponseParams } from "@/types/response";
import { RequestParams } from "@/types/request";
import useMessageTip from "@/composables/useMessageTip";
import router from "@/router";
import { useRoute } from "vue-router";
import { DArrowRight, Refresh } from "@element-plus/icons";

import { useStore } from "@/store/index";
import useWatchChangeProduct from "@/composables/useWatchChangeProduct";
import { getSession } from "@/utils/sesssion";
export default defineComponent({
  name: "test",
  components: { DArrowRight, Refresh },
  setup() {
    const { tipMessage } = useMessageTip();
    const store = useStore();
    const route = useRoute();
    const pageTableRef = ref<any>();
    const getStatus = (status: number) => {
      const list = BUG_STATUS.find((v: { value: number; label: string }) => v.value === status);
      return list?.label;
    };
    const getType = (type: number) => {
      const list = BUG_TYPE.find((v: { value: number; label: string }) => v.value === type);
      return list?.label;
    };
    const getEnv = (type: number) => {
      const list = ENVLIST.find((v: { value: string; id: number }) => v.id === type);
      return list?.value;
    };
    const getTextColor = (status: number) => {
      const list = BUG_STATUS.find((v: { value: number; label: string }) => v.value === status);
      return {
        color: list?.color
      };
    };
    // 判断是否进行筛选
    const flag = ref<boolean>(false);
    const currentIterationName = ref("");
    const currentIterationId = ref<null | number>(null);
    onActivated(() => {
      if (route.query.iteration_id) {
        formParams.name = route.query.name;
      }
      setTimeout(() => {
        handleConditionSearch();
      }, 300);
    });

    const page = ref(1);
    const formParams: any = reactive({
      // 创建人
      create_by: [],
      iteration_id: [],
      status: [],
      name: null,
      staff_no: [] as Array<string>,
      staff_name: [] as Array<string>,
      level: [],
      type: [],
      env: [],
      end_time: "",
      create_time: "",
      product_id: ""
    });

    let temp_rowData = ref<Record<string, any>>({});
    // 所有员工列表
    const employeeLists = ref();
    // 所有指派人列表
    const iterationPeopleList = ref();
    const setFiled = (staffNos: Array<string>) => {
      flag.value = true;
      if (!staffNos.length) {
        formParams.staff_no = [];
        handleConditionSearch;
      }
    };
    const tableData = reactive({
      list: [],
      total: 0,
      bugType: {
        serious_num: 0,
        unsolved_num: 0,
        unvalidated_num: 0
      }
    });

    const stopAutoGetData = ref<boolean>(false);
    // 分页以及获取数据
    const getData = async (pagationParams?: Pagation, flag?: boolean, params?: any) => {
      stopAutoGetData.value = flag == undefined ? false : true;
      page.value = (pagationParams && pagationParams.pageIndex) || 1;
      const { response } = useRequest(useFetchSearch, params || Object.assign(formParams));
      const { pagation } = useRenderTable(response);
      let {
        data: { list, count, serious_num, unsolved_num, unvalidated_num }
      } = await pagation(pagationParams);

      tableData.bugType.serious_num = serious_num;
      tableData.bugType.unsolved_num = unsolved_num;
      tableData.bugType.unvalidated_num = unvalidated_num;
      tableData.total = count;
      tableData.list = list;
    };

    const handleTypeList = (isType: string, params: number[]) => {
      if (isType === "serious") {
        if (arrow.value) showSearchList();
        formParams.level = params;
        // formParams.status = [];
      } else if (isType === "notVerified") {
        formParams.status = params;
        // formParams.level = [];
      } else {
        // formParams.level = [];
        formParams.status = params;
      }
      handleConditionSearch();
    };
    //#region  修改状态
    const statusModal = ref(false);
    const handleChangeStatus = (row: Record<string, any>) => {
      temp_rowData.value = { ...row };
      statusModal.value = true;
    };
    // 弹窗点击确定
    const handleConfirmChange = () => {
      updateBugStatus<ResponseParams.ResponseDataSuccess>(temp_rowData.value as RequestParams.UpdateBugStatus).then((res) => {
        res.code === 200 && tipMessage(res.code);
        getData(pageTableRef.value.getCurrentPage());
        statusModal.value = false;
      });
    };
    const BUG_STATUS_DELETE = BUG_STATUS.slice().splice(1, BUG_STATUS.length);
    //#endregion
    //#region 修改指派
    const assignModal = ref(false);
    const assignFormData = reactive({
      bug_id: 0,
      remark: null,
      staff_no: ""
    });
    const handleChangeAssign = (row: Record<string, any>) => {
      assignFormData.staff_no = row.staff_no;
      assignFormData.bug_id = row.id;
      assignFormData.remark = null;
      assignModal.value = true;
    };
    // 弹窗点击确定
    const handleConfirmChangeAssign = () => {
      updateAssignTask<ResponseParams.ResponseDataSuccess>({
        bug_id: assignFormData.bug_id,
        remark: assignFormData.remark,
        staff_no: assignFormData.staff_no
      }).then((res) => {
        tipMessage(res.code);
        getData(pageTableRef.value.getCurrentPage());
        assignModal.value = false;
        handleIterationEmployeeList();
      });
    };
    //#endregion
    const handleUpdateList = (row: any) => {
      router.push({ name: "bugEdit", query: { page: page.value, bugId: row.id } });
    };
    // 导出
    const exportTaskDate = async () => {
      if (!tableData.total) return tipMessage(400, "暂无数据，无法导出");
      setObjStringify(formParams, "/api/tomato/bug/export");
    };
    // 复制后跳转到新增页面
    const handleCopyList = (row: any) => {
      const coypVal = {
        iteration_id: row.iteration_id,
        level: row.level,
        staff_name: row.staff_name,
        staff_no: row.staff_no,
        status: row.status,
        type: row.type,
        env: row.env,
        currentIterationId: row.iteration_id,
        currentIterationName: row.iteration_name
      };
      router.push({ name: "bugEdit", params: { coypVal: JSON.stringify(coypVal) } });
    };
    // 新增bug
    const handleCreateBug = () => {
      router.push({
        name: "bugEdit",
        query: {
          page: page.value,
          product_id: formParams.product_id,
          currentIterationId: currentIterationId.value,
          currentIterationName: currentIterationName.value
        }
      });
    };
    // 查看详情
    const handleShowDetail = (row: any) => {
      router.push({
        name: "bugDetail",
        query: {
          page: page.value,
          bugId: row.id,
          product_id: formParams.product_id,
          currentIterationId: currentIterationId.value,
          currentIterationName: currentIterationName.value
        }
      });
    };

    // 创建人下拉点击
    const handleCreate = (val: Array<string>) => {
      flag.value = true;
      if (!val.length) {
        formParams.create_by = [];
        // getData(pageTableRef.value.getCurrentPage());
        handleConditionSearch();
      }
    };
    // 类型下拉点击
    const handleBugType = (val: Array<string>) => {
      flag.value = true;

      if (!val.length) {
        formParams.type = [];
        // getData(pageTableRef.value.getCurrentPage());
        handleConditionSearch();
      }
    };
    const handleName = (val: string) => {
      flag.value = true;

      if (!val) {
        formParams.name = "";
        handleConditionSearch();
      }
    };
    const handleCreateTime = (val: Array<string>) => {
      flag.value = true;
      page.value = 1;

      if (!val) {
        formParams.create_time = [];
      }
      handleConditionSearch();
    };
    const handleEndTime = (val: Array<string>) => {
      flag.value = true;
      page.value = 1;

      if (!val) {
        formParams.end_time = [];
      }
      handleConditionSearch();
    };
    const handleLevel = (val: number) => {
      flag.value = true;
      page.value = 1;

      if (!val) {
        formParams.level = [];
        handleConditionSearch();
      }
    };
    const handleStatus = (val: number[]) => {
      flag.value = true;
      page.value = 1;

      if (val.indexOf(-1) >= 0) {
        formParams.status = [];
      }
      if (!val.length) {
        formParams.status = [];
        handleConditionSearch();
      }
    };
    const handleEnv = (val: number[]) => {
      flag.value = true;
      page.value = 1;

      if (val.indexOf(-1) >= 0) {
        formParams.env = [];
      }
      if (!val.length) {
        formParams.env = [];
        handleConditionSearch();
      }
    };

    const handleIteration = (val: number) => {
      flag.value = true;
      page.value = 1;

      if (val) {
        currentIterationName.value = productLists.value.find((list: Record<string, any>) => list.id === val).name;
        if (val === 999999) currentIterationId.value = null;
        else currentIterationId.value = val;
      } else {
        currentIterationId.value = null;
        handleConditionSearch();
      }
    };

    const refersh = ref(true);
    const handleRefersh = () => {
      flag.value = true;
      page.value = 1;

      refersh.value = !refersh.value;
      handleConditionSearch();
    };

    // 获取当前  指派  下拉列表数据
    const handleIterationEmployeeList = () =>
      // getIterationEmployeeList<ResponseParams.ResponseDataSuccess>(getSession("productId") as any).then((res) => {
      //   iterationPeopleList.value = res.data;
      //   setSession("iterationPeopleList", JSON.stringify(iterationPeopleList.value));
      // });
      getStaffList<ResponseParams.ResponseDataSuccess>({
        product_id: formParams.product_id,
        iteration_id: 0,
        type: "all"
      }).then((res) => {
        iterationPeopleList.value = res.data;
        setSession("iterationPeopleList", JSON.stringify(iterationPeopleList.value));
      });

    // 获取当前  创建人  下拉列表数据
    const handleGetCreateBugPeople = () =>
      getCreateBugPeople({ product_id: Number(getSession("productId")) }).then((res: any) => {
        employeeLists.value = res.data;
      });

    // 搜索菜单下拉箭头
    const arrow = ref(true);
    const showSearchList = () => {
      arrow.value = !arrow.value;
      const contentHeight = document.getElementsByClassName("content")[0] as HTMLDivElement;
      const headerHeight = document.getElementsByClassName("search-header")[0] as HTMLDivElement;
      if (arrow.value) pageTableRef.value.height = contentHeight.offsetHeight - headerHeight.offsetHeight - 50;
      else pageTableRef.value.height = contentHeight.offsetHeight - headerHeight.offsetHeight - 160;
    };

    // 获取当前 所属迭代 下拉列表数据
    const productLists = computed(() => {
      const newDemandList = JSON.parse(JSON.stringify(demandList.value)) || [];
      newDemandList.unshift({ name: "主干", id: 999999 });
      return newDemandList;
    });

    let timer: ReturnType<typeof setTimeout>;
    // 条件搜索
    const handleConditionSearch = async (isHiddenSelect?: boolean) => {
      if (isHiddenSelect === true) {
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(async () => {
        if (flag.value) {
          pageTableRef.value.setCurrentPage();
          page.value = 1;
          await getData({ pageIndex: 1, pageSize: 20 }, true, Object.assign(formParams));
          flag.value = false;
        } else {
          await getData(pageTableRef.value?.getCurrentPage(), true, Object.assign(formParams));
        }
        stopAutoGetData.value = false;
        handleIterationEmployeeList();
        handleGetCreateBugPeople();
      }, 300);
    };

    useWatchChangeProduct(handleConditionSearch, (newValue) => {
      if (formParams.product_id != newValue) formParams.iteration_id = null;
      formParams.product_id = newValue as number;

      handleConditionSearch();
    });

    // 排序
    const sortChange = (e: any) => {
      const { prop, order } = e;
      if (!order) return;
      formParams.sort_name = prop;
      formParams.sort_by = order === "ascending" ? 1 : 2;
      getData(pageTableRef.value.getCurrentPage(), undefined, formParams);
    };

    return {
      sortChange,
      staffNo: store.getters.user.staff_no,
      assignModal,
      handleChangeAssign,
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
      getType,
      getEnv,
      getTextColor,
      temp_rowData,
      handleConfirmChange,
      statusModal,
      handleChangeStatus,
      handleUpdateList,
      handleCopyList,
      BUG_LEVEL,
      BUG_TYPE,
      ENVLIST,
      handleConfirmChangeAssign,
      assignFormData,
      showSearchList,
      arrow,
      refersh,
      productLists,
      iterationPeopleList,
      handleCreate,
      handleBugType,
      handleCreateTime,
      handleEndTime,
      handleLevel,
      handleStatus,
      handleEnv,
      handleIteration,
      handleTypeList,
      handleName,
      handleRefersh,
      page,
      exportTaskDate
    };
  }
});
</script>
<style lang="less" scoped>
.rp-test {
  height: calc(100% - -10px);

  .main {
    .bugTitle {
      color: var(--theme-color);
      margin-left: 10px;
      cursor: pointer;
    }
    .rp-Table__common {
      font-size: 12px;
      cursor: pointer;
      &:hover {
        text-decoration: underline;
        opacity: 0.8;
      }
    }
    .rp-Table__bug {
      .rp-Table__common;
      color: #3370ff;
    }
    .rp-Table__bugSelf {
      .rp-Table__common;
      color: #ff0000;
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
}
.rp-test-list-num {
  float: left;
  span.rp-test-num {
    display: inline-block;
    padding: 0px 6px;
    font-size: 13px;
    margin: 0 6px;
    background: #c4efe6;
    color: #606266;
    border-radius: 4px;
    font-weight: 500;
    &:hover {
      cursor: pointer;
      color: #3f3f40;
    }
  }
  // :deep(.el-pagination__total) {
  // display: inline-block;
  // background: #f4f4f5;
  // padding: 2px 6px;
  // line-height: 20px;
  // height: 20px;
  // margin-top: 4px;
  // border-radius: 4px;
  // -webkit-box-sizing: none;
  // }
}
// :deep(.page) {
//   bottom: 20px;
// }

.el-icon-refresh {
  position: absolute;
  margin-left: 30px;
  margin-top: 8px;
  color: #999;

  &:hover {
    cursor: pointer;
    color: @rp-color-background;
  }
}
.icon-refresh-rotate {
  transform: rotate(360deg);
  transition: all 800ms ease-in;
}
.icon-refresh {
  transform: rotate(0deg);
  transition: all 800ms ease-in-out;
}
.el-icon-d-arrow-left {
  // position: fixed;
  position: absolute;
  display: inline-block;
  margin-left: 5px;
  margin-top: 8px;
  color: #999;
  transform: rotate(0deg);
  transition: all 00ms ease;
  &:hover {
    cursor: pointer;
    color: @rp-color-text-primary;
  }
}
.arrow-down-list {
  // position: fixed;
  transform: rotate(90deg);
  transition: all 500ms ease;
}
.rp-Dialog__bugStatus {
  :deep(.el-form-item__content) {
    display: flex;
  }
  :deep(.el-select) {
    width: 100%;
  }
}
:deep(.rp-select) {
  .el-input {
    width: 140px;
  }
  .el-select__tags {
    max-width: 126px !important;
  }
  .el-select__tags-text {
    max-width: 50px !important;
  }
  .el-date-editor {
    width: 240px;
  }
}

.rp-test-status {
  text-align: left;
  &:hover {
    cursor: pointer;
  }
}
.rotate-icon {
  transform: rotate(90deg);
  margin-right: 5px;
  color: #3370ff;
}

.test-header-hide {
  height: 50px;
  // overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  transition: all 500ms ease;
}
.test-header-show {
  display: flex;
  flex-wrap: wrap;
  height: 100px;
  transition: all 500ms ease;
}
.test-search-main {
  width: 92%;
  height: 50px;
  white-space: nowrap;
  // overflow-x: scroll;
  // overflow-y: hidden;

  :deep(.bug-title) {
    width: 160px;
  }
}
.test-operation {
  width: 8%;
  :deep(.el-form-item__content) {
    display: flex;
    flex-wrap: nowrap;
  }
}
:deep(.el-table__body) {
  .rp-test-column {
    .cell {
      text-align: left !important;
    }
  }
}
</style>
