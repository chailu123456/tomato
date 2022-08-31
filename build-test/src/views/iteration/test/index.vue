<template>
  <div class="rp-test">
    <page-table
      :tableData="list"
      :currentPage="page"
      :total="total"
      :highlight="true"
      :bugType="bugType"
      ref="pageTableRef"
      :isFullScreen="isFullScreen"
      :stopAutoGetData="stopAutoGetData"
      @sort-change="sortChange"
      @handlePagationChange="getData"
      @handleSelectionChange="handleSelectionChange"
    >
      <template #header>
        <div class="search-header">
          <div class="search-left">
            <search-form
              :searchArray="searchArray"
              :currentActive="currentActive"
              @quickSeacrh="quickSeacrh"
              @changeSearch="changeSearch"
              @onCancel="onCancleSearch"
            ></search-form>
            <el-icon @click="handleRefersh" :class="['el-icon-refresh', refersh ? 'icon-refresh' : 'icon-refresh-rotate']">
              <Refresh />
            </el-icon>
          </div>
          <div class="search-right">
            <el-button plain @click="exportTaskDate">导出</el-button>
            <el-button class="js-drawer-uncloseable" type="primary" @click="handleCreateBug">新增BUG</el-button>
          </div>
        </div>
      </template>
      <template #main>
        <el-table-column type="selection" width="55"></el-table-column>
        <!-- Bug标题 -->
        <el-table-column sortable="custom" prop="name" class-name="table-column-left table-title" min-width="200" label="Bug标题" #default="scope">
          <span class="js-drawer-uncloseable rp-Table__bug" style="font-size: 14px" @click="handleShowDetail(scope.row.id)">{{ scope.row.name }}</span>
        </el-table-column>
        <!-- 状态 -->
        <el-table-column sortable="custom" prop="status" label="状态" :min-width="140">
          <template #default="scope">
            <span @click="handleChangeStatus(scope.row)" class="rp-Table__common rp-Table__icons" :style="getTextColor(scope.row.status)">
              {{ getStatus(scope.row.status) }}
              <el-icon class="rp-Table__icons-arrow"><ArrowDown /></el-icon>
            </span>
          </template>
        </el-table-column>
        <!-- 优先级 -->
        <el-table-column sortable="custom" prop="priority" label="优先级" :min-width="80">
          <template #default="scope">
            <selectOption
              :valueKey="['id', 'value']"
              keyVal="priority"
              :currentVal="scope.row.priority"
              :type="1"
              currentType="priority"
              :item="scope.row"
              :optionsData="PRIORITY"
              @onChangeSelect="onChangeSelect"
            ></selectOption>
          </template>
        </el-table-column>
        <!-- 级别 -->
        <el-table-column sortable="custom" prop="level" label="级别" :min-width="90">
          <template #default="scope">
            <selectOption
              :valueKey="['value', 'label']"
              keyVal="level"
              :currentVal="scope.row.level"
              :type="1"
              currentType="level"
              :item="scope.row"
              :optionsData="BUG_LEVEL"
              @onChangeSelect="onChangeSelect"
            ></selectOption>
          </template>
        </el-table-column>
        <!-- 指派给 -->
        <el-table-column sortable="custom" prop="staff_name" label="指派给" :min-width="100">
          <template #default="scope">
            <selectOption
              :valueKey="['staff_no', 'staff_name']"
              keyVal="staff_no"
              :currentVal="scope.row.staff_name"
              :type="0"
              currentType="staff_no"
              :item="scope.row"
              :optionsData="employeeLists"
              @onChangeSelect="onChangeSelect"
            ></selectOption>
          </template>
        </el-table-column>
        <!-- 解决日期 -->
        <el-table-column sortable="custom" prop="end_time" label="解决时间" :min-width="140"></el-table-column>
        <!-- 创建人 -->
        <el-table-column sortable="custom" prop="creator" label="创建人" :min-width="100"></el-table-column>
        <!-- 创建日期 -->
        <el-table-column sortable="custom" prop="create_time" label="创建时间" :min-width="140"></el-table-column>
        <!-- 操作栏目 -->
        <el-table-column label="操作" align="right" :min-width="60">
          <template #default="scope">
            <el-button type="primary" link @click="handleCopyList(scope.row)">复制</el-button>
          </template>
        </el-table-column>
      </template>

      <!-- 底部快捷搜索 -->
      <template #qucikSelect>
        <div class="rp-test-list-num">
          <span class="rp-test-num" @click="handleTypeList('unResolved', [0, 1, 6])">未解决 {{ bugType.unsolved_num }} 条</span>
          <span class="rp-test-num" @click="handleTypeList('notVerified', [2, 5])">待验证 {{ bugType.unvalidated_num }} 条</span>
          <span class="rp-test-num" @click="handleTypeList('serious', [3])">严重 {{ bugType.serious_num }} 条</span>
        </div>
      </template>
    </page-table>

    <!-- 基础选项 -->
    <div class="rp-use-task-opation" v-if="selectMore.length">
      <el-dropdown size="small" trigger="click" ref="basicBtn">
        <el-button>
          基础项
          <el-icon><ArrowUp /></el-icon>
        </el-button>
        <template #dropdown>
          <el-cascader-panel @change="handleBasicChange" ref="cascaderPanel" :options="basicsOption" />
        </template>
      </el-dropdown>
    </div>

    <!-- 更改状态弹框 -->
    <el-dialog title="修改bug状态" v-model="statusModal" width="40%">
      <el-form :key="Math.random()" label-position="top" label-width="88px" class="rp-Dialog__bugStatus">
        <el-form-item label="状态" prop="status">
          <el-select v-model="temp_rowData.status" placeholder="--所有--">
            <el-option v-for="item in BUG_STATUS_DELETE" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="[4, 5].includes(temp_rowData.status)" label="方案或原因" prop="cause">
          <el-select v-model="temp_rowData.cause">
            <el-option v-for="item in REJECTDEALREASON" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="[2].includes(temp_rowData.status)" label="实际消耗工时" prop="hours">
          <el-input type="number" v-model="temp_rowData.hours" placeholder="请输入实际消耗工时" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <WangEditor :height="200" @getWangEditorValue="(val) => (temp_rowData.remark = val)" :description="temp_rowData.remark" ref="wangEditor" />
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
    <el-dialog title="修改指派" v-model="assignModal" width="30%">
      <el-form label-width="70px" class="rp-Dialog__bugStatus">
        <el-form-item label="指派给" prop="status">
          <el-select value-key="staff_no" filterable collapse-tagsvalue-key="staff_no" v-model="assignFormData.staff_no" placeholder="--所有--">
            <el-option-group v-for="group in employeeLists" :key="group.staff_no" :label="group.label">
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

    <!-- 右侧抽屉 -->
    <div :key="drawerCount">
      <Drawer
        :id="drawerForm.id"
        v-model:drawer="bugDrawer"
        :title="drawerForm.name"
        :headerTitle="headerTitle"
        :rich="drawerForm.description"
        :rich2="drawerForm.remark"
        :richStatus="richStatus"
        :rich2Status="rich2Status"
        :statusList="drawerForm.list"
        :loading="loading"
        @onHandle="onHandle"
      >
        <template #form>
          <form-bug
            :drawerForm="drawerForm"
            :bugTypeList="BUG_TYPE"
            :bugStatusList="BUG_STATUS_DELETE"
            :staffList="employeeLists"
            :levelList="BUG_LEVEL"
            :priorityList="PRIORITY"
            :envList="ENVLIST"
            :iterationList="iterateList"
            :demandList="newDemandLists"
            :taskList="taskLists"
            :useCaseList="useCaseList"
            :currIterateId="iterateId"
            @onHandle="handleBugDetail"
          ></form-bug>
        </template>
      </Drawer>
    </div>
    <!-- 指派人弹出框 -->
    <dialog-demand title="指派给" @updateVal="updateVal" :userList="employeeLists" :type="dialogType" v-model:visible="dialogDemand"></dialog-demand>
    <!-- 全屏相关 -->
    <FullScreen v-model:fullscreen="isFullScreen" />
  </div>
</template>
<script lang="ts">
import { useRoute } from "vue-router";
import router from "@/router";
import dayjs from "dayjs";
import { ElLoading } from "element-plus";
import useMixin from "../useMixin";
import { useStore } from "@/store/index";
import { ResponseParams } from "@/types/response";
import { ArrowUp } from "@element-plus/icons";
import FormBug from "./components/formBug.vue";
import useRequest from "@/composables/useRequest";
import Drawer from "@/components/drawer/index.vue";
import { Pagation } from "@/composables/usePagation";
import useMessageTip from "@/composables/useMessageTip";
import useRenderTable from "@/composables/useRenderTable";
import useFetchSearch from "./composables/useFetchSearch";
import WangEditor from "@/components/wangEditor/index.vue";
import FullScreen from "@/components/fullscreen/index.vue";
import { getStaffList } from "@/api/request-modules/common";
import { cloneDeep, assign, map, pickBy } from "lodash";
import { PRIORITY, REJECTDEALREASON } from "@/utils/contantOptions";
import { BtnArray, SearchForm, SearchArray } from "@/types/interface";
import dialogDemand from "@/businessComponents/demandDialog/index.vue";
import useWatchChangeProduct from "@/composables/useWatchChangeProduct";
import { defineComponent, reactive, toRefs, ref, onMounted, watch, computed, onDeactivated } from "vue";
import { BUG_STATUS, BUG_LEVEL, BUG_TYPE, ENVLIST, setObjStringify } from "@/utils/index";
import { getBugDetail, updateBug, createBug, getBugDynamic } from "@/api/request-modules/test";
import { ArrowDown, Refresh } from "@element-plus/icons";
import { Iterate } from "@/composables/useBoardBase";
import selectOption from "@/businessComponents/selectOption/index.vue";

export default defineComponent({
  name: "test",
  components: {
    Drawer,
    FormBug,
    ArrowUp,
    FullScreen,
    WangEditor,
    dialogDemand,
    ArrowDown,
    Refresh,
    selectOption
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const pageTableRef = ref<any>();
    const { tipMessage } = useMessageTip();

    interface WangText {
      id: number[];
      name?: string;
      field?: string;
      remark?: string;
      description?: string;
      origin_remark?: string;
    }

    //#region 修改指派
    const assignModal = ref(false);
    const assignFormData = reactive({
      bug_id: 0,
      remark: null,
      staff_no: ""
    });
    const statusModal = ref(false);
    const isFullScreen = ref(false);

    const arrow = ref(true);
    const refersh = ref(true);
    // 判断是否进行筛选
    const flag = ref<boolean>(false);
    // 表格多选
    const selectMore: any = ref([]);

    const iterateId = computed(() => store.getters.iterateId);
    const currentIter = computed(() => store.getters.currentIter);
    const curProductInfo = computed(() => store?.getters?.productInfo);
    const onIteration = computed(() => router.currentRoute.value.meta.onIteration);

    const getStatus = (status: number) => {
      const list = BUG_STATUS.find((v: { value: number; label: string }) => v.value === status);
      return list?.label;
    };
    const getType = (type: number) => {
      const list = BUG_TYPE.find((v: { value: number; label: string }) => v.value === type);
      return list?.label;
    };
    const getTextColor = (status: number) => {
      const list = BUG_STATUS.find((v: { value: number; label: string }) => v.value === status);
      return {
        color: list?.color
      };
    };

    const { handleGetIterationList, newDemandLists, employeeBasicLists, employeeLists, iterateListData, iterateBasicLists, taskLists, useCaseList } =
      useMixin();
    handleGetIterationList();

    const allEmployeeLists = ref([]);
    const iterateList = reactive(cloneDeep(iterateListData));
    const iterateBasicList = reactive(cloneDeep(iterateBasicLists));
    const page = ref(1);
    const pageSize = ref(20);

    // 初始化待搜索的表单数据
    const defaultParams = {
      env: [],
      type: [],
      level: [],
      status: [],
      name: null,
      end_time: "",
      product_id: "",
      create_time: "",
      create_by: [],
      iteration_id: [],
      staff_no: [] as Array<string>,
      staff_name: [] as Array<string>
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
    const loading = ref(false);
    const currentActive = ref("-1");
    const stopAutoGetData = ref<boolean>(false);
    let temp_rowData = ref<Record<string, any>>({});
    let formParams: any = reactive(cloneDeep(defaultParams));

    // 快捷搜索列表的数据
    const defaultBtnArray: BtnArray[] = [
      { id: "-1", label: "所有", key: "" },
      { id: "0,1,6", label: "未解决", key: "status" },
      { id: "2,5", label: "待验证", key: "status" },
      { id: "4", label: "延期处理", key: "status" },
      { id: "6", label: "我创建的", key: "create_by" },
      { id: "7", label: "指给我的", key: "staff_no" },
      { id: "8", label: "本月", key: "create_time" }
    ];

    const BUG_STATUS_DELETE = BUG_STATUS.slice().splice(1, BUG_STATUS.length);

    const defaultSearchForm: any = [
      {
        type: "input",
        label: "名称",
        key: "name",
        val: ""
      },
      {
        type: "select",
        label: "状态",
        val: [],
        multiple: true,
        key: "status",
        valueKey: ["value", "label"],
        listData: BUG_STATUS_DELETE
      },
      {
        type: "select",
        label: "创建人",
        val: [],
        key: "create_by",
        showRecord: true,
        multiple: true,
        valueKey: ["staff_no", "staff_name"],
        listData: allEmployeeLists
      },
      {
        type: "select",
        label: "指派给",
        val: [],
        key: "staff_no",
        showRecord: true,
        multiple: true,
        valueKey: ["staff_no", "staff_name"],
        listData: allEmployeeLists
      },
      {
        type: "select",
        label: "优先级",
        val: [],
        key: "priority",
        multiple: true,
        valueKey: ["id", "value"],
        listData: PRIORITY
      },
      {
        type: "select",
        label: "级别",
        val: [],
        key: "level",
        multiple: true,
        listData: BUG_LEVEL
      },
      {
        type: "select",
        label: "类型",
        multiple: false,
        val: [],
        key: "type",
        listData: BUG_TYPE
      },
      {
        type: "select",
        label: "所属环境",
        multiple: false,
        val: [],
        key: "env",
        valueKey: ["id", "value"],
        listData: ENVLIST
      },
      {
        type: "select",
        label: "关联需求",
        multiple: false,
        val: [],
        key: "demand_id",
        valueKey: ["id", "name"],
        listData: newDemandLists
      },
      {
        type: "select",
        label: "关联迭代",
        multiple: false,
        val: [],
        key: "iteration_id",
        valueKey: ["id", "name"],
        listData: iterateList
      },
      {
        type: "select",
        label: "关联任务",
        multiple: false,
        val: [],
        key: "task_id",
        valueKey: ["id", "name"],
        listData: taskLists
      },
      {
        type: "select",
        label: "关联用例",
        multiple: false,
        val: [],
        key: "test_case_id",
        valueKey: ["id", "name"],
        listData: useCaseList
      },
      {
        type: "daterange",
        label: "创建时间",
        multiple: false,
        val: [],
        key: "create_time",
        listData: []
      }
    ];

    const searchArray: SearchArray = reactive({
      btnArray: defaultBtnArray,
      searchForm: defaultSearchForm
    });

    // 抽屉组件form表单
    const defaultDrawerForm = {
      id: null,
      env: 1,
      type: 1,
      hours: null,
      level: 1,
      cause: null,
      status: 0,
      task_id: null,
      priority: 3,
      demand_id: null,
      test_case_id: null,
      name: "",
      remark: "",
      staff_no: "",
      task_name: "",
      staff_name: "",
      demand_name: "",
      product_name: "",
      test_case_name: "",
      description: "<p><b>[步骤]</b><br/><br/><br/><b>[结果]<br/></b><br/><br/><b>[期望]<br/></b><br/><br/></p>",
      iteration_id: "",
      iteration_name: "",
      list: [] as Array<Record<string, any>>,
      attachment: [] as Array<Record<string, any>>,
      product_id: curProductInfo.value?.id
    };
    let drawerForm = ref(cloneDeep(defaultDrawerForm));
    const bugDrawer = ref(false);
    const drawerCount = ref(1);
    const richStatus = ref("view");
    const rich2Status = ref("view");
    const headerTitle = ref("新增需求");

    //基础操作列表数据
    const basicBtn = ref();
    const cascaderPanel = ref();
    // 基础向操作 指派人、来源人状态
    const dialogType = ref(1);
    const dialogDemand = ref(false);
    const basicsOption = ref([
      {
        value: "status",
        label: "状态",
        children: BUG_STATUS_DELETE
      },
      {
        value: "priority",
        label: "优先级",
        children: PRIORITY.map((o) => {
          return { value: o.id, label: o.value };
        })
      },
      {
        value: "level",
        label: "级别",
        children: BUG_LEVEL
      },
      {
        value: "type",
        label: "类型",
        children: BUG_TYPE
      },
      {
        value: "staff_no",
        label: "指派给",
        children: []
      },
      {
        value: "iteration_id",
        label: "迭代",
        children: iterateBasicList
      }
    ]);

    watch(
      () => route.query,
      () => {
        const { bugId, type, status, where } = route.query as Record<string, string>;
        if (bugId) {
          setTimeout(() => {
            handleShowDetail(bugId as string);
            router.replace({
              path: route.path,
              query: {
                productId: curProductInfo?.value?.id
              }
            });
          }, 300);
        } else {
          if (where === "headerTest" && type === "add") {
            setTimeout(() => {
              handleCreateBug();
              router.replace({
                path: route.path,
                query: {
                  productId: curProductInfo?.value?.id
                }
              });
            }, 300);
          }
          if (where === "home" && status) {
            formParams.status = status?.split(",").map((i: string) => parseInt(i));
            searchArray.searchForm[1].val = formParams.status;
            currentActive.value = "-10";
            setTimeout(() => {
              router.replace({
                path: route.path,
                query: {
                  productId: curProductInfo?.value?.id
                }
              });
            }, 300);
          }
        }
      },
      {
        immediate: true
      }
    );

    watch(
      () => iterateId.value,
      () => {
        setDefaultIterationId();
        handleConditionSearch();
      }
    );

    // 是否是迭代下的bug列表
    watch(
      () => onIteration.value,
      () => {
        // 这里会导致其他页面被影响到，先加个条件判断
        const currentPath = router.currentRoute.value.name!;
        if (currentPath !== "test") return;
        setDefaultIterationId();
        handleConditionSearch();
      }
    );

    watch(
      () => bugDrawer.value,
      (newValue) => {
        if (!newValue) {
          drawerCount.value++;
        }
      }
    );

    onMounted(() => {
      const { status } = route.query as Record<string, string>;
      if (status) {
        formParams.status = status?.split(",").map((i) => parseInt(i));
        searchArray.searchForm[1].val = formParams.status;
        currentActive.value = "-10";
        setTimeout(() => {
          router.replace({
            path: route.path,
            query: {
              productId: curProductInfo?.value?.id
            }
          });
        }, 300);
      }
      setDefaultIterationId();
      setTimeout(() => {
        handleConditionSearch();
        // 迭代下的bug模块
        if (router.currentRoute.value.meta.onIteration) {
          const item = iterateListData.value.find((item: Iterate) => item.id === iterateId.value);

          if (item) {
            defaultSearchForm[9].listData = [item];
          }
        }
      }, 300);
    });

    onDeactivated(() => {
      bugDrawer.value = false;
    });

    const setDefaultIterationId = () => {
      if (onIteration.value && iterateId.value) {
        // 迭代下的bug
        formParams.iteration_id = parseInt(iterateId.value, 10);
        iterateList.value = [currentIter.value];
        iterateBasicList.value = [
          {
            value: currentIter.value.id,
            label: currentIter.value.name
          }
        ];
      } else {
        // 项目下的bug
        currentActive.value = "-1";
        formParams.iteration_id = "";
        searchArray.searchForm[9].val = "";
        iterateList.value = iterateListData;
        iterateBasicList.value = iterateBasicLists;
      }
    };

    // 分页以及获取数据
    const getData = async (pagationParams?: Pagation, flag?: boolean, params?: any) => {
      stopAutoGetData.value = flag == undefined ? false : true;
      page.value = (pagationParams && pagationParams.pageIndex) || 1;
      pageSize.value = (pagationParams && pagationParams.pageSize) || 20;
      const { response } = useRequest(useFetchSearch, params || Object.assign(formParams));
      const { pagation } = useRenderTable(response);
      let {
        data: { list, count, serious_num, unsolved_num, unvalidated_num }
      } = await pagation(pagationParams);
      tableData.list = list;
      tableData.total = count;
      tableData.bugType.serious_num = serious_num;
      tableData.bugType.unsolved_num = unsolved_num;
      tableData.bugType.unvalidated_num = unvalidated_num;
    };

    const handleTypeList = (isType: string, params: number[]) => {
      searchArray.searchForm = defaultSearchForm;
      if (isType === "serious") {
        formParams.level = params;
        searchArray.searchForm[5].val = params;
      } else if (isType === "notVerified") {
        formParams.status = params;
        formParams.is_reset = 0;
        searchArray.searchForm[1].val = params;
      } else {
        formParams.status = params;
        formParams.is_reset = 0;
        searchArray.searchForm[1].val = params;
      }
      currentActive.value = "-10";
      handleConditionSearch();
    };

    const handleChangeAssign = (row: Record<string, any>) => {
      assignModal.value = true;
      assignFormData.remark = null;
      assignFormData.bug_id = row.id;
      assignFormData.staff_no = row.staff_no;
    };

    // 导出
    const exportTaskDate = async () => {
      if (!tableData.total) return tipMessage(400, "暂无数据，无法导出");
      setObjStringify(formParams, "/api/tomato/bug/export");
    };

    const getSelectId = () => {
      let ids: number[] = [];
      selectMore.value?.forEach((item: Record<string, any>) => {
        ids.push(item.id);
      });
      return ids;
    };

    const handleSelectionChange = (val: any) => {
      selectMore.value = val;
    };

    interface Staff {
      value: string;
      staff_no: string;
    }

    interface StaffData {
      id?: number[];
      field: string;
      staff_name: string;
      staff_no: string;
    }

    // 基础向批量操作
    const handleBasicChange = (val: any) => {
      if (val[0] === "staff_no") {
        dialogType.value = 2;
        dialogDemand.value = true;
      } else {
        const obj: any = {
          id: getSelectId()
        };
        const keyArr = ["status", "priority", "level", "type", "iteration_id"];
        const label = cascaderPanel.value.getCheckedNodes()[0].value;
        obj[val[0]] = label;
        if (keyArr.includes(val[0])) {
          obj[val[0]] = label * 1;
        }
        // 如果是指派人，需要把指派人名字传过去，其它只传id即可
        if (val[0] === "staff_no") {
          const userMsg = employeeBasicLists.value.filter((item: Staff) => item.value === label);
          obj.staff_name = userMsg[0].label;
        }
        obj.field = val[0];
        editOrAddBug(obj, "edit");
      }
      // 隐藏基础项
      basicBtn?.value.handleClose();
    };

    const updateVal = (val: string | StaffData) => {
      if (val === "no") {
        // 弹框取消操作
        getData(pageTableRef.value?.getCurrentPage(), true, Object.assign(formParams));
        return;
      }
      if (dialogType.value === 2) {
        let obj = val as StaffData;
        obj.id = getSelectId();
        editOrAddBug(obj, "edit");
      }
      dialogDemand.value = false;
    };

    const handleRefersh = () => {
      flag.value = true;
      page.value = 1;
      refersh.value = !refersh.value;
      handleConditionSearch();
    };

    interface StaffItem {
      options: { staff_no: string; staff_name: number }[];
      label: string;
    }

    const handleIterationAllEmployeeList = () => {
      getStaffList<ResponseParams.ResponseDataSuccess>({
        product_id: formParams.product_id,
        iteration_id: onIteration.value ? iterateId.value : undefined,
        type: "all"
      }).then((res) => {
        if (res.code === 200 && res.data) {
          allEmployeeLists.value = res.data;
        } else {
          allEmployeeLists.value = [];
        }
      });
    };

    const handleIterationEmployeeList = () => {
      handleIterationAllEmployeeList();
      getStaffList<ResponseParams.ResponseDataSuccess>({
        product_id: formParams.product_id,
        iteration_id: onIteration.value ? iterateId.value : undefined
      }).then((res) => {
        if (res.code === 200 && res.data) {
          employeeLists.value = res.data;
          const staffItem = res.data[1] as StaffItem;
          employeeBasicLists.value = staffItem?.options.map((o: Record<string, any>) => {
            return { value: o.staff_no, label: o.staff_name };
          });
        } else {
          employeeLists.value = [];
          employeeBasicLists.value = [];
        }
      });
    };

    // 搜索菜单下拉箭头
    const showSearchList = () => {
      arrow.value = !arrow.value;
      const contentHeight = document.getElementsByClassName("content")[0] as HTMLDivElement;
      const headerHeight = document.getElementsByClassName("search-header")[0] as HTMLDivElement;
      if (arrow.value) pageTableRef.value.height = contentHeight.offsetHeight - headerHeight.offsetHeight - 50;
      else pageTableRef.value.height = contentHeight.offsetHeight - headerHeight.offsetHeight - 160;
    };

    let timer: ReturnType<typeof setTimeout>;
    const handleConditionSearch = async (isHiddenSelect?: boolean) => {
      if (isHiddenSelect === true) {
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(async () => {
        if (flag.value) {
          pageTableRef.value?.setCurrentPage();
          page.value = 1;
          await getData({ pageIndex: 1, pageSize: pageSize.value as number }, true, Object.assign(formParams));
          flag.value = false;
        } else {
          await getData(pageTableRef.value?.getCurrentPage(), true, Object.assign(formParams));
        }
        stopAutoGetData.value = false;
        handleIterationEmployeeList();
      }, 300);
    };

    useWatchChangeProduct(handleConditionSearch, (newValue) => {
      if (formParams.product_id != newValue) {
        formParams.iteration_id = null;
      }
      formParams.product_id = newValue as number;
      defaultDrawerForm.product_id = newValue;
      handleConditionSearch();
      handleGetIterationList();
    });

    // 排序
    const sortChange = (e: any) => {
      const { prop, order } = e;
      if (!order) return;
      formParams.sort_name = prop;
      formParams.sort_by = order === "ascending" ? 1 : 2;
      getData(pageTableRef.value?.getCurrentPage(), undefined, formParams);
    };

    // 快捷搜索
    const quickSeacrh = (val: BtnArray) => {
      let lastDay, firstDay;
      const { key, id } = val;
      formParams = cloneDeep(
        assign(defaultParams, {
          product_id: curProductInfo.value?.id,
          iteration_id: onIteration.value ? iterateId.value : undefined
        })
      );
      switch (key) {
        case "status":
          formParams[key] = id?.split(",").map((i) => parseInt(i));
          if (formParams.status === "") {
            formParams.is_reset = 1;
          }
          break;
        case "create_by":
        case "staff_no":
          formParams[key] = store.getters.user.staff_no;
          break;
        case "create_time":
          lastDay = dayjs().endOf("month").format("YYYY-MM-DD");
          firstDay = dayjs().format("YYYY-MM-01");
          formParams[key] = [firstDay, lastDay];
          break;
        default:
          break;
      }
      handleRefersh();
    };

    const onCancleSearch = () => {
      searchArray.btnArray = defaultBtnArray;
      searchArray.searchForm = defaultSearchForm;
    };

    // 下拉列表搜索
    const changeSearch = (val: SearchForm) => {
      formParams = cloneDeep(
        assign(defaultParams, {
          product_id: curProductInfo.value?.id,
          iteration_id: onIteration.value ? iterateId.value : undefined
        })
      );
      map(val, (value, key) => {
        switch (key) {
          case "name": // 名称
          case "create_by": // 创建人
          case "staff_no": // 指派给
          case "type": // 类型
          case "create_time": // 创建时间
          case "level": // 级别
          case "env": // 所属环境
          case "iteration_id": // 关联迭代
          case "priority": // 优先级
          case "demand_id": // 关联需求
          case "task_id": // 关联任务
          case "test_case_id": // 关联用例
            // 迭代属性并且在bug下面并且迭代属性对应的值不存在，就使用上面全局的iterateId
            if (key === "iteration_id" && onIteration.value && !value) return;
            formParams[key] = value;
            break;
          case "status": // 状态为空时需要特殊处理下
            formParams[key] = value;
            if (formParams.status === "") {
              formParams.is_reset = 1;
            }
            break;
        }
      });
      handleRefersh();
    };

    // 新增bug
    const handleCreateBug = () => {
      headerTitle.value = "新增BUG";
      richStatus.value = "add";
      rich2Status.value = "add";
      drawerForm.value = cloneDeep(defaultDrawerForm);
      // 产品要求把筛选条件中的迭代带入，所以会有以下代码
      if (formParams.iteration_id) {
        drawerForm.value.iteration_id = formParams.iteration_id;
      }
      bugDrawer.value = true;
    };

    const updateBugDynamic = (bugId: string | number) => {
      getBugDynamic<ResponseParams.ResponseDataSuccess>(bugId).then((res) => {
        if (res.code === 200 && res.data) {
          drawerForm.value.list = res.data;
        }
      });
    };

    //#region  修改状态
    const handleChangeStatus = (row: Record<string, any>) => {
      getBugDetail<ResponseParams.ResponseDataSuccess>(row.id).then((res) => {
        if (res.code === 200 && res.data) {
          const { id, status, cause, hours, remark } = res.data;
          temp_rowData.value.id = id;
          temp_rowData.value.status = status;
          temp_rowData.value.cause = cause ? cause : 1;
          temp_rowData.value.hours = hours ? hours : "";
          temp_rowData.value.remark = remark ? remark : "";
          statusModal.value = true;
        }
      });
    };

    const resetDrawerForm = (data: any) => {
      const {
        id,
        env,
        type,
        hours,
        level,
        cause,
        status,
        task_id,
        priority,
        demand_id,
        test_case_id,
        name,
        remark,
        staff_no,
        task_name,
        staff_name,
        demand_name,
        product_name,
        test_case_name,
        iteration_id,
        iteration_name,
        attachment,
        description,
        product_id
      } = data as Record<string, any>;
      // 这里的写法是为了兼容组件显示
      drawerForm.value.id = id ? id : null;
      drawerForm.value.env = env ? env : null;
      drawerForm.value.type = type ? type : null;
      drawerForm.value.level = level ? level : null;
      drawerForm.value.cause = cause ? cause : null;
      drawerForm.value.task_id = task_id ? task_id : null;
      drawerForm.value.priority = priority ? priority : null;
      drawerForm.value.demand_id = demand_id ? demand_id : null;
      drawerForm.value.test_case_id = test_case_id ? test_case_id : null;
      drawerForm.value.iteration_id = iteration_id ? iteration_id : null;
      drawerForm.value.hours = hours;
      drawerForm.value.name = name;
      drawerForm.value.remark = remark;
      drawerForm.value.staff_no = staff_no;
      drawerForm.value.status = status;
      drawerForm.value.task_name = task_name;
      drawerForm.value.staff_name = staff_name;
      drawerForm.value.demand_name = demand_name;
      drawerForm.value.product_name = product_name;
      drawerForm.value.test_case_name = test_case_name;
      drawerForm.value.iteration_name = iteration_name;
      drawerForm.value.attachment = attachment;
      drawerForm.value.description = description;
      drawerForm.value.product_id = product_id;
    };

    // 复制后带参数新增
    const handleCopyList = (row: any) => {
      getBugDetail<ResponseParams.ResponseDataSuccess>(row.id).then((res) => {
        if (res.code === 200 && res.data) {
          resetDrawerForm(res.data);
          drawerForm.value.id = null;
          drawerForm.value.status = 0;
          drawerForm.value.list = [];
          drawerForm.value.name = "";
          drawerForm.value.remark = "";
          drawerForm.value.description = "<p><b>[步骤]</b><br/><br/><br/><b>[结果]<br/></b><br/><br/><b>[期望]<br/></b><br/><br/></p>";
          headerTitle.value = "新增BUG";
          richStatus.value = "add";
          rich2Status.value = "add";
          bugDrawer.value = true;
        }
      });
    };

    // 查看详情
    const handleShowDetail = (bugId: string | number) => {
      if (!bugId) return;

      updateBugDynamic(bugId);
      bugDrawer.value = true;
      getBugDetail<ResponseParams.ResponseDataSuccess>(bugId)
        .then((res) => {
          if (res.code === 200 && res.data) {
            resetDrawerForm(res.data);
            headerTitle.value = "查看BUG详情";
            richStatus.value = "view";
            rich2Status.value = "view";
            loading.value = true;
          }
        })
        .finally(() => {
          loading.value = false;
        });
    };

    const handleBugDetail = (bugId: string | number) => {
      if (!bugId) return;
      updateBugDynamic(bugId);
      getBugDetail<ResponseParams.ResponseDataSuccess>(bugId).then((res) => {
        if (res.code === 200 && res.data) {
          resetDrawerForm(res.data);
          headerTitle.value = "查看BUG详情";
          richStatus.value = "view";
          rich2Status.value = "view";
          bugDrawer.value = true;
        }
      });
      getData(pageTableRef.value.getCurrentPage());
    };

    // 抽屉-保存数据
    const onHandle = (type: "save" | "cancel", currentRt: any, who: string) => {
      if (type === "cancel") {
        bugDrawer.value = false;
        return;
      }
      if (who === "title") {
        const obj: WangText = {
          id: [currentRt.id],
          field: "name",
          name: currentRt.title
        };
        if (currentRt.title.length < 4 || currentRt.title.length > 100) return tipMessage(400, "请输入4-100个字数内的标题");
        drawerForm.value.name = currentRt.title;
        editOrAddBug(obj, "edit");
        return;
      }
      // who存在代表编辑，否则是新增需求
      if (currentRt.who) {
        const obj: WangText = {
          id: [currentRt.id],
          field: ""
        };
        if (currentRt.who === "rich") {
          obj.field = "description";
          obj.description = currentRt.rich;
        } else {
          obj.field = "remark";
          obj.remark = currentRt.rich2;
        }
        editOrAddBug(obj, currentRt.id ? "edit" : "add");
      } else {
        if (!currentRt.title) return tipMessage(400, "标题不能为空");
        drawerForm.value.name = currentRt.title;
        drawerForm.value.description = currentRt.rich;
        drawerForm.value.remark = currentRt.rich2;
        const params = {
          name: drawerForm.value.name,
          description: drawerForm.value.description,
          remark: drawerForm.value.remark,
          attachment: drawerForm.value.attachment,
          type: drawerForm.value.type,
          status: drawerForm.value.status,
          staff_no: drawerForm.value.staff_no,
          level: drawerForm.value.level,
          priority: drawerForm.value.priority,
          env: drawerForm.value.env,
          product_id: drawerForm.value.product_id,
          iteration_id: drawerForm.value.iteration_id,
          demand_id: drawerForm.value.demand_id,
          task_id: drawerForm.value.task_id,
          test_case_id: drawerForm.value.test_case_id
        };
        if (!params.staff_no) {
          return tipMessage(400, "请选择指派人");
        } else {
          editOrAddBug(
            pickBy(params, (val) => val),
            "add"
          );
        }
      }
    };

    // 更新后的下拉列表选项
    const onChangeSelect = (val: string | number, item: Record<string, any>, key?: string) => {
      const params: Record<string, any> = {
        id: [item.id],
        field: key
      };
      if (key === "priority") params.priority = val;
      if (key === "status") params.status = val;
      if (key === "level") params.level = val;
      if (key === "staff_no") {
        const person = employeeBasicLists.value.filter((item: Staff) => item.value === val);
        params.staff_no = person[0].value;
        params.staff_name = person[0].label;
      }
      updateBug<ResponseParams.ResponseDataSuccess>(params as any).then((res) => {
        if (res.code === 200) {
          handleConditionSearch();
          return tipMessage(200, "成功");
        }
      });
    };

    // 修改指定bug的状态
    const onChangePriority = (val: Record<string, any>, item: Record<string, any>) => {
      const params: any = {
        id: [item.id],
        priority: val.id,
        field: "priority"
      };
      updateBug<ResponseParams.ResponseDataSuccess>(params as any).then((res) => {
        if (res.code === 200) {
          handleConditionSearch();
          return tipMessage(200, "成功");
        }
      });
    };

    const onChangeType = (val: Record<string, any>, item: Record<string, any>, type?: string) => {
      const params: Record<string, any> = {
        id: [item.id]
      };
      if (type === "staff") {
        params.staff_no = val.value;
        params.staff_name = val?.label;
        params.field = "staff_no";
      }
      updateBug<ResponseParams.ResponseDataSuccess>(params as any).then((res) => {
        if (res.code === 200) {
          handleConditionSearch();
          return tipMessage(200, "成功");
        }
      });
    };

    const onChangeLevel = (val: Record<string, any>, item: Record<string, any>) => {
      const params: any = {
        id: [item.id],
        level: val.id,
        field: "level"
      };
      updateBug<ResponseParams.ResponseDataSuccess>(params as any).then((res) => {
        if (res.code === 200) {
          handleConditionSearch();
          return tipMessage(200, "成功");
        }
      });
    };

    // 编辑或者新增需求  type: add代表创建需求，edit代表编辑描述或者备注
    const editOrAddBug = (params: any, type: string) => {
      if (type === "add") {
        const loading = ElLoading.service({
          lock: true,
          text: "Loading",
          background: "rgba(0, 0, 0, 0.7)"
        });
        createBug<ResponseParams.ResponseDataSuccess>(params as any).then((res) => {
          if (res.code === 200) {
            bugDrawer.value = false;
            handleConditionSearch();
            loading.close();
            return tipMessage(200, "成功");
          }
        });
      } else {
        updateBug<ResponseParams.ResponseDataSuccess>(params as any).then((res) => {
          if (res.code === 200) {
            handleConditionSearch();
            // if (params.id.length === 1) {
            //   handleShowDetail(params.id[0]);
            // }
            return tipMessage(200, "成功");
          }
        });
      }
    };

    // 修改指派弹窗点击确定
    const handleConfirmChangeAssign = () => {
      const params: any = {
        id: [assignFormData.bug_id],
        remark: assignFormData.remark,
        staff_no: assignFormData.staff_no,
        field: "staff_no"
      };
      updateBug<ResponseParams.ResponseDataSuccess>(params as any).then((res) => {
        if (res.code === 200) {
          tipMessage(200, "成功");
          getData(pageTableRef.value.getCurrentPage());
          assignModal.value = false;
          handleIterationEmployeeList();
        }
      });
    };

    // 弹窗点击修改bug状态
    const handleConfirmChange = () => {
      const { id, status, cause, hours, remark } = temp_rowData.value;
      let params: any = {
        id: [id],
        status,
        remark,
        field: "status"
      };
      if ([4, 5].includes(status)) {
        params.cause = cause;
      } else if ([2].includes(status)) {
        const r = /^\+?[0-9][0-9]*$/;
        if (!r.test(hours)) return tipMessage(400, "请输入大于0的正整数");
        params.hours = parseInt(hours, 10);
        if (params.hours > 999 || params.hours <= 0) return tipMessage(400, "请输入0到999的正整数");
      }
      updateBug<ResponseParams.ResponseDataSuccess>(params as any).then((res) => {
        if (res.code === 200) {
          tipMessage(200, "成功");
          getData(pageTableRef.value.getCurrentPage());
          statusModal.value = false;
        }
      });
    };

    return {
      loading,
      page,
      arrow,
      bugDrawer,
      drawerCount,
      refersh,
      iterateId,
      basicBtn,
      taskLists,
      drawerForm,
      richStatus,
      formParams,
      dialogType,
      selectMore,
      rich2Status,
      headerTitle,
      useCaseList,
      searchArray,
      assignModal,
      statusModal,
      basicsOption,
      temp_rowData,
      isFullScreen,
      pageTableRef,
      dialogDemand,
      cascaderPanel,
      employeeLists,
      currentActive,
      assignFormData,
      newDemandLists,
      stopAutoGetData,
      iterateList,
      iterateListData,
      employeeBasicLists,
      iterateBasicList,
      ENVLIST,
      PRIORITY,
      BUG_TYPE,
      BUG_LEVEL,
      BUG_STATUS,
      REJECTDEALREASON,
      BUG_STATUS_DELETE,
      getData,
      getType,
      onHandle,
      getStatus,
      updateVal,
      sortChange,
      quickSeacrh,
      changeSearch,
      onCancleSearch,
      onChangeType,
      getTextColor,
      onChangeLevel,
      handleRefersh,
      showSearchList,
      handleTypeList,
      handleCopyList,
      exportTaskDate,
      handleCreateBug,
      handleBugDetail,
      onChangeSelect,
      onChangePriority,
      handleShowDetail,
      handleBasicChange,
      handleChangeStatus,
      handleChangeAssign,
      handleConfirmChange,
      handleConditionSearch,
      handleSelectionChange,
      handleConfirmChangeAssign,
      ...toRefs(tableData),
      staffNo: store.getters.user.staff_no
    };
  }
});
</script>
<style lang="less" scoped>
.search-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  margin-right: 50px;
  .search-left {
    display: flex;
    justify-content: flex-start;
  }
  .el-icon-refresh {
    top: 3px;
    left: 16px;
    color: #999;

    &:hover {
      cursor: pointer;
      color: @rp-color-background;
    }
  }
  .search-right {
  }
}

.rp-test {
  height: calc(100% + 10px);
  position: relative;
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
        .rp-Table__icons-arrow {
          display: block;
        }
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

    .rp-Table__icons {
      position: relative;

      &-arrow {
        display: none;
        color: var(--el-text-color-placeholder);
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 13px;
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
  :deep(.bug-title) {
    width: 160px;
  }
}

.fullscreen-icon-global {
  top: 22px !important;
}

.test-operation {
  width: 8%;

  :deep(.el-form-item__content) {
    display: flex;
    flex-wrap: nowrap;
  }
}

.rp-use-task-opation {
  z-index: 999;
  position: absolute;
  float: left;
  margin-left: 20px;
  margin-top: -52px;
}

.rp-Table__mask {
  position: absolute;
  background: transparent;
  width: 104px;
  height: 32px;
  top: 8px;
  left: 8px;
  cursor: pointer;
  &:hover {
    box-shadow: 0 0 0 1px #777, #898989 inset;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
}
.rp-Table__common {
  font-size: 12px;
  display: inline-block;
  height: 32px;
  line-height: 32px;
  padding-left: 25px;
  padding-right: 40px;
  border: 1px solid rgba(255, 255, 255, 0);
  cursor: pointer;
  text-decoration: none;
  &:hover {
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 0 0 1px #777, #898989 inset;
    border: 1px solid #ccc;
    border-radius: 4px;
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
