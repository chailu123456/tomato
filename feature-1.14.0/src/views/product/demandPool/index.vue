<template>
  <div class="index" style="height: calc(100% - -10px)">
    <page-table
      :tableData="list"
      @sort-change="sortChange"
      @handleSelectionChange="handleSelectionChange"
      @handlePagationChange="getData"
      :total="total"
      ref="pageTableRef"
    >
      <template #header>
        <el-form :inline="true" :model="searchParams">
          <el-form-item label>
            <el-input
              v-model.trim="searchParams.name"
              style="width: 146px"
              @change="handleName"
              @keyup.enter="handleConditionSearch"
              placeholder="需求名称"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="模块" class="rp-select">
            <el-select
              class="elect-pool"
              v-model="searchParams.product_module_id"
              @change="handleLevel"
              clearable
              placeholder="--所有--"
              multiple
              collapse-tags
              @visible-change="handleConditionSearch"
              @remove-tag="handleConditionSearch"
            >
              <el-option v-for="item in moduleList" :key="item.name" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="优先级" class="rp-select">
            <el-select
              class="elect-pool-level"
              v-model="searchParams.level"
              @change="handleLevel"
              clearable
              placeholder="--所有--"
              multiple
              collapse-tags
              @visible-change="handleConditionSearch"
              @remove-tag="handleConditionSearch"
            >
              <el-option v-for="item in PRIORITY" :key="item.value" :label="item.value" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="需求状态" v-if="isShow" class="rp-select">
            <el-select
              class="elect-pool-level"
              v-model="searchParams.status"
              placeholder="--所有--"
              @change="handleStatus"
              clearable
              multiple
              collapse-tags
              @visible-change="handleConditionSearch"
              @remove-tag="handleConditionSearch"
            >
              <el-option v-for="item in PLAN_STATUS" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="需求类型" class="rp-select">
            <el-select class="elect-pool-level" v-model="searchParams.type" placeholder="--所有--" @change="handleStatus" clearable>
              <el-option v-for="item in requireTypes" :key="item.value" :label="item.value" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="创建人" class="rp-select">
            <el-select
              class="elect-pool"
              @change="handleCreator"
              v-model="searchParams.creator"
              placeholder="--所有--"
              multiple
              clearable
              collapse-tags
              @visible-change="handleConditionSearch"
              @remove-tag="handleConditionSearch"
            >
              <el-option-group v-for="group in userList" :key="group.staff_no" :label="group.label">
                <el-option v-for="item in group.options" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"></el-option>
              </el-option-group>
            </el-select>
          </el-form-item>
          <el-form-item style="float: right">
            <el-button type="primary" @click="handleUpdateAssign(3)">审批单</el-button>
            <el-button type="primary" @click="handleAddDemand">新增需求</el-button>
            <!-- <el-button @click="isShow = !isShow">
              <i style="transform: rotate(90deg)" class="el-icon-sort"></i>
              {{ !isShow ? "状态列表" : "普通列表" }}
            </el-button> -->
            <el-dropdown style="margin-left: 10px">
              <el-button type="primary"> 更 多 </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="isShow = !isShow">
                    {{ isShow ? "切换状态列表" : "切换普通列表" }}
                  </el-dropdown-item>
                  <el-dropdown-item @click="exportTaskDate">导 出</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="isShow" #main>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column sortable="custom" prop="id" label="ID" width="80"></el-table-column>
        <el-table-column sortable="custom" class-name="table-column-left table-title" :min-width="200" prop="name" label="需求名称">
          <template #default="scoped">
            <span class="app-name" @click="handleDetail(scoped.row)">{{ scoped.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="product_module_id" width="120" label="模块">
          <template #default="scoped">
            <span>{{ scoped.row.product_module_name ? scoped.row.product_module_name : "主干" }}</span>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="type" width="100" label="类型">
          <template #default="scoped">
            <span>{{ handleType(scoped.row.type) }}</span>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="level" width="90" label="优先级">
          <template #default="scoped">
            <PriorityPopup :item="scoped.row" @changePriority="onChangePriority" />
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="status" width="100" label="状态">
          <template #default="scoped">
            <span :style="getTextColor(scoped.row.status)">{{ scoped.row.statusName }}</span>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="plan_name" min-width="200" label="关联计划">
          <template #default="scoped">
            <span class="app-name" @click="handleShowPlan">{{ scoped.row.plan_name }}</span>
          </template>
        </el-table-column>
        <!-- is_approval  是否需要审批 0.不需要 1.需要  -->
        <el-table-column prop="approval_title" min-width="130" label="关联审批" v-if="curProductInfo?.is_approval === 1">
          <template #default="scoped">
            <span class="app-name" @click="handleUpdateAssign(2, scoped.row)">{{ scoped.row.approval_title }}</span>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="creator" label="创建人"></el-table-column>
        <el-table-column sortable="custom" prop="origin_path" width="100" label="需求来源">
          <template #default="scoped">
            <span>{{ scoped.row.origin_path ? scoped.row.origin_path : scoped.row.origin }}</span>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="collect_time" width="110" label="收集时间"></el-table-column>
        <el-table-column width="150" label="操作">
          <template #default="scope">
            <el-button type="text" :disabled="handleDisable(scope.row, '1')" @click="handleEdit(scope.row.id)">编辑</el-button>
            <el-button type="text" :disabled="handleDisable(scope.row, '2')" @click="handleUpdateAssign(1, scope.row)">申请审批</el-button>
            <el-button
              :class="[handleDisable(scope.row, '3') ? '' : 'delete']"
              :disabled="handleDisable(scope.row, '3')"
              type="text"
              @click="handleDelete(scope.row.id)"
              >作废</el-button
            >
          </template>
        </el-table-column>
      </template>
    </page-table>
    <template v-if="!isShow">
      <div class="rp-demand-list">
        <ul class="demand-list-show" ref="columnsWrapperRef">
          <li v-for="(item, index) in demandData" :key="index" class="demand-list-cloumn">
            <div class="demand-title" :style="{ background: item.titleColor }">{{ item.titleName }}</div>
            <div class="demand-detail-show">
              <el-scrollbar :data-index="index">
                <div
                  class="demand-show-content"
                  :style="{ background: item.status ? '#e1effb' : 'rgb(230, 252, 247)' }"
                  v-for="(it, index) in item.listData"
                  :key="index"
                >
                  <p @click="handleDetail(it)">{{ it.name }}</p>
                  <div class="content-msg" v-if="!it.status">
                    <span>{{ it.creator }}</span>
                    <span>{{ it.create_time }}</span>
                  </div>
                  <div v-if="!it.status" class="content-origin">来源： {{ it.origin_path ? it.origin_path : it.origin }}</div>
                  <div v-if="[1, 2, 8].includes(it.status)">
                    <div class="content-plan" @click="handleShowPlan">计划： {{ it.plan_name }}</div>
                    <div class="content-give">交付: {{ it.deliver_time }}</div>
                  </div>
                  <div v-if="[3, 4, 5, 6].includes(it.status)">
                    <div class="content-plan" @click="jupmIteration(it.iteration_id)">迭代： {{ it.iteration_name }}</div>
                    <div class="content-cycle">周期: {{ it.iteration_dev_time }} - {{ it.iteration_release_time }}</div>
                  </div>
                </div>
                <div class="block-loadingMore">
                  <i class="el-icon-d-arrow-right" @click="handleLoadMore(item)" v-show="item.isShowLoadingMore"></i>
                  <span v-show="!item.hasData">┗( ▔, ▔ )┛没有更多了...</span>
                </div>
              </el-scrollbar>
            </div>
          </li>
        </ul>
      </div>
    </template>
    <div class="index-popup" v-if="selectedList?.length">
      <el-dropdown size="small" @command="(n: number) => handlebatch(n)">
        <el-button>
          优先级
          <i class="el-icon-arrow-up el-icon--right"></i>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu v-for="(item, index) in PRIORITY" :key="index">
            <el-dropdown-item :command="item.id">
              <span :style="{ color: item.color }">{{ item.value }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button style="margin-left: 10px" @click="handleUpdateAssign(1)">
        申请审批
        <i class="el-icon--right"></i>
      </el-button>
      <el-button @click="handlebatchCancel">
        作废
        <i class="el-icon--right"></i>
      </el-button>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, toRefs, reactive, ref, watch, onActivated } from "vue";
import { useFetchSearch } from "./composables/useFetchSearch";
import { RequestParams } from "@/types/request";
import useGetTableData from "@/composables/useGetTableData";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { demandUserList, getDemandListStatus, getDemandListPage, deleteDemand, updatePriority, updateTrash } from "@/api/request-modules/product";
import { ResponseParams } from "@/types/response";
import { getModuleList } from "@/api/request-modules/common";
import useMixin from "@/views/iteration/useMixin";
import { PLAN_STATUS, PRIORITY } from "@/utils/contantOptions";
import PriorityPopup from "@/views/product/demandPool/components/priorityPopup.vue";
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
import useWatchChangeProduct from "@/composables/useWatchChangeProduct";
import { PRIORITYINTER } from "@/types/interface";
import { requireTypes } from "@/utils/contantOptions";
import useMessageTip from "@/composables/useMessageTip";
import { getSession, setObjStringify } from "@/utils";

export default defineComponent({
  name: "demandPool",
  components: {
    PriorityPopup
  },
  setup() {
    const { tipMessage } = useMessageTip();
    const curProductInfo = ref(getSession("productInfo", true));
    const router = useRouter();
    const route = useRoute();
    const searchParams = reactive({
      status: [],
      product_id: [],
      product_module_id: [],
      creator: [],
      level: [],
      name: "",
      create_by: [] as Array<string>,
      type: "",
      sort_name: "",
      sort_by: 0
    });
    const isShow = ref(true);
    const pageTableRef = ref<any>("");

    // 选中的list
    let selectedList = ref<ResponseParams.RequireListItem[]>();
    const handleDisable = (obj: Record<any, any>, type: string) => {
      // 优先判断status=999是否作废然后判断demand_status
      //demand_status 3不能编辑，  3 不能作废
      if (obj.status === 999) return true;
      if (type === "1") {
        if (obj.demand_status === 3) return true;
      }
      if (type === "2") {
        if (obj.demand_status === 2 || obj.demand_status === 3) return true;
      }
      if (type === "3") {
        if (obj.demand_status === 3) return true;
      }
      return false;
    };
    let demandData = reactive<Array<StepList>>([
      {
        titleColor: "rgb(219 219 219)",
        titleName: "未开始",
        status: 0,
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
        status: 1,
        listData: [],
        isDisable: false,
        isShowLoadingMore: false,
        hasData: true,
        page_index: 1,
        page_size: 10
      },
      {
        titleColor: "rgba(250, 252, 239, 1)",
        titleName: "待评审",
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
        titleName: "已评审",
        status: 8,
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
        status: 4,
        listData: [],
        isDisable: true,
        isShowLoadingMore: false,
        hasData: true,
        page_index: 1,
        page_size: 10
      },
      {
        titleColor: "rgba(225, 239, 251, 1)",
        titleName: "测试中",
        status: 5,
        listData: [],
        isDisable: true,
        isShowLoadingMore: false,
        hasData: true,
        page_index: 1,
        page_size: 10
      },
      {
        titleColor: "rgba(225, 239, 251, 1)",
        titleName: "待发布",
        status: 6,
        listData: [],
        isDisable: true,
        isShowLoadingMore: false,
        hasData: true,
        page_index: 1,
        page_size: 10
      }
    ]);

    // 获取用户下拉列表
    const userList = ref([]);
    const getUserList = (pId: ProductId) => {
      demandUserList<ResponseParams.ResponseDataSuccess>(pId).then((res: any) => {
        if (res.data && res.data.length) {
          userList.value = res.data;
        } else {
          userList.value = [];
        }
      });
    };
    const getDemandStatusData = () => {
      getDemandListStatus<ResponseParams.ResponseDataSuccess>(searchParams).then((res) => {
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
          if (v.status === 4) {
            if (list.status === 3 || list.status === 4) {
              v.listData.push(list);
            }
          } else if (v.status === list.status) {
            v.listData.push(list);
          }
        });
        v.isShowLoadingMore = v.listData.length > 9 ? true : false;
        v.hasData = true;
        v.page_index = 1;
        v.page_size = 10;
      });
    };
    const handleType = (val: number) => {
      // 1.新增功能 2.产品优化 3.缺陷修复 4.政治项目 5.配合升级
      const statusObj: any = {
        1: "新增功能",
        2: "产品优化",
        3: "缺陷修复",
        4: "政治项目",
        5: "配合升级"
      };
      return statusObj[val] || "";
    };
    watch(
      () => isShow.value,
      (newVal) => {
        if (!newVal) {
          getDemandStatusData();
        }
      }
    );
    watch(
      () => route.query,
      (newVal, oldVal) => {
        if (newVal?.productId !== oldVal?.productId) {
          curProductInfo.value = getSession("productInfo", true);
        }
      },
      {
        immediate: true,
        deep: true
      }
    );
    // 编辑
    const handleEdit = (id: number) => {
      router.push({
        name: "editDemandPool",
        query: { demand_id: id }
      });
    };
    // 查看详情
    const handleDetail = (row: any) => {
      router.push({
        name: "demandPoolDetail",
        query: { demand_id: row.id }
      });
    };

    const getTextColor = (status: number) => {
      const list = PLAN_STATUS.find((v: { value: number; label: string }) => v.value === status);
      return {
        color: list?.color
      };
    };
    // 新增需求
    const handleAddDemand = () => {
      router.push({ name: "editDemandPool" });
    };
    const all = useMixin(true);

    const jupmIteration = (id: number) => {
      all.searchParams.demand = id;
      router.push({ name: "homepage" });
    };

    onActivated(() => {
      if (route.query.name) {
        const name: string | any = route.query.name;
        searchParams.name = name || "";
      }
      setTimeout(() => {
        console.log(searchParams);
        handleConditionSearch();
      }, 300);
    });

    const { getData, tableData, stopAutoGetData } = useGetTableData(useFetchSearch, searchParams);
    // 条件搜索
    let timer: ReturnType<typeof setTimeout>;
    const handleConditionSearch = async (isHiddenSelect?: boolean) => {
      if (isHiddenSelect === true) {
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          await getData(pageTableRef.value.getCurrentPage(), true, searchParams);
        } catch (e) {
          console.log(e);
        }
        stopAutoGetData.value = false;

        getUserList({ product_id: searchParams.product_id as [] });
        getDemandStatusData();
      }, 300);
    };
    const handleLevel = (val: number[]) => {
      if (!val.length) handleConditionSearch();
    };
    const handleStatus = (val: number[]) => {
      if (!val.length) handleConditionSearch();
    };

    const handleName = (val: string) => {
      if (!val) {
        searchParams.name = "";
        handleConditionSearch();
      }
    };

    // 单列加载更多
    const handleLoadMore = (item: Record<string, any>) => {
      const status = item.status;
      let params = {
        status: item.status
      } as RequestParams.GetPlanListsTurnPage;
      params.page_index = item.page_index + 1;
      params.page_size = item.page_size;
      params = Object.assign({}, params, searchParams);
      params.status = item.status;
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
      const params = JSON.parse(JSON.stringify(searchParams));
      if (!params.type) delete params.type;
      if (!tableData.total) return tipMessage(400, "暂无数据，无法导出");
      setObjStringify(params, "/api/tomato/demand/export");
    };

    // 作废需求
    const handleDelete = (id: number) => {
      ElMessageBox.confirm("此操作将永久作废，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        deleteDemand<ResponseParams.ResponseDataSuccess>(id).then(() => {
          getData(pageTableRef.value.getCurrentPage(), true, searchParams);
        });
      });
    };
    // 选择创建人
    const handleCreator = (names: Array<string>) => {
      if (!names.length) {
        searchParams.create_by = [];
        searchParams.creator = [];
        handleConditionSearch();
        return;
      }
      searchParams.create_by = [];
      const list: Record<string, any> = userList.value[1];
      list.options.forEach((item: any) => {
        names.forEach((v) => {
          if (v === item.staff_name) {
            searchParams.create_by.push(item.staff_no);
          }
        });
      });
    };
    const moduleList: any = ref([]);
    useWatchChangeProduct(handleConditionSearch, (newValue) => {
      searchParams.product_id = newValue as [];
      handleConditionSearch();
      // 获取创建人下拉列表数据
      // getUserList({ product_id: newValue as [] });
      getModuleList<ResponseParams.ResponseDataSuccess>({ product_id: Number(newValue) }).then((res) => {
        if (res.data && res.data.length) {
          moduleList.value = res.data;
          moduleList.value.unshift({ id: 0, name: "主干" });
        } else {
          moduleList.value = [{ id: 0, name: "主干" }];
        }
      });
    });
    //#region 跳转关联计划
    const handleShowPlan = () => {
      router.push({
        name: "planManagement"
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
        if (type === 1 && row?.id && row?.status !== 997) return ElMessage.warning("非待审核状态无法申请审批");
        // 如果有id 说明是操作具体的一栏，没有id说明是批量操作，另外这里的filter 997 是过滤待审核的状态
        let ids;
        let names;
        if (row?.id || row?.approval_id) {
          ids = type === 1 ? row.id : row.approval_id;
          names = type === 1 ? row.name : row.approval_title;
        } else {
          const arr = selectedList.value?.filter((i) => i.status === 997);
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

    // TODO更改优先级
    const onChangePriority = (val: PRIORITYINTER, item: any) => {
      let params: any = {
        ids: [item.id],
        level: val.id
      };
      updatePriority<ResponseParams.ResponseDataSuccess>(params).then(() => {
        getData(pageTableRef.value.getCurrentPage(), true, searchParams);
      });
    };
    // 批量优先级
    const handlebatch = (val: any) => {
      let ids: number[] = [];
      selectedList.value?.forEach((item) => {
        if (item.status !== 999) ids.push(item.id);
      });
      let params = {
        ids: ids,
        level: val
      };
      if (!ids.length) return tipMessage(400, "请选择除已作废状态的需求进行批量修改优先级");
      updatePriority<ResponseParams.ResponseDataSuccess>(params).then(() => {
        getData(pageTableRef.value.getCurrentPage(), true, searchParams);
      });
    };
    // 批量审批
    const handlebatchApprove = () => {
      console.log(2);
    };
    // 批量作废
    const handlebatchCancel = () => {
      // demand_status = 3审核中的   和已经作废的过滤掉
      let ids: number[] = [];
      selectedList.value?.forEach((item) => {
        if (item.status !== 999) {
          if (item.demand_status !== 3) {
            ids.push(item.id);
          }
        }
      });
      ElMessageBox.confirm("此操作将永久作废，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        updateTrash<ResponseParams.ResponseDataSuccess>({ ids: ids }).then(() => {
          getData(pageTableRef.value.getCurrentPage(), true, searchParams);
        });
      });
    };
    // 排序
    const sortChange = (e: any) => {
      const { prop, order } = e;
      if (!order) return;
      searchParams.sort_name = prop;
      searchParams.sort_by = order === "ascending" ? 1 : 2;
      getData(pageTableRef.value.getCurrentPage(), undefined, searchParams);
    };
    return {
      sortChange,
      onChangePriority,
      selectedList,
      ...toRefs(tableData),
      handleUpdateAssign,
      searchParams,
      getData,
      PLAN_STATUS,
      PRIORITY,
      pageTableRef,
      handleConditionSearch,
      handleDelete,
      getTextColor,
      handleEdit,
      handleDetail,
      handleAddDemand,
      handleSelectionChange,
      userList,
      handleCreator,
      handleLevel,
      handleStatus,
      handleName,
      isShow,
      handleShowPlan,
      demandData,
      handleLoadMore,
      moduleList,
      jupmIteration,
      handlebatch,
      handlebatchApprove,
      handlebatchCancel,
      handleType,
      requireTypes,
      handleDisable,
      curProductInfo,
      exportTaskDate
    };
  }
});
</script>

<style scoped lang="less">
.demand-form {
  :deep(.el-form-item) {
    display: flex;
  }
  :deep(.el-form-item__content) {
    flex-grow: 1;
  }
  :deep(.el-select) {
    width: 100%;
  }
}
:deep(.elect-pool) {
  width: 150px;
}
:deep(.elect-pool-level) {
  width: 120px;
  .el-input {
    width: 120px !important;
  }
}
.f-r {
  float: right;
  margin-bottom: 10px;
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
:deep(.rp-select) {
  .el-input {
    width: 144px;
  }
  .el-select__tags {
    width: 90%;
    max-width: 130px !important;
  }
  .el-select__tags-text {
    max-width: 50px !important;
  }
}
.rp-demand-list {
  position: absolute;
  top: 72px;
  left: 20px;
  background: #fff;
  right: 24px;
  bottom: 10px;
  z-index: 101;
  .demand-list-show {
    display: flex;
    height: 100%;
    .demand-list-cloumn {
      flex: 1;
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
    left: 30px;
    bottom: 10px;
  }

  &-priority {
    cursor: pointer;
  }
}
</style>
