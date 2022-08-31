<!-- <template>
  <div class="rp-tab">
    <page-table :tableData="list" :hiddenPagation="true" @handlePagationAdd="handlePagationAdd" @handlePagationChange="getData" ref="pageTableRef" :stopAutoGetData="stopAutoGetData">
      <template #header>
        <Tab @handleTab="handleTab" @handleUpdateSearchVal="handleUpdateSearchVal" :editableTabs="editableTabs" :tabsValue="tabsValue" />
      </template>
      <template #main>
        <el-table-column prop="title" class-name="table-column-left" label="标题">
          <template #default="scoped">
            <div class="rp-table-opation">
              <div class="rp-title-left">
                <span @click="handleRow(scoped.row)" class="rp-title-name">{{ scoped.row.title }}</span>
                <template v-if="!rowStatus">
                  <el-tooltip class="item" v-if="scoped.row.permission" effect="light" :content="statusOpation[scoped.row.permission - 1]" placement="bottom">
                    <i style="color: #ccc" class="el-icon-user"></i>
                  </el-tooltip>
                  <el-tooltip v-if="scoped.row.is_top" class="item" effect="light" content="置顶" placement="bottom">
                    <i style="color: rgb(31, 159, 133)" class="iconfont icon-zhiding"></i>
                  </el-tooltip>
                  <el-tooltip v-if="scoped.row.is_collection === 1" class="item" effect="light" content="收藏" placement="bottom">
                    <i style="color: #1f9f85; font-size: 16px" class="el-icon-star-on"></i>
                  </el-tooltip>
                </template>
              </div>
              <div class="rp-icon-right" v-if="!rowStatus">
                <el-tooltip class="item" content="复制链接" effect="light" placement="bottom">
                  <i @click.stop="handleCopyLink(scoped.row)" class="el-icon-link"></i>
                </el-tooltip>
                <el-tooltip v-if="!scoped.row.is_collection" effect="light" class="item" content="收藏" placement="bottom">
                  <i @click.stop="handleEditStar(scoped.row)" :class="{ 'el-icon-star-off': !scoped.row.is_collection || scoped.row.is_collection === 2, 'el-icon-star-on': starStatus }"></i>
                </el-tooltip>
                <el-popover placement="right" :width="150" trigger="hover">
                  <template #reference>
                    <i class="el-icon-more"></i>
                  </template>
                  <ul class="rp-popover-list">
                    <li @click="handleNewWindow(scoped.row)">
                      <i class="el-icon-position"></i>
                      <em>新窗口打开</em>
                    </li>
                    <li @click="handleCopyLink(scoped.row)">
                      <i class="el-icon-link"></i>
                      <em>复制链接</em>
                    </li>
                    <li @click="handleEditStar(scoped.row)">
                      <i class="el-icon-star-off"></i>
                      <em v-if="scoped.row.is_collection === 1">取消收藏</em>
                      <em v-else>收藏</em>
                    </li>
                    <li @click="handleTop(scoped.row)" v-if="scoped.row.opt_permissions?.can_stick_top">
                      <i class="el-icon-top"></i>
                      <em v-if="scoped.row.is_top">取消置顶</em>
                      <em v-else>置顶</em>
                    </li>
                    <li @click="handleEdit(scoped.row)" v-if="scoped.row.opt_permissions?.can_edit">
                      <i class="el-icon-edit"></i>
                      <em>编辑</em>
                    </li>
                    <li @click="handleDownload(scoped.row)">
                      <i class="el-icon-download"></i>
                      <em>下载</em>
                    </li>
                    <li @click="handleDelete(scoped.row)" v-if="scoped.row.opt_permissions?.can_delete">
                      <i class="el-icon-delete"></i>
                      <em>删除</em>
                    </li>
                  </ul>
                </el-popover>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column width="150" v-if="!rowStatus" prop="classify_name" :label="!oneClassifyName ? '类型 / 项目' : '所属项目'"></el-table-column>
        <el-table-column prop="tag_list" class-name="rp-table-tag" width="250" v-if="!rowStatus" label="标签">
          <template #header>
            <div class="tag" @click="handleSelectTag">
              <span>标签</span>
              <i style="font-size: 16px" class="el-icon-caret-bottom"></i>
            </div>
            <el-select v-if="isShowTag" v-model="tagSearchVal" clearable @change="handleTagSearchVal" filterable :multiple-limit="oneClassifyName ? 1 : 3" multiple placeholder="请选择标签">
              <el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </template>
          <template #default="scoped">
            <div :style="{ textAlign: route.meta.englishName !== 'projectDoc' ? 'left' : 'center' }">
              <el-tag style="margin: 2px 0px 2px 4px" v-for="(item, index) in handleTag(scoped.row.tag_list)" :key="index">{{ item }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column width="150" prop="creator" v-if="currentTabName !== '草稿'" :label="currentTabName === '与我协作' ? '发起人' : '创建人'"></el-table-column>
        <el-table-column prop="update_time" width="250" label="最近编辑">
          <template #default="scoped">
            {{ dateTime(scoped.row.update_time) }}
          </template>
        </el-table-column>
        <el-table-column width="100" label="操作" v-if="rowStatus">
          <template #default="scoped">
            <el-button type="text" @click.stop="handleEdit(scoped.row)">编辑</el-button>
            <el-button type="text" class="delete" v-if="currentTabName === '草稿'" @click.stop="handleDelete(scoped.row)">删除</el-button>
          </template>
        </el-table-column>
      </template>
    </page-table>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, toRefs, reactive } from "vue";
import { Pagation } from "@/composables/usePagation";
import { dateTime } from "@/utils/timeTransform";
import useWatchChangeProduct from "@/composables/useWatchChangeProduct";
import { useFetchSearch, useFetchSearchProduct, useFetchSearchCollaborat, useFetchSearchColllect, useFetchSearchDraft, useFetchSearchPublish } from "../composables/useFetchSearch";
import useRequest from "@/composables/useRequest";
import useRenderTable from "@/composables/useRenderTable";
import { ResponseParams } from "@/types/response";
import { updateCollection, deleteDoc, topDoc, getClassify, getShareList } from "@/api/request-modules/document";
import { ElMessageBox, ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import copyField from "@/utils/copyField";
import { getTagList } from "@/api/request-modules/document";
import { setSession, getSession } from "@/utils";
export default defineComponent({
  name: "docComponent",
  props: {
    oneClassifyName: {
      type: String,
      default: () => ""
    }
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    // 表格 标签列表
    const options = ref([]);
    // 表格数据
    const tableData = reactive({
      list: [],
      total: 1
    });

    // 当前tab默认选中
    const tabsValue = ref("0");
    // 表格标签搜索选项
    const editableTabs: any = ref([]);

    const getTabList = () => {
      getClassify<ResponseParams.ResponseDataSuccess>({ root_id: 0 }).then((res) => {
        if (res.code === 200) {
          let knowledgeTag: any = res.data;
          knowledgeTag.unshift({
            id: "0",
            name: "全部"
          });
          setSession("knowledge", JSON.stringify(knowledgeTag));
        }
      });
      getClassify<ResponseParams.ResponseDataSuccess>({ root_id: 1 }).then((res) => {
        if (res.code === 200) {
          let documentTag: any = res.data;
          documentTag.unshift({
            id: "0",
            name: "全部"
          });
          setSession("document", JSON.stringify(documentTag));
        }
      });
      getShareList<ResponseParams.ResponseDataSuccess>().then((res) => {
        if (res.code === 200) {
          let documentShareTag: any = res.data;
          documentShareTag.unshift({
            id: "0",
            name: "全部"
          });
          setSession("documentShareTag", JSON.stringify(documentShareTag));
        }
      });
    };

    const tagSearchVal = ref([]);
    // 搜索字段
    const formParams = reactive({
      classify_id: 0,
      keyword: "",
      tag_ids: [],
      space_tab_name: "草稿"
    });
    formParams.keyword = window.location.href.includes("guifan") ? "规范" : "";

    // 获取表格标签数据
    const getClassifyTab = (root_id: number) => {
      if (route.meta.englishName === "spaceMe") {
        editableTabs.value = [
          {
            name: "草稿",
            id: "0"
          },
          {
            name: "已分享",
            id: "1"
          },
          {
            name: "收藏",
            id: "2"
          },
          {
            name: "与我协作",
            id: "3"
          }
        ];
        const knowledgeTagList = getSession("knowledgeTagList", true) as any;
        const documentTagList = getSession("documentTagList", true) as any;
        documentTagList.forEach((item: Record<string, any>) => {
          knowledgeTagList.push(item);
        });
        options.value = knowledgeTagList;

        return;
      }
      if (root_id == 0) {
        editableTabs.value = getSession("knowledge", true);
        options.value = getSession("knowledgeTagList", true) as any;
      } else {
        editableTabs.value = [];
        editableTabs.value = getSession("document", true) as any;
        options.value = getSession("documentTagList", true) as any;
      }
    };

    const pagationParams = reactive({
      pageIndex: 1,
      pageSize: 30
    });

    let timer: ReturnType<typeof setTimeout>;
    const stopAutoGetData = ref<boolean>(false);
    // 分页以及获取数据
    const getData = async (pagationParams?: Pagation, flag?: boolean, params?: any, type?: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        stopAutoGetData.value = flag == undefined ? false : true;
        if (route.name === "knowledgeBase") {
          const { response } = useRequest(useFetchSearch, params || formParams);
          data(response, pagationParams, type);
        }

        if (route.name === "projectDocument") {
          const { response } = useRequest(useFetchSearchProduct, params || formParams);
          data(response, pagationParams, type);
        }

        if (route.name === "mySpace") {
          const spaceTab = [
            { name: "草稿", request: useFetchSearchDraft },
            { name: "已分享", request: useFetchSearchPublish },
            { name: "收藏", request: useFetchSearchColllect },
            { name: "与我协作", request: useFetchSearchCollaborat }
          ];
          spaceTab.forEach((item) => {
            if (item.name === formParams.space_tab_name) {
              const { response } = useRequest(item.request, params || formParams);
              data(response, pagationParams, type);
            }
          });
        }
      }, 300);
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
    };

    const isShowTag = ref(false);
    const handleSelectTag = () => {
      isShowTag.value = !isShowTag.value;
    };

    // 新窗口打开
    const handleNewWindow = (val: Record<string, any>) => {
      const url = window.location.origin + "/#/document/padIframe?docId=" + val.id + "&content_id=" + val.content_id + "&type=update";
      window.open(url, "_blank");
    };
    // 复制链接
    const handleCopyLink = (val: Record<string, any>) => {
      copyField(window.location.origin + "/#/document/padIframe?docId=" + val.id + "&content_id=" + val.content_id + "&type=update&is_link_share=1");
    };
    // 取消星标/星标    2星标 1取消星标
    const handleEditStar = (val: Record<string, any>) => {
      updateCollection<ResponseParams.ResponseDataSuccess>({ type: val.is_collection === 1 ? 2 : 1, wiki_id: val.id }).then((res) => {
        if (res.code === 200) {
          val.is_collection = val.is_collection === 1 ? 2 : 1;
          ElMessage.success({
            message: "成功",
            type: "success"
          });
          const currentTab = getSession("currentDocTab", true) as any;
          if (currentTab && currentTab.name === "收藏") {
            tableData.list = tableData.list.filter((item: Record<string, any>) => item.id !== val.id);
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
      router.push({
        name: "padIframe",
        query: {
          docId: val.id,
          content_id: val.content_id,
          type: "update"
        }
      });
    };
    // 下载
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleDownload = (val: Record<string, any>) => {
      return ElMessage.warning("列表页目前不提供下载，请前往详情页进行下载～～");
      // console.log(val);
      // const { content_id, title } = val;
      // downloadPadFile(title, `${content_id}/export/markdown`);
    };
    // 删除
    const handleDelete = (val: Record<string, any>) => {
      ElMessageBox.confirm("此操作将永久删除，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          deleteDoc<ResponseParams.ResponseDataSuccess>({ id: val.id }).then((res) => {
            if (res.code === 200) {
              tableData.list = [];
              tableData.total = 0;
              getData();
            }
          });
        })
        .catch(() => {
          ElMessage({
            type: "info",
            message: "已取消删除"
          });
        });
    };

    // 表格行点击
    const handleRow = (val: Record<string, any>) => {
      const routeName: any = route.name;
      router.push({
        name: "padIframe",
        query: {
          docId: val.id,
          content_id: val.content_id,
          type: "update",
          origin: routeName
        }
      });
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
      setSession("currentDocTab", JSON.stringify(params));
      tableData.list = [];
      tableData.total = 0;
      formParams.classify_id = params.id * 1;
      currentTabName.value = params.name;
      formParams.space_tab_name = params.name;
      if (params.name === "草稿" || params.name === "与我协作") {
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
    const handleUpdateSearchVal = (val: string) => {
      formParams.keyword = val;
      tableData.list = [];
      tableData.total = 0;
      getData();
    };
    // 获取表格 标签列表
    const getTagData = () => {
      getTagList<ResponseParams.ResponseDataSuccess>({ root_id: 0 }).then((res) => {
        if (res.code === 200) {
          // options.value = res.data;
          setSession("knowledgeTagList", JSON.stringify(res.data));
        }
      });
      getTagList<ResponseParams.ResponseDataSuccess>({ root_id: 1 }).then((res) => {
        if (res.code === 200) {
          // options.value = res.data;
          setSession("documentTagList", JSON.stringify(res.data));
        }
      });
    };
    getTagData();
    let timerRoute: ReturnType<typeof setTimeout>;
    // 监听路由切换
    useWatchChangeProduct(getData, () => {
      clearTimeout(timerRoute);
      timerRoute = setTimeout(async () => {
        let root_id = 0;
        if (route.meta.englishName === "projectDoc") root_id = 1;
        await getTabList();
        await getClassifyTab(root_id);
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
              handleTab({ id: "0", name: "草稿" });
            }
          } else {
            handleTab({ id: "0", name: "草稿" });
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
            handleTab({ id: "0", name: "全部" });
            // getData(pagationParams);
          }
        }
      }, 100);
    });

    // 滚动加载分页
    const handlePagationAdd = (val?: number) => {
      const maxPage = Math.ceil(tableData.total / 30);
      // 滚动条滑倒底部才会执行
      if (val) {
        pagationParams.pageIndex = pagationParams.pageIndex += 1;
        if (pagationParams.pageIndex > maxPage) {
          console.log("到底了");
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
      route
    };
  }
});
</script>
<style scoped lang="less">
.rp-tab {
  height: 100%;
}
.rp-table-opation {
  display: flex;
  justify-content: space-between;
  i:hover {
    cursor: pointer;
  }
  .rp-title-left {
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
    &:hover {
      cursor: pointer;
    }
  }
}
</style> -->
