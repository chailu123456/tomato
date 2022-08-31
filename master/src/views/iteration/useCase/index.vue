<template>
  <div v-if="hasData" class="rp-case-content">
    <page-table
      :tableData="list"
      @handlePagationChange="getData"
      @handleSelectionChange="handleSelectionChange"
      :total="total"
      :isFullScreen="isFullScreen"
      ref="pageTableRef"
      @sort-change="sortChange"
      :stopAutoGetData="stopAutoGetData"
      :highlight="true"
      :currentPage="page"
    >
      <template #header>
        <div class="search-header">
          <search-form
            :searchArray="searchArray"
            ref="taskFormParams"
            :currentActive="currentActive"
            @quickSeacrh="quickSeacrh"
            @changeSearch="changeSearch"
          ></search-form>
          <div class="search-right">
            <el-button @click="exportTaskDate" style="margin-right: 10px" class="all-option">导 出</el-button>

            <el-dropdown split-button placement="bottom-end" popper-class="case-btn" type="primary" @click="addCaseDate">
              <span class="js-drawer-uncloseable">新增用例</span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleAddDate">批量新增</el-dropdown-item>
                  <el-dropdown-item @click="handleQuickImport">快捷导入</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>
      <template #main>
        <el-table-column type="selection" width="40"></el-table-column>
        <el-table-column sortable="custom" prop="id" label="ID" width="80"></el-table-column>
        <el-table-column sortable="custom" prop="name" min-width="180" class-name="table-column-left" label="用例标题">
          <template #default="scoped">
            <div @click="handleDetail(scoped.row)" class="table-link">{{ scoped.row.name }}</div>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="product_module_id" label="模块" min-width="90">
          <template #default="scope">
            <span>{{ scope.row?.module?.name || "" }}</span>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="type" label="用例类型" width="130">
          <template #default="scope">
            <selectOption
              :valueKey="['value', 'label']"
              keyVal="type"
              :currentVal="scope.row.type"
              :type="1"
              currentType="type"
              :item="scope.row"
              :optionsData="STATUS"
              @onChangeSelect="onChangeSelect"
            ></selectOption>
          </template>
        </el-table-column>
        <!-- 级别 -->
        <el-table-column sortable="custom" prop="level" label="等级" width="90">
          <template #default="scope">
            <selectOption
              :valueKey="['id', 'value']"
              keyVal="level"
              :currentVal="scope.row.level"
              :type="1"
              currentType="level"
              :item="scope.row"
              :optionsData="PRIORITY"
              @onChangeSelect="onChangeSelect"
            ></selectOption>
          </template>
        </el-table-column>
        <el-table-column prop="staff_name" sortable="custom" label="指派给" width="120">
          <template #default="scope">
            <selectOption
              keyVal="staff_no"
              :valueKey="['staff_no', 'staff_name']"
              :currentVal="scope.row.staff_name"
              :type="0"
              currentType="staff_no"
              :item="scope.row"
              :optionsData="userList"
              @onChangeSelect="onChangeSelect"
            ></selectOption>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="status" label="执行结果" width="148">
          <template #default="scope">
            <div style="padding-left: 8px">
              <selectOption
                :valueKey="['value', 'label']"
                keyVal="status"
                :currentVal="scope.row.status"
                :type="1"
                currentType="status"
                :item="scope.row"
                :optionsData="RESOULT"
                :showDot="true"
                @onChangeSelect="onChangeSelect"
              ></selectOption>
            </div>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="operate_time" label="最近执行时间" min-width="150"></el-table-column>

        <el-table-column sortable="custom" prop="creator" label="创建人" width="130"></el-table-column>
        <el-table-column sortable="custom" prop="create_time" label="创建时间" min-width="150"></el-table-column>

        <el-table-column label="操作" width="180">
          <template #default="scoped">
            <el-button type="primary" link @click.stop="handleBug(scoped.row)">提BUG</el-button>
            <el-button class="delete" link @click.stop="handleDeleteList(scoped.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </template>
      <template #qucikSelect>
        <div class="rp-test-list-num">
          <span class="rp-test-num" @click="handleTypeList(0, ['2'])">未通过 {{ bugType.unpassed_num }} 条</span>
          <span class="rp-test-num" @click="handleTypeList(1, [1])">L0 {{ bugType.zero_type_num }} 条</span>
        </div>
      </template>
    </page-table>
    <div class="rp-use-case-opation" v-if="selectMore.length">
      <el-dropdown size="small" trigger="click" ref="basicBtn">
        <el-button>
          基础项
          <el-icon><ArrowUp /></el-icon>
        </el-button>
        <template #dropdown>
          <el-cascader-panel style="height: 220px" @change="handleBasicChange" ref="cascaderPanel" :options="basicsOption"></el-cascader-panel>
        </template>
      </el-dropdown>
      <el-divider direction="vertical"></el-divider>
      <el-button @click="handleDeleteList(0)">删除</el-button>
    </div>

    <FullScreen v-model:fullscreen="isFullScreen" />
    <WorkDrawer :type="typeDrawer" :targetId="targetId" @refresh="updateUseList" ref="workDrawer"></WorkDrawer>
    <AddDialog v-model:visible="showDialog" @update="getData"></AddDialog>
    <!-- 更新模块 -->
    <el-dialog center title="更新模块" v-model="isOpenEditModule" @close="handleCancle" width="30%">
      <div style="margin-bottom: 160px">
        <module-select v-model:value="product_module_id" :list="moduleTree" @updateUseCase="getModuleSelectTree" @change="handleChangeModule"></module-select>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancle">取 消</el-button>
          <el-button type="primary" v-debounce @click="handleUpdateModule">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
  <div v-else class="empty-block">
    <el-empty :image-size="200"></el-empty>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, ref, watch, computed, onMounted } from "vue";
import { PRIORITY, STATUS, RESOULT } from "./contantOptions";
import FullScreen from "@/components/fullscreen/index.vue";
import selectOption from "@/businessComponents/selectOption/index.vue";
import WorkDrawer from "@/businessComponents/workDrawer/index.vue";
import { ArrowUp } from "@element-plus/icons";
import AddDialog from "./component/addDialog.vue";
import { allMember } from "@/api/request-modules/product";
import { Pagation } from "@/composables/usePagation";
import { getSession, clearSession, setObjStringify, addDetailIdToRouter } from "@/utils";
import useRequest from "@/composables/useRequest";
import useRenderTable from "@/composables/useRenderTable";
import useFetchSearch from "./composables/useFetchSearch";
import { getUseCaseStaff, updateUseCaseStatus, deleteUseCaseStatus, editUseCaseData } from "@/api/request-modules/iteration";
import { ResponseParams } from "@/types/response";
import useMessageTip from "@/composables/useMessageTip";
import { useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
import useWatchChangeProduct from "@/composables/useWatchChangeProduct";
import { store } from "@/store";
import { SearchArray } from "@/types/interface";
import { USER } from "@/store/state";
import VueEvent from "@/utils/mitt";
import { useRoute } from "vue-router";
import type { UseCaseList, UseCaseListParams } from "./contantOptions";
import type { OrderSort, BasicsOption } from "@/composables/useCommon";
import { getModuleData, ModuleNode } from "@/components/module-manage";

export default defineComponent({
  name: "useCase",
  components: {
    FullScreen,
    selectOption,
    WorkDrawer,
    ArrowUp,
    AddDialog
  },
  setup() {
    const router = useRouter();
    const curProductInfo = computed(() => store?.getters?.productInfo);
    const user = getSession("user", true) as USER;
    const isFullScreen = ref(false);
    const { tipMessage } = useMessageTip();
    const showDialog = ref(false);
    const cascaderPanel = ref();
    const basicBtn = ref();

    const route = useRoute();

    const product_module_name = ref("");

    // 批量编辑模块-弹窗
    const isOpenEditModule = ref(false);
    const product_module_id = ref<number | null>(null);

    const employeeLists: any = ref([]);
    const tableData = reactive({
      list: [],
      total: 0,
      bugType: {
        unpassed_num: 0,
        zero_type_num: 0
      }
    });
    const currentActive = ref("-1");
    const page = ref(1);
    // 判断是否进行筛选
    const flag = ref<boolean>(false);
    const pageTableRef = ref<any>();
    const stopAutoGetData = ref<boolean>(false);
    // 迭代id保存
    const iterateId = computed(() => store.getters.iterateId);

    const hasData = ref(true);
    const onIntertion = () => {
      if (router.currentRoute.value.name === "useCase" && !iterateId.value) hasData.value = false;
      else hasData.value = true;
    };
    onIntertion();

    const workDrawer = ref();
    const typeDrawer = ref(0);
    const targetId = ref(-1);

    const defaultSearchParams = {
      create_by: "",
      product_module_id: [],
      type: [] as Array<number>,
      staff_no: [],
      name: null,
      status: [] as Array<number>,
      level: [] as Array<number>,
      product_id: curProductInfo.value?.id
    };

    const formParams = ref<Record<string, any>>({
      create_by: "",
      product_module_id: [],
      type: [] as Array<number>,
      staff_no: [],
      name: null,
      status: [] as Array<number>,
      level: [] as Array<number>,
      product_id: curProductInfo.value?.id
    });

    // 表格多选
    const selectMore: any = ref([]);

    const tableHeight = () => {
      setTimeout(() => {
        const contentHeight = document.getElementsByClassName("content")[0] as HTMLDivElement;
        const headerHeight = document.getElementsByClassName("search-header")[0] as HTMLDivElement;
        if (pageTableRef.value) {
          pageTableRef.value.height = contentHeight.offsetHeight - headerHeight.offsetHeight - 140;
        }
      }, 100);
    };

    // 分页以及获取数据
    const getData = async (pagationParams?: Pagation, flag?: boolean, params?: any) => {
      // 一定要在params 存在情況下去判斷
      if (params && !params?.product_id) {
        hasData.value = false;
        return;
      }
      stopAutoGetData.value = flag == undefined ? false : true;
      page.value = (pagationParams && pagationParams.pageIndex) || 1;
      if (!iterateId.value) {
        tableData.total = 0;
        tableData.list = [];
        tableData.bugType.unpassed_num = 0;
        tableData.bugType.zero_type_num = 0;
        return;
      }
      const paramsObj = JSON.parse(JSON.stringify(params || Object.assign(formParams.value, { iteration_id: iterateId.value })));
      Reflect.deleteProperty(paramsObj, "tempStaff");
      const { response } = useRequest(useFetchSearch, paramsObj);
      const { pagation } = useRenderTable(response);
      let {
        data: { list, count, unpassed_num, zero_type_num }
      } = await pagation(pagationParams);
      tableData.total = count;
      tableData.list = list;
      tableData.bugType.unpassed_num = unpassed_num;
      tableData.bugType.zero_type_num = zero_type_num;
      tableHeight();
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
          await getData({ pageIndex: 1, pageSize: 20 }, true, Object.assign(formParams.value, { iteration_id: iterateId.value }));
          flag.value = false;
        } else {
          await getData(pageTableRef.value?.getCurrentPage(), true, Object.assign(formParams.value, { iteration_id: iterateId.value }));
        }
        stopAutoGetData.value = false;
        getUseCase();
      }, 300);
    };

    watch(
      () => iterateId.value,
      () => {
        flag.value = true;
        handleConditionSearch();
        getUserList(curProductInfo.value?.id);
        onIntertion();
        getIterateData();
      }
    );

    // // 获取当前 创建人 下拉列表数据
    const getUseCase = () => {
      if (!iterateId.value) return;
      getUseCaseStaff({ iteration_id: iterateId.value }).then((res: any) => {
        employeeLists.value = res.data;
      });
    };
    useWatchChangeProduct(handleConditionSearch, () => {
      if (formParams.value.product_id != curProductInfo.value?.id) formParams.value.iteration_id = null;
      formParams.value.product_id = curProductInfo.value?.id;
      formParams.value.iteration_id = iterateId.value;
      flag.value = true;

      handleConditionSearch();
    });

    // 获取用户下拉列表
    const userList: any = ref([]);
    const basicUserList: any = ref([]);
    const getUserList = (pId: number) => {
      if (!pId) return;
      allMember<ResponseParams.ResponseDataSuccess>({ product_id: pId }).then((res: any) => {
        if (res.data && res.data.length) {
          userList.value = res.data;
          basicUserList.value = res.data[1].options.map((o: Record<string, any>) => {
            return { value: o.staff_no, label: o.staff_name };
          });
        } else {
          userList.value = [];
          basicUserList.value = [];
        }
      });
    };
    // 获取用户下拉列表

    // 查看用例详情
    const handleDetail = (item: UseCaseList | UseCaseListParams) => {
      workDrawer.value?.handleDrawerVisble(true);
      typeDrawer.value = 9;
      targetId.value = item.id;
      addDetailIdToRouter(item.id);
    };

    // 监听抽屉组件状态
    VueEvent.on("drawStatus", (val) => {
      if (!val) {
        targetId.value = -1;
      }
    });

    // 新增用例
    const addCaseDate = () => {
      workDrawer.value?.handleDrawerVisble(true);
      typeDrawer.value = 9;
      targetId.value = -11;
    };
    // 新增任务

    // 批量添加
    const handleAddDate = () => {
      const a = router.resolve({
        name: "useCaseAdd"
      });
      window.open(a.href, "_blank");
    };

    // 接收方
    window.addEventListener("storage", (val) => {
      if (val.key === "setUseCase") {
        getData(pageTableRef.value?.getCurrentPage());
        clearSession("setUseCase");
      }
    });

    // 提bug
    const handleBug = (val: UseCaseList) => {
      workDrawer.value?.handleDrawerVisble(true);
      typeDrawer.value = 3;
      targetId.value = -12;
      workDrawer.value?.resetUseCaseBug({ id: val.id, name: val.name });
    };

    // 快捷导入
    const handleQuickImport = () => {
      showDialog.value = true;
    };

    // 获取迭代下拉数据
    interface IterateBasicData {
      value: string;
      label: string;
    }
    const iterateBasicData = ref<IterateBasicData[]>([]);
    const getIterateData = () => {
      const iterateList = getSession("iterateList", true) as any;
      if (iterateList && iterateList.length) {
        iterateBasicData.value = iterateList.map((o: Record<string, any>) => {
          return { value: o.id, label: o.name };
        });
      } else {
        iterateBasicData.value = [];
      }
    };
    // 获取迭代下拉数据

    // 导出
    const exportTaskDate = async () => {
      const params = JSON.parse(JSON.stringify(formParams.value));
      if (!params.type) delete params.type;
      if (!tableData.total) return tipMessage(400, "暂无数据，无法导出");
      setObjStringify(params, "/api/tomato/test-case/export");
    };

    // 更新结果
    const updataStatus = (params: any) => {
      updateUseCaseStatus<ResponseParams.ResponseDataSuccess>(params).then((res: any) => {
        tipMessage(res.code);
        getData(pageTableRef.value.getCurrentPage());
      });
    };
    // 结果 -- 批量结果
    const handleCommand = (command: string, val?: any): any => {
      let params: any = {
        status: Number(command)
      };
      if (val) {
        params = {
          ids: [val.id],
          status: Number(command)
        };
      } else {
        params.ids = [];
        if (selectMore.value && selectMore.value.length) {
          selectMore.value.forEach((item: UseCaseList) => {
            params.ids.push(item.id);
          });
        } else {
          return tipMessage(400, "请选择列表");
        }
      }
      updataStatus(params);
    };

    // 删除--批量删除
    const handleDeleteList = (val: number) => {
      let params: any = {
        ids: []
      };
      if (val) {
        params.ids = [val];
      } else {
        params.ids = [];
        if (selectMore.value && selectMore.value.length) {
          selectMore.value.forEach((item: Record<string, any>) => {
            params.ids.push(item.id);
          });
        } else {
          return tipMessage(400, "请选择要操作的列表");
        }
      }
      ElMessageBox.confirm("此操作将永久删除该用例，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        confirmButtonClass: "el-button--danger-box",
        type: "error"
      }).then(() => {
        deleteUseCaseStatus<ResponseParams.ResponseDataSuccess>(params).then((res) => {
          tipMessage(res.code);
          getData(pageTableRef.value.getCurrentPage());
        });
      });
    };

    // 基础向批量  编辑更新
    const updateData = (params: Record<string, any>) => {
      editUseCaseData<ResponseParams.ResponseDataSuccess>(params).then((res) => {
        if (res.code === 200) {
          getData(pageTableRef.value.getCurrentPage(), undefined, formParams.value);
          if (params.field === "staff_no") {
            // 这里延迟请求是因为立即执行页面会有数据切换，交互不好
            setTimeout(() => {
              getUserList(curProductInfo.value?.id);
            }, 500);
          }
          return tipMessage(200, "成功");
        }
      });
    };
    const getSelectId = () => {
      let ids: number[] = [];
      selectMore.value?.forEach((item: Record<string, any>) => {
        ids.push(item.id);
      });
      return ids;
    };
    // 基础向批量操作
    const handleBasicChange = (val: any) => {
      // 调起弹框组件 模块
      if (val[0] === "product_module_id") {
        // 模块
        isOpenEditModule.value = true;
      } else {
        const obj: any = {
          ids: getSelectId()
        };
        const keyArr = ["status", "level", "type", "iteration_id"];
        const label = cascaderPanel.value.getCheckedNodes()[0].value;
        obj[val[0]] = label;
        if (keyArr.includes(val[0])) {
          obj[val[0]] = label * 1;
        }
        obj.field = val[0];
        // 如果是指派人，需要把指派人名字传过去，其它只传id即可
        if (val[0] === "staff_no") {
          const userMsg = basicUserList.value.filter((item: Staff) => item.value === label);
          obj.staff_name = userMsg[0].label;
        }
        updateData(obj);
      }
      // 隐藏基础项
      basicBtn?.value.handleClose();
    };
    interface ModuleObj {
      ids?: number[];
      product_module_id: number | null;
      product_module_name?: string;
      field?: string;
    }
    let obj = ref<ModuleObj>({
      product_module_id: 0
    });
    // 批量修改模块--确定
    const handleUpdateModule = () => {
      if (obj.value.product_module_id !== null && obj.value.product_module_id >= 0 && obj.value.field) {
        updateData(obj.value);
        isOpenEditModule.value = false;
        product_module_id.value = null;
        return;
      }
      return tipMessage(400, "请选择模块");
    };
    // 抽屉数据更新后回调
    const updateUseList = () => {
      getData(pageTableRef.value.getCurrentPage(), undefined, formParams.value);

      setTimeout(() => {
        getUserList(curProductInfo.value?.id);
      }, 1000);
    };

    // 取消批量更新模块
    const handleCancle = () => {
      selectMore.value = [];
      product_module_id.value = null;
      obj.value.product_module_id = null;
      isOpenEditModule.value = false;
      getData(pageTableRef.value.getCurrentPage(), undefined, formParams.value);
    };

    // 批量修改模块--选择模块
    const handleChangeModule = async (val: any) => {
      obj.value = {
        ids: getSelectId(),
        field: "product_module_id",
        product_module_id: val.id
      };
    };

    const moduleTree = ref<ModuleNode[]>();

    // 获取模块select树数据  id: 在新增模块弹窗中删除模块的id，回调与当前列表进去比较
    const getModuleSelectTree = async (id?: number) => {
      if (id) {
        if (obj.value.product_module_id === id) {
          obj.value.product_module_id = 0;
          if (moduleTree.value && moduleTree.value[0].name) {
            obj.value.product_module_name = moduleTree.value[0]?.name || "";
          }
          product_module_id.value = 0;
        }
      }
      product_module_id.value = obj.value.product_module_id;
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
    };

    const tableResoult = JSON.parse(JSON.stringify(RESOULT));

    interface Staff {
      value: string;
      staff_no: string;
    }
    // 更改状态、等级、指派人
    const onChangeSelect = (val: string | number, item: UseCaseList, key?: string) => {
      const obj: Record<string, any> = {
        ids: [item.id],
        field: key
      };
      if (key) obj[key] = val;
      if (key === "staff_no") {
        const person = basicUserList.value.filter((item: Staff) => item.value === val);
        obj.staff_no = person[0].value;
        obj.staff_name = person[0].label;
      }
      updateData(obj);
    };

    //基础操作列表数据
    const basicsOption: BasicsOption[] = reactive([
      {
        value: "product_module_id",
        label: "模块",
        children: []
      },
      {
        value: "level",
        label: "等级",
        children: PRIORITY.map((o) => {
          return { value: o.id, label: o.value };
        })
      },
      {
        value: "status",
        label: "结果",
        children: RESOULT
      },
      {
        value: "type",
        label: "类型",
        children: STATUS
      },
      {
        value: "staff_no",
        label: "指派给",
        children: basicUserList
      },

      {
        value: "iteration_id",
        label: "迭代",
        children: iterateBasicData
      }
    ]);
    // 搜索列表数据
    const searchArray: SearchArray = reactive({
      btnArray: [
        { id: "-1", label: "所有", key: "" },
        { id: "2", label: "未通过", key: "status" },
        { id: "5", label: "未执行", key: "status" },
        { id: "22", label: "冒烟用例", key: "type" },
        { id: "500", label: "我创建的", key: "create_by" },
        { id: "600", label: "指给我的", key: "staff_no" }
      ],
      searchForm: [
        {
          type: "input",
          label: "名称",
          key: "name",
          val: ""
        },
        {
          type: "select",
          label: "指派给",
          val: [],
          key: "staff_no",
          showRecord: true,
          multiple: true,
          valueKey: ["staff_no", "staff_name"],
          listData: userList
        },
        {
          type: "customComponents",
          label: "模块",
          val: [],
          key: "product_module_id",
          componentIndex: 2
        },
        {
          type: "select",
          label: "结果",
          multiple: true,
          key: "status",
          val: [],
          listData: RESOULT
        },
        {
          type: "select",
          label: "类型",
          key: "type",
          val: [],
          listData: STATUS
        },
        {
          type: "select",
          label: "等级",
          multiple: true,
          key: "level",
          val: [],
          valueKey: ["id", "value"],
          listData: PRIORITY
        },

        {
          type: "select",
          label: "创建人",
          val: [],
          key: "create_by",
          multiple: true,
          valueKey: ["staff_no", "staff_name"],
          listData: employeeLists
        }
      ]
    });

    // 快速查询
    const quickSeacrh = async (val: Record<string, any>) => {
      currentActive.value = "-1";
      const productInfo = getSession("productInfo", true) as Record<string, any>;
      // 重写将默认值赋给searchParams
      formParams.value = JSON.parse(JSON.stringify(defaultSearchParams));
      formParams.value.product_id = productInfo.id;
      // val.key不存在代表获取所有数据
      if (val.key) {
        const obj: Record<string, any> = {
          create_by: [user?.staff_no],
          staff_no: [user?.staff_no]
        };
        let params: Record<string, any> = {};
        params.product_id = formParams.value.product_id;

        params[val.key] = obj[val.key];
        if (val.key === "status") {
          if (val.id === "2") params[val.key] = [2];
          else params[val.key] = [5];
        }
        if (val.key === "type") params[val.key] = [1];

        formParams.value[val.key] = params[val.key];
      }
      formParams.value.iteration_id = iterateId.value;

      searchData();
    };
    // 点击搜索弹框选中搜索条件查询
    const changeSearch = async (val: Record<string, any>) => {
      let params: Record<string, any> = JSON.parse(JSON.stringify(val));
      params.product_id = curProductInfo.value.id;

      // 遍历将值更新到formParams
      for (var obj in val) {
        formParams.value[obj] = val[obj];
      }
      if (val.times && val.times.length) {
        formParams.value.expected_start_time = val.times;
        params.expected_start_time = val.times;
      } else {
        formParams.value.expected_start_time = [];
        params.expected_start_time = [];
      }
      formParams.value.iteration_id = iterateId.value;
      searchData();
      if (val.staff_no && val.staff_no.length) {
        // 这里延迟请求是因为立即执行页面会有数据切换，交互不好
        setTimeout(() => {
          getUserList(curProductInfo.value?.id);
        }, 500);
      }
    };

    // quick存在代表是使用快速搜索
    const searchData = async () => {
      flag.value = true;
      page.value = 1;
      pageTableRef.value.setCurrentPage();
      getData(pageTableRef.value.getCurrentPage(), undefined, formParams.value);
    };

    // 未通过、L0快速查询
    const handleTypeList = (isType: number, params: number[] | string[]) => {
      if (isType) {
        formParams.value.level = params;
        searchArray.searchForm[5].val = params;
        formParams.value.status = [];
        searchArray.searchForm[3].val = [];
      } else {
        searchArray.searchForm[3].val = [2];
        formParams.value.status = params;
        formParams.value.level = [];
        searchArray.searchForm[5].val = [];
      }
      getData(pageTableRef.value.getCurrentPage(), undefined, formParams.value);
    };

    const handleSelectionChange = (val: any) => {
      selectMore.value = val;
    };

    // 排序
    const sortChange = (e: OrderSort) => {
      const { prop, order } = e;
      if (!order) return;
      formParams.value.sort_name = prop;
      formParams.value.sort_by = order === "ascending" ? 1 : 2;
      getData(pageTableRef.value.getCurrentPage(), undefined, formParams.value);
    };

    onMounted(() => {
      const { detailId } = route.query as Record<string, any>;
      if (router.currentRoute.value.name === "useCase" && detailId) {
        handleDetail({ id: detailId });
      }
      getUserList(curProductInfo.value?.id);
      getIterateData();
    });

    return {
      product_module_id,
      sortChange,
      handleBug,
      employeeLists,
      pageTableRef,
      stopAutoGetData,
      handleConditionSearch,
      ...toRefs(tableData),
      getData,
      formParams,
      page,
      PRIORITY,
      STATUS,
      RESOULT,
      tableResoult,
      handleCommand,
      selectMore,
      handleTypeList,
      handleDeleteList,
      handleSelectionChange,
      exportTaskDate,
      searchArray,
      currentActive,
      quickSeacrh,
      changeSearch,
      addCaseDate,
      handleAddDate,
      handleQuickImport,
      isFullScreen,
      onChangeSelect,
      userList,
      typeDrawer,
      targetId,
      handleDetail,
      workDrawer,
      handleBasicChange,
      basicsOption,
      showDialog,
      basicUserList,
      cascaderPanel,
      basicBtn,
      isOpenEditModule,
      handleUpdateModule,
      handleChangeModule,
      handleCancle,
      product_module_name,
      updateUseList,
      iterateId,
      hasData,
      moduleTree,
      getModuleSelectTree
    };
  }
});
</script>

<style scoped lang="less">
.container {
  padding-top: 10px !important;
}
.rp-case-content {
  position: relative;
  .fullscreen-icon-global {
    top: 12px;
  }
  .case-module-select {
    width: 280px;
  }
}
.search-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  margin-right: 50px;
}
.progress-padding {
  padding-left: 10px;
}
.use-add {
  float: right;
  margin-right: 10px;
}
.rotate-icon {
  transform: rotate(90deg);
  margin-right: 5px;
  color: #3370ff;
}
.rp-Table__common {
  font-size: 14px;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
    opacity: 0.8;
  }
}
:deep(.el-dropdown-link) {
  display: flex;
  align-items: center;
  font-size: 12px;
  margin-top: 4px;
  .el-icon {
    display: inline-block;
  }
}
:deep(.rp-select) {
  .el-input {
    width: 140px;
  }
  .el-select__tags {
    max-width: 120px !important;
  }
  .el-select__tags-text {
    max-width: 50px !important;
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
.no-click {
  pointer-events: none;
  cursor: default;
  color: #c0c4cc;
}
.rp-assign {
  :deep(.el-form-item__content) {
    display: flex !important;
  }
}
:deep(.row-scroll) {
  max-height: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.rp-use-case-opation {
  z-index: 999;
  position: absolute;
  left: 20px;
  margin-top: -70px;
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
  :deep(.el-pagination__total) {
    display: inline-block;
    background: #f4f4f5;
    padding: 2px 6px;
    line-height: 20px;
    height: 20px;
    margin-top: 4px;
    border-radius: 4px;
    -webkit-box-sizing: none;
  }
}
.rp-drawer-use {
  padding: 0 20px 20px 20px;
  overflow: scroll;
  height: calc(100% - 100px);
  // margin-top: 50px;
  .rp-drawer-title {
    display: flex;
    align-items: center;
    .el-button {
      min-height: 22px;
      height: 22px;
      line-height: 22px;
      padding: 0 14px;
      margin-right: 10px;
    }
    h1 {
      color: #615e5e;
      font-size: 18px;
    }
  }
  .rp-drawer-content {
    .content-list {
      .content-list-title {
        display: flex;
        align-items: center;
        margin: 10px 0;
        color: #615e5e;
        span.list-icon {
          display: inline-block;
          width: 8px;
          height: 16px;
          background: #1f9f85;
          margin-right: 10px;
        }
        span.list-name {
          font-weight: 700;
        }
      }
      .list-show {
        padding-left: 18px;
        margin-top: 10px;
        div {
          font-size: 14px;
          margin: 5px 0;
          color: #606266;
          span {
            white-space: pre-wrap;
          }
        }
      }
    }
  }
}
.drawer-btn {
  display: flex;
  justify-content: space-around;
  position: fixed;
  bottom: 0px;
  right: 0;
  padding: 10px;
  width: 70%;
  background: #fff;
  box-shadow: 0px -2px 12px #eee;
  .el-button {
    width: 90px;
  }
}

:deep(.el-drawer__body) {
  height: 100%;
}

:deep(.page) {
  padding-top: 20px;
}
:deep(.case-drawer) {
  position: fixed;
  inset: 0px;
  width: 70%;
  left: 30% !important;
  top: 50px;
  .el-drawer__header {
    margin: 0;
    padding-top: 0;
    min-height: 40px;
    border-bottom: 1px solid #ccc;
    .drawer-title {
      color: #615e5e;
      font-size: 14px;
      font-weight: 700;
    }
  }
}

.empty-block {
  background-color: #fff;
}

// 不要删掉，应对全屏名称的样式问题
:global(.rp-case-content .table-column-left) {
  font-size: 14px;
}
</style>
<style lang="less">
.case-btn {
  .el-dropdown-menu__item {
    padding: 6px 22px;
  }
}
</style>
