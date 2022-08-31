<template>
  <div class="index demandPool" style="height: calc(100% + 10px)">
    <page-table
      :tableData="list"
      @sort-change="sortChange"
      @handleSelectionChange="handleSelectionChange"
      @handlePagationChange="getData"
      :total="total"
      :hiddenPagation="comePlan === 'comePlan' ? true : false"
      :currentPage="currentPage"
      :highlight="true"
      ref="pageTableRef"
    >
      <template #header v-if="comePlan != 'comePlan'">
        <div class="search-header">
          <search-form
            :searchArray="searchArray"
            ref="demandFormParams"
            :currentActive="currentActive"
            @quickSeacrh="quickSeacrh"
            @changeSearch="changeSearch"
          ></search-form>
          <div class="search-right">
            <el-button plain @click="exportTaskDate">导 出</el-button>
            <el-button type="primary" v-if="curProductInfo?.is_approval === 1" plain @click="handleUpdateAssign(3)">审批单</el-button>
            <el-button plain @click="isShow = !isShow">
              <el-icon style="transform: rotate(90deg)"><sort /></el-icon>
              {{ isShow ? " 列表" : " 看板" }}
            </el-button>
            <el-button type="primary" @click="handleAddDemand">新 增</el-button>
          </div>
        </div>
      </template>
      <template v-if="isShow" #main>
        <el-table-column v-if="comePlan != 'comePlan'" type="selection" width="55"></el-table-column>
        <el-table-column sortable="custom" prop="id" label="ID" width="80"></el-table-column>

        <el-table-column sortable="custom" class-name="table-column-left table-title" :min-width="200" prop="name" label="需求名称">
          <template #default="scoped">
            <span class="app-name" @click="handleDetail(scoped.row)">{{ scoped.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" class="eee" prop="level" width="150" label="优先级">
          <template #default="scoped">
            <selectOption
              :valueKey="['id', 'value']"
              keyVal="level"
              :currentVal="scoped.row.level"
              :type="1"
              currentType="level"
              :item="scoped.row"
              :optionsData="PRIORITY"
              @onChangeSelect="onChangeSelect"
            ></selectOption>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="demand_status" width="120" label="状态">
          <template #default="scoped">
            <div>
              <span style="margin-left: -20%" v-if="scoped.row.demand_status === 1">待审核</span>
              <span style="margin-left: -20%" v-else-if="scoped.row.demand_status === 3">审批中</span>
              <selectOption
                v-else
                :valueKey="['value', 'label']"
                keyVal="demand_status"
                currentType="status"
                :currentVal="scoped.row.demand_status"
                :type="1"
                :item="scoped.row"
                :optionsData="DEMAND_STATUS"
                @onChangeSelect="onChangeSelect"
              ></selectOption>
            </div>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="staff_name" width="140" label="指派给">
          <template #default="scoped">
            <selectOption
              :valueKey="['staff_no', 'staff_name']"
              keyVal="staff_no"
              :currentVal="scoped.row.staff_name"
              :type="0"
              currentType="staff_no"
              :item="scoped.row"
              :optionsData="userList"
              @onChangeSelect="onChangeSelect"
            ></selectOption>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="hours" width="120" label="预计工时">
          <template #default="scoped">
            <InputOption :inputVal="scoped.row.hours" :currentId="scoped.row.id" @onChangeVal="onChangeVal" valKey="hours"></InputOption>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="create_time" min-width="220" label="创建时间"></el-table-column>
        <el-table-column width="100" label="操作">
          <template #default="scope">
            <el-button class="delete" link @click="handlebatchCancel(scope.row.id)">
              {{ comePlan === "comePlan" ? "移除" : "删除" }}
            </el-button>
          </template>
        </el-table-column>
      </template>
    </page-table>
    <template v-if="!isShow">
      <div class="rp-demand-list">
        <ul class="demand-list-show" ref="columnsWrapperRef">
          <li v-for="(item, index) in demandData" :key="index" class="demand-list-cloumn">
            <div class="demand-title" :style="{ background: item.titleColor }">{{ item.titleName }}</div>
            <div class="demand-detail-show" v-infinite-scroll="() => handleLoad(item)" style="overflow: auto">
              <div>
                <div
                  class="demand-show-content"
                  :style="{ background: item.status ? '#e1effb' : 'rgb(230, 252, 247)' }"
                  v-for="(it, index) in item.listData"
                  :key="index"
                >
                  <p style="word-break: break-all; word-wrap: break-word" @click.stop="handleDetail(it)">{{ it.name }}</p>
                  <div class="content-msg" v-if="it.status === 2">
                    <span>{{ it.creator }}</span>
                    <span>{{ it.create_time }}</span>
                  </div>
                  <div v-if="it.status === 2" class="content-origin">来源： {{ it.origin_path ? it.origin_path + "/" + it.origin_staff : "" }}</div>
                  <div v-if="[4, 5, 6].includes(it.status)">
                    <div class="content-plan" @click="handleShowPlan(it.plan_name)">计划： {{ it.plan_name || "无" }}</div>
                    <div class="content-give">负责人: {{ it.staff_name || "无" }}</div>
                  </div>
                  <div v-if="[7].includes(it.status)">
                    <div class="content-plan" @click="jupmIteration(it.iteration_id)">迭代： {{ it.iteration_name }}</div>
                    <div class="content-cycle">周期: {{ it.iteration_dev_time }} - {{ it.iteration_release_time }}</div>
                  </div>
                </div>
                <div class="block-loadingMore">
                  <!-- <el-icon @click="handleLoadMore(item)" v-show="item.isShowLoadingMore"><DArrowRight /></el-icon> -->
                  <span v-show="!item.hasData && item.page_size !== 1">┗( ▔, ▔ )┛没有更多了...</span>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </template>

    <div class="index-popup" v-if="selectedList?.length">
      <el-dropdown size="small" placement="top-start" trigger="click" ref="basicBtn">
        <el-button>
          基础项
          <el-icon><ArrowUp /></el-icon>
        </el-button>
        <template #dropdown>
          <el-cascader-panel style="height: 220px" popper-class="cascader-panel" @change="handleBasicChange" ref="cascaderPanel" :options="basicsOption" />
        </template>
      </el-dropdown>
      <el-button style="margin-left: 10px" @click="handleCreatePlan()">
        创建计划
        <i class="el-icon--right"></i>
      </el-button>
      <!-- is_approval  是否需要审批 0.不需要 1.需要  -->
      <el-button style="margin-left: 10px" v-if="curProductInfo?.is_approval === 1" @click="handleUpdateAssign(1)">
        申请审批
        <i class="el-icon--right"></i>
      </el-button>
      <el-button @click="handlebatchCancel()">
        删除
        <i class="el-icon--right"></i>
      </el-button>
    </div>

    <Drawer
      v-model:drawer="drawer"
      :title="demandForm.name"
      :headerTitle="headerTitle"
      :id="demandForm.id"
      @onHandle="onHandle"
      :rich="demandForm.description"
      :rich2="demandForm.origin_remark"
      :richStatus="richStatus"
      placeholder="建议参考的模板： 作为一名<某种类型的用户>，我希望<达成某些目的>，这样可以<开发的价值>"
      :rich2Status="rich2Status"
      :statusList="logArr"
      :loading="loading"
    >
      <template #form>
        <form-demand :userList="userList" @onChangeTask="onChangeDemand" :iterationList="iterationList" :demandForm="demandForm"></form-demand>
      </template>
    </Drawer>
    <dialog-demand @updateVal="updateVal" :userList="userList" :type="dialogType" v-model:visible="dialogDemand"></dialog-demand>
    <el-dialog center title="更新模块" v-model="isOpenEditModule" @close="handleCancle" width="30%">
      <div style="margin-bottom: 160px">
        <module-select v-model:value="moduleId" :list="moduleTree" @updateUseCase="getModuleSelectTree" @change="handleChangeModule"></module-select>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancle">取 消</el-button>
          <el-button type="primary" v-debounce @click="handleUpdateModule">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent, toRefs, onMounted, reactive, onDeactivated, ref, computed, watch, onActivated } from "vue";
import { useFetchSearch } from "./composables/useFetchSearch";
import FormDemand from "./components/formDemand.vue";
import { RequestParams } from "@/types/request";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { store } from "@/store";
import { MutationType } from "@/store/mutation-types";
import {
  allMember,
  getDemandListStatus,
  getDemandListPage,
  getDemandDetail,
  editDemand,
  createDemand,
  updateTrash,
  getDemandPlanList,
  getDemandListDetailLog,
  removePlanDemand
} from "@/api/request-modules/product";
import { ResponseParams } from "@/types/response";
import { DEMAND_STATUS, PRIORITY, DEMAND_PRIORITY } from "@/utils/contantOptions";
import { Sort, ArrowUp } from "@element-plus/icons";
import Drawer from "@/components/drawer/index.vue";
import type { OrderSort, BasicsOption } from "@/composables/useCommon";

type ProductId = {
  product_id: [];
};
interface StepList {
  titleColor: string;
  titleName: string;
  status: number;
  listData: Array<Record<string, any>>;
  isDisable: boolean;
  isShowLoadingMore: boolean;
  hasData: boolean;
  page_index: number;
  page_size: number;
}
import { Pagation } from "@/composables/usePagation";
import InputOption from "@/businessComponents/inputOption/index.vue";
import selectOption from "@/businessComponents/selectOption/index.vue";
import useRenderTable from "@/composables/useRenderTable";
import useRequest from "@/composables/useRequest";
import useWatchChangeProduct from "@/composables/useWatchChangeProduct";
import { PRIORITYINTER } from "@/types/interface";
import { requireTypes } from "@/utils/contantOptions";
import useMessageTip from "@/composables/useMessageTip";
import { SearchArray } from "@/types/interface";
import { USER } from "@/store/state";
import useGetDemandList from "@/views/iteration/useGetDemandList";
import { ProjectItem } from "@/composables/useCommon";
import dialogDemand from "@/businessComponents/demandDialog/index.vue";
import dayjs from "dayjs";
import { ElLoading } from "element-plus";
import { getSession, setObjStringify, removeIdFromRouter, addDetailIdToRouter } from "@/utils";
import { getModuleData, ModuleNode } from "@/components/module-manage";

export default defineComponent({
  name: "demandPool",
  components: {
    Sort,
    Drawer,
    FormDemand,
    InputOption,
    ArrowUp,
    dialogDemand,
    selectOption
  },
  props: {
    comePlan: {
      type: String,
      default: () => ""
    },
    id: {
      type: Number,
      default: () => 0
    }
  },
  setup(props) {
    const { tipMessage } = useMessageTip();
    const curProductInfo = ref(getSession("productInfo", true) as any);
    const userMsg = getSession("user", true) as USER;
    const router = useRouter();
    const route = useRoute();
    const headerTitle = ref("新增需求");
    const cascaderPanel = ref();
    const basicBtn = ref();
    const show = ref(false);
    const staff: Record<string, any> = ref({ staff_name: "", staff_no: "" });
    const currentActive = ref("-1");

    const dialogDemand = ref(false);
    const loading = ref(false);

    const moduleId = ref();

    const isOpenEditModule = ref(false);

    const product_module_name = ref("");

    const searchParams: Record<string, any> = ref({
      demand_status: [],
      product_id: [],
      plan_id: [],
      staff_no: [],
      iteration_id: null,
      product_module_id: [-1],
      level: [],
      name: "",
      create_by: [] as Array<string>,
      type: "",
      sort_name: "",
      sort_by: 0,
      page_size: 20,
      page_index: 1
    });
    // 保存默认值，后期对searchParams重新赋值
    const defaultSearchParams = {
      demand_status: [],
      product_id: [],
      plan_id: [],
      product_module_id: [-1],
      staff_no: [],
      iteration_id: null,
      level: [],
      name: "",
      create_by: [] as Array<string>,
      type: "",
      sort_name: "",
      sort_by: 0,
      page_size: 20,
      page_index: 1
    };
    const tableData: any = reactive({
      total: 0,
      list: []
    });
    // 抽屉组件form表单
    const demandForm = ref<Record<string, any>>({});
    const defaultDemandForm = {
      attachment: [],
      collect_time: dayjs().format("YYYY-MM-DD"),
      create_by: "",
      create_time: "",
      creator: "",
      delete_time: "",
      demand_status: curProductInfo.value?.is_approval === 1 ? 1 : 2,
      description: "",
      end_time: "",
      hours: 0,
      iteration_id: null,
      iteration_name: "",
      level: "3",
      type: 1,
      name: "",
      origin: userMsg?.staff_no,
      origin_remark: "",
      origin_staff: userMsg?.name,
      product_id: curProductInfo.value?.id,
      product_module_id: 0,
      product_module_name: curProductInfo.value?.name,
      product_name: curProductInfo.value?.name,
      staff_name: userMsg?.name,
      staff_no: userMsg?.staff_no,
      start_time: "",
      status_list: []
    };
    const richStatus = ref("view");
    const rich2Status = ref("view");
    // 抽屉组件默认隐藏
    const drawer = ref(false);
    // 基础向操作 指派人、来源人状态
    const dialogType = ref(1);

    const currentPage = ref(1);
    const stopAutoGetData = ref<boolean>(false);
    let flag = ref(false);
    // true： 列表 false: 看板
    const isShow = ref(true);
    const pageTableRef = ref<any>("");
    // 选中的list
    let selectedList = ref<ResponseParams.RequireListItem[]>();

    let demandData = reactive<Array<StepList>>([
      {
        titleColor: "rgb(219 219 219)",
        titleName: "未开始",
        status: 2,
        listData: [],
        isDisable: false,
        isShowLoadingMore: false,
        hasData: true,
        page_index: 1,
        page_size: 10
      },
      {
        titleColor: "rgba(250, 252, 239, 1)",
        titleName: "设计中",
        status: 4,
        listData: [],
        isDisable: false,
        isShowLoadingMore: false,
        hasData: true,
        page_index: 1,
        page_size: 10
      },
      {
        titleColor: "rgba(250, 252, 239, 1)",
        titleName: "设计完成",
        status: 5,
        listData: [],
        isDisable: false,
        isShowLoadingMore: false,
        hasData: true,
        page_index: 1,
        page_size: 10
      },
      {
        titleColor: "rgba(250, 252, 239, 1)",
        titleName: "已评审",
        status: 6,
        listData: [],
        isDisable: false,
        isShowLoadingMore: false,
        hasData: true,
        page_index: 1,
        page_size: 10
      },
      {
        titleColor: "rgba(225, 239, 251, 1)",
        titleName: "开发中",
        status: 7,
        listData: [],
        isDisable: true,
        isShowLoadingMore: false,
        hasData: true,
        page_index: 1,
        page_size: 10
      }
    ]);
    // 来源人、来源部门弹框。1：来源部门 2:来源人
    const type = ref(1);

    // 组件被销毁是  组件是包在keep-alice中
    onDeactivated(() => {
      drawer.value = false;
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
    // 获取项目列表
    const productLists = ref<ProjectItem[]>([]);

    const getProjectList = async () => {
      const data1 = computed(() => store.getters.productList);
      const data = JSON.parse(JSON.stringify(data1.value));
      if (!data) return;
      productLists.value = data.map((o: ProjectItem) => {
        return { ...o, value: o.id, label: o.name };
      });
    };
    // 获取项目列表

    // 获取计划下拉列表
    const planList = ref([]);
    const getPlanList = (pId: ProductId) => {
      if (!pId) return;
      getDemandPlanList<ResponseParams.ResponseDataSuccess>(pId).then((res: any) => {
        if (res.data && res.data.length) {
          planList.value = res.data;
        } else {
          planList.value = [];
        }
      });
    };
    // 获取迭代下拉列表
    const iterationList = ref([]);
    const basicIterationList = ref([]);
    const getIterationData = (params: ProductId) => {
      const getDemandList = useGetDemandList();
      getDemandList(params.product_id).then((res) => {
        if (res && res.length) {
          iterationList.value = res;
          basicIterationList.value = res.map((o: Record<string, any>) => {
            return { value: o.id, label: o.name };
          });
        } else {
          iterationList.value = [];
          basicIterationList.value = [];
        }
      });
    };
    // 获取迭代下拉列表

    // 获取需求详情动态
    const logArr = ref([]);
    const getLog = (id: number) => {
      getDemandListDetailLog<ResponseParams.ResponseDataSuccess>(id).then((res: any) => {
        if (res.data && res.data.length) {
          logArr.value = res.data;
        } else {
          logArr.value = [];
        }
      });
    };
    // 获取需求详情动态
    // 修改需求详情回调
    const onChangeDemand = (id: number) => {
      getLog(id);
    };
    // 修改需求详情回调

    const getDemandStatusData = (params?: Record<string, any>) => {
      getDemandListStatus<ResponseParams.ResponseDataSuccess>(params ? params : searchParams.value).then((res) => {
        if (res.code === 200) {
          const data = res.data;
          sortData(data);
        }
      });
    };
    // 数据分类到对应的位置
    const sortData = (lists: Array<Record<string, any>>): void => {
      demandData.forEach((v) => {
        v.listData = [];
        lists?.forEach((list) => {
          if (v.status === list.status) {
            v.listData.push(list);
          }
        });
        v.isShowLoadingMore = v.listData.length > 9 ? true : false;
        v.hasData = true;
        v.page_index = 1;
        v.page_size = 10;
      });
    };
    // 监听列表与看板切换
    watch(
      () => isShow.value,
      (newVal) => {
        if (!newVal) {
          getDemandStatusData();
        }
      }
    );
    // 监听抽屉关闭请求数据
    watch(
      () => drawer.value,
      (newVal) => {
        if (!newVal) {
          getData(pageTableRef.value.getCurrentPage(), undefined, searchParams.value);
          removeIdFromRouter();
          // 这里延迟请求是因为立即执行页面会有数据切换，交互不好
          setTimeout(() => {
            getUserList(searchParams.value.product_id);
          }, 500);
        }
      }
    );

    let obj: any = {
      product_module_id: 0
    };
    // // 批量修改模块--确定
    const handleUpdateModule = () => {
      if (obj.product_module_id >= 0) {
        updateData(obj);
        isOpenEditModule.value = false;
        return;
      }
    };

    // 取消批量更新模块
    const handleCancle = () => {
      selectedList.value = [];
      isOpenEditModule.value = false;
      getData(pageTableRef.value.getCurrentPage(), undefined, searchParams.value);
    };

    // 批量修改模块--选择模块
    const handleChangeModule = async (val: any) => {
      obj = {
        id: getSelectId(),
        field: "product_module_id",
        product_module_id: val.id
      };
    };

    const moduleTree = ref<ModuleNode[]>();

    // 获取模块select树数据  id: 在新增模块弹窗中删除模块的id，回调与当前列表进去比较
    const getModuleSelectTree = async (id?: number, parentId?: number) => {
      if (id) {
        if (obj.product_module_id === id) {
          obj.product_module_id = 0;
          if (moduleTree.value && moduleTree.value[0].name) {
            obj.product_module_name = moduleTree.value[0]?.name || "";
          }

          moduleId.value = parentId || 0;
        }
      }
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

    // 查看详情
    const handleDetail = (row: any) => {
      if (props.comePlan) {
        router.push({ name: "demandPool", query: { where: "planDetail", demandName: row.name } });
      } else {
        headerTitle.value = "查看详情";
        richStatus.value = "view";
        rich2Status.value = "view";
        drawer.value = true;
        loading.value = true;
        getdemandDetailFn(row.id);
        getLog(row.id);
        addDetailIdToRouter(row.id);
      }
    };
    // 获取需求详情
    const getdemandDetailFn = (id: number) => {
      if (!id) return;
      getDemandDetail<ResponseParams.ResponseDataSuccess>({ id })
        .then((res) => {
          demandForm.value = res.data;
          demandForm.value.level = demandForm.value.level + "";
          demandForm.value.iteration_id = demandForm.value.iteration_id ? demandForm.value.iteration_id : null;
        })
        .finally(() => {
          loading.value = false;
        });
    };
    // 获取需求详情

    const dialogShadow = (val: boolean) => {
      show.value = val;
    };

    // 新增需求
    const handleAddDemand = () => {
      headerTitle.value = "新增需求";
      richStatus.value = "add";
      rich2Status.value = "add";

      curProductInfo.value = getSession("productInfo", true) as any;
      defaultDemandForm.demand_status = curProductInfo.value?.is_approval === 1 ? 1 : 2;
      defaultDemandForm.product_id = curProductInfo.value?.id;
      defaultDemandForm.product_name = curProductInfo.value?.name;

      demandForm.value = JSON.parse(JSON.stringify(defaultDemandForm));

      logArr.value = [];

      drawer.value = true;
    };
    // 新增需求
    // 迭代跳转
    const jupmIteration = (id: number) => {
      if (id) {
        const a = iterationList.value.filter((item: any) => item.id === id);
        searchParams.value.demand = id;

        // 缓存当前迭代
        store.commit(MutationType.updateIterateId, id);
        // 缓存当前迭代信息
        store.commit(MutationType.updateCurrentIter, a[0] || null);
        router.push({ name: "homepage" });
      }
    };
    let a = 1;
    // 滚动加载
    const handleLoad = (item: Record<string, any>) => {
      if (a) {
        a++;
      } else {
        if (a === 0) {
          a = 1;

          handleLoadMore(item);
        }
      }
      setTimeout(() => {
        a = 0;
      }, 1000);
    };

    onMounted(() => {
      const { detailId } = route.query as Record<string, any>;
      if (router.currentRoute.value.name === "demandPool" && detailId) {
        handleDetail({ id: detailId });
      }
      // 获取创建人和指派人下拉列表
      getUserList(searchParams.value.product_id);
    });

    onActivated(() => {
      const { productId, auto, ids, name } = route.query as Record<string, any>;
      // 从工作台-仪表盘-项目动态跳转
      if (auto) {
        // 重写将默认值赋给searchParams
        searchParams.value = JSON.parse(JSON.stringify(defaultSearchParams));
        searchParams.value.product_id = productId;
        searchParams.value.name = name;
        searchArray.searchForm[0].val = name;

        currentActive.value = "-10";
        // searchData();
        handleDetail({ id: ids });
        // 去掉路由的参数
        setTimeout(() => {
          router.replace({
            path: route.path,
            query: { productId, name: undefined, auto: undefined }
          });
        }, 1000);
      }

      // setTimeout(() => {
      //   handleConditionSearch();
      // }, 300);
    });

    // 单列加载更多

    const handleLoadMore = (item: Record<string, any>) => {
      if (!item.hasData) return;

      const status = item.status;
      let params = {
        demand_status: item.status
      } as RequestParams.GetPlanListsTurnPage;

      params = Object.assign({}, params, searchParams.value);
      params.page_index = item.page_index + 1;
      params.page_size = item.page_size;
      params.demand_status = item.status;
      getDemandListPage<ResponseParams.ResponseDataSuccess>(params).then((res) => {
        if (res.data.length === 0) {
          item.isShowLoadingMore = false;
          item.hasData = false;
        } else {
          // 获取成功，重新设置当前分页
          item.page_index = item.page_index + 1;
          // 拼接数据到对应位置
          const index = demandData.findIndex((v) => v.status === status);
          // 当前返回数据小于10，表示已经加载完所有数据，显示没有更多
          if (res.data.length < 10) {
            demandData[index].hasData = false;
            demandData[index].isShowLoadingMore = false;
          }
          res.data.forEach((item: Record<string, any>) => {
            demandData[index].listData.push(item);
          });
        }
      });
    };

    // 导出
    const exportTaskDate = async () => {
      const params = JSON.parse(JSON.stringify(searchParams.value));
      if (!params.type) delete params.type;
      if (!tableData.total) return tipMessage(400, "暂无数据，无法导出");
      setObjStringify(params, "/api/tomato/demand/export");
    };
    // 编辑或者新增需求  type: add代表创建需求，edit代表编辑描述或者备注
    const editOrAddDemand = (params: any, type: string) => {
      if (type === "add") {
        const loading = ElLoading.service({
          lock: true,
          text: "Loading",
          background: "rgba(0, 0, 0, 0.7)"
        });
        createDemand<ResponseParams.ResponseDataSuccess>(params).then(() => {
          handleConditionSearch();
          drawer.value = false;
          loading.close();
          return tipMessage(200, "成功");
        });
      } else {
        editDemand<ResponseParams.ResponseDataSuccess>(params).then(() => {
          getLog(params.id[0]);
          // getData(pageTableRef.value.getCurrentPage(), true, searchParams.value);
          // drawer.value = false;
          return tipMessage(200, "成功");
        });
      }
    };
    interface WangText {
      id: number[];
      description?: string;
      origin_remark?: string;
      field?: string;
      name?: string;
    }
    // 抽屉-保存数据
    const onHandle = (type: "save" | "cancel" | "name", currentRt: any, who: string) => {
      if (type === "cancel") {
        return (drawer.value = false);
      }
      if (who === "title") {
        const obj: WangText = {
          id: [currentRt.id],
          field: "name",
          name: currentRt.title
        };
        // console.log(object)
        if (currentRt.title.length < 4 || currentRt.title.length > 100) return tipMessage(400, "请输入4-100个字数内的标题");
        demandForm.value.name = currentRt.title;
        editOrAddDemand(obj, "edit");
        return;
      }

      // id存在代表编辑，否则是新增需求
      if (currentRt.id) {
        const obj: WangText = {
          id: [currentRt.id]
        };
        if (currentRt.who === "rich") {
          obj.description = currentRt.rich;
          demandForm.value.description = currentRt.rich;
          obj.field = "description";
        } else {
          obj.origin_remark = currentRt.rich2;
          demandForm.value.origin_remark = currentRt.rich2;

          obj.field = "origin_remark";
        }

        editOrAddDemand(obj, "edit");
      } else {
        if (!currentRt.title) return tipMessage(400, "标题不能为空");
        if (currentRt.title.length < 4 || currentRt.title.length > 100) return tipMessage(400, "请输入4-100个字数内的标题");
        demandForm.value.name = currentRt.title;
        demandForm.value.description = currentRt.rich;
        demandForm.value.origin_remark = currentRt.rich2;
        if (demandForm.value.hours) {
          const r = /^\+?[0-9][0-9]*$/;
          if (Number(demandForm.value.hours) < 0) return tipMessage(400, "请输入大于0的正整数");
          if (!r.test(demandForm.value.hours)) return tipMessage(400, "请输入大于0的正整数");
        }
        demandForm.value.hours = demandForm.value.hours * 1;

        // 这俩重新序列化一次原因是demandForm.value.demand_status和demandForm.value.level后端要number类型，而element中select值是字符串，如果进行序列化在保存时会状态和优先级内容变成数字（闪一下）
        const obj = JSON.parse(JSON.stringify(demandForm.value));
        obj.product_id = curProductInfo.value?.id;
        obj.demand_status = demandForm.value.demand_status * 1;
        obj.level = demandForm.value.level * 1;
        if (!obj.iteration_id) obj.iteration_id = 0;
        if (!obj.staff_no) return tipMessage(400, "指派给不能为空");

        editOrAddDemand(obj, "add");
      }
    };

    //#region 跳转关联计划
    const handleShowPlan = (name: string) => {
      router.push({
        name: "planManagement",
        query: {
          where: "demand",
          plan_name: name
        }
      });
    };
    //#endregion

    // 选中数据
    const handleSelectionChange = (val: ResponseParams.RequireListItem[]) => {
      selectedList.value = val;
    };

    /**
     * 优先级处理
     * @param type 类型 1：申请审批
     */
    const handleUpdateAssign = (type: number, row?: ResponseParams.RequireListItem) => {
      if (type === 1 || type === 2) {
        if (type === 1 && row?.id && row?.demand_status !== 1) return ElMessage.warning("非待审核状态无法申请审批");
        // 如果有id 说明是操作具体的一栏，没有id说明是批量操作，另外这里的filter 1 是过滤待审核的状态
        let ids;
        let names;
        if (row?.id || row?.approval_id) {
          ids = type === 1 ? row.id : row.approval_id;
          names = type === 1 ? row.name : row.approval_title;
        } else {
          const arr = selectedList.value?.filter((i) => i.demand_status === 1);
          ids = arr?.map((i) => i.id).toString();
          names = arr?.map((i) => i.name).toString();
        }
        // 跳转到需求审批列表
        router.push({
          name: "approval",
          query: { ids, names, auto: 1, productId: route.query.productId, fromNotices: type === 2 ? "true" : "false" }
        });
      } else if (type === 3) {
        router.push({ name: "approval", query: { productId: route.query.productId } });
      }
    };

    // 此函数每次点击分页也会调用到
    const getData = async (pagationParams?: Pagation, flag?: boolean, params?: any) => {
      stopAutoGetData.value = flag == undefined ? false : true;
      currentPage.value = (pagationParams && pagationParams.pageIndex) || 1;
      const { response } = useRequest(useFetchSearch, params || searchParams.value);
      const { pagation } = useRenderTable(response);
      const {
        data: { list, count }
      } = await pagation(pagationParams);
      tableData.total = count;
      tableData.list = list;
    };

    // 条件搜索
    let timer: ReturnType<typeof setTimeout>;
    const handleConditionSearch = async (isHiddenSelect?: boolean) => {
      if (isHiddenSelect === true) {
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(async () => {
        if (flag.value) {
          pageTableRef.value.setCurrentPage();
          currentPage.value = 1;
          await getData({ pageIndex: 1, pageSize: 20 }, true, searchParams.value);
          flag.value = false;
        } else {
          await getData(pageTableRef.value.getCurrentPage(), true, searchParams.value);
        }
        stopAutoGetData.value = false;

        // 获取计划下拉列表
        getPlanList({ product_id: searchParams.value.product_id as [] });
        // 获取迭代下拉列表
        getIterationData({ product_id: searchParams.value.product_id as [] });
        getDemandStatusData();
      }, 300);
    };

    const demandFormParams = ref();

    useWatchChangeProduct(handleConditionSearch, async (newValue) => {
      searchParams.value.product_id = newValue as [];
      curProductInfo.value = getSession("productInfo", true) as any;
      // 计划模块-计划详情也用到该页面
      if (props.comePlan) {
        searchParams.value.plan_id = [props.id];
        searchParams.value.page_size = 50;
      }
      // demandFormParams.value?.resetForm();

      await handleConditionSearch();
      // await quickSeacrh({ id: "-1", key: "", label: "所有" });

      // 获取项目列表
      getProjectList();
    });
    // 快速查询
    const quickSeacrh = (val: Record<string, any>) => {
      const productInfo = getSession("productInfo", true) as Record<string, any>;
      // 重写将默认值赋给searchParams
      searchParams.value = JSON.parse(JSON.stringify(defaultSearchParams));
      searchParams.value.product_id = productInfo.id;

      // val.key不存在代表获取所有数据
      if (val.key) {
        const obj: Record<string, any> = {
          demand_status: ["2", "4", "5", "6", "7"],
          create_by: [userMsg?.staff_no],
          staff_no: [userMsg?.staff_no]
        };
        let params: Record<string, any> = {};
        params.product_id = searchParams.value.product_id;

        params[val.key] = obj[val.key];
        if (val.id === "4") params[val.key] = ["4"];

        searchParams.value[val.key] = params[val.key];
      }
      if (!isShow.value) getDemandStatusData(searchParams.value);
      else searchDate();
    };
    // 点击搜索弹框选中搜索条件查询
    const changeSearch = (val: Record<string, any>) => {
      let params: Record<string, any> = JSON.parse(JSON.stringify(val));

      params.product_id = searchParams.value.product_id;
      // 遍历将值更新到searchParams
      for (var obj in val) {
        searchParams.value[obj] = val[obj];
      }
      if (!searchParams.value.product_module_id) searchParams.value.product_module_id = [-1];
      if (!isShow.value) getDemandStatusData(searchParams.value);
      else searchDate();

      // 这里延迟请求是因为立即执行页面会有数据切换，交互不好
      setTimeout(() => {
        getUserList(searchParams.value.product_id);
      }, 500);
    };

    const searchDate = async () => {
      pageTableRef.value?.setCurrentPage();
      currentPage.value = 1;
      await getData(pageTableRef.value?.getCurrentPage(), undefined, Object.assign(searchParams.value));
      flag.value = false;
    };

    const searchData = async () => {
      flag.value = true;
      handleConditionSearch();
    };

    // 更改优先级
    const onChangePriority = (val: PRIORITYINTER, item: any) => {
      updateData({
        field: "level",
        id: [item.id],
        level: val.id
      });
    };
    // 更改状态、预计工时、指派人
    const onChangeType = (val: Record<string, any>, item: Record<string, any>, type?: string) => {
      const obj: Record<string, any> = {
        id: [item.id]
      };
      // 修改预计工时
      if (type === "hours") {
        obj.hours = Number(val.label);
        obj.field = "hours";
      }
      // 修改指派人
      else if (type === "staff") {
        obj.staff_no = val.value;
        obj.staff_name = val?.label;
        obj.field = "staff_no";
      } else {
        obj.field = "demand_status";
        obj.demand_status = Number(val.value);
      }
      updateData(obj);
    };
    // 更改状态、等级、指派人
    const onChangeSelect = (val: string | number, item: Record<string, any>, key?: string) => {
      const obj: Record<string, any> = {
        id: [item.id],
        field: key
      };
      if (key === "staff_no") {
        const person = basicUserList.value.filter((item: Staff) => item.value === val);
        obj.staff_no = person[0].value;
        obj.staff_name = person[0].label;
      }
      if (key === "level") obj.level = val;

      if (key === "demand_status") obj.demand_status = val;
      updateData(obj);
    };
    interface StaffData {
      id?: number[];
      field: string;
      staff_name: string;
      staff_no: string;
    }
    // 修改来源人，指派人回调
    const updateVal = (val: string | StaffData) => {
      if (val === "no") {
        // 弹框取消操作
        getData(pageTableRef.value.getCurrentPage(), undefined, searchParams.value);
        return;
      }
      if (dialogType.value === 1) {
        let obj = {
          id: getSelectId(),
          field: "origin",
          origin: val
        };
        updateData(obj);
      } else {
        let obj = val as StaffData;
        obj.id = getSelectId();

        updateData(obj);
      }

      dialogDemand.value = false;
    };

    // 创建计划
    const handleCreatePlan = () => {
      const obj = getSelectId();
      router.push({
        name: "planManagement",
        params: {
          planIds: obj
        }
      });
    };
    // 创建计划

    // 移除计划下的需求(在计划管理-计划详情下)
    const deleteDemand = (params: any) => {
      removePlanDemand<ResponseParams.ResponseDataSuccess>(params).then(() => {
        getData(pageTableRef.value.getCurrentPage(), undefined, searchParams.value);
      });
    };
    // 移除计划下的需求(在计划管理-计划详情下)

    // 批量删除/删除  id存在代表单个删除
    const handlebatchCancel = (id?: number) => {
      // props.comePlan代表移除计划下的需求
      if (props.comePlan) {
        deleteDemand({ plan_id: searchParams.value.plan_id.join() * 1, demand_id: id });
        return;
      }
      let ids: number[] = [];
      if (id) {
        ids.push(id);
      } else {
        selectedList.value?.forEach((item) => {
          if (item.demand_status !== 3) {
            ids.push(item.id);
          }
        });
      }

      ElMessageBox.confirm("此操作将永久删除，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        confirmButtonClass: "el-button--danger-box",
        type: "warning"
      }).then(() => {
        updateTrash<ResponseParams.ResponseDataSuccess>({ ids: ids }).then(() => {
          getData(pageTableRef.value.getCurrentPage(), undefined, searchParams.value);
        });
      });
    };

    // 基础向批量  编辑更新
    const updateData = (params: any) => {
      editDemand<ResponseParams.ResponseDataSuccess>(params).then((res) => {
        if (res.code === 200) {
          getData(pageTableRef.value.getCurrentPage(), undefined, searchParams.value);

          if (params.demand_status && params.demand_status == 5) {
            return tipMessage(200, "修改成功，请填写消耗工时，以便记录工作情况");
          }
          // 这里延迟请求是因为立即执行页面会有数据切换，交互不好
          setTimeout(() => {
            getUserList(searchParams.value.product_id);
          }, 500);
          return tipMessage(200, "成功");
        }
      });
    };

    // 预计工时修改
    const onChangeVal = (params: Record<string, any>) => {
      const obj = {
        id: params.ids,
        hours: params.hours,
        field: "hours"
      };
      updateData(obj);
    };
    // 预计工时修改

    // 获取多选id
    const getSelectId = () => {
      let ids: number[] = [];
      selectedList.value?.forEach((item) => {
        if (item.demand_status !== 999) ids.push(item.id);
      });
      return ids;
    };
    // 获取多选id

    interface Staff {
      value: string;
      staff_no: string;
    }
    // 基础向批量操作
    const handleBasicChange = (val: any) => {
      console.log(val);

      // 调起弹框组件 模块
      if (val[0] === "product_module_id") {
        // 模块
        isOpenEditModule.value = true;
        return;
      }
      // 调起弹框组件 操作来源人、来源部门
      if (!val[1]) {
        // 来源人
        if (val[0] === "origin") {
          dialogType.value = 1;
          console.log(val);
        } else {
          // 指派人
          dialogType.value = 2;
        }
        dialogDemand.value = true;
      } else {
        const obj: any = {
          id: getSelectId()
        };
        const keyArr = ["demand_status", "level"];
        const label = cascaderPanel.value.getCheckedNodes()[0].value;
        obj[val[0]] = label;
        if (keyArr.includes(val[0])) {
          obj[val[0]] = label * 1;
        }
        // 如果是指派人，需要把指派人名字传过去，其它只传id即可
        else if (val[0] === "staff_no") {
          const userMsg = basicUserList.value.filter((item: Staff) => item.value === label);
          obj.staff_name = userMsg[0].label;
        } else if (val[0] === "product_module_id") {
          obj.product_module_id = obj.product_module_id * 1;
        }
        obj.field = val[0];

        updateData(obj);
      }
      // 隐藏基础项
      basicBtn?.value.handleClose();
    };
    // 基础向批量操作
    // 排序
    const sortChange = (e: OrderSort) => {
      const { prop, order } = e;
      if (!order) return;
      searchParams.value.sort_name = prop;
      searchParams.value.sort_by = order === "ascending" ? 1 : 2;
      getData(pageTableRef.value.getCurrentPage(), undefined, searchParams.value);
    };

    //基础操作列表数据
    const basicsOption: BasicsOption[] = reactive([
      {
        value: "level",
        label: "优先级",
        children: DEMAND_PRIORITY
      },
      {
        value: "demand_status",
        label: "状态",
        children: DEMAND_STATUS
      },
      {
        value: "staff_no",
        label: "指派给",
        children: []
      },
      {
        value: "type",
        label: "类型",
        children: requireTypes.map((o) => {
          return { value: o.id, label: o.value };
        })
      },
      {
        value: "product_module_id",
        label: "模块",
        children: []
      },
      {
        value: "product_id",
        label: "项目",
        children: productLists
      },
      {
        value: "iteration_id",
        label: "迭代",
        children: basicIterationList
      },
      {
        value: "origin",
        label: "来源人"
      }
    ]);
    // 搜索列表数据
    const searchArray: SearchArray = reactive({
      btnArray: [
        { id: "-1", label: "所有", key: "" },
        { id: "2,4,5,6,7", label: "未完成", key: "demand_status" },
        { id: "4", label: "设计中", key: "demand_status" },
        { id: "5", label: "我创建的", key: "create_by" },
        { id: "6", label: "指给我的", key: "staff_no" }
      ],
      searchForm: [
        {
          type: "input",
          label: "需求名称",
          key: "name",
          val: ""
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
          label: "优先级",
          multiple: true,
          key: "level",
          val: [],
          listData: DEMAND_PRIORITY
        },
        {
          type: "select",
          label: "需求状态",
          multiple: true,
          key: "demand_status",
          val: [],
          listData: DEMAND_STATUS
        },
        {
          type: "select",
          label: "创建人",
          val: [],
          key: "create_by",
          showRecord: true,
          multiple: true,
          valueKey: ["staff_no", "staff_name"],
          listData: userList
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
          type: "select",
          label: "所属计划",
          multiple: false,
          val: [],
          key: "plan_id",
          valueKey: ["id", "name"],
          listData: planList
        },
        {
          type: "select",
          label: "所属迭代",
          multiple: false,
          val: [],
          key: "iteration_id",
          valueKey: ["id", "name"],
          listData: iterationList
        }
      ]
    });
    watch(
      () => route.query,
      (newVal, oldVal) => {
        // type存在不是在header上快捷选项进行新增需求
        const { productId, demandId, id, type, where } = route.query as Record<string, any>;
        if (where === "headerDemand" && type === "add") {
          handleAddDemand();
          setTimeout(() => {
            // 去掉路由的参数
            router.replace({
              path: route.path,
              query: { productId, type: undefined }
            });
          }, 700);
        }
        // 从计划管理跳转过来
        else if (where === "plan") {
          // 重写将默认值赋给searchParams
          searchParams.value = JSON.parse(JSON.stringify(defaultSearchParams));
          searchParams.value.product_id = curProductInfo.value?.id;
          searchParams.value.plan_id = [id];

          setTimeout(() => {
            searchArray.searchForm[6].val = id * 1;
          }, 500);

          if (newVal.type && newVal.type.length) {
            searchParams.value.demand_status = newVal.type;

            searchArray.searchForm[3].val = [8];
          } else {
            searchParams.value.demand_status = [];
            searchArray.searchForm[3].val = [];
          }
          currentActive.value = "-10";
          searchData();
          // 去掉路由的参数
          router.replace({
            path: route.path,
            query: { productId, type: undefined, id: undefined, where: undefined, demand_status: undefined }
          });
        }
        // // 从计划管理-详情跳转
        else if (where === "planDetail") {
          // 重写将默认值赋给searchParams
          searchParams.value = JSON.parse(JSON.stringify(defaultSearchParams));
          searchParams.value.product_id = curProductInfo.value?.id;
          searchParams.value.name = newVal.demandName;
          searchParams.value.page_size = 100;
          currentActive.value = "-10";
          searchArray.searchForm[0].val = newVal.demandName;
          searchData();
          // 去掉路由的参数
          setTimeout(() => {
            router.replace({
              path: route.path,
              query: { productId, demandName: undefined, where: undefined }
            });
          }, 1000);
        }
        // // 从迭代主页跳转过来
        else if (where === "iteration") {
          handleDetail({ id: demandId });
          // 去掉路由的参数
          setTimeout(() => {
            router.replace({
              path: route.path,
              query: { productId, demandId: undefined, where: undefined }
            });
          }, 1000);
        }
        // 从项目也跳转
        else if (where === "home") {
          // 重写将默认值赋给searchParams
          searchParams.value = JSON.parse(JSON.stringify(defaultSearchParams));
          searchParams.value.product_id = curProductInfo.value?.id;
          searchParams.value.demand_status = [2, 4, 5, 6, 7];
          searchArray.searchForm[3].val = [2, 4, 5, 6, 7];

          currentActive.value = "-10";
          searchData();
          setTimeout(() => {
            // 去掉路由的参数
            router.replace({
              path: route.path,
              query: { productId, status: undefined, where: undefined }
            });
          }, 700);
        }
        if (newVal?.productId !== oldVal?.productId) {
          curProductInfo.value = getSession("productInfo", true);
        }
      },
      {
        immediate: true
      }
    );

    return {
      loading,
      sortChange,
      onChangePriority,
      selectedList,
      ...toRefs(tableData),
      handleUpdateAssign,
      searchParams,
      getData,
      PRIORITY,
      pageTableRef,
      DEMAND_STATUS,
      handleConditionSearch,
      handleDetail,
      handleAddDemand,
      handleSelectionChange,
      userList,
      isShow,
      handleShowPlan,
      demandData,
      handleLoadMore,
      jupmIteration,
      handlebatchCancel,
      requireTypes,
      curProductInfo,
      exportTaskDate,
      currentPage,
      searchArray,
      quickSeacrh,
      changeSearch,
      handleCreatePlan,
      drawer,
      onHandle,
      demandForm,
      headerTitle,
      iterationList,
      richStatus,
      rich2Status,
      editOrAddDemand,
      basicsOption,
      handleBasicChange,
      basicBtn,
      dialogShadow,
      type,
      show,
      staff,
      cascaderPanel,
      onChangeType,
      basicUserList,
      onChangeVal,
      currentActive,
      logArr,
      onChangeDemand,
      dialogDemand,
      updateVal,
      dialogType,
      demandFormParams,
      onChangeSelect,
      handleLoad,
      product_module_name,
      isOpenEditModule,
      handleUpdateModule,
      handleCancle,
      handleChangeModule,
      moduleId,
      moduleTree,
      getModuleSelectTree
    };
  }
});
</script>

<style scoped lang="less">
.container {
  padding: 10px;
}
.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.search-right {
  margin-right: 6px;
}
.app-name {
  color: @rp-color-text-link;
  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
}
:deep(.page) {
  bottom: 24px;
}

.rp-project-list {
  position: absolute;
  top: 14px;
  right: 110px;
  z-index: 999;
}
.rp-demand-list {
  position: absolute;
  top: 60px;
  left: 20px;
  background: #fff;
  right: 20px;
  bottom: 30px;
  z-index: 101;
  .demand-list-show {
    display: flex;
    height: 100%;
    .demand-list-cloumn {
      width: 20%;
      height: 100%;
      .demand-title {
        font-size: 14px;
        line-height: 34px;
        text-align: center;
      }
      .demand-detail-show {
        height: calc(100% - 50px);
        padding: 10px 5px 0;
        border: 1px solid #e8e8e8;
        // overflow: scroll;
        .demand-show-content {
          padding: 8px;
          box-sizing: border-box;
          position: relative;
          border-radius: 10px;
          border: 1px solid #e8e8e8;
          background: rgb(225, 239, 251);
          margin: 5px auto 5px;
          font-size: 12px;
          div {
            margin: 6px 0;
            color: #595959;
          }
          p {
            font-weight: bold;
            margin: 8px 0;
            font-size: 14px;
            &:hover {
              cursor: pointer;
              text-decoration: underline;
            }
          }
          .content-plan {
            &:hover {
              cursor: pointer;
              text-decoration: underline;
            }
          }
          .content-msg {
            display: flex;
            justify-content: space-between;
            color: #595959;
          }
          .content-origin {
            margin: 8px 0;
            color: #595959;
          }
        }
        .block-loadingMore {
          margin: 30px 0;
          text-align: center;
          i {
            cursor: pointer;
            color: #999;
            font-size: 26px;
            transform: rotate(90deg);
          }
          span {
            font-size: 14px;
            color: #999;
          }
        }
      }
    }
  }
}

.index {
  position: relative;
  &-popup {
    z-index: 999;
    position: absolute;
    left: 20px;
    bottom: 34px;
  }

  &-priority {
    cursor: pointer;
  }
}

// 不要删掉，应对全屏名称的样式问题
:global(.demandPool .table-column-left) {
  font-size: 14px;
}
</style>
