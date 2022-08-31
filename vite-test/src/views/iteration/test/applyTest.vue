<template>
  <div class="container">
    <div class="main">
      <el-button type="primary" class="apply-test-btn" v-if="btnTextArr[status]" @click="handleApplyTest">{{ btnTextArr[status] }}</el-button>
      <el-button type="primary" class="apply-test-btn" v-if="status === 2" @click="handleRejectTest">驳回申请</el-button>
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
              <p>{{ TEST_STATUS[status].value }}</p>
            </div>
          </div>
          <div class="test-content-table">
            <div class="test-title">包含应用</div>
            <el-table :data="tableData" style="width: 100%">
              <el-table-column prop="id" label="ID" width="180"></el-table-column>
              <el-table-column prop="name" label="名称"></el-table-column>
              <el-table-column prop="branch" label="分支"></el-table-column>
              <el-table-column prop="remark" label="备注"></el-table-column>
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
            <el-input type="textarea" :disabled="show" :rows="2" placeholder="请输入测试注意事项" v-model="precaution"> </el-input>
          </div>
          <div class="test-careful">
            <div class="test-title">影响范围说明</div>
            <el-input type="textarea" :disabled="show" :rows="2" placeholder="请输入影响范围" v-model="influence"> </el-input>
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
              multiple
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
              {{ dateTime(item.create_time) }} <span v-html="item.content"></span> <span v-if="item.demand">提测需求：{{ item.demand }}。</span>
              <span v-if="item.remark">备注：{{ item.remark }}。</span>
            </p>
          </div>
          <el-empty v-else description="暂无记录" :image-size="100"></el-empty>
        </div>
      </div>
    </div>
    <el-dialog title="状态变更" v-model="dialogVisible" width="30%">
      <el-form :model="dialogFormParams" class="demand-form" label-width="66px">
        <div class="test-status-show">
          <div>
            <span>当前状态</span>
            <span> {{ TEST_STATUS[status] ? TEST_STATUS[status].value : "-" }}</span>
          </div>
          <div>
            <span>下阶段</span>
            <span v-if="reject">提测驳回</span>
            <span v-else>{{ TEST_STATUS[status + 1] ? TEST_STATUS[status + 1].value : "-" }}</span>
          </div>
        </div>
        <el-form-item label="备注">
          <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="dialogFormParams.remark"> </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleConfirmPostForm">提 交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { ref, reactive, defineComponent, watch, toRefs, getCurrentInstance } from "vue";
import api from "@/api/dict";
import useMixin from "../useMixin";
import fileSave from "@/utils/fileSave";
import { dateTime } from "@/utils/timeTransform";
import { getApplyTest, editApplyTest, ApplyTest } from "@/api/request-modules/test";
import { UploadFile, UploadImgStatus } from "@/types/upload";
import { ResponseParams } from "@/types/response";
import { RequestParams } from "@/types/request";
import useMessageTip from "@/composables/useMessageTip";
import { TEST_STATUS } from "@/utils/contantOptions";

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
    const btnTextArr = ["申请提测", "重新提测", "接受提测", "测试完成", "申请发布", "发布完成"];
    const { tipMessage } = useMessageTip();
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
      status: 0
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

    const tree = ref<null | { getCheckedNodes: () => null; getCheckedKeys: () => null; setCheckedKeys: (parmas: any) => [] }>(null);
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
      editParams.attach_list = attachList.value; // 将修改配置文件赋值给editParams
      if (tree.value) editParams.demand_ids = tree.value.getCheckedKeys() || [];
      editApplyTest<ResponseParams.ResponseDataSuccess>(editParams).then(() => {
        getData(dialogFormParams);
      });
    };
    // 弹框参数和请求迭代数据 公用 (只用到id)
    const dialogFormParams = reactive<RequestParams.EditApplyTest>({
      id: 0,
      remark: "",
      to_status: 0
    });
    // 点击文件，下载文件信息
    const handlePreview = (file: UploadFile) => {
      if (file.url) fileSave(file.name, file.url);
      if (file.response) fileSave(file.name, file.response?.url);
    };
    // 文件上传之后 获取文件信息
    const handleSuccess = ({ status, response }: UploadFile) => {
      if (status === UploadImgStatus.success) {
        if (response) {
          const obj: RequestParams.AttachList = {
            id: 0,
            name: response.filename,
            size: response.size,
            url: response.url
          };
          attachList.value.push(obj);
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
        getData(dialogFormParams);
      });
    };

    // 是否有驳回申请按钮，有则在弹框---下阶段显示提测驳回
    const reject = ref(false);

    // 弹框显示 申请提测 接受提测 待测试 测试中 测试完成 已发布
    const handleApplyTest = () => {
      reject.value = false;
      dialogFormParams.to_status = statusId.value + 1;
      dialogFormParams.remark = "";
      dialogVisible.value = true;
    };
    // 驳回申请
    const handleRejectTest = () => {
      dialogFormParams.to_status = 1;
      dialogFormParams.remark = "";
      dialogVisible.value = true;
      reject.value = true;
    };
    // 获取数据
    const getData = (dialogFormParams: RequestParams.EditApplyTest) => {
      show.value = true;
      isEdit.value = false;
      getApplyTest<ResponseParams.ResponseDataSuccess>(dialogFormParams).then((res: any) => {
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

          statusId.value = testData.status;

          demandParams.product_id = testData.product_id;
          demandParams.plan_id = testData.plan_id;
          logList.value = testData.log_list;

          originDemandList.value = testData.demand_list;

          attachList.value = testData.attach_list;
          checkedArr.value = []; // 清空选中状态
          if (tree.value) tree.value?.setCheckedKeys([]); // 清空
          demandTree(testData.demand_list, true); // 遍历数据
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
          disabled: isDisable
        });
        obj.id = list[i].id;
        obj.label = list[i].name;
        obj.locked = list[i].locked;
        if (list[i].locked) obj.disabled = true;
        if (list[i].checked) checkedArr.value.push(list[i].id);
        if (list[i].child_list?.length) obj.children = returnList(list[i].child_list!, isDisable);
        arr.push(obj);
      }
      return arr;
    };

    const { searchParams } = useMixin();
    watch(
      searchParams,
      (newVal) => {
        dialogFormParams.id = Number(newVal.demand);
        editParams.id = Number(newVal.demand);
        getData(dialogFormParams);
      },
      { immediate: true }
    );
    return {
      isEdit,
      btnTextArr,

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
      apiUrl
    };
  }
});
</script>
<style scoped lang="less">
.main {
  padding: 22px 12px;
  // height: calc(100vh - 180px);
  overflow-y: auto;
  border-radius: 8px;
  background-color: #ebf8f6;
  .apply-test-btn {
    float: right;
    margin-top: -10px;
    margin-left: 10px;
  }
  .apply-test-content {
    display: flex;
    justify-content: space-between;
    margin-top: 34px;
    height: calc(100% - 34px);
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
::v-deep(.upload-demo) {
  position: relative;
}
::v-deep(.el-upload--text) {
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
  ::v-deep(.el-form-item) {
    display: flex;
  }
  ::v-deep(.el-form-item__content) {
    flex-grow: 1;
  }
  ::v-deep(.el-select) {
    width: 100%;
  }
}
</style>
