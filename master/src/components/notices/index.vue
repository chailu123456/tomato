<template>
  <div class="notices">
    <!-- 顶部操作栏 -->
    <div class="notices-top">
      <span>消息提醒</span>
      <span class="notices-top__clear" :class="{ 'notices-top__cleared': !notices }" @click="onClearMark"><i class="iconfont icon-clear"></i> 全部已读</span>
    </div>
    <!-- 数据展示区域 -->
    <page-table
      :tableData="tableData"
      :total="total"
      :height="400"
      style="overflow: hidden"
      @handlePagationChange="getMsgInfo"
      :show-header="false"
      :currentPage="page"
      layout="total,prev, pager, next, jumper"
    >
      <template #main>
        <el-table-column prop="content">
          <template #default="scope">
            <span
              class="hover-point"
              :class="{ 'notices-readed': scope.row.is_read }"
              @click="onLink(scope.row, $event)"
              v-html="filterItems(scope.row)"
            ></span>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" width="150">
          <template #default="scope">
            <span class="textAlign" :class="{ 'notices-readed': scope.row.is_read }">{{ filterCreateTime(scope.row.create_time) }}</span>
          </template>
        </el-table-column>
      </template>
    </page-table>
  </div>

  <teleport to="#app">
    <el-dialog v-model="visible" title="权限申请" width="30%" center>
      <span>{{ permissTitle }}</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleBtns(2)">拒绝</el-button>
          <el-button type="primary" @click="handleBtns(1)">同意</el-button>
        </span>
      </template>
    </el-dialog>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref, toRefs } from "vue";
import { MsgItemsIter, getMessage, updateAllMsgStatus, updateMsgStatusById, filterItems } from "@/composables/useGetNoticesData";
import { Pagation } from "@/composables/usePagation";
import { ElMessageBox } from "element-plus";
import { LinkType } from "@/utils/enum";
import { useRouter, useRoute } from "vue-router";
import dayjs from "dayjs";
import { ResponseParams } from "@/types/response";
import { searchParams, productId, demandList, setCache } from "@/views/iteration/useMixin";
import useGetDemandList from "@/views/iteration/useGetDemandList";
import { onUpdatePermission } from "@/composables/useDocument";
import { shortCode } from "@/api/request-modules/document";
import { store } from "@/store";
import { MutationType } from "@/store/mutation-types";
import { ProjectItem } from "@/composables/useCommon";

export default defineComponent({
  name: "notices",
  props: {
    notices: {
      type: Number as PropType<number>,
      default: 0
    }
  },
  setup(props, content) {
    const router = useRouter();
    const route = useRoute();
    const { notices } = toRefs(props);
    let visible = ref(false);
    let permissTitle = ref("");
    const page = ref(1);
    let objId = 0;
    // 分页
    const pagi = reactive<Pagation>({
      pageIndex: 1,
      pageSize: 20
    });
    // 数据总条数
    let total = ref(0);
    // 未读消息
    let unReads = ref(0);
    // 列表数据
    const tableData = reactive<Array<MsgItemsIter>>([]);

    // 更新所有消息
    const onClearMark = async () => {
      if (notices.value <= 0) return;
      // 确认是否清理所有的未读消息
      const isClear = await ElMessageBox.confirm("请确认是否清除所有未读消息？", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      });
      // 显示消息框
      content.emit("update:show", "show");
      if (!isClear) return;
      const isTrue = await updateAllMsgStatus();
      if (!isTrue) return;
      // 如果更新了所有消息，更新未读消息为0
      content.emit("update:notices", 0);
      // 未读消息更新为0
      unReads.value = 0;
      // 把所有未读的过滤出来，然后把他们都设置为已读状态
      tableData.filter((item: MsgItemsIter) => !item.is_read).forEach((item) => (item.is_read = true));
    };

    const handleBtns = (status: number) => {
      onUpdatePermission(objId, status).then((isTrue) => {
        visible.value = !isTrue;
      });
    };

    // 点击消息跳转
    const onLink = (item: MsgItemsIter, event: Event) => {
      const { is_read, id, obj_name, obj_id, module, wiki_content_id, apply_staff_name, product_id, demand_approval_id } = item;
      objId = obj_id;
      // 是否已读？如果是未读走接口更新状态
      if (!is_read) {
        updateMsgStatusById(id).then((res) => {
          if (!res) return;
          const curItem = tableData.find((e) => e.id === id);
          // 更新状态
          curItem!.is_read = true;
          // 更新未读消息条数
          content.emit("update:notices", --unReads.value <= 0 ? 0 : unReads.value);
        });
      }
      content.emit("update:show", "");
      const { target } = event as any;
      // 如果包含wiki，即文档消息
      let linkType = "wiki";
      // 如果消息体为用户向你申请权限
      if (module.includes("wiki")) {
        // 如果消息体为用户向你申请权限
        if (LinkType.WIKIREADPERMISSION === module || LinkType.WIKIWRITEPERMISSION === module) {
          const typeVal = module === LinkType.WIKIREADPERMISSION ? "阅读" : "编辑";
          permissTitle.value = `${apply_staff_name}向您申请文档《${obj_name}》${typeVal}权限`;
          visible.value = true;
          return;
        } else if (module === LinkType.DEMANDAPPROVAL) {
          // 审批消息类型
        } else {
          item.module = linkType;
        }
      }

      if (target.nodeName === "SPAN" || target.nodeName === "A") {
        /**
         * 这里执行的是点击到A标签后，需要跳转到不同页面
         * 可以采用 LinkType 去判断类型
         * 任务列表 /iteration/exploitation?id=15&staffNo=SF58042&staffName=高卓越
         * 迭代工单 /iteration/applyTest?id=16
         */
        const routeMap = {
          [LinkType.APPLYTESTMODULE]: {
            baseName: "applyTest",
            query: { id: item.iteration_id }
          },
          [LinkType.BUGMODULE]: {
            baseName: "test",
            query: {
              productId: product_id,
              detailId: item.obj_id
            }
          },
          [LinkType.TASKMODULE]: {
            baseName: "projectExploitation",
            query: {
              where: "notices",
              detailId: item.obj_id
            }
          },
          [LinkType.DEMANDAPPROVAL]: {
            baseName: "approval",
            query: {
              productId: product_id,
              auto: 1,
              ids: demand_approval_id,
              fromNotices: true
            }
          },
          [LinkType.APPLYTEST]: {
            baseName: "testBill",
            query: {
              productId: product_id,
              testApplyId: item.obj_id
            }
          },
          [linkType]: {
            baseName: "padIframe",
            query: {
              docId: obj_id,
              content_id: wiki_content_id
            }
          }
        } as Record<string, any>;
        // 设置当前项目和迭代
        if (productId.value === item.product_id) {
          // 同一个项目内切换迭代id
          searchParams.demand = item.iteration_id;
        } else {
          // 跨项目
          if (item.product_id) {
            store.commit(MutationType.updateProductId, item.product_id);
            const curProdctInfo = store.getters.productList.find((n: ProjectItem) => n.id === item.product_id);
            if (curProdctInfo) {
              // 设置项目列表缓存
              store.commit(MutationType.updateProductInfo, curProdctInfo);
            }

            const getDemandList = useGetDemandList();
            getDemandList(item.product_id).then((res) => {
              if (item.iteration_id === 0) {
                searchParams.demand = res || [];
                // 缓存当前迭代
                store.commit(MutationType.updateIterateId, item.iteration_id);
              } else {
                const hasIter = demandList.value && demandList.value.filter((it: any) => it.id === item.iteration_id);
                searchParams.demand = item.iteration_id;
                // 缓存当前迭代信息
                store.commit(MutationType.updateCurrentIter, hasIter[0] || null);
                // 缓存当前迭代
                store.commit(MutationType.updateIterateId, item.iteration_id);
              }
            });
          }
        }
        if (item.iteration_id) setCache(item.iteration_id);
        if (routeMap[item.module].baseName === "padIframe") {
          // 转换为短链接
          const a = "docId=" + obj_id + "&content_id=" + wiki_content_id + "&type=update&is_link_share=1";
          shortCode<ResponseParams.ResponseDataSuccess>({ content: a }).then((res) => {
            if (res.code === 200) {
              // 在文档页面打开时需要重新加载
              if (route.name === "padIframe") {
                window.location.href = window.location.origin + "/document/padIframe?" + res.data.code;
                location.reload();
              } else {
                window.open(window.location.origin + "/document/padIframe?" + res.data.code, "_self");
              }
            }
          });
        } else {
          router.push({
            name: routeMap[item.module].baseName,
            query: routeMap[item.module].query
          });
        }
      }
    };

    // 获取列表信息
    const getMsgInfo = async (pagationParams: Pagation) => {
      const { unread, list, count } = await getMessage(pagationParams);
      tableData.length = 0;
      tableData.push(...list);
      total.value = count;
      unReads.value = unread;
      page.value = (pagationParams && pagationParams.pageIndex) || 1;

      // 更新notices值
      content.emit("update:notices", unread);
      if (unread > 0) return true;
    };
    getMsgInfo(pagi);
    // socket服务
    // socket(async (data: MessageEvent) => {
    //   // 是否有消息推送过来
    //   const hasMsg = Array.isArray(data) && data.length;
    //   // 更新页面数据
    //   await getMsgInfo(pagi);
    //   // 如果消息体不存在，就不需要发送消息。
    //   if (!hasMsg) return;
    //   // 发送消息
    //   if (Array.isArray(data)) {
    //     for (let i = 0; i < data.length; i++) {
    //       sendNotification(data[i]);
    //     }
    //   }
    // });
    //#region 处理时间显示
    const filterCreateTime = (time: string) => {
      const now = dayjs(time).format("YYYY-MM-DD");
      const isThisYear = dayjs().isSame(now, "year");
      const isThisMonth = dayjs().isSame(now, "month");
      const isThisDay = dayjs().isSame(now, "day");
      if (isThisDay && isThisMonth && isThisYear) {
        return dayjs(time).format("HH:mm:ss");
      } else if (isThisYear) {
        return dayjs(time).format("MM-DD HH:mm:ss");
      } else if (!isThisYear) {
        return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
      }
    };

    //#endregion
    return {
      filterCreateTime,
      tableData,
      onClearMark,
      getMsgInfo,
      filterItems,
      onLink,
      total,
      visible,
      handleBtns,
      permissTitle,
      page
    };
  }
});
</script>

<style lang="less">
.notices {
  .main {
    padding: 0;
  }
}
</style>

<style lang="less" scoped>
.container {
  height: 448px;
}
.notices {
  height: 480px;
  :deep(.main) {
    height: 410px !important;
    overflow: hidden;
    .el-table__body-wrapper {
      height: 408px !important;
    }
    .page {
      height: 36px;
      padding-top: 10px;
    }
  }
  &-top {
    display: flex;
    justify-content: space-between;
    margin: 10px 0;

    &__clear {
      cursor: pointer;
    }

    &__cleared {
      color: #ddd;
      cursor: not-allowed;
    }
  }

  &-readed {
    color: #bdbdbd;
  }
  &-link {
    color: #3370ff;
  }
  .hover-point {
    cursor: pointer;
    display: inline-block;
    width: 100%;
  }
  .textAlign {
    width: 100%;
    display: inline-block;
    text-align: right;
  }
  :deep(.cell) {
    text-align: left;
  }
  :deep(.container) {
    padding: 0;
  }
}
</style>
