<template>
  <div class="approval">
    <page-table :tableData="tableData.list" @handlePagationChange="getData(1)" :total="tableData.total" ref="pageTableRef" :stopAutoGetData="stopAutoGetData">
      <template #header>
        <el-form :inline="true" :model="formParams" @change="handleSearch">
          <back-btn name="demandPool" :query="{ productId: route.query.productId }" style="margin-right: 10px; float: left"></back-btn>
          <el-form-item label="名称">
            <el-input clearable v-model="formParams.title" @clear="handleSearch" placeholder="单据名称"></el-input>
          </el-form-item>
          <el-form-item class="rp-select" label="状态">
            <el-select v-model="formParams.status" placeholder="请选择" clearable @visible-change="handleConditionSearch" @change="handleClear">
              <el-option v-for="item in APPROVALSTATUSLIST" :key="item.id" :label="item.value" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="rp-select" label="提单人">
            <el-select v-model="formParams.staff_no" placeholder="请选择" clearable @visible-change="handleConditionSearch" @change="handleClear">
              <el-option v-for="item in userList" :key="item.staff_name" :label="item.staff_name" :value="item.staff_no"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="float: right">
            <el-button type="primary" @click="handleAddDemand">新 增</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template #main>
        <el-table-column prop="approval_no" label="单据编号" width="120"></el-table-column>
        <el-table-column prop="title" label="标题" show-overflow-tooltip width="340" align="left">
          <template #default="scope">
            <el-button class="table-link" type="text" @click="showDialog(scope.row)">{{ scope.row.title }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="create_name" label="提单人"></el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="scope">
            <span>{{ handleStatus(scope.row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="prev_approve_name" label="上个处理人"></el-table-column>
        <el-table-column prop="next_approve_name" label="待处理人"></el-table-column>
        <el-table-column prop="create_at" label="提交时间"></el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <div class="options-btn">
              <el-button type="text" @click="handleRow(scope.row, 'copy')">复制</el-button>
              <el-button type="text" class="delete" v-if="scope.row.status === 1" @click="handleRow(scope.row, 'delete')">删除</el-button>
              <el-button type="text" v-if="scope.row.status === 2" @click="handleRow(scope.row, 'notice')">提醒审批</el-button>
              <el-button type="text" class="delete" v-if="scope.row.status === 2" @click="handleRow(scope.row, 'withdraw')">撤回</el-button>
            </div>
          </template>
        </el-table-column>
      </template>
    </page-table>

    <Edit @updateList="getData(1)" v-model:isCopy="isCopy" v-model:visible="visible" :id="curId" />
  </div>
</template>

<script lang="ts">
// 审批单列表
export default {
  name: "approval"
};
</script>

<script lang="ts" setup>
import { computed, onMounted, provide, reactive, ref } from "vue";
import { APPROVALSTATUSLIST } from "@/utils/contantOptions";
import type { ApprovalItems } from "@/types/interface";
import { ElMessageBox } from "element-plus";
import { getApprovalUser, editWithdraw, removeApprove, remindApproval } from "@/api/request-modules/product";
import useApproval from "@/composables/useApproval";
import { useRoute, useRouter, onBeforeRouteUpdate, LocationQuery } from "vue-router";

import Edit from "./edit.vue";
import useMessageTip from "@/composables/useMessageTip";

interface ResponseDataSuccess {
  code: number;
  data: [] & Record<string, any>;
  message: string;
}
const route = useRoute();
const router = useRouter();
// #start 变量区
const tableData = reactive<{ list: ApprovalItems[]; total: number }>({
  list: [],
  total: 0
});

const visible = ref(false);
const userList = ref([]);
// 当前操作item
const curItem = ref<ApprovalItems | null>(null);

const stopAutoGetData = ref<boolean>(false);

// 是否为copy功能
const isCopy = ref(false);

// form 表单
const formParams: Record<string, any> = reactive({
  staff_no: [],
  title: "",
  status: [],
  page_index: 1,
  page_size: 20,
  product_id: route.query.productId as string
});
// table ref
const pageTableRef = ref<any>();
// 同时创建多个id
const autoIds = ref("");
// 同时创建多个names
const autoNames = ref("");
let timer: ReturnType<typeof setTimeout>;

// #end

const { tipMessage } = useMessageTip();
const { useGetList } = useApproval();

// 当前item id
const curId = computed(() => {
  return curItem.value ? curItem.value.id : -(Math.random() * 1000);
});

// 同时创建多条数据ids
provide("autoIds", autoIds);
// 同时创建多条数据Names
provide("autoNames", autoNames);

// 路由更新
onBeforeRouteUpdate((to) => {
  const { fromNotices } = to.query as Record<string, any>;
  // 从消息通过过来的，需要手动调用处理路由事件
  if (fromNotices === "true") {
    handleRouteUpdate(to.query);
  }
});

//#start 函数区域
onMounted(async () => {
  await getData();
  await getUser();
  // 处理路由变化
  handleRouteUpdate();
});

// 处理路由update
const handleRouteUpdate = (query?: LocationQuery) => {
  const { auto, productId, ids, fromNotices, names } = query || (route.query as Record<string, any>);
  if (auto === "1" && ids) {
    visible.value = true;
    // 从消息通知进入的
    if (fromNotices === "true") {
      // 随便哪一个数据，然后更换id，要不然类型报错
      curItem.value = tableData.list[0];
      curItem.value.id = parseInt(ids);
    } else {
      autoIds.value = ids;
      autoNames.value = names;
    }
    router.replace({ name: "approval", query: { productId } });
  }
};

// 显示dialog
const showDialog = (item: ApprovalItems) => {
  isCopy.value = false;
  visible.value = true;
  curItem.value = item;
};

// 分页以及获取数据
const getData = async (page?: number) => {
  // page存在则是点击了分页事件
  if (page) {
    await getUser();
    formParams.page_index = pageTableRef.value.getCurrentPage().pageIndex;
  } else {
    formParams.page_index = 1;
  }
  const res: any = await useGetList(formParams);
  if (res.code == 200) {
    tableData.list = res.data.list;
    tableData.total = res.data.count;
  } else {
    tableData.list = [];
    tableData.total = 0;
  }
};

const getUser = async () => {
  await getApprovalUser().then((res: any) => {
    if (res && res.data && res.data.length) {
      userList.value = res.data;
    } else {
      userList.value = [];
    }
  });
};

const handleStatus = (val: number) => {
  const statusObj: Record<number, string> = {
    1: "已保存",
    2: "审批中",
    3: "已通过",
    4: "已终止"
  };
  return statusObj[val] || "";
};

// 表单搜索
const handleSearch = () => {
  getData();
};
// 状态搜索
const handleConditionSearch = async () => {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    await getData();
    stopAutoGetData.value = false;
  }, 300);
};

const handleClear = (val: string) => {
  if (!val) getData();
};

const handleRow = (row: ApprovalItems, type: string) => {
  isCopy.value = false;
  // 撤回
  if (type === "withdraw") withdraw(row.id);
  // 删除
  else if (type === "delete") deleteApprove(row.id);
  // 提醒
  else if (type === "notice") notice(row.id);
  else {
    curItem.value = row;
    isCopy.value = true;
    visible.value = true;
  }
};

// 撤回
const withdraw = (id: number) => {
  ElMessageBox.confirm("撤回后，单据将变为待保存状态，所有流程需重新审批，是否确认？", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    editWithdraw<ResponseDataSuccess>({ id }).then(async (res) => {
      if (res.code === 200) {
        tipMessage(200, "成功");

        getData();
      }
    });
  });
};
// 删除
const deleteApprove = (id: number) => {
  ElMessageBox.confirm("此操作将永久删除该审批单，是否继续？", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    removeApprove<ResponseDataSuccess>({ id }).then(async (res) => {
      if (res.code === 200) {
        getData();
      }
    });
  });
};
// 提醒
const notice = (id: number) => {
  remindApproval<ResponseDataSuccess>({ id }).then(async (res) => {
    if (res.code === 200) {
      tipMessage(200, "成功");
    }
  });
};

// 新增审批单
const handleAddDemand = () => {
  curItem.value = null;
  autoIds.value = "";
  visible.value = true;
};
// #end
</script>

<style scoped lang="less">
.progress-padding {
  padding-left: 10px;
}
.all-option {
  float: right;
  margin-right: 8px;
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
.rp-use-case-opation {
  z-index: 999;
  position: absolute;
  left: 80px;
  margin-top: -60px;
}

.options-btn {
  display: flex;
  margin-left: 20px;
}
</style>
💈
<style lang="less">
.approval {
  // 修复全局样式带来的设置element属性不生效
  .cell {
    text-align: inherit;
  }
}
</style>
