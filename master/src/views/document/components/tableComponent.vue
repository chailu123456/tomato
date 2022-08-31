<template>
  <div class="rp-tab">
    <page-table
      :tableData="list"
      :hiddenPagation="true"
      @handlePagationAdd="handlePagationAdd"
      @handlePagationChange="getData"
      ref="pageTableRef"
      :stopAutoGetData="stopAutoGetData"
      :highlight="true"
      :rowStyle="rowStyle"
    >
      <template #header>
        <!-- <Tab @handleTab="handleTab" @handleUpdateSearchVal="handleUpdateSearchVal" :editableTabs="editableTabs" :tabsValue="tabsValue" /> -->
        <el-input
          @change="handleUpdateSearchVal"
          @keyup.enter="handleUpdateSearchVal"
          clearable
          class="rp-tab-search"
          placeholder="搜索文章标题"
          v-model.trim="formParams.keyword"
        >
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
      </template>
      <template #main>
        <el-table-column prop="title" class-name="table-column-left" label="标题" min-width="300">
          <template #default="scoped">
            <div class="rp-table-opation">
              <div class="rp-title-left">
                <span @click="handleRow(scoped.row)" class="rp-title-name">{{ scoped.row.title }}</span>
                <template v-if="!rowStatus">
                  <el-tooltip class="item" v-if="scoped.row.permission" effect="light" :content="statusOpation[scoped.row.permission - 1]" placement="bottom">
                    <el-icon style="color: #ccc">
                      <User />
                    </el-icon>
                  </el-tooltip>
                  <el-tooltip v-if="scoped.row.is_top" class="item" effect="light" content="置顶" placement="bottom">
                    <i style="color: rgb(31, 159, 133)" class="iconfont icon-zhiding"></i>
                  </el-tooltip>
                  <el-tooltip v-if="scoped.row.is_collection === 1" class="item" effect="light" content="收藏" placement="bottom">
                    <el-icon style="color: #1f9f85; font-size: 16px">
                      <StarFilled />
                    </el-icon>
                  </el-tooltip>
                </template>
              </div>
              <div class="rp-icon-right" :style="{ display: currentlistId === scoped.row.id ? 'inline' : '' }" v-if="!rowStatus">
                <el-tooltip class="item" content="复制链接" effect="light" placement="bottom">
                  <el-icon @click.stop="handleCopyLink(scoped.row)" style="color: #1f9f85">
                    <Link />
                  </el-icon>
                </el-tooltip>
                <el-tooltip v-if="!scoped.row.is_collection" effect="light" class="item" content="收藏" placement="bottom">
                  <el-icon v-if="!scoped.row.is_collection || scoped.row.is_collection === 2" @click.stop="handleEditStar(scoped.row)">
                    <star />
                  </el-icon>
                  <el-icon v-if="scoped.row.is_collection === 1" @click.stop="handleEditStar(scoped.row)">
                    <StarFilled />
                  </el-icon>
                </el-tooltip>
                <el-popover placement="right" popper-class="opation-cao" :width="150" @hide="hidePopover" @show="showPopover(scoped.row)" trigger="click">
                  <template #reference>
                    <el-icon style="color: #1f9f85">
                      <MoreFilled />
                    </el-icon>
                  </template>
                  <ul class="rp-popover-list">
                    <li @click="handleNewWindow(scoped.row)">
                      <el-icon @click.stop="handleCopyLink(scoped.row)" style="color: #1f9f85">
                        <Position />
                      </el-icon>
                      <em>新窗口打开</em>
                    </li>
                    <li @click="handleCopyLink(scoped.row)">
                      <el-icon>
                        <Link />
                      </el-icon>
                      <em>复制链接</em>
                    </li>
                    <li @click="handleEditStar(scoped.row)">
                      <el-icon>
                        <Star />
                      </el-icon>
                      <em v-if="scoped.row.is_collection === 1">取消收藏</em>
                      <em v-else>收藏</em>
                    </li>
                    <li @click="handleTop(scoped.row)" v-if="scoped.row.opt_permissions?.can_stick_top">
                      <el-icon>
                        <Top />
                      </el-icon>
                      <em v-if="scoped.row.is_top">取消置顶</em>
                      <em v-else>置顶</em>
                    </li>
                    <li @click="handleEdit(scoped.row)" v-if="scoped.row.opt_permissions?.can_edit">
                      <el-icon>
                        <Edit />
                      </el-icon>
                      <em>编辑</em>
                    </li>
                    <li @click="handleDownload(scoped.row)">
                      <el-icon>
                        <Download />
                      </el-icon>
                      <em>下载</em>
                    </li>
                    <li @click="handleDelete(scoped.row)" v-if="scoped.row.opt_permissions?.can_delete">
                      <el-icon>
                        <Delete />
                      </el-icon>
                      <em>删除</em>
                    </li>
                  </ul>
                </el-popover>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column width="200" v-if="!rowStatus" prop="classify_name" :label="!oneClassifyName ? '分类' : '分类'"></el-table-column>
        <el-table-column prop="tag_list" class-name="rp-table-tag" width="250" v-if="!rowStatus" label="标签">
          <template #header>
            <div class="tag" @click="handleSelectTag">
              <span>标签</span>
              <el-icon style="font-size: 14px" :class="[!isRotate ? 'icon-arrow-t' : 'icon-arrow-b', 'el-icon-caret-bottom']">
                <caret-right />
              </el-icon>
              <!-- <i ></i> -->
            </div>
            <el-select
              v-if="isShowTag"
              v-model="tagSearchVal"
              clearable
              @change="handleTagSearchVal"
              filterable
              :multiple-limit="oneClassifyName ? 1 : 3"
              multiple
              placeholder="请选择标签"
            >
              <el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </template>
          <template #default="scoped">
            <div :style="{ textAlign: route.meta.englishName !== 'projectDoc' ? 'left' : 'center' }">
              <el-tag style="margin: 2px 0px 2px 4px" v-for="(item, index) in handleTag(scoped.row.tag_list)" :key="index">{{ item }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          width="100"
          prop="creator"
          v-if="currentTabName !== '我的草稿'"
          :label="currentTabName === '与我协作' ? '发起人' : '创建人'"
        ></el-table-column>
        <el-table-column prop="update_time" width="200" label="最近编辑">
          <template #default="scoped">
            {{ dateTime(scoped.row.update_time) }}
          </template>
        </el-table-column>
        <el-table-column width="100" label="操作" v-if="rowStatus">
          <template #default="scoped">
            <el-button link type="primary" @click.stop="handleEdit(scoped.row)">编辑</el-button>
            <el-button link class="delete" v-if="currentTabName === '我的草稿'" @click.stop="handleDelete(scoped.row)">删除</el-button>
          </template>
        </el-table-column>
      </template>
    </page-table>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, toRefs, reactive, watch } from "vue";
import { Pagation } from "@/composables/usePagation";
import { dateTime } from "@/utils/timeTransform";
import useWatchChangeProduct from "@/composables/useWatchChangeProduct";
import {
  useFetchSearchCenter,
  useFetchSearchCollaborat,
  useFetchSearchColllect,
  useFetchSearchDraft,
  useFetchSearchPublish
} from "../composables/useFetchSearch";
import useRequest from "@/composables/useRequest";
import useRenderTable from "@/composables/useRenderTable";
import { ResponseParams } from "@/types/response";
import { updateCollection, deleteDoc, topDoc, shortCode } from "@/api/request-modules/document";
import { ElMessageBox, ElMessage } from "element-plus";
import { useRoute } from "vue-router";
import copyField from "@/utils/copyField";
import { setSession, getSession } from "@/utils";
import { getTagList } from "@/api/request-modules/document";
import { CaretRight, User, Edit, Top, Download, Star, StarFilled, Link, MoreFilled, Delete, Position, Search } from "@element-plus/icons";

type Tag = {
  id: number;
  level: number;
  name: string;
  order: number;
  parent_id: number;
};
export default defineComponent({
  name: "docComponent",
  components: { CaretRight, User, Edit, Top, Download, Star, StarFilled, Link, MoreFilled, Delete, Position, Search },
  props: {
    oneClassifyName: {
      type: String,
      default: () => ""
    },
    defauldMenuId: {
      type: Object,
      default: () => ({
        name: "所有分类",
        id: 94
      })
    }
  },
  setup(props, context) {
    const pageTableRef = ref();

    const route = useRoute();
    // 表格 标签列表
    const options = ref<Tag[]>([]);
    // 表格数据
    const tableData = reactive({
      list: [],
      total: 0
    });

    const isRotate = ref(false);

    // 当前tab默认选中
    const tabsValue = ref("0");
    // 表格标签搜索选项
    const editableTabs: any = ref([]);

    const tagSearchVal = ref([]);
    // 搜索字段
    const formParams = reactive({
      classify_id: -1,
      keyword: "",
      tag_ids: [],
      space_tab_name: "与我协作"
    });
    // 滑动列表到底部判断是否有数据
    const hasDoc = ref(true);

    if (window.location.href.includes("guifan")) {
      formParams.keyword = "规范";
    }

    const pagationParams = reactive({
      pageIndex: 1,
      pageSize: 50
    });

    // 获取表格 标签列表
    const getTagData = () => {
      getTagList<ResponseParams.ResponseDataSuccess>().then((res) => {
        if (res.code === 200) {
          options.value = res.data;
          setSession("documentTagList", JSON.stringify(res.data));
        }
      });
    };
    getTagData();

    let timer: ReturnType<typeof setTimeout>;
    const stopAutoGetData = ref<boolean>(false);
    // 分页以及获取数据
    const getData = async (pagationParams?: Pagation, flag?: boolean, params?: any, type?: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        stopAutoGetData.value = flag == undefined ? false : true;
        if (route.name === "documentCenter") {
          const { response } = useRequest(useFetchSearchCenter, params || formParams);
          data(response, pagationParams, type);
        }
        if (route.name === "mySpace") {
          const spaceTab = [
            { id: 1, name: "与我协作", request: useFetchSearchCollaborat },
            { id: 2, name: "我的草稿", request: useFetchSearchDraft },
            { id: 3, name: "已分享", request: useFetchSearchPublish },
            { id: 4, name: "收藏", request: useFetchSearchColllect }
          ];

          spaceTab.forEach((item) => {
            if (item.name === formParams.space_tab_name) {
              const { response } = useRequest(item.request, params || formParams);
              data(response, pagationParams, type);
            }
          });
        }
      }, 700);
    };
    // 抽离getData方法获取数据
    const data = async (response: any, pagationParams: any, type?: string) => {
      const { pagation } = useRenderTable(response);
      let {
        data: { list, count }
      } = await pagation(pagationParams);
      if (type) {
        tableData.total = count;
        tableData.list = list;
      } else {
        tableData.total = count;
        tableData.list = tableData.list.concat(list);
      }

      context.emit("articalNum", count);
    };

    // 当前表格行的标题名称
    const currentType = ref("");
    // 当前表格行的id
    const currentlistId = ref(0);

    const rowStyle = ({ row }: any) => {
      if (currentType.value === row.title) {
        return {
          "background-color": "#e9f5f3"
        };
      }
      return { cursor: "pointer" };
    };

    // 更多显示  这里的作用是将三个icon是否展示
    const showPopover = (data: Record<string, any>) => {
      currentlistId.value = data.id;
      currentType.value = data.title;
    };
    // 更多隐藏
    const hidePopover = () => {
      currentlistId.value = 0;
      currentType.value = "";
    };

    const isShowTag = ref(false);
    const handleSelectTag = () => {
      isShowTag.value = !isShowTag.value;
      isRotate.value = !isRotate.value;
    };

    // 参数转码  type: 1新窗口打开 2当前窗口打开(包括编辑) 3复制
    const linkShortCode = (params: string, type?: number) => {
      shortCode<ResponseParams.ResponseDataSuccess>({ content: params }).then((res) => {
        if (res.code === 200) {
          if (type === 1) {
            window.open(window.location.origin + "/document/padIframe?" + res.data.code, "_blank");
          }
          if (type === 2) {
            window.open(window.location.origin + "/document/padIframe?" + res.data.code, "_self");
          }
          if (type === 3) {
            copyField(window.location.origin + "/document/padIframe?" + res.data.code);
          }
        }
      });
    };

    // 新窗口打开
    const handleNewWindow = (val: Record<string, any>) => {
      const a = "docId=" + val.id + "&content_id=" + val.content_id + "&type=update";

      // const url = window.location.origin + "/document/padIframe?docId=" + val.id + "&content_id=" + val.content_id + "&type=update";
      // const url = window.location.origin + "/document/padIframe?docId=" + a;
      // window.open(url, "_blank");
      linkShortCode(a, 1);
    };
    // 复制链接
    const handleCopyLink = (val: Record<string, any>) => {
      const url = window.location.origin + "/document/padIframe?docId=" + val.id + "&content_id=" + val.content_id + "&type=update&is_link_share=1";
      console.log(url);
      const a = "docId=" + val.id + "&content_id=" + val.content_id + "&type=update&is_link_share=1";
      linkShortCode(a, 3);
    };
    // 取消星标/星标    2星标 1取消星标
    const handleEditStar = (val: Record<string, any>) => {
      updateCollection<ResponseParams.ResponseDataSuccess>({
        type: val.is_collection === 1 ? 2 : 1,
        wiki_id: val.id
      }).then((res) => {
        if (res.code === 200) {
          val.is_collection = val.is_collection === 1 ? 2 : 1;
          ElMessage.success({
            message: "成功",
            type: "success"
          });
          if (route.name === "mySpace") {
            const currentTab = getSession("mySpacekey", true) as any;
            if (currentTab && currentTab.id === 4) {
              tableData.list = tableData.list.filter((item: Record<string, any>) => item.id !== val.id);
            }
          } else {
            handleTab(defaultSearch);
          }
        }
      });
    };

    // 取消置顶/置顶
    const handleTop = (val: Record<string, any>) => {
      topDoc<ResponseParams.ResponseDataSuccess>({ id: val.id, type: val.is_top ? 0 : 1 }).then((res) => {
        if (res.code === 200) {
          tableData.list = [];
          tableData.total = 0;
          getData();
        }
      });
    };
    // 编辑
    const handleEdit = (val: Record<string, any>) => {
      const a = "docId=" + val.id + "&content_id=" + val.content_id + "&type=update";
      linkShortCode(a, 2);
    };
    // 下载
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleDownload = (val: Record<string, any>) => {
      return ElMessage.warning("列表页目前不提供下载，请前往详情页进行下载～～");
    };
    // 删除
    const handleDelete = (val: Record<string, any>) => {
      ElMessageBox.confirm("此操作将永久删除，是否继续？", "提示", {
        confirmButtonText: "确定",
        confirmButtonClass: "el-button--danger-box",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        deleteDoc<ResponseParams.ResponseDataSuccess>({ id: val.id }).then((res) => {
          if (res.code === 200) {
            tableData.list = [];
            tableData.total = 0;
            // 更新tree列表的数量
            context.emit("treeList");
            getData();
          }
        });
      });
    };

    // 表格行点击
    const handleRow = (val: Record<string, any>) => {
      const routeName: any = route.name;
      const a = "docId=" + val.id + "&content_id=" + val.content_id + "&type=update" + "&origin=" + routeName;
      linkShortCode(a, 2);
    };

    const defaultSearch = {
      id: 0,
      name: ""
    };

    // 收藏状态
    const starStatus = ref(false);

    // 权限提示
    const statusOpation = ref(["所有人可编辑", "所有人可查看", "部分人可编辑", "部分人可查看"]);

    // tag标签
    const handleTag = (tagList: any) => {
      let tagVal: string[] = [];
      if (tagList && tagList.length) {
        tagList.forEach((item: Record<string, any>) => {
          tagVal.push(item.name);
        });
      }
      return tagVal;
    };

    // 判断是否展示部分列表(对我的空间-草稿和与我协作进行判断)
    const rowStatus = ref(false);

    const currentTabName = ref("");
    // tab更新 请求该tab下数据
    const handleTab = (params: Record<string, any>) => {
      // console.log(params, "-----------");
      hasDoc.value = true;
      let selectWrap: any = document.querySelector(".el-table__body-wrapper");
      selectWrap.scrollTop = 0;
      if (route.name === "mySpace") {
        setSession("mySpacekey", JSON.stringify(params));
      } else {
        setSession("currentDocTab", JSON.stringify(params));
      }
      tableData.list = [];
      tableData.total = 0;
      formParams.classify_id = params.id * 1;
      currentTabName.value = params.name;
      formParams.space_tab_name = params.name;

      if (params.name === "我的草稿" || params.name === "与我协作") {
        rowStatus.value = true;
      } else {
        rowStatus.value = false;
      }
      tabsValue.value = params.id;
      tagSearchVal.value = [];
      formParams.tag_ids = [];
      isShowTag.value = false;

      pagationParams.pageIndex = 1;
      getData(pagationParams, undefined, "", "clear");
    };

    watch(
      () => props.defauldMenuId,
      (newVal) => {
        // console.log("watch", newVal);
        defaultSearch.id = newVal.id;
        defaultSearch.name = newVal.name;
        if (newVal.id != formParams.classify_id) {
          handleTab(newVal);
        }
      },
      {
        deep: true
      }
    );

    const handleTagSearchVal = () => {
      if (!tagSearchVal.value.length) {
        isShowTag.value = false;
      }
      formParams.tag_ids = tagSearchVal.value;
      tableData.list = [];
      tableData.total = 0;
      getData();
    };

    // 获取子组件搜索框值
    const handleUpdateSearchVal = () => {
      // formParams.keyword = val;
      tableData.list = [];
      tableData.total = 0;
      getData();
    };

    let timerRoute: ReturnType<typeof setTimeout>;
    // 监听路由切换
    useWatchChangeProduct(getData, () => {
      clearTimeout(timerRoute);
      timerRoute = setTimeout(async () => {
        tableData.list = [];
        tableData.total = 0;
        // 默认
        if (route.meta.englishName === "spaceMe") {
          // 从文档详情跳出来，跳到原指定tab下
          if (route.query.type === "docBack") {
            const currentTab = getSession("currentDocTab", true) as any;
            if (currentTab && currentTab.id >= 0) {
              tabsValue.value = currentTab.id;
              handleTab(currentTab);
            } else {
              handleTab({ id: "2", name: "我的草稿" });
            }
          } else {
            handleTab({ id: "2", name: "我的草稿" });
          }
        } else {
          pagationParams.pageIndex = 1;
          // 从文档详情跳出来，跳到原指定tab下
          if (route.query.type === "docBack") {
            const currentTab = getSession("currentDocTab", true) as any;
            if (currentTab && currentTab.id >= 0) {
              tabsValue.value = currentTab.id;
              handleTab(currentTab);
            } else if (route.meta.englishName === "projectDoc") {
              const projectTab = getSession("document", true) as any;
              tabsValue.value = projectTab[0].id;
              handleTab(projectTab[0]);
            } else if (route.meta.englishName === "knowledge") {
              const knowledgeTab = getSession("knowledge", true) as any;
              tabsValue.value = knowledgeTab[0].id;

              handleTab(knowledgeTab[0]);
            }
          } else {
            if (route.meta.englishName === "projectDoc") {
              editableTabs.value = getSession("document", true) as any;
            }
            handleTab(defaultSearch);
            // getData(pagationParams);
          }
        }
      }, 500);
    });

    // 滚动加载分页
    const handlePagationAdd = (val?: number) => {
      const maxPage = Math.ceil(tableData.total / 50);
      // 滚动条滑倒底部才会执行
      if (val) {
        pagationParams.pageIndex = pagationParams.pageIndex += 1;
        if (pagationParams.pageIndex > maxPage) {
          if (hasDoc.value) {
            ElMessage.warning("没有更多文档啦~");
            hasDoc.value = false;
          }
          return;
        }
        getData(pagationParams);
      }
    };

    return {
      editableTabs,
      tabsValue,
      handleTab,
      ...toRefs(tableData),
      stopAutoGetData,
      handleUpdateSearchVal,
      getData,
      dateTime,
      handleTag,
      options,
      tagSearchVal,
      handleTagSearchVal,
      statusOpation,
      handleNewWindow,
      handleEditStar,
      handleCopyLink,
      handleTop,
      handleEdit,
      handleDelete,
      handleDownload,
      starStatus,
      ...toRefs(props),
      rowStatus,
      handlePagationAdd,
      handleSelectTag,
      isShowTag,
      currentTabName,
      handleRow,
      route,
      formParams,
      isRotate,
      showPopover,
      pageTableRef,
      rowStyle,
      currentType,
      currentlistId,
      hidePopover
    };
  }
});
</script>
<style scoped lang="less">
.rp-tab {
  height: calc(100% - 60px);
  border-top: 1px solid #ccc;
  // padding: 0px 10px;
  .container {
    padding: 10px 0 0 0;
  }
  .rp-tab-search {
    position: absolute;
    top: 64px;
    width: 340px;
    right: 39px;
  }
}
.rp-table-opation {
  display: flex;
  justify-content: space-between;
  position: relative;
  .rp-title-left {
    display: flex;
    align-items: center;
    width: 75%;
    i {
      margin: 0 6px;
      font-size: 14px;
    }
    .rp-title-name {
      font-size: 14px;
      &:hover {
        cursor: pointer;
        text-decoration: underline;
      }
    }
  }
  .rp-icon-right {
    display: none;
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    i {
      margin: 0 6px;
      font-size: 14px;
      &:hover {
        cursor: pointer;
        color: #57d3ba;
      }
    }
  }
}
.el-table__body tr:hover {
  cursor: pointer;
  .rp-icon-right {
    display: inline;
  }
}
.rp-popover-list {
  display: flex;
  flex-wrap: wrap;
  li {
    width: 100%;
    height: 34px;
    line-height: 34px;
    &:hover {
      cursor: pointer;
      color: #57d3ba;
    }
    i {
      margin: 0 10px;
    }
    em {
      font-style: normal;
    }
  }
}
.rp-table-tag {
  .tag {
    position: relative;
    &:hover {
      cursor: pointer;
    }
    .icon-arrow-t {
      position: absolute;
      margin-top: 4px;
      transform: rotate(0deg);
    }
    .icon-arrow-b {
      transform: rotate(90deg);
    }
  }
}
</style>
