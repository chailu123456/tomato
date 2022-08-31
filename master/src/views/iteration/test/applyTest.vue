<template>
  <div class="container">
    <!-- <el-skeleton animated></el-skeleton> -->
    <div class="main" v-if="isHasDate">
      <!-- <back-btn style="opacity: 0"></back-btn> -->
      <div class="rp-test-status">
        <div v-if="iteration_status == 2 && status === 0">
          <el-button type="primary" class="apply-test-btn" :disabled="iteration_status === 7" @click="handleStart">开始联调</el-button>
        </div>
        <div v-if="iteration_status == 3 && status === 0">
          <el-button type="primary" class="apply-test-btn" :disabled="complete_percent !== 100">申请提测</el-button>
          <el-button type="primary" class="apply-test-btn" @click="handleUnion(0)">联调中 ({{ complete_percent }}%)</el-button>
        </div>

        <div v-if="iteration_status == 8 && status === 0">
          <el-button type="primary" class="apply-test-btn" :disabled="iteration_status === 7" @click="handleApplyTest">申请提测</el-button>
          <el-button type="primary" class="apply-test-btn" :disabled="true">联调完成 (100%)</el-button>
        </div>
        <div v-if="iteration_status == 3 && status === 1">
          <el-button type="primary" class="apply-test-btn" :disabled="iteration_status === 7" @click="handleApplyTest">申请提测</el-button>
          <el-button type="primary" class="apply-test-btn" :disabled="true">联调完成 (100%)</el-button>
        </div>

        <div v-if="status == 2">
          <el-button type="primary" class="apply-test-btn" :disabled="iteration_status === 7" @click="handleApplyTest">接受提测</el-button>
          <el-button type="primary" class="apply-test-btn" :disabled="iteration_status === 7" @click="handleRejectTest">驳回申请</el-button>
        </div>

        <div v-if="iteration_status == 4">
          <el-button type="primary" class="apply-test-btn" :disabled="complete_percent !== 100">申请发布</el-button>
          <el-button type="primary" class="apply-test-btn" @click="handleUnion(1)">测试中 ({{ complete_percent }}%)</el-button>
        </div>

        <div v-if="iteration_status == 5 && (status == 4 || status == 3)">
          <el-button type="primary" class="apply-test-btn" :disabled="iteration_status === 7" @click="handleApplyTest">申请发布</el-button>
          <el-button type="primary" class="apply-test-btn" :disabled="true">测试进度 (100%)</el-button>
        </div>
        <!-- <div v-if="status == 4">
          <el-button type="primary" :disabled="iteration_status === 7" class="apply-test-btn" @click="handleApplyTest">发布完成</el-button>
        </div> -->
        <div v-if="status == 5">
          <el-button type="primary" class="apply-test-btn" :disabled="iteration_status === 7" @click="handleApplyTest">发布完成</el-button>
        </div>
      </div>
      <div class="apply-test-content">
        <div class="test-content-left">
          <div class="test-content-title">
            <ul class="content-title-msg">
              <li>
                <span>迭代名称</span>
                <span>{{ name }}</span>
              </li>
              <li>
                <span>计划版本</span>
                <span>{{ plan_version }}</span>
              </li>
              <li>
                <span>计划名称</span>
                <span>{{ plan_name }}</span>
              </li>
              <li>
                <span>所属项目</span>
                <span>{{ product_name }}</span>
              </li>
              <li>
                <span>提测人</span>
                <span>{{ apply_staff || "-" }}</span>
              </li>
              <li>
                <span>提测时间</span>
                <span>{{ apply_time || "-" }}</span>
              </li>
            </ul>
            <div class="test-status">
              <p>状态</p>
              <p v-if="iteration_status === 2">开发中</p>
              <p v-if="iteration_status === 3 && status != 1">联调中</p>
              <p v-if="status == 1">待提测</p>
              <p v-if="iteration_status > 3">{{ iteration_status === 5 ? "待发布" : TEST_STATUS[status].value }}</p>
            </div>
          </div>
          <div class="test-content-table">
            <div class="test-title">包含应用</div>
            <el-table :data="tableData" style="width: 100%">
              <el-table-column prop="id" label="ID" width="180"></el-table-column>
              <el-table-column prop="name" class-name="table-column-left" label="名称"></el-table-column>
              <el-table-column prop="branch" label="分支"></el-table-column>
              <el-table-column prop="remark" class-name="table-column-left" label="备注"></el-table-column>
            </el-table>
          </div>
          <div class="operation-demand">
            <div v-if="TEST_STATUS[status].value != '已发布'">
              <el-button type="primary" v-if="show" class="apply-btn" @click="handleEdit">编 辑</el-button>
              <el-button type="primary" v-if="!show" class="apply-btn" @click="handlePreserve">保 存</el-button>
              <el-button class="apply-btn" v-if="!show" @click="handleCancel">取 消</el-button>
            </div>
            <div class="test-requirements">
              <div class="test-title">提测需求</div>
              <div class="test-slide">
                <el-tree :data="demandDataTree" ref="tree" node-key="id" show-checkbox default-expand-all :default-checked-keys="checkedArr"></el-tree>
              </div>
            </div>
          </div>
          <div class="test-careful">
            <div class="test-title">测试注意事项说明</div>
            <el-input type="textarea" :disabled="show" :autosize="{ minRows: 5 }" placeholder="请输入测试注意事项" v-model="precaution"> </el-input>
          </div>
          <div class="test-careful">
            <div class="test-title">影响范围说明</div>
            <el-input type="textarea" :disabled="show" :autosize="{ minRows: 3 }" placeholder="请输入影响范围" v-model="influence"> </el-input>
          </div>
          <div class="test-careful">
            <div class="test-title">参数及相关配置</div>
            <el-upload
              class="upload-demo"
              :disabled="show"
              :action="apiUrl"
              :on-remove="handleRemove"
              :on-preview="handlePreview"
              :before-remove="beforeRemove"
              :on-change="handleSuccess"
              :file-list="attachList"
            >
              <el-button size="small" v-if="!show" type="primary">上传文件</el-button>
            </el-upload>
            <p v-if="!attachList.length" style="color: #909399; font-size: 14px; text-align: center">暂无相关参数及配置</p>
          </div>
        </div>
        <div class="test-content-right">
          <div class="test-title" style="margin-top: 0">单据记录</div>
          <div class="log-list" v-if="logList.length">
            <p v-for="(item, index) in logList" :key="index">
              {{ dateTime(item.create_time) }} <span v-html="item.content"></span>
              <span v-if="item.demand">提测需求：{{ item.demand }}。</span>
              <span v-if="item.remark">备注：{{ item.remark }}。</span>
            </p>
          </div>
          <el-empty v-else description="暂无记录" :image-size="100"></el-empty>
        </div>
      </div>
    </div>
    <div v-else>
      <el-empty description="暂无数据"></el-empty>
    </div>
    <!-- 编辑状态框 -->
    <el-dialog center :title="dialogFormDataTitle" v-model="isOpenEditProgress" width="30%">
      <div>
        <el-form label-width="80px" :model="dialogFormData">
          <el-form-item label="当前状态">
            <p style="margin-top: 2px">{{ currentStatus }}</p>
          </el-form-item>
          <el-form-item label="进度">
            <el-input-number @change="handleChangeInputNumber" step-strictly v-model="dialogFormData.complete_percent" :min="0" :max="100"></el-input-number>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="isOpenEditProgress = false">取 消</el-button>
          <el-button type="primary" v-debounce @click="handleUpdateStatus">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog title="状态变更" v-model="dialogVisible" width="30%">
      <el-form :model="dialogFormParams" class="demand-form" label-width="68px">
        <div class="test-status-show">
          <div>
            <span>当前状态</span>
            <span> {{ TEST_STATUS[status] ? TEST_STATUS[status].value : "-" }}</span>
          </div>
          <div>
            <span>下阶段</span>
            <span v-if="reject">待提测</span>
            <span v-else>
              <span v-if="status === 0">{{ TEST_STATUS[status + 2] ? TEST_STATUS[status + 2].value : "-" }}</span>
              <span v-else>{{ TEST_STATUS[status + 1] ? TEST_STATUS[status + 1].value : "-" }}</span>
            </span>
          </div>
        </div>
        <el-form-item label="备注">
          <el-input type="textarea" :rows="5" placeholder="请输入内容" v-model="dialogFormParams.remark"> </el-input>
        </el-form-item>
        <el-form-item label="添加抄送">
          <el-button icon="el-icon-user" @click="handleAddPeople">添 加</el-button>
        </el-form-item>
        <div class="rp-people-list">
          <span v-for="(item, index) in selectPerson" :class="item.is_sys ? 'people-check' : 'people-default-check'" :key="index">{{ item.staff_name }}</span>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseDialog">取 消</el-button>
          <el-button type="primary" :disabled="!dialogVisible" @click="handleConfirmPostForm">提 交</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog title="添加成员" custom-class="position-dialog" v-model="dialogShadow" width="40%">
      <div class="load-container" v-if="!allPeople">
        <div class="load"></div>
      </div>
      <div v-else>
        <el-input placeholder="输入姓名查找" v-model="filterText"> </el-input>
        <el-scrollbar height="400px">
          <el-tree
            @check="handleCheckBoxEventByText"
            node-key="id"
            default-expand-all
            show-checkbox
            :data="allPeople"
            :default-checked-keys="checkedKeys"
            :filter-node-method="filterNode"
            ref="keywordTreeRef"
          ></el-tree>
        </el-scrollbar>
      </div>
      <div>
        <el-divider direction="vertical"></el-divider>
      </div>
      <div>
        <el-scrollbar height="400px">
          <div v-for="(item, index) in selectPerson" :key="index" class="current-checked-nodes">
            <el-button icon="el-icon-user-solid" type="text">{{ item.staff_name }}</el-button>
            <i v-if="!item.is_sys" style="margin-right: 10px" class="el-icon-close" @click="deleteCheckedKeys(item, index)"></i>
          </div>
        </el-scrollbar>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" :disabled="!dialogShadow" @click="handleShadow">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { ref, reactive, defineComponent, watch, toRefs, onActivated, getCurrentInstance, nextTick, computed } from "vue";
import api from "@/api/dict";
import { store } from "@/store";
import useMixin from "../useMixin";
import fileSave from "@/utils/fileSave";
import { dateTime } from "@/utils/timeTransform";
import { getApplyTest, editApplyTest, ApplyTest, startUnion, updateTestProgress, updateProgress } from "@/api/request-modules/test";
import { UploadFile, UploadImgStatus } from "@/types/upload";
import { ResponseParams } from "@/types/response";
import { getDepartmentListPeople } from "@/api/request-modules/common";
import { RequestParams } from "@/types/request";
import useMessageTip from "@/composables/useMessageTip";
import { TEST_STATUS, STATUS } from "@/utils/contantOptions";
import { useRoute, useRouter } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
type AppInclude = {
  id: number;
  branch: string;
  code_language: string;
  git_url: string;
  name: string;
  remark: string;
  run_env: number;
};

type LogList = {
  id: number;
  content: string;
  create_time: string;
  demand: string;
  remark: string;
  staff_no: string;
  iteration_id: number;
};

type ParameConfig = {
  id: number;
  create_time?: string | undefined;
  name: string;
  url: string;
  iteration_id?: number | undefined;
  size?: number;
};

type ReturnDemandTree = {
  id: number;
  name: string;
  is_product?: boolean;
  locked?: boolean;
  checked?: boolean;
  child_list?: ReturnChildren[] | null;
};
type ReturnChildren = {
  id: number;
  name: string;
  is_product: boolean;
  locked?: boolean;
  checked?: boolean;
  child_list?: ReturnChildren[] | null;
};

type Children = {
  id: number;
  label: string;
  disabled?: boolean;
  locked?: boolean;
  children?: Children[] | null;
};

type DemandDataTree = {
  id: number;
  label: string;
  disabled?: boolean;
  locked?: boolean;
  children?: Children[] | null;
};

export default defineComponent({
  name: "applyTest",
  setup() {
    const { searchParams } = useMixin();

    const isHasDate = ref(true);

    const route = useRoute();
    const router = useRouter();
    const btnTextArr = ["申请提测", "重新提测", "接受提测", "测试完成", "申请发布", "发布完成"];
    const { tipMessage } = useMessageTip();
    const currentIter = computed(() => store?.getters?.currentIter);
    // 是否可编辑
    const isEdit = ref(false);
    const dialogVisible = ref<boolean>(false);
    // 迭代名称、时间、计划版本测试注意事项等等
    const applyTestData = reactive({
      apply_staff: "",
      apply_time: "",
      influence: "",
      name: "",
      plan_id: "",
      plan_name: "",
      plan_version: "",
      precaution: "",
      product_name: "",
      status: 0,
      complete_percent: null,
      iteration_status: 0
    });
    // 包含应用表格
    const tableData = ref<AppInclude[]>([]);
    // 单据记录
    const logList = ref<LogList[]>([]);
    // 参数及相关配置
    const attachList = ref<ParameConfig[]>([]);
    // 提测需求
    const originDemandList = ref<ReturnChildren[]>();
    const demandDataTree = ref<DemandDataTree[]>([]);
    const defaultProps = {
      children: "children",
      label: "label"
    };

    const dialogFormDataTitle = ref("联调进度");
    const currentStatus = ref("联调中");
    const dialogFormData = reactive<any>({
      iteration_status: null,
      iteration_id: null,
      complete_percent: 0
    });
    const currentIterationId = reactive<{ iteration_id: number }>({
      iteration_id: 0
    });
    let isOpenEditProgress = ref(false);
    const handleStart = () => {
      startUnion<ResponseParams.ResponseDataSuccess>(currentIterationId).then((res: Record<string, any>) => {
        if (res.code === 1001) {
          ElMessageBox.confirm(`${res.message}，是否前去添加排期？`, "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
            .then(() => {
              router.push({
                name: "homepage",
                params: {
                  code: 1001
                }
              });
            })
            .catch(() => {
              ElMessage({
                type: "info",
                message: "已取消"
              });
            });
        }
        if (res.code === 200) getData(dialogFormParams);
      });
    };

    const handleUnion = (val: number) => {
      if (val) {
        dialogFormDataTitle.value = "测试进度";
        currentStatus.value = "测试中";
      }
      isOpenEditProgress.value = true;
    };

    const handleChangeInputNumber = (currentValue: number) => {
      // change
      if (dialogFormDataTitle.value === "测试进度") {
        if (currentValue === 100) currentStatus.value = "测试完成";
      } else if (currentValue === 100) currentStatus.value = "联调完成";
    };

    const handleUpdateStatus = () => {
      if (dialogFormData.iteration_status === 4) {
        updateProgress<ResponseParams.ResponseDataSuccess>(dialogFormData).then((res) => {
          if (res.code === 200) {
            isOpenEditProgress.value = false;
            getData(dialogFormParams);
          }
        });
      } else {
        updateTestProgress<ResponseParams.ResponseDataSuccess>(dialogFormData).then((res) => {
          if (res.code === 200) {
            isOpenEditProgress.value = false;
            getData(dialogFormParams);
          }
        });
      }
    };

    // 编辑完提交参数
    const editParams = reactive<RequestParams.EditDemand>({
      id: 0,
      attach_list: [],
      demand_ids: [],
      influence: "",
      precaution: ""
    });

    // 上传地址
    const apiUrl = ref("");
    apiUrl.value = api.uploadAssets;

    const tree = ref<null | {
      getCheckedNodes: () => null;
      getCheckedKeys: () => null;
      setCheckedKeys: (parmas: any) => [];
    }>(null);
    // 联级菜单选中id
    const checkedArr = ref<number[]>([]);
    const demandParams = reactive<RequestParams.GetRelevanceDemandList>({
      product_id: 0,
      plan_id: 0,
      is_bind: true
    });
    const show = ref<boolean>(true);

    const handleEdit = () => {
      show.value = false;
      isEdit.value = true;
      // 开启树形控件可选功能
      demandTree(originDemandList.value, false);
    };
    const handleCancel = () => {
      getData(dialogFormParams);
      show.value = true;
      isEdit.value = false;
      // 关闭树形控件可选功能
      demandTree(originDemandList.value, true);
    };
    // 保存---->>>(提测需求，测试注意事项说明，影响范围说明，参数及相关配置)
    const handlePreserve = () => {
      show.value = true;
      editParams.influence = applyTestData.influence;
      editParams.precaution = applyTestData.precaution;
      editParams.demand_ids = Array.from(new Set(editParams.demand_ids));
      editParams.attach_list = attachList.value; // 将修改配置文件赋值给editParams
      // if (tree.value) editParams.demand_ids = tree.value.getCheckedKeys() || [];
      editApplyTest<ResponseParams.ResponseDataSuccess>(editParams).then(() => {
        getData(dialogFormParams);
      });
    };
    // 弹框参数和请求迭代数据 公用 (只用到id)
    const dialogFormParams = reactive<RequestParams.EditApplyTest>({
      id: 0,
      remark: "",
      to_status: 0,
      notify_list: []
    });
    // 点击文件，下载文件信息
    const handlePreview = (file: UploadFile) => {
      if (file.url) fileSave(file.name, file.url);
      if (file.response) fileSave(file.name, file.response?.url);
    };
    // 文件上传之后 获取文件信息
    const handleSuccess = ({ status, response }: UploadFile) => {
      if (status === UploadImgStatus.success) {
        if (response && response.url) {
          const obj: RequestParams.AttachList = {
            id: 0,
            name: response.filename,
            size: response.size,
            url: response.url
          };
          attachList.value.push(obj);
        } else {
          return tipMessage(500, "上传文件失败，请重新上传");
        }
      }
      if (status === UploadImgStatus.fail) return tipMessage(500, "上传失败，请重新上传");
    };
    const internalInstance = getCurrentInstance();
    const global: any = internalInstance?.appContext.config.globalProperties;
    // 删除文件，获取文件信息
    const beforeRemove = (file: UploadFile) => {
      return global.$confirm(`确定移除 ${file.name}？`);
    };
    // 删除文件，获取文件信息
    const handleRemove = (file: UploadFile) => {
      attachList.value = attachList.value.filter((item) => item.url != file.url);
      editParams.attach_list = attachList.value;
    };
    // 状态id
    const statusId = ref(0);
    // 弹框 提交保存
    const handleConfirmPostForm = () => {
      dialogVisible.value = false;
      ApplyTest<ResponseParams.ResponseDataSuccess>(dialogFormParams).then(() => {
        tipMessage(200, "成功");
        getData(dialogFormParams);
      });
    };

    onActivated(() => {
      getData(dialogFormParams);
    });

    // 添加抄送
    const dialogShadow = ref(false);

    // 成员列表
    const allPeople = ref();
    const handleConditionSearch = (val: any) => {
      console.log(val);
    };
    const filterText = ref();
    // 抄送人员列表
    let selectPerson = ref<Array<Record<string, any>>>([]);
    // 备份默认抄送人员列表
    let oldSelectPerson = JSON.stringify([]);

    let checkedKeys = ref(["zhangsan", "libai"]);
    const keywordTreeRef = ref();
    // 文字搜索时候点击的
    const handleCheckBoxEventByText = () => {
      selectPerson.value = [];
      // 获取当前节点状态
      const allCheckNodes = keywordTreeRef?.value.getCheckedNodes();

      if (allCheckNodes && allCheckNodes.length) {
        allCheckNodes.forEach((item: Record<string, any>) => {
          if (!item.children?.length) {
            selectPerson.value.push(item);
          }
        });
      }
      // console.log(keywordTreeRef?.value.getCheckedNodes(), "---getCheckedNodes----");
      // console.log("选中值");

      // console.log(selectPerson.value);
      selectPerson.value = selectPerson.value.map((o) => {
        return { staff_name: o.label, staff_no: o.id, is_sys: o.is_sys };
      });

      dialogFormParams.notify_list = selectPerson.value;
    };
    // 删除成员
    const deleteCheckedKeys = (item: Record<string, any>, index: number) => {
      selectPerson.value.splice(index, 1);
      dialogFormParams.notify_list = selectPerson.value;
      nextTick(() => {
        keywordTreeRef?.value.setCheckedKeys(selectPerson.value.map((v) => v.staff_no));
      });
    };
    //成员 搜索 过滤
    const filterNode = (value: any, data: any) => {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    };
    watch(
      () => filterText.value,
      (newValue) => {
        keywordTreeRef?.value.filter(newValue);
      }
    );
    watch(
      () => route.query.bugId,
      (newValue) => {
        if (newValue) {
          dialogFormParams.id = +newValue;
          getData(dialogFormParams);
        }
      }
    );

    // 弹框 --取消操作
    const handleCloseDialog = () => {
      dialogVisible.value = false;
      selectPerson.value = JSON.parse(oldSelectPerson);
    };
    let allGetPeople: any = [];
    // 添加抄送
    const handleAddPeople = () => {
      dialogShadow.value = true;
      // 采用延迟加载 数据量大
      setTimeout(() => {
        allPeople.value = allGetPeople;
      }, 100);
    };

    // 添加成员弹框---确定
    const handleShadow = () => {
      dialogShadow.value = false;
    };
    // 是否有驳回申请按钮，有则在弹框---下阶段显示提测驳回
    const reject = ref(false);

    // 弹框显示 申请提测 接受提测 待测试 测试中 测试完成 已发布
    const handleApplyTest = () => {
      reject.value = false;
      dialogFormParams.to_status = statusId.value === 0 ? statusId.value + 2 : statusId.value + 1;
      dialogFormParams.remark = "";
      dialogVisible.value = true;
      selectPerson.value = JSON.parse(oldSelectPerson);
    };
    // 驳回申请
    const handleRejectTest = () => {
      dialogFormParams.to_status = 1;
      dialogFormParams.remark = "";
      dialogVisible.value = true;
      reject.value = true;
      selectPerson.value = JSON.parse(oldSelectPerson);
    };
    // 获取数据
    const getData = (dialogFormParams: RequestParams.EditApplyTest) => {
      if (!dialogFormParams.id) return;

      show.value = true;
      isEdit.value = false;
      editParams.demand_ids = [];
      if (!dialogFormParams.id) return;
      getApplyTest<ResponseParams.ResponseDataSuccess>(dialogFormParams).then((res: any) => {
        checkedKeys.value = [];
        if (res.data) {
          const testData = res.data;
          tableData.value = testData.app_list;
          applyTestData.apply_staff = testData.apply_staff;
          applyTestData.apply_time = testData.apply_time;
          applyTestData.influence = testData.influence;
          applyTestData.name = testData.name;
          applyTestData.plan_name = testData.plan_name;
          applyTestData.plan_id = testData.plan_id;
          applyTestData.plan_name = testData.plan_name;
          applyTestData.plan_version = testData.plan_version;
          applyTestData.precaution = testData.precaution;
          applyTestData.product_name = testData.product_name;
          applyTestData.status = testData.status;
          applyTestData.iteration_status = testData.iteration_status;
          applyTestData.complete_percent = testData.complete_percent;

          statusId.value = testData.status;
          if (testData.status === 3) statusId.value = 4;
          currentIterationId.iteration_id = testData.id;

          demandParams.product_id = testData.product_id;
          demandParams.plan_id = testData.plan_id;
          logList.value = testData.log_list;

          dialogFormData.complete_percent = testData.complete_percent;
          dialogFormData.iteration_id = testData.id;
          dialogFormData.iteration_status = testData.iteration_status;

          // 推送人
          selectPerson.value = testData.notify_list;
          testData.notify_list.forEach((item: any) => {
            checkedKeys.value.push(item.staff_no);
          });
          dialogFormParams.notify_list = selectPerson.value;
          oldSelectPerson = JSON.stringify(testData.notify_list);

          originDemandList.value = testData.demand_list;
          getPeople();

          attachList.value = testData.attach_list;
          checkedArr.value = []; // 清空选中状态
          if (tree.value) tree.value?.setCheckedKeys([]); // 清空
          demandTree(testData.demand_list, true); // 遍历数据
        } else {
          console.log(22);
        }
      });
    };
    const demandTree = (parmas: any, isDisable: boolean) => {
      demandDataTree.value = [];
      demandDataTree.value = returnList(parmas, isDisable);
    };
    const returnList = (list: ReturnDemandTree[], isDisable: boolean) => {
      let arr = [];
      for (let i = 0; i < list.length; i += 1) {
        const obj = reactive<DemandDataTree>({
          id: 0,
          label: "",
          disabled: true
        });
        obj.id = list[i].id;
        editParams.demand_ids.push(list[i].id);
        obj.label = list[i].name;
        obj.locked = list[i].locked;
        if (list[i].locked) obj.disabled = true;
        // if (list[i].checked) checkedArr.value.push(list[i].id);
        checkedArr.value.push(list[i].id);
        if (list[i].child_list?.length) obj.children = returnList(list[i].child_list!, isDisable);
        arr.push(obj);
      }
      return arr;
    };

    const getPeople = () => {
      getDepartmentListPeople().then((res: any) => {
        allGetPeople = dataReverse(res.data);
      });
    };
    const dataReverse = (people: Array<Record<string, any>>) => {
      let defaultCheck = JSON.parse(oldSelectPerson);
      let newArr = [];
      for (let i = 0; i < people.length; i += 1) {
        let obj: Record<string, any> = {};
        obj.id = people[i].id;
        obj.label = people[i].label;
        obj.is_sys = false;
        obj.disabled = false;
        defaultCheck.forEach((item: Record<string, any>) => {
          if (item.staff_no == people[i].id && item.is_sys) {
            obj.is_sys = true;
            obj.disabled = true;
          }
        });
        if (people[i].children && people[i].children.length) {
          obj.children = dataReverse(people[i].children);
        }
        newArr.push(obj);
      }
      return newArr;
    };
    watch(
      currentIter,
      (newVal) => {
        if (newVal.id) {
          isHasDate.value = true;

          dialogFormParams.id = Number(newVal.demand);
          editParams.id = Number(newVal.demand);
          console.log(dialogFormParams);
          console.log(dialogFormParams);
          console.log(dialogFormParams);
          getData(dialogFormParams);
        } else {
          isHasDate.value = false;
          console.log(777);
        }
      },
      { immediate: true }
    );
    return {
      isEdit,
      btnTextArr,
      isHasDate,
      dialogVisible,
      dialogFormParams,
      handleConfirmPostForm,
      handleApplyTest,
      handleRejectTest,
      getData,
      demandDataTree,
      defaultProps,
      tableData,
      show,
      checkedArr,
      tree,
      handleEdit,
      handleCancel,
      handlePreserve,
      ...toRefs(applyTestData),
      logList,
      attachList,
      dateTime,
      reject,

      TEST_STATUS,

      handlePreview,
      beforeRemove,
      handleRemove,
      handleSuccess,
      apiUrl,

      handleCloseDialog,
      handleAddPeople,
      dialogShadow,
      allPeople,
      handleConditionSearch,
      handleCheckBoxEventByText,
      checkedKeys,
      handleShadow,
      selectPerson,
      deleteCheckedKeys,
      keywordTreeRef,
      filterText,
      filterNode,

      handleStart,
      handleUnion,
      isOpenEditProgress,
      dialogFormData,
      handleUpdateStatus,
      STATUS,
      dialogFormDataTitle,
      handleChangeInputNumber,
      currentStatus
    };
  }
});
</script>
<style scoped lang="less">
.main {
  height: 98%;
  width: calc(100% - 26px);
  padding: 10px 12px;
  overflow-y: auto;
  border-radius: 8px;
  box-sizing: border-box;
  .rp-test-status {
    float: right;
  }
  .apply-test-btn {
    float: right;
    margin-right: 16px;
  }
  .apply-test-content {
    display: flex;
    justify-content: space-between;
    // margin-top: 20px;
    height: calc(100% - 20px);
    .test-content-left {
      padding: 20px;
      width: calc(68% - 40px);
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 2px 2px 5px #ccc;
      .test-content-title {
        display: flex;
        justify-content: space-between;
        .content-title-msg {
          width: 88%;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          align-items: center;
          li {
            width: 33%;
            line-height: 34px;
            span:first-child {
              font-size: 12px;
            }
            span:last-child {
              font-weight: 700;
              margin-left: 16px;
              color: @rp-color-text-primary;
            }
          }
        }
        .test-status {
          width: 10%;
          p:first-child {
            font-size: 12px;
          }
          p:last-child {
            font-weight: 700;
            font-size: 18px;
            color: @rp-color-background;
          }
        }
      }
      .operation-demand {
        .apply-btn {
          float: right;
          margin-left: 10px;
          margin-top: 10px;
        }
        .test-requirements {
          .test-slide {
            margin-top: 10px;
            margin-left: 0px;
          }
        }
      }
      .test-careful {
        :deep(.el-textarea__inner) {
          color: @rp-color-text-primary;
        }
      }
    }
    .test-content-right {
      padding: 20px;
      width: calc(32% - 60px);
      border-radius: 8px;
      background-color: #fff;
      box-shadow: 2px 2px 5px #ccc;
      p {
        font-size: 14px;
      }
      .log-list {
        height: calc(100% - 60px);
        overflow: auto;
      }
    }
  }
  .test-title {
    margin-top: 10px;
    line-height: 40px;
    color: @rp-color-text-title;
    font-weight: 700;
  }
}
:deep(.upload-demo) {
  position: relative;
}
:deep(.el-upload--text) {
  position: absolute;
  top: -40px;
  right: 0;
}
.demand-form {
  .test-status-show {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    div {
      span:first-child {
        color: #606266;
        font-weight: 700;
        margin-right: 12px;
      }
    }
  }
  .rp-people-list {
    span {
      display: inline-block;
      padding: 4px 8px;
      margin: 2px 4px;
      font-size: 12px;
      border-radius: 4px;
      color: #606266;
      background: #f1f1f1;
    }
    span.people-default-check {
      background: #cfe8e3;
    }
  }

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
:deep(.position-dialog) {
  .el-dialog__body {
    position: relative;
    display: flex;
    div {
      &:nth-child(1) {
        flex: 0 0 48%;
      }
      &:nth-child(2) {
        .el-divider--vertical {
          height: 100%;
        }
      }
      &:nth-child(3) {
        flex: 0 0 48%;
      }
    }
    .current-checked-nodes {
      display: flex;

      align-items: center;
      justify-content: space-between;
      i {
        cursor: pointer;
        &:hover {
          color: @rp-color-danger;
        }
      }
    }
  }
  .load-container {
    transform: scale(0.2);
    width: 200px;
    height: 200px;
    position: relative;
    margin: 60px auto;
  }

  .load {
    width: 150px;
    height: 150px;
    border: 20px solid #f3f3f3;
    border-top: 20px solid #0dc5c1;
    border-radius: 50%;
    animation: loading 1.2s infinite linear;
  }

  @keyframes loading {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
