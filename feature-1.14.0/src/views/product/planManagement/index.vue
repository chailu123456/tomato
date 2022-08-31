<template>
  <div class="container planManagement">
    <div class="header main">
      <el-form :inline="true" :model="planParams" class="demo-form-inline">
        <el-form-item label="计划名称:">
          <el-input v-model="planParams.name" placeholder="请输入计划名称" @change="planList"></el-input>
        </el-form-item>
        <el-form-item label="创建人:">
          <el-select
            clearable
            v-model="planParams.create_by"
            filterable
            placeholder="请选择创建人"
            multiple
            collapse-tags
            @visible-change="planList"
            @remove-tag="planList"
          >
            <el-option-group v-for="group in createPerson" :key="group.staff_no" :label="group.label">
              <!-- <el-option v-for="item in group.options" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"></el-option> -->
              <el-option v-for="item in group.options" :key="item.staff_no" :label="item.staff_name" :value="item.staff_no"> </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <!-- <el-form-item>
          <el-button type="primary" @click="planList">
            <i class="el-icon-search"></i>
            搜索
          </el-button>
        </el-form-item> -->
        <el-form-item style="float: right; margin-right: 0">
          <el-button type="primary" @click="openDialog(0)">
            <el-icon style="vertical-align: middle">
              <Plus />
            </el-icon>
            <span style="vertical-align: middle"> 新增 </span>
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- <div class="main"> -->
    <ul class="planManagement__main__columns" ref="columnsWrapperRef">
      <li v-for="(item, index) in stepList" :key="item.titleName">
        <div class="header" :style="{ background: item.titleColor }">
          {{ item.titleName }}
        </div>
        <div
          class="body"
          @dragover.prevent=""
          @drop.stop="handleDrop($event, index)"
          @dragenter.prevent="handleDragenter($event, index)"
          @dragleave="handleDragleave"
        >
          <el-scrollbar :data-index="index" @scroll="handleScroll">
            <div
              v-for="(block, key) in item.listData"
              :key="block.name"
              class="block"
              :style="{
                background: block.bgc,
                cursor: item.isDisable ? 'not-allowed' : 'move'
              }"
              :draggable="!item.isDisable"
              @dragenter.prevent="handleDragenter($event, index, key)"
              @dragleave="handleDragleave"
              @dragstart="handleDragstart(index, key)"
              @drop.stop="handleDrop($event, index, key)"
            >
              <div class="block-header">
                <span>{{ block.version }}</span>
                <div>
                  <div :class="[!block.demand_docs ? 'block-header-prdBtn-disable' : 'block-header-prdBtn']">
                    <el-link :disabled="!block.demand_docs" @click.prevent="handleShowPRD(block)" type="primary">PRD</el-link>
                  </div>
                  <el-dropdown>
                    <span class="el-dropdown-link action">... </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="handleShowDemandDetailDialog(block)">查看需求</el-dropdown-item>
                        <el-dropdown-item :disabled="block.iteration_id === 0" @click="handleShowIteration(block.iteration_id)">查看迭代</el-dropdown-item>
                        <el-dropdown-item @click="openDialog(1, block)">编辑</el-dropdown-item>
                        <el-dropdown-item @click="handleDeletePlan(block.id)">删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
              <div class="block-body">
                <p>{{ block.name }}</p>
                <p>{{ block.product_name }}</p>
              </div>
              <div class="block-footer">
                <p>{{ block.creator }}</p>
                <p>{{ block.create_time }}</p>
              </div>
              <!-- {{ block.name }} -->
            </div>
            <div class="block-loadingMore">
              <i class="el-icon-d-arrow-right" @click="handleLoadMore(item)" v-show="item.isShowLoadingMore"></i>
              <span v-show="!item.hasData">┗( ▔, ▔ )┛没有更多了...</span>
            </div>
          </el-scrollbar>
        </div>
      </li>
    </ul>

    <!-- 需求说明弹框查看 -->
    <el-dialog title="需求说明" v-model="dialogVisibleDemand" width="30%" center>
      <div v-if="demandList.length" class="demand-list">
        <p v-for="(item, index) in demandList" :key="index">
          <span v-if="item.remark">{{ item.remark }}：</span>
          <span v-else>{{ item.type === 1 ? "需求链接：" : "需求文件：" }}</span>
          <a v-if="item.type === 1" class="table-link" :href="item.url" target="_black">查看链接</a>
          <a v-else class="table-link" @click="handleDownloadDoc(item)">下载文件</a>
        </p>
      </div>
      <div v-else>暂无需求说明</div>
    </el-dialog>

    <el-dialog :title="dialogParams.id === null ? `新增计划` : `编辑计划`" v-model="isShowEditModal" center top="2vh">
      <dialog-plan-management></dialog-plan-management>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" v-debounce @click="handleCreateOrEditPlan($event, tipMessage)">确 定</el-button>
          <el-button @click="isShowEditModal = false">取 消</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 查看 -->
    <el-dialog title="查看需求" v-model="isShowDetail" center top="2vh">
      <detailDialog :data="planDetail"></detailDialog>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handleChangeDetail">编辑</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, onActivated, onMounted, Ref, ref } from "vue";
import useDraggable from "./composables/useDraggable";
import dialogPlanManagement from "./components/dialogEditOrAdd.vue";
import detailDialog from "./components/detailDialog.vue";
import useShowPlanDetail from "./composables/useShowPlanDetail";
import useCreateAndEditPlan from "./composables/useCreateAndEditPlan";
import useMessageTip from "@/composables/useMessageTip";
import { deletePlan } from "@/api/request-modules/product";
import { ResponseParams } from "@/types/response";
import { replaceProductId } from "@/views/iteration/useMixin";
import { useRouter } from "vue-router";
import fileSave from "@/utils/fileSave";
import { Plus } from "@element-plus/icons";

export default defineComponent({
  components: {
    dialogPlanManagement,
    detailDialog,
    Plus
  },
  setup() {
    const router = useRouter();
    const isReady = ref(false);
    onMounted(() => {
      isReady.value = true;
    });
    const { tipMessage } = useMessageTip();
    // 拖拽
    const {
      stepList,
      planList,
      handleDragstart,
      handleDragenter,
      handleDrop,
      handleDragleave,
      handleShowDemandDetailDialog,
      handleScroll,
      columnsWrapperRef,
      handleLoadMore,
      planParams,
      isShowDetail,
      createPerson
    } = useDraggable(tipMessage);
    console.log(stepList);

    const { planDetail, demandLists, tempData } = useShowPlanDetail();

    // 需求说明弹框
    const dialogVisibleDemand = ref(false);
    const demandList = ref([]);

    const { isShowEditModal, openDialog, handleCreateOrEditPlan, dialogParams } = useCreateAndEditPlan(planList);
    //#region 获取创建人
    // const createPerson = ref();
    // // 获取创建人列表
    // const handleManagerList = () =>
    //   selectManagerList<ResponseParams.ResponseDataSuccess>({ product_id: Number(getSession("productId")) }).then((res) => {
    //     createPerson.value = res.data;
    //   });
    // handleManagerList();
    //#endregion
    // 删除
    const handleDeletePlan = (id: number) => {
      deletePlan<ResponseParams.ResponseDataSuccess>(id).then(() => {
        // tipMessage(res.code);
        planList();
      });
    };
    // 详情dialog关闭，打开编辑
    const handleChangeDetail = () => {
      isShowDetail.value = false;
      (openDialog as (...args: Array<unknown>) => void)(1, (tempData as Ref<unknown>).value);
    };
    onActivated(() => {
      replaceProductId();
    });
    replaceProductId();
    // 查看迭代跳转
    const handleShowIteration = (id: number) => {
      router.push({
        name: "homepage",
        query: {
          id
        }
      });
    };
    const handleDownloadDoc = (detail: Record<string, any>) => {
      const { url, name } = detail;
      fileSave(name, url);
    };
    //#region 查看PRD
    const handleShowPRD = (block: Record<string, any>) => {
      console.log(block);
      dialogVisibleDemand.value = true;
      demandList.value = block.demand_docs || [];
      // const {
      //   demand_doc: { url, type, name }
      // } = block;
      // // type 为 1，打开新窗口跳转
      // if (type === 1) {
      //   let reg = /^((https|http){1}:\/\/)[^\s]+/;
      //   if (!reg.test(url)) {
      //     window.open("https://" + url, "_blank");
      //   } else {
      //     window.open(url, "_blank");
      //   }
      // } else if (type === 2) {
      //   fileSave(name, url);
      // }
      // type为 2 下载文件
    };
    //#endregion
    return {
      dialogParams,
      handleChangeDetail,
      handleShowDemandDetailDialog,
      isShowDetail,
      createPerson,
      isReady,
      planDetail,
      handleDeletePlan,
      tipMessage,
      handleCreateOrEditPlan,
      demandLists,
      isShowEditModal,
      openDialog,
      stepList,
      handleDragstart,
      handleDragenter,
      handleDrop,
      handleDragleave,
      handleScroll,
      columnsWrapperRef,
      handleLoadMore,
      planParams,
      planList,
      handleShowIteration,
      handleShowPRD,
      dialogVisibleDemand,
      demandList,
      handleDownloadDoc
    };
  }
});
</script>

<style scoped lang="less">
.planManagement {
  padding: 20px 20px 0;
  box-sizing: border-box;
  .main {
  }
  height: 100%;

  .demand-list {
    max-height: 240px;
    overflow-y: scroll;
  }

  .planManagement__main__columns {
    box-sizing: border-box;
    background: #fff;
    display: flex;
    height: 80vh;
    li {
      flex: 1;
      // margin-right: 5px;
      // margin-bottom: 20px;
      overflow: hidden;
      .header {
        user-select: none;
        text-align: center;
        line-height: 32px;
        font-size: 14px;
        color: rgba(38, 38, 38, 1);
        height: 32px;
      }
      .body {
        border: 1px solid rgba(232, 232, 232, 1);
        box-sizing: border-box;
        height: 100%;
        height: 76vh;
        padding: 10px 5px 0px;

        .block {
          padding: 8px;
          box-sizing: border-box;
          position: relative;
          border-radius: 10px;
          user-select: none;
          margin: 5px auto 5px;
          color: rgba(89, 89, 89, 1);
          font-size: 12px;
          .block-header {
            height: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            div {
              display: flex;
              align-items: center;
            }
            :deep(.el-dropdown) {
              display: flex;
              justify-content: center;
              align-items: center;
              transform: rotate(90deg) !important;
            }
            .action {
              text-align: center;
              cursor: pointer;
              margin-left: 10px;
              font-size: 20px;
              margin-top: -13px;
              margin-right: 11px;
            }
            .block-header-prdBtn {
              height: 18px;
              box-sizing: border-box;
              padding: 2px;
              border-radius: 5px;
              background: #fff;
              // cursor: pointer;
              border: 1px solid #000;
              :deep(.el-link) {
                font-size: 12px;
              }
            }
            .block-header-prdBtn-disable {
              .block-header-prdBtn;
              border: 1px solid rgba(0, 0, 0, 0.3);
              :deep(.el-link) {
                font-size: 12px;
                color: rgba(0, 0, 0, 0.3) !important;
              }
            }
          }
          .block-body {
            font-size: 14px;
            p {
              line-height: 10px;
            }
            p:first-child {
              line-height: 20px;
              text-overflow: ellipsis;
              overflow: hidden;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 2;
              font-weight: 600;
            }
          }
          .block-footer {
            display: flex;
            justify-content: space-between;
            p {
              line-height: 5px;
            }
          }
          &:last-child {
            margin-bottom: 40px;
          }
        }
        .block-loadingMore {
          margin-top: 30px;
          margin-bottom: 50px;
          text-align: center;
          i {
            cursor: pointer;
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
.center {
  text-align: center;
}
</style>
