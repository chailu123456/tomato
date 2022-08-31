<template>
  <div class="rp-container">
    <div class="main">
      <div class="grid-container" v-if="Object.keys(result).length && currentIter?.id">
        <section>
          <el-card shadow="never" style="position: relative">
            <iteration-tip class="position-tooltip"></iteration-tip>
            <div class="progress">
              <iteration-card :isStatus="true" title="迭代状态">
                <h2 class="iteration__status" @click="changeUpdateIterationStatus">
                  <span v-if="result.status != 7" class="iter-status">
                    {{ STATUS[result.status]?.label || "-" }}
                  </span>
                  <span v-if="result.status === 7" class="iter-status">{{ STATUS[result.status]?.label || "-" }}</span>
                </h2>
                <p class="progress-title" v-html="getStageDate(result)"></p>
                <!-- 计划日期8.24，实际日期8.25 -->
                <div class="progress-item__icon">
                  <img src="../../../assets/ddzt.png" alt="" />
                </div>
              </iteration-card>

              <iteration-card title="迭代进度" :total="result.complete_percent" :today="result.today_percent" unit="%">
                <p class="progress-title">
                  时间进度<span style="color: #003300; font-size: 16px; margin-left: 6px">{{ result.time_percent }}%</span>
                  <template v-if="result.complete_percent - result.time_percent < 0">
                    ，落后<span class="progress-item__progressText--down">{{ Math.abs(result.complete_percent - result.time_percent) }}%</span>
                  </template>
                  <template v-else>
                    ，提前
                    <span class="progress-item__progressText--up">{{ result.complete_percent - result.time_percent }}%</span>
                  </template>
                </p>
                <div class="progress-item__icon">
                  <img src="../../../assets/xmjd.png" alt="" />
                </div>
              </iteration-card>

              <iteration-card title="完成任务工时" :total="result.done_hour" :today="result.today_hour" unit="h">
                <p class="progress-title">
                  总任务工时<span style="color: #003300; font-size: 16px; margin-left: 6px">{{ result.total_hour }}h</span>，未完成<span
                    class="progress-item__progressText--down"
                    >{{ result.total_hour - result.done_hour }}h</span
                  >
                </p>
                <div class="progress-item__icon">
                  <img src="../../../assets/rwgs.png" alt="" />
                </div>
              </iteration-card>

              <iteration-card title="BUG数" :total="result.total_bug" :today="result.today_bug" unit="个">
                <p class="progress-title">
                  <span
                    >已修复<span style="color: #003300; font-size: 16px; margin-left: 6px">{{ result.fixed_bug }}</span
                    >个</span
                  >，
                  <span
                    >已验证<span class="progress-item__progressText--down">{{ result.verified_bug }}</span
                    >个</span
                  >
                </p>
                <div class="progress-item__icon">
                  <img src="../../../assets/bugzs.png" alt="" />
                </div>
              </iteration-card>
            </div>

            <div class="flow-schedule">
              <progress-bar width="90%" :status="progressData.status" :dataTime="progressData.dataTime"></progress-bar>
            </div>
          </el-card>
        </section>
        <section>
          <el-card shadow="never">
            <div v-for="(item, index) in btn_groups" :key="index" class="btn-groups">
              <el-button class="btn-groups__button" v-debounce :class="[item.class, item.type ? '' : 'btn-style']" plain :type="item.type" @click="item.event">
                <i :class="['iconfont', item.icon ? item.icon : '']" style="font-size: 14px; margin-right: 4px"></i>
                {{ item.name }}
              </el-button>
            </div>
          </el-card>
        </section>

        <section v-if="isOk">
          <el-card shadow="never" style="overflow: scroll">
            <span>基础信息</span>
            <el-button
              size="small"
              @click="handleChangeDialogStatus(1, $event)"
              style="height: 25px !important; float: right; border: 1px solid #1f9f85; color: #1f9f85"
              >编辑</el-button
            >
            <div class="basic-info">
              <div>
                <span>版本号: </span>
                <span>v{{ result.version }}</span>
              </div>
              <div>
                <span>迭代名称: </span>
                <span>{{ result?.name || "" }}</span>
              </div>
              <div>
                <span>所属项目: </span>
                <span>{{ result?.product.name || "" }}</span>
              </div>
              <div class="overflow-hidden">
                <span>关联计划: </span>
                <span></span>
              </div>
              <div>
                <div class="basic-info__wrapper" v-for="(item, index) in 4" :key="index">
                  <div class="basic-info__avatar">
                    <img :src="result.iteration_manager.avatar" alt="" v-if="index === 0" />
                    <img :src="result.backend_manager.avatar" alt="" v-if="index === 1" />
                    <img :src="result.frontend_manager.avatar" alt="" v-if="index === 2" />
                    <img :src="result.test_manager.avatar" alt="" v-if="index === 3" />
                  </div>

                  <div class="basic-info__person" v-if="index === 0">
                    <p>{{ result.iteration_manager.staff_name }}</p>
                    <p class="basic-info__job">产品负责人</p>
                  </div>
                  <div class="basic-info__person" v-if="index === 1">
                    <p>{{ result.backend_manager.staff_name }}</p>
                    <p class="basic-info__job">后端负责人</p>
                  </div>
                  <div class="basic-info__person" v-if="index === 2">
                    <p>{{ result.frontend_manager.staff_name }}</p>
                    <p class="basic-info__job">前端负责人</p>
                  </div>
                  <div class="basic-info__person" v-if="index === 3">
                    <p>{{ result.test_manager.staff_name }}</p>
                    <p class="basic-info__job">测试负责人</p>
                  </div>
                </div>
              </div>
              <div class="danger-remark">
                <span>风险备注：</span>
                <span v-if="result.warning && result.warning !== ''">{{ result.warning }}</span>
                <span v-else>无</span>
              </div>
            </div>
          </el-card>
        </section>

        <section v-if="isOk">
          <el-card shadow="never">
            <span>迭代内容</span>
            <el-button
              size="small"
              @click="handleRelativeDemand(result.id, $event)"
              style="height: 25px !important; float: right; border: 1px solid #1f9f85; color: #1f9f85"
              >关联需求</el-button
            >
            <el-scrollbar max-height="240px">
              <ol class="iteration-content" v-for="(item, index) in result.deman" :key="index">
                <li>
                  <span @click="handleDemandDetail(item.id)">{{ item.name }}</span>

                  <ol v-for="(childItem, index) in item.child_list" :key="index">
                    <div class="a" @click="handleDemandDetail(childItem.id)">
                      {{ childItem.name }}
                    </div>
                  </ol>
                </li>
              </ol>
            </el-scrollbar>
          </el-card>
        </section>

        <section>
          <el-card shadow="never" class="assets">
            <span>资料地址</span>
            <div v-for="item in docLists" :key="item.name">
              <span>{{ item.name }}: </span>
              <el-button type="primary" link @click="dialogVisibleDemand = true" v-if="item.name === '需求及UI说明'"> 查看 </el-button>
              <el-button type="primary" link v-else-if="item.doc[0]?.url" @click="handleDownloadDoc(item.doc[0])">
                <a class="assets_link_color" :href="`${item.doc[0].url}`" target="_black">查看</a>
              </el-button>
              <el-button type="primary" link :disabled="true" v-else-if="item.name === 'UI设计'"> 查看 </el-button>
              <el-button type="primary" link @click="hanldeLook(item.name)" v-else> 查看 </el-button>
              <!-- <el-button type="text" v-if="item.name !== '需求说明'" @click="handleEditDoc(index)">编辑</el-button> -->
              <!-- 需求说明新增新增入口 -->
              <el-button type="primary" link @click="showDemand(1)" v-if="item.name === '需求及UI说明'"> 编辑 </el-button>
            </div>
          </el-card>
        </section>

        <section></section>
        <section class="employee-management__wrapper">
          <employee-management :list="result.user_list" @refresh="getIterationDetail" />
        </section>

        <section class="">
          <projectManagement :list="result.app_list" @refresh="getIterationDetail" />
        </section>

        <!-- 需求说明弹框查看 -->
        <el-dialog title="需求及UI说明" v-model="dialogVisibleDemand" width="30%" center>
          <div v-if="result?.doc?.demand_doc?.length" class="demand-list">
            <p v-for="(item, index) in result?.doc?.demand_doc" :key="index">
              <span v-if="item.remark">{{ item.remark }}：</span>
              <span v-else>{{ item.type === 1 ? "需求链接：" : "需求文件：" }}</span>
              <a v-if="item.type === 1" class="assets_link_color" :href="item.url" target="_black">查看链接</a>
              <a v-else class="assets_link_color" href="#" @click="handleDownloadDoc(item)">下载文件</a>
              <span v-if="item.create_time">，时间：{{ item.create_time }}</span>
            </p>
          </div>
          <div v-else>暂无需求说明</div>
        </el-dialog>

        <!-- 资料地址编辑 -->
        <el-dialog :title="dialogDocInfo.title" v-model="dialogVisible" width="30%" center>
          <el-radio-group v-model="dialogDocInfo.doc[0].type" @change="changeDemandDoc">
            <el-radio :label="1">需求链接</el-radio>
            <el-radio :label="2">需求文件</el-radio>
            <!-- <el-radio :label="0">暂无</el-radio> -->
          </el-radio-group>
          <el-form class="demo-form-inline">
            <el-form-item label="">
              <div v-show="dialogDocInfo.doc[0].type === 1">
                <el-input v-model="dialogDocInfo.demandUrl" placeholder="如http://www.google.com"> </el-input>
              </div>
              <el-upload
                v-show="dialogDocInfo.doc[0].type == 2"
                :file-list="dialogDocInfo.doc[0].size ? dialogDocInfo.doc : []"
                :on-remove="handleRemoveFiles"
                :on-success="handleSuccessFiles"
                :action="api.uploadAssets"
                :limit="1"
              >
                <el-button icon="el-icon-plus" type="text">上传附件</el-button>
              </el-upload>
            </el-form-item>
          </el-form>

          <template #footer>
            <span class="dialog-footer">
              <el-button type="primary" :disabled="dialogDocInfo.doc[0].type === 0" v-debounce @click="handleConfirmChange(dialogDocInfo.doc[0].type)"
                >确 定</el-button
              >
              <el-button @click="dialogVisible = false">取 消</el-button>
            </span>
          </template>
        </el-dialog>

        <!-- 修改迭代状态 -->
        <div>
          <el-dialog title="提示" v-model="updateStatusDialog" width="30%">
            <el-form :inline="true">
              <el-form-item label="迭代状态" v-if="result.status != 7">
                <el-select v-model="status" placeholder="请选择">
                  <el-option :disabled="item.disabled" v-for="item in REAL_STATUS" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select>
              </el-form-item>
              <div style="margin-left: -12px" v-if="result.status === 7">
                <span style="margin-left: 12px">取消搁置</span>
                <el-checkbox style="margin-left: 14px" v-model="checkInterStatus" label=""></el-checkbox>
              </div>
            </el-form>
            <template #footer>
              <!-- status -->
              <span class="dialog-footer">
                <el-button @click="updateStatusDialog = false">取 消</el-button>
                <el-button type="primary" v-debounce @click="handleConfirmStatusChange">确 定</el-button>
              </span>
            </template>
          </el-dialog>
        </div>

        <!-- 风险备注 -->
        <!-- 关联需求对话框 -->
        <relative-dialog
          title="关联需求"
          placeholder="搜索需求"
          inputTitle="搜索需求"
          :defaultCheck="defaultCheck"
          v-model:visible="iterateContentVisible"
          @updateTree="getRelativeDate"
          :sortTreeDate="treeData"
        ></relative-dialog>

        <!-- 关联需求 -->
        <el-dialog title="提示" top="10vh" v-model="riskModal" width="30%">
          <el-form :inline="true" class="demo-form-inline">
            <el-form-item label="风险备注">
              <el-input type="textarea" placeholder="请输入内容" :autosize="{ minRows: 4 }" v-model="riskWarningText" maxlength="200" show-word-limit>
              </el-input>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="riskModal = false">取 消</el-button>
              <el-button type="primary" v-debounce @click="handleUpdateRiskWarning">确 定</el-button>
            </span>
          </template>
        </el-dialog>
      </div>

      <div v-else class="empty-block">
        <el-empty :image-size="200"></el-empty>
      </div>
    </div>
    <DemandEditor :type="demandType" :files="result?.doc?.demand_doc" v-model:visible2="visible2" @submit="onSubmit" />
    <HandleTestBill hasIter @update-info="getIterationDetail(currentIter?.id)" ref="testBillComp" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, onMounted } from "vue";
import EmployeeManagement from "./components/employeeManagement.vue";
import projectManagement from "./components/projectManagement.vue";
import useUpdateDoc from "./composables/useUpdateDoc";
import useMixin, { replaceProductId } from "../useMixin";
import useMessageTip from "@/composables/useMessageTip";
import useUpdateIterationStatus from "./hooks/useUpdateIterationStatus";
import { ResponseParams } from "@/types/response";
import iterationCard from "./components/iterationCard.vue";
import dayjs from "dayjs";
import api from "@/api/dict";
import { useRouter, useRoute } from "vue-router";
import IterationTip from "@/components/iteration-tip/index.vue";
import { STATUS } from "@/utils/index";
import { updateRiskWarning, getIterationDemand, updateIterationDemand } from "@/api/request-modules/iteration";
import { store } from "@/store";
import DemandEditor from "./components/demandEdit.vue";
import useIteration, { DemandReqItems, DemandReqItemsFile } from "@/composables/useIteration";
import { ElMessage } from "element-plus";
import { MutationType } from "@/store/mutation-types";
import HandleTestBill from "@/views/product/testBill/components/handleTestBill.vue";

export default defineComponent({
  components: {
    EmployeeManagement,
    projectManagement,
    iterationCard,
    IterationTip,
    DemandEditor,
    HandleTestBill
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const visible2 = ref(false);
    const demandType = ref(1);
    const testBillComp = ref();
    const currentIter = computed(() => store?.getters?.currentIter);
    const iterateContentVisible = computed(() => store.state.iterateContentVisible);
    const { useUpdateDemand } = useIteration();
    replaceProductId();
    //#region  资料地址模块
    const { tipMessage } = useMessageTip();
    // 资料地址相关数据
    const { handleConfirmChange, handleEditDoc, dialogDocInfo, dialogVisible, docLists, handleDownloadDoc } = useUpdateDoc(tipMessage);
    //#endregion
    // 关联需求弹框
    const dialogRelative = ref(false);

    // 需求说明弹框
    const dialogVisibleDemand = ref(false);
    const demandList = ref([]);
    // 管理需求弹窗默认选中
    const defaultCheck = ref([] as Array<number>);
    let treeData = ref([]);
    let alreadyClick = false;

    const curProductInfo = computed(() => store?.getters?.productInfo);

    //#region  文档
    const { handleChangeDialogStatus, dialogRef, result, isOk, getIterationDetail, progressData } = useMixin(true);

    onMounted(() => {
      getIterationDetail(currentIter.value?.id);
    });

    watch(
      () => result.value,
      () => {
        if (Object.keys(result.value).length) {
          try {
            const fileds = Object.keys(result.value?.doc);
            demandList.value = result.value.doc;
            (docLists as Array<Record<string, any>>).forEach((v) => {
              v.quote_id = result.value.id;
              fileds.forEach((filed) => {
                v.doc = [result.value.doc[filed]];
              });
              riskWarningText.value = result.value.warning;
            });
          } catch (e) {
            console.log(e);
          }
        } else {
          demandList.value = [];
        }
      }
    );
    watch([() => iterateContentVisible.value, () => currentIter.value], ([newVisible, newIter]) => {
      if (newVisible) {
        handleRelativeDemand(result.value.id);
      }
      if (newIter) {
        getIterationDetail(currentIter.value?.id);
      } else {
        result.value = {};
      }
    });

    const { changeUpdateIterationStatus, updateStatusDialog, handleConfirmStatusChange, status, REAL_STATUS, checkInterStatus } = useUpdateIterationStatus(
      tipMessage,
      result,
      getIterationDetail
    );

    //#region 风险备注更新
    const riskModal = ref(false);
    const riskWarningText = ref("");
    // 开始联调前判断是否添加时间
    if (route.params.code) {
      setTimeout(() => {
        handleChangeDialogStatus(1);
      }, 100);
    }
    // 风险备注
    const handleChangeRiskRemark = (e: any) => {
      let target = e.target;
      if (target.nodeName == "SPAN" || target.nodeName == "I") {
        target = e.target.parentNode;
      }
      target.blur();
      riskModal.value = true;
    };
    // 项目周报
    const handleProductWeekly = () => {
      router.push({
        name: "reports"
      });
    };

    const handleUpdateRiskWarning = () => {
      updateRiskWarning<ResponseParams.ResponseDataSuccess>({
        iteration_id: currentIter.value?.id,
        remark: riskWarningText.value
      }).then((res) => {
        if (res.code === 200) {
          tipMessage(res.code);
        }
        getIterationDetail(currentIter.value?.id);
        riskModal.value = false;
      });
    };

    const docTypeFn = (type: number) => {
      if (type) return 2;
      return 1;
    };

    // 提测单弹窗
    const onIterateFun = () => {
      if (result.value.stage > 0 && !result.value?.test_apply_id) {
        testBillComp.value.handleDrawerVisble(true, true);
      } else if (result.value?.test_apply_id) {
        testBillComp.value.showEditDrawer(result.value.test_apply_id);
      } else {
        ElMessage.warning("该阶段无法创建提测单");
      }
    };

    //#endregion
    //#region 按钮组
    const btn_groups = [
      {
        name: "编辑迭代",
        event: (e: any) => {
          return handleChangeDialogStatus(1, e);
        },
        type: "primary",
        icon: "icon-bianji",
        class: "plain"
      },
      {
        name: "修改状态",
        event: changeUpdateIterationStatus,
        type: "success",
        icon: "icon-xiugaizhuangtai"
      },
      {
        name: "迭代工单",
        event: onIterateFun,
        type: "info",
        icon: "icon-caidan",
        class: "iterationTicket js-drawer-uncloseable"
      },
      {
        name: "风险备注",
        event: handleChangeRiskRemark,
        type: "danger",
        icon: "icon-fengxian"
      },
      {
        name: "迭代周报",
        event: handleProductWeekly,
        type: "default",
        icon: "icon-zhoubao"
      }
    ];

    // 迭代状态下的显示内容
    const getStageDate = (iterationDetail: Record<string, any>) => {
      if (!Object.keys(iterationDetail).length) return;
      const stage = iterationDetail.stage;
      const formatDate = (date: string) => {
        return dayjs(date).format("MM.DD");
      };
      const stageMap = {
        1: "dev_time",
        2: "union_time", // 联调中显示当前联调进度
        3: "test_time", // 测试中显示当前测试进度
        4: "release_time"
      } as Record<string, any>;
      if (!iterationDetail.is_schedule) {
        let text = "";
        switch (iterationDetail.status) {
          case 6:
            return "已完成";
          case 1:
            text = "设计";
            break;
          case 2:
            text = "开发";
            break;
          case 3:
            text = "联调";
            break;
          case 4:
            text = "测试";
            break;
          default:
            return "";
        }
        return `当前${text}进度 <span style="color:rgb(0, 51, 0);font-weight: 700;"> ${iterationDetail.percent}%</span>`;
      }
      const strPlan = `计划开始日期${formatDate(iterationDetail[stageMap[stage]])}`;
      let text = "";
      switch (iterationDetail.status) {
        case 0:
          return `计划开始日期${formatDate(iterationDetail.dev_time)}`;
        case 1:
          text = "设计";
          break;
        case 2:
          text = "开发";
          break;
        case 3:
          text = "联调";
          break;
        case 4:
          text = "测试";
          break;
        case 5:
          return `计划发布日期${formatDate(iterationDetail[stageMap[stage + 1]])}`;
        case 6:
          return "已完成";
        case 7:
          return "";
        case 8:
          return `计划测试日期${formatDate(iterationDetail[stageMap[stage + 1]])}`;
        default:
          return strPlan;
      }
      return `当前${text}进度 <span style="color:rgb(0, 51, 0);font-weight: 700;"> ${iterationDetail.percent}%</span>`;
    };
    //#endregion
    //#region
    // 文件上传
    const handleSuccessFiles = (response: Record<string, any>) => {
      // 七牛上传成功后有时候返回url为空
      const { size, url, filename } = response;
      if (response.url) {
        const type = (dialogDocInfo as Record<string, any>).doc[0].type;
        (dialogDocInfo as Record<string, any>).doc[0] = {
          name: filename,
          size,
          type,
          url
        };
      }
    };

    const handleRemoveFiles = () => {
      (dialogDocInfo as Record<string, any>).doc = [
        {
          name: "",
          size: 0,
          type: 2,
          url: ""
        }
      ];
    };

    const hanldeLook = (name: string) => {
      if (name === "接口文档") {
        router.push({
          name: "interface"
        });
      }
      if (name === "测试用例") {
        router.push({
          name: "useCase"
        });
      }
    };

    const handleType = (val: number) => {
      status.value = val;
      handleConfirmStatusChange();
    };

    //#endregion
    //#region 切换需求说明
    const changeDemandDoc = () => {
      console.log(dialogDocInfo);
    };
    const addDemand = () => {
      router.push({
        name: "demandPool",
        query: { type: "add" }
      });
    };
    // 需求查看
    const handleDemand = () => {
      dialogVisibleDemand.value = true;
    };
    // 关联需求
    const handleRelativeDemand = (id: string | number, e?: any) => {
      if (e) {
        let target = e.target;
        if (target.nodeName == "SPAN" || target.nodeName == "I") {
          target = e.target.parentNode;
        }
        target.blur();
      }
      if (alreadyClick) return;
      // 一个阈值
      treeData.value = [];
      defaultCheck.value = [];
      getIterationDemand<ResponseParams.ResponseDataSuccess>({
        with_iteration_id: id,
        product_id: curProductInfo.value?.id
      }).then((res: any) => {
        if (res.code === 200) {
          res.data.forEach((item: { id: number; iteration_id: number }) => {
            if (item.iteration_id === id) {
              defaultCheck.value.push(item.id);
            }
          });
          treeData.value = res.data.map((item: { id: number; name: string }) => {
            return { id: item.id, label: item.name };
          });
          alreadyClick = true;
          store.commit(MutationType.iterateContentVisible, true);
          setTimeout(() => {
            alreadyClick = false;
          }, 1000);
        } else {
          treeData.value = [];
          defaultCheck.value = [];
        }
      });
    };

    // 关联需求后回调
    const getRelativeDate = (val: number[]) => {
      updateIterationDemand<ResponseParams.ResponseDataSuccess>({
        iteration_id: result.value.id,
        demand_ids: val
      }).then((res: any) => {
        if (res.code === 200) {
          dialogRelative.value = false;
          store.commit(MutationType.iterateContentVisible, false);
          getIterationDetail(currentIter.value?.id);
          tipMessage(200, "成功");
        }
      });
    };

    const handleDemandDetail = (demandId: number) => {
      const { id } = result.value.product;
      router.push({
        name: "demandPool",
        query: {
          productId: id,
          demandId: demandId,
          where: "iteration"
        }
      });
    };

    // 更新需求说明
    const onUpdateDemand = async (params: DemandReqItems) => {
      const data = await useUpdateDemand(params);
      return !!data;
    };

    const onSubmit = async (files: DemandReqItemsFile[]) => {
      const hasEmptyUrl = files.some((item) => item.type === 2 && !item.url);
      if (hasEmptyUrl) return ElMessage.warning("文件地址不能为空");
      const params = {
        category: 1,
        quote_id: currentIter.value?.id,
        docs: files
      };

      const isTrue = await onUpdateDemand(params);
      if (isTrue) visible2.value = false;
      getIterationDetail(currentIter.value?.id);
    };

    const showDemand = (type: 1 | 2) => {
      visible2.value = true;
      demandType.value = type;
    };
    return {
      testBillComp,
      currentIter,
      iterateContentVisible,
      demandType,
      showDemand,
      onSubmit,
      visible2,
      STATUS,
      getIterationDetail,
      isOk,
      result,
      dialogRef,
      handleChangeDialogStatus,
      docLists,
      handleConfirmChange,
      dialogDocInfo,
      docTypeFn,
      handleEditDoc,
      dialogVisible,
      btn_groups,
      progressData,
      updateStatusDialog,
      handleConfirmStatusChange,
      changeUpdateIterationStatus,
      status,
      REAL_STATUS,
      handleChangeRiskRemark,
      riskModal,
      riskWarningText,
      handleUpdateRiskWarning,
      getStageDate,
      handleRemoveFiles,
      handleSuccessFiles,
      api,
      changeDemandDoc,
      handleDownloadDoc,
      handleDemandDetail,
      checkInterStatus,
      handleProductWeekly,
      handleDemand,
      dialogVisibleDemand,
      demandList,
      hanldeLook,
      handleType,
      dialogRelative,
      handleRelativeDemand,
      getRelativeDate,
      addDemand,
      treeData,
      defaultCheck
    };
  }
});
</script>

<style lang="less" scoped>
.rp-container {
  height: calc(100% + 10px);
  padding-top: 10px;
  background: #fff;
  height: calc(100% - 20px);
  overflow: scroll;
  .main {
    height: 100%;
    overflow-x: hidden;
  }
}
.grid-container {
  display: grid;
  text-align: left;
  grid-template-columns: 40% 39% 19%;
  grid-template-rows: 380px 300px auto;
  grid-row-gap: 15px;
  grid-column-gap: 15px;
  :deep(.el-card) {
    text-align: left;
    height: 100%;
  }
  .btn-groups {
    text-align: center;
    padding-top: 18px;
  }
  .btn-groups__button {
    width: 130px;
    height: 40px !important;
    margin-bottom: 10px;
  }

  .flow-schedule {
    padding-top: 30px;
  }
  .progress {
    margin-top: 10px;
    display: flex;
    justify-content: space-around;
    .progress-item {
      position: relative;
      border-radius: 10px;
      box-sizing: border-box;
      padding: 10px 20px 0;
      text-align: left;
      flex: 0 0 24%;
      height: 170px;
      background: rgba(231, 248, 245);
    }
    .progress-item__progressText {
      color: #003300;
      i {
        font-weight: 700;
      }
      margin-right: 20px;
      font-weight: 700;
      font-size: 30px;
    }
    .progress-item__progressText--up {
      color: #009966;
    }
    .progress-title {
      font-size: 14px;
      margin: 0 6px;
      color: #a3a4a4;
    }
    .progress-item__progressText--down {
      color: #fe4066;
      font-size: 16px;
      margin-left: 6px;
    }
    .progress-item__icon {
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 60px;
      height: 60px;
      position: absolute;
      right: 22px;
      top: 40%;
      transform: translateY(-70%);
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
  .btn-style {
    background: #dbf3ee;
    &:hover {
      background: #75dec8;
      color: #fff;
      border-color: #75dec8;
    }
  }
  section {
    &:nth-child(1) {
      // 第一个方框左侧线在对其第一个
      grid-column-start: 1;
      grid-column-end: 3;
    }
    &:nth-child(3) {
      grid-column-start: 1;
      grid-column-end: 2;
    }
    &:nth-child(4) {
      grid-column-start: 2;
      grid-column-end: 2;
    }
    &:nth-child(7),
    &:nth-child(8) {
      grid-column-start: 1;
      grid-column-end: 4;
    }
  }
  .basic-info {
    margin-top: 20px;
    display: grid;
    grid-template-columns: 50% 50%;
    grid-template-rows: 55px 30px 80px;
    div {
      &:nth-child(5) {
        display: flex;
        justify-content: space-between;
        align-items: center;
        grid-column-start: 1;
        grid-column-end: 3;
        .basic-info__wrapper {
          display: flex;
          align-items: center;
        }
      }
      &:nth-child(6) {
        grid-column-start: 1;
        grid-column-end: 3;
      }
      span:nth-child(1) {
        font-weight: 700;
      }
    }
    .danger-remark {
      display: flex;
      align-items: center;
      span:nth-child(1) {
        width: 100px;
        display: inline-block;
        font-weight: 700;
      }
      span:last-child {
        white-space: pre-wrap;
        width: calc(100% - 100px);
        display: inline-block;
      }
    }
    .basic-info__person {
      font-size: 12px;
      line-height: 2px;
    }
    .basic-info__avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      margin-right: 10px;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .basic-info__job {
      font-size: 12px;
      color: #999;
      white-space: nowrap;
    }
    .overflow-hidden {
      opacity: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .iteration-content {
    li {
      list-style: initial !important;
      font-size: 14px;
      color: #3370ff;
      cursor: pointer;
      ol {
        line-height: 20px;
      }
    }
  }
  .assets {
    div {
      line-height: 50px;
      span:first-child {
        display: inline-block;
        width: 110px;
      }
      span:last-child {
        margin-left: 20px;
      }
    }
  }
  .demo-form-inline {
    margin-top: 20px;
    display: flex;
    :deep(.el-form-item) {
      display: flex;
      flex: 1;
    }
    :deep(.el-form-item__content) {
      flex: 1;
    }
  }
  .symbol {
    font-size: 18px;
  }
  .employee-management__wrapper {
    margin-top: -20px;
  }
  .assets_link_color {
    color: #3370ff;
  }
  .iterationTicket {
    background: #fffddc;
    color: #9a9100;
    &:hover {
      background: rgba(245, 189, 0, 0.5);
      color: #fff;
      border: 1px solid rgba(245, 189, 0, 0.5);
    }
  }
  .iteration__status {
    height: 32px;
    display: inline-block;

    .iter-status {
      font-size: 24px;
      color: #303133;
      position: relative;

      &:after {
        position: absolute;
        top: 43%;
        right: -30px;
        content: "";
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 12px 8px 0 8px;
        border-color: #222 transparent transparent transparent;
      }
      i {
        margin-left: 6px;
      }
    }
    &:hover {
      cursor: pointer;
    }
  }
}
.empty-block {
  height: calc(100% + 10px);
  margin-top: 15vh;
}
.position-tooltip {
  position: absolute;
  right: 26px;
  bottom: 150px;
}
.demand-list {
  max-height: 300px;
  overflow-y: scroll;
}
</style>

<style lang="less">
.iteration-list-select {
  .el-dropdown-menu__item {
    padding: 4px 20px !important;
  }
}
</style>
