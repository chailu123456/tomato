<template>
  <div class="rp-demand-doc">
    <page-table
      :tableData="tableData.list"
      :showHeader="false"
      :currentPage="currentRt.currentPage"
      @handlePagationChange="changeTable"
      @handleRow="rowClick"
      :total="tableData.total"
      ref="pageTableRef"
      :hiddenPagation="props.planId"
      @tableMethods="tableMethods"
    >
      <template #header v-if="!props.planId">
        <div class="search-header">
          <el-input v-model.trim="serachVal.title" @keyup.enter="searchData" @clear="searchData" clearable placeholder="搜索标题" :prefix-icon="Search" />
          <el-dropdown trigger="click" @command="handleQuick">
            <el-button type="normal">
              {{ quickSearchVal }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="0">默认展示</el-dropdown-item>
                <el-dropdown-item :command="1">最近更新</el-dropdown-item>
                <el-dropdown-item :command="2">我上传的</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-button @click="addDoc" type="primary">新增文档</el-button>
        </div>
      </template>
      <template #main>
        <el-table-column type="expand" width="1">
          <template #default="scope">
            <div class="doc-children">
              <div class="doc-children-list" v-for="item in scope.row.children" :key="item.id">
                <div class="doc-content-left" @click="handleShowLog(item)">
                  <i :class="backClass(item.type)"></i>
                  <div class="content-left-title">
                    <span :ref="(el) => setChildRef(el, item.id)" class="doc-name" @click.stop="handleTitle(item)">
                      {{ item.title }}
                    </span>
                    <br />
                    <span class="doc-msg">{{ item.staff_name }} {{ item.update_time != item.create_time ? "更新于" : "创建于" }} {{ item.update_time }}</span>
                  </div>
                </div>
                <div class="doc-content-right">
                  <span v-if="item.type === 3" class="operate-btn" @click.stop="handleAdd(item)">
                    <el-tooltip content="新增">
                      <el-icon><Plus /></el-icon>
                    </el-tooltip>
                  </span>
                  <span v-else class="operate-btn" @click.stop="handleShare(item)">
                    <el-tooltip :show-after="1000" content="分享">
                      <el-icon><Share /></el-icon>
                    </el-tooltip>
                  </span>
                  <span class="operate-btn" v-if="item.type != 5" @click.stop="handleDownload(item)">
                    <el-tooltip :show-after="1000" content="下载">
                      <el-icon><Download /></el-icon>
                    </el-tooltip>
                  </span>

                  <span class="operate-btn" @click.stop="handleMore(item)">
                    <el-popover placement="bottom" popper-class="more-btn-list" :width="80">
                      <template #reference>
                        <el-icon><MoreFilled /></el-icon>
                      </template>
                      <div class="operate-more">
                        <span @click="handleEdit(item)">编辑</span>
                        <span v-if="item.type !== 3" @click="handleShowLog(item, 1)">更多信息</span>
                        <span @click="handleDelete(item)">删除</span>
                      </div>
                    </el-popover>
                  </span>
                </div>
                <div class="doc-dynamic" v-if="showLog && curLogId === item.id">
                  <docLog :activities="activities" :len="tempActiveList.length" @lookMore="handleMoreLog" :showMore="showMore"></docLog>
                </div>
              </div>
              <div class="doc-dynamic" v-if="showLog && curLogId === scope.row.id">
                <docLog :activities="activities" :len="tempActiveList.length" @lookMore="handleMoreLog" :showMore="showMore"></docLog>
              </div>
              <div style="text-align: center; color: #4cb29d; width: 100%" v-if="scope.row.type === 3 && !scope.row.children">暂无数据</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="" prop="title" class-name="table-column-left table-title">
          <template #default="scope">
            <div class="doc-list">
              <div class="doc-content-left">
                <i :class="backClass(scope.row.type)"></i>
                <div class="content-left-title">
                  <span class="doc-name" :ref="(el) => setChildRef(el, scope.row.id)" @click="handleTitle(scope.row)" v-if="scope.row.type === 3">{{
                    scope.row.title
                  }}</span>

                  <span class="doc-name" v-else :ref="(el) => setChildRef(el, scope.row.id)" @click.stop="handleTitle(scope.row)">{{ scope.row.title }}</span>
                  <span style="display: block" class="doc-msg"
                    >{{ scope.row.staff_name }} {{ scope.row.update_time != scope.row.create_time ? "更新于" : "创建于" }} {{ scope.row.update_time }}</span
                  >
                </div>
                <div class="doc-num" v-if="scope.row.type === 3">
                  <span>
                    <i class="iconfont icon-html"></i>
                    {{ scope.row.html_doc_num }}
                  </span>
                  <span>
                    <i class="iconfont icon-rp"></i>
                    {{ scope.row.rp_doc_num }}
                  </span>
                  <span>
                    <i class="iconfont icon-link"></i>
                    {{ scope.row.link_doc_num }}
                  </span>
                  <span>
                    <i class="iconfont icon-unknow"></i>
                    {{ scope.row.unknow_doc_num }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="" prop="title" width="140" class-name="table-column-left table-title">
          <template #default="scope">
            <div class="doc-list">
              <div class="doc-content-right">
                <span v-if="scope.row.type === 3" class="operate-btn" @click.stop="handleAdd(scope.row)">
                  <el-tooltip :show-after="1000" content="新增">
                    <el-icon><Plus /></el-icon>
                  </el-tooltip>
                </span>
                <span v-else class="operate-btn" @click.stop="handleShare(scope.row)">
                  <el-tooltip :show-after="1000" content="分享">
                    <el-icon><Share /></el-icon>
                  </el-tooltip>
                </span>
                <span class="operate-btn" v-if="scope.row.type != 5" @click.stop="handleDownload(scope.row)">
                  <el-tooltip :show-after="1000" content="下载">
                    <el-icon><Download /></el-icon>
                  </el-tooltip>
                </span>

                <span class="operate-btn" @click.stop="handleMore(scope.row)">
                  <el-popover placement="bottom" popper-class="more-btn-list" :width="80">
                    <template #reference>
                      <el-icon><MoreFilled /></el-icon>
                    </template>
                    <div class="operate-more">
                      <span @click="handleEdit(scope.row)">编辑</span>
                      <span v-if="scope.row.type !== 3" @click="handleMoreMsg(scope.row)">更多信息</span>
                      <span v-if="props.planId" @click="handleRemoveRelative(scope.row)">解除关联</span>
                      <span @click="handleDelete(scope.row)">删除</span>
                    </div>
                  </el-popover>
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
      </template>
    </page-table>
    <docDialog v-model:visible="showDialog" :demandDocForm="demandDocForm" @updateVal="updataData" :type="type"></docDialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, defineProps, defineExpose, computed, watch } from "vue";
import { Share, Download, Search, MoreFilled, Plus, ArrowDown } from "@element-plus/icons";
import docDialog from "./components/docDialog.vue";
import docLog from "./components/docLog.vue";
import useDemandDoc, { GetDocParams, DemandReqItemsList, DemandLog, LogList } from "@/composables/useDemandDoc";
import { getSession, downloadUrl } from "@/utils";
import { USER } from "@/store/state";
import { Pagation } from "@/composables/usePagation";
import useMessageTip from "@/composables/useMessageTip";
import batchDownload from "@/utils/downloadUrl";
import copyField from "@/utils/copyField";
import { ElMessageBox } from "element-plus";
import { store } from "@/store";

const props = defineProps({
  planId: {
    type: Number,
    default: 0
  }
});

const curLogId = ref(0);
const productId = computed(() => store?.getters?.productId);
const pageTableRef = ref();
const showDialog = ref(false);
const classIconArr = ["icon-rp", "icon-unknow", "icon-doc", "icon-html", "icon-link"];
const tableData = reactive({
  list: [],
  total: 0
});
const { tipMessage } = useMessageTip();
const quickSearchVal = ref("快速访问");
const user = getSession("user", true) as USER;

const activities = ref<DemandLog>({
  folder_name: "",
  iteration_names: "",
  plan_names: "",
  list: [],
  id: 0
});
const tempActiveList = ref<LogList[]>([]);

const serachVal = ref<GetDocParams>({
  product_id: productId.value,
  page_index: 1,
  page_size: props.planId ? 1000 : 20,
  recent_changes: 0,
  create_by: "",
  title: "",
  plan_id: props.planId,
  is_folder: 1
});

// 保存每一列数据
let childRefs: any = {};

const setChildRef = (el: any, index: number) => {
  if (el) {
    childRefs[index] = el;
  }
};

const demandDocForm = ref({});

// type: 0 全局的新增文档   1代表文档合集的新增
const type = ref(0);

const showMore = ref(false);

const showLog = ref(false);

const { getDocList, deleteDemandDoc, useGetDocLog, deletePlanDoc } = useDemandDoc();
let a: any = null;

// 此方法是将table原型链上的方法抛出，主要用到toggleRowExpansion方法对行的收起展开
const tableMethods = (e: any) => {
  a = e;
  console.log(a);
};
// 获取日志
const getDocLog = async (params: { id: number }) => {
  let data = await useGetDocLog(params);
  if (data) {
    // 临时缓存文件
    tempActiveList.value = data.list;
    activities.value = data;
    // 只显示前三条数据
    if (activities.value.list && activities.value.list.length) activities.value.list = data.list.slice(0, 3);
  }
};

let oldId = 0;
// 行点击
const rowClick = (row: any, e?: any) => {
  if (e) a = e;
  // showMore.value = false;

  a.toggleRowExpansion(row);
  if (row.type !== 3) {
    showMore.value = false;
    showLog.value = true;
    curLogId.value = row.id;
    getDocLog({ id: row.id });
    oldId = row.id;
  } else {
    if (pageTableRef.value.expands.includes(row.id)) {
      if (row.children && row.children.length) {
        let childData = row.children;
        const filterData = childData.filter((item: DemandReqItemsList) => item.id === oldId);
        if (filterData.length) {
          showLog.value = false;
        }
      }
    } else {
      if (row.children && row.children.length) {
        let childData = row.children;
        const filterData = childData.filter((item: DemandReqItemsList) => item.id === oldId);
        if (filterData.length) {
          showLog.value = false;
          showMore.value = true;
        }
      }
    }
  }
};
interface Obj {
  id: number;
  planId: number;
  planAdd?: number;
}
// 搜索栏新增文档按钮 isPlanAdd在计划详情模块，新增需求说明的新增中用于做判断
const addDoc = (isPlanAdd?: number) => {
  showDialog.value = true;
  type.value = 0;
  const obj: Obj = { id: 0, planId: props.planId };
  if (isPlanAdd) obj.planAdd = 1;
  demandDocForm.value = obj;
};

// 返回icon样式
const backClass = (type: number) => {
  return `iconfont ${classIconArr[type - 1]}`;
};

// 标题点击  类型  1.rp  2.未知  3.文件夹 4.html  5.ui
// is_unpacked  解压状态  0.未解压 1.解压成功 2.解压失败
const handleTitle = (val: DemandReqItemsList) => {
  childRefs[val.id + ""].style.color = "#8d8d8d";
  if (val.type === 2) {
    if (!val.url) return tipMessage(400, `文档合集下无文件类型文档，不可下载`);
    tipMessage(200, `下载中，请稍等...`);
    downloadUrl(val.url, val.file_name);
  }
  if (val.type !== 2 && val.type !== 3) {
    if (val.type === 5) return window.open(val.url, "_blank");
    if (val.type === 1 || val.type === 4) {
      return window.open(`/preview?id=${val.id}`, "_blank");
    }
  }
};

//下载
const handleDownload = (val: DemandReqItemsList) => {
  if (!val.url) return tipMessage(400, `文档合集下无文件类型文档，不可下载`);
  if (val.type === 1 || val.type === 2 || val.type === 4) {
    tipMessage(200, `下载中，请稍等...`);

    downloadUrl(val.url, val.file_name);
  } else {
    tipMessage(200, `下载中，请稍等...`);
    const urlArr = val.url.split(",");
    const arrChildName = val.file_name_str.split(",");
    batchDownload(urlArr, val.title, arrChildName);
  }
};
// 分享
const handleShare = (val: DemandReqItemsList) => {
  if (val.type === 2 || val.type === 5) {
    if (val.type === 2) copyField(val.url + `?attname=${val.file_name}`);
    else copyField(val.url);
  } else {
    if (val.type === 1 || val.type === 4) {
      copyField(window.location.origin + `/preview?id=${val.id}`);
    }
  }
};
// 文档集合新增（新增子文件）
const handleAdd = (val: DemandReqItemsList) => {
  showDialog.value = true;
  type.value = 1;
  demandDocForm.value = {
    parent_id: val.id
  };
};
// 更多
const handleMore = (val: DemandReqItemsList) => {
  console.log("more", val);
};

const handleEdit = (val: DemandReqItemsList) => {
  type.value = 0;
  showDialog.value = true;
  demandDocForm.value = Object.assign(val, { planId: props.planId });
};
// 删除
const handleDelete = (val: DemandReqItemsList) => {
  ElMessageBox.confirm(val.type !== 3 ? "将永久删除此文档，是否确认？" : "将永久删除此文件集合，及其包含的文档，是否确认", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    confirmButtonClass: "el-button--danger-box",
    type: "error"
  }).then(async () => {
    const data = await deleteDemandDoc({ id: val.id });
    if (data) {
      getData();
    }
  });
};
// 解除关联
const handleRemoveRelative = (val: DemandReqItemsList) => {
  ElMessageBox.confirm(val.type !== 3 ? "解除关联，是否确认？" : "解除关联，是否确认？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    confirmButtonClass: "el-button--danger-box",
    type: "error"
  }).then(async () => {
    const data = await deletePlanDoc({ doc_id: val.id, plan_id: props.planId });
    if (data) {
      getData();
    }
  });
};

const handleShowLog = (val: DemandReqItemsList, type?: number) => {
  pageTableRef.value.expands = pageTableRef.value.expands.filter((val: number) => val != oldId);

  if (type) {
    showLog.value = true;
    oldId = val.id;
    curLogId.value = val.id;
  } else {
    if (oldId === val.id) {
      showLog.value = !showLog.value;
    } else {
      showLog.value = true;
      oldId = val.id;
      curLogId.value = val.id;
    }
  }
  showMore.value = false;
  getDocLog({ id: val.id });
};

const handleMoreMsg = (val: DemandReqItemsList) => {
  if (pageTableRef.value.expands.includes(val.id)) {
    showLog.value = true;
    showMore.value = false;
  } else {
    a.toggleRowExpansion(val);
    showLog.value = true;
    showMore.value = false;
  }

  curLogId.value = val.id;

  getDocLog({ id: val.id });
};
// 查看更多
const handleMoreLog = () => {
  // 获取完成的文件列表
  activities.value.list = tempActiveList.value;
  showMore.value = true;
};
const currentRt = ref({
  currentPage: 1
});
const filterData = (val: DemandReqItemsList[]) => {
  let arr: number[] = [];
  if (val.length) {
    val.forEach((item: DemandReqItemsList) => {
      if (item.type === 3) {
        arr.push(item.id);
        if (!pageTableRef.value?.expands.includes(item.id)) {
          pageTableRef.value.expands.push(item.id);
        }
      }
    });
    // pageTableRef.value.expands = arr;
  }
};

// 获取列表数据  type新增、编辑后回调
const getData = async (pagationParams?: Pagation, type?: number) => {
  serachVal.value.product_id = productId.value;
  // 一定要在params 存在情況下去判斷
  if (!serachVal.value?.product_id) {
    return;
  }
  console.log(pagationParams);
  console.log(pagationParams?.pageIndex);
  currentRt.value.currentPage = (pagationParams && pagationParams.pageIndex) || 1;
  const params = Object.assign(serachVal.value, pagationParams);
  const data = await getDocList(params);
  if (data) {
    tableData.total = data.count;
    tableData.list = data.list;
    if (!type) {
      // 搜索判断是否展开文件夹内容 type=3
      if (params.is_folder && params.title) filterData(data.list);
      else {
        showMore.value = false;
        showLog.value = false;
        pageTableRef.value.expands = [];
      }
    }
  } else {
    tableData.total = 0;
    tableData.list = [];
  }
};
const handleQuick = (val: number) => {
  const arr = ["默认展示", "最近更新", "我上传的"];
  quickSearchVal.value = arr[val];
  if (!val) {
    serachVal.value.create_by = "";
    serachVal.value.is_folder = 1;
    serachVal.value.recent_changes = 0;
  } else if (val === 1) {
    serachVal.value.recent_changes = 1;
    serachVal.value.create_by = "";
    serachVal.value.is_folder = 0;
  } else {
    serachVal.value.create_by = user?.staff_no ? user.staff_no : "";
    serachVal.value.recent_changes = 0;
    serachVal.value.is_folder = 0;
  }
  childRefs = {};
  getData();
};
// 切换分页
const changeTable = (pagationParams?: Pagation) => {
  currentRt.value.currentPage = (pagationParams && pagationParams.pageIndex) || 1;
  getData(pagationParams);
};

// 新增，编辑回调
const updataData = (id?: number) => {
  getData(pageTableRef.value.getCurrentPage(), 1);
  if (id && showLog.value && id === curLogId.value) {
    getDocLog({ id });
    showMore.value = false;
  } else {
    if (curLogId.value && showLog.value) {
      showMore.value = false;
      getDocLog({ id: curLogId.value });
    }
  }
};
// 搜索框enter、清除事件
const searchData = () => {
  childRefs = {};
  pageTableRef.value.setCurrentPage();
  getData(pageTableRef.value.getCurrentPage());
};
watch(
  () => productId.value,
  () => {
    pageTableRef.value.setCurrentPage();
    currentRt.value.currentPage = 1;
    serachVal.value.recent_changes = 0;
    serachVal.value.product_id = productId.value;
    serachVal.value.title = "";
    serachVal.value.page_index = 1;
    serachVal.value.pageIndex = 1;
    getData();
  }
);

onMounted(() => {
  getData();
});

// 计划模块调用
defineExpose({ addDoc });
</script>

<style lang="less" scoped>
.rp-demand-doc {
  :deep(.main) {
    overflow: hidden;
  }
  .search-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
    .el-input {
      width: 30%;
    }
    .el-dropdown {
      margin: 0 10px;
    }
  }
  .doc-list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    .doc-content-left {
      width: calc(100% - 140px);
      display: flex;
      align-items: center;
      .content-left-title {
        margin: 0 8px;
        .doc-name {
          margin: 6px 0 2px 0;
          color: #333;
          font-size: 14px;
          font-weight: 600;
          &:hover {
            cursor: pointer;
            text-decoration: underline;
          }
        }
      }
      .doc-num {
        margin-left: 10px;
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        opacity: 0.7;
        span {
          display: flex;
          margin: 0 8px;
          font-size: 14px;
          .iconfont {
            font-size: 16px;
            margin-right: 6px;
          }
        }
      }
    }
  }
  .doc-children {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin-left: 50px;
    // max-height: 500px;
    // overflow-y: scroll;
    :deep(.doc-dynamic) {
      width: 100%;
      background: #f4f4f4;
      padding-left: 20px;
      .dynamic-msg {
        display: flex;
        align-items: center;
        line-height: 26px;
        font-size: 14px;
        margin: 10px 0;
        div {
          display: flex;
          align-items: center;
          margin-right: 10px;
          overflow: hidden; //超出的文本隐藏
          text-overflow: ellipsis; //溢出用省略号显示
          white-space: nowrap; //溢出不换行
        }
        span.log-title {
          overflow: hidden; //超出的文本隐藏
          text-overflow: ellipsis; //溢出用省略号显示
          white-space: nowrap; //溢出不换行
        }
        div:first-child {
          min-width: 220px;
          max-width: 300px;
          span {
            width: 100%;
          }
        }
        div:nth-child(2) {
          min-width: 220px;
          max-width: calc(100% - 600px);
          span {
            max-width: 100%;
          }
        }
        div:last-child {
          width: 280px;
          span {
            width: 100%;
            margin-left: 10px;
          }
        }
      }
      .dynamic-list {
        position: relative;
        // max-height: 140px;
        max-height: 300px;
        overflow-x: scroll;
        display: flex;
        .dynamic-name {
          width: 40px;
        }
        .dynamic-log {
          width: calc(100% - 50px);
          margin-top: 4px;
          .el-timeline-item__content {
            // white-space: nowrap !important;
            word-break: break-all;
          }
        }
        .more-dynamic {
          color: #1890ff;
          position: absolute;
          right: 100px;
          top: 118px;
          i {
            display: inline-block;
            font-size: 12px;
            font-weight: 700;
            transform: rotate(90deg);
          }
          &:hover {
            cursor: pointer;
          }
        }
      }
    }
    .doc-children-list {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      width: 100%;
      border-bottom: 1px solid #ebeef5;
      .doc-content-left {
        width: calc(100% - 140px);
        display: flex;
        align-items: center;
        padding: 6px 0 12px 0;
        .content-left-title {
          margin: 0 8px;
          .doc-name {
            margin: 6px 0 2px 0;
            color: #333;
            font-size: 14px;
            font-weight: 600;
            &:hover {
              cursor: pointer;
              text-decoration: underline;
            }
          }
        }
      }
    }
  }
  .doc-content-right {
    width: 140px;
    display: flex;
    justify-content: flex-end;
    .operate-btn {
      display: inline-block;
      width: 40px;
      text-align: center;
      i {
        font-size: 20px;
        color: #1d9f85;
        &:hover {
          cursor: pointer;
        }
      }
    }
  }
  .doc-msg {
    color: #999;
  }
  :deep(.el-table__expand-icon) {
    opacity: 0;
  }
  :deep(.page) {
    height: 36px !important;
  }
  .iconfont {
    font-size: 40px;
  }
  .icon-doc {
    color: #f4eb34;
  }
  .icon-rar {
    color: #1d9f85;
  }
  .icon-rp {
    color: #713cbe;
  }
  .icon-unknow {
    color: #1d2b80;
  }
}
.more-btn-list {
  .operate-more {
    span {
      width: 100%;
      display: block;
      height: 26px;
      line-height: 26px;
      &:hover {
        cursor: pointer;
        background: #f5f7fa;
      }
    }
  }
}
</style>
