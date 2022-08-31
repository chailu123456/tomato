<template>
  <div class="container">
    <div class="main">
      <backBtn></backBtn>
      <el-divider style="margin: 0 20px" direction="vertical"></el-divider>
      <el-button type="primary" v-debounce @click="handleConfirmSave">保 存</el-button>
      <el-button type="primary" v-if="!isEdit" style="float: right" @click="handleExport">快捷导入</el-button>

      <el-table :data="tableData">
        <el-table-column type="index" v-if="!isEdit" width="50" label="序号"></el-table-column>
        <el-table-column prop="id" v-if="isEdit" label="ID" width="90"> </el-table-column>
        <el-table-column prop="name" class-name="table-column-left" label="用例名称" width="350">
          <template #default="scoped">
            <el-input
              v-model="scoped.row.name"
              type="textarea"
              maxlength="100"
              :autosize="{ minRows: 2, maxRows: 4 }"
              placeholder="请输入不超过100字的用例标题"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="用例类型" width="130">
          <template #default="scoped">
            <el-select v-model="scoped.row.type" placeholder="请选择" :disabled="scoped.row.is_sys">
              <div v-if="scoped.$index == 0">
                <el-option v-for="item in CASE_STATUS" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </div>
              <div v-else>
                <el-option v-for="item in CASE_STATUS_LAST" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </div>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="用例等级" width="130">
          <template #default="scoped">
            <el-select v-model="scoped.row.level" placeholder="请选择" :disabled="scoped.row.is_sys">
              <div v-if="scoped.$index == 0">
                <el-option v-for="item in CASEPRIORITY" :key="item.value" :label="item.value" :value="item.id"> </el-option>
              </div>
              <div v-else>
                <el-option v-for="item in CASE_PRIORITY_LAST" :key="item.value" :label="item.value" :value="item.id"> </el-option>
              </div>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="premise" label="前提">
          <template #default="scoped">
            <el-input
              placeholder="请输入1-300字"
              type="textarea"
              :rows="3"
              :disabled="scoped.row.is_sys"
              v-model="scoped.row.premise"
              maxlength="300"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="input" label="输入">
          <template #default="scoped">
            <el-input placeholder="请输入1-300字" type="textarea" :rows="3" :disabled="scoped.row.is_sys" v-model="scoped.row.input" maxlength="300"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="output" label="输出">
          <template #default="scoped">
            <el-input
              placeholder="请输入1-300字"
              :rows="3"
              type="textarea"
              :disabled="scoped.row.is_sys"
              v-model="scoped.row.output"
              maxlength="300"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="remark" class-name="table-column-left" label="备注" maxlength="300">
          <template #default="scoped">
            <el-input placeholder="请输入0-300字" type="textarea" :rows="3" v-model="scoped.row.remark"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" v-if="!isEdit">
          <template #default="scoped">
            <el-icon class="action" @click="handlePlusTable(scoped.$index)">
              <CirclePlus />
            </el-icon>
            <el-divider direction="vertical"></el-divider>
            <el-icon
              class="action"
              :style="{ pointerEvents: scoped.$index === 0 ? 'none' : '', color: scoped.$index === 0 ? '#ccc' : '' }"
              :disable="scoped.$index !== 0"
              @click="handleRemoveTable(scoped.$index)"
            >
              <Remove />
            </el-icon>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 导入 -->
    <div>
      <el-dialog title="快捷导入" v-model="exportShow" width="30%">
        <div>
          <p style="margin-top: 0">1、下载模板</p>
          <span>
            下载测试用例模板，并按照规则填写内容
            <a href="#" @click="fileSave('测试用例模板', 'https://file.vetscloud.com/caseTemplate.xlsx')">下载模板</a>
          </span>
        </div>
        <div>
          <p>2、上传内容</p>
          <el-upload
            class="upload-demo"
            ref="fileList"
            drag
            action="alert"
            :auto-upload="false"
            multiple
            :before-upload="beforeAvatarUpload"
            :on-change="uploadChange"
            :limit="1"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击选择文件上传</em></div>
          </el-upload>
        </div>
        <div v-if="fileName">
          上传成功: <span style="color: #1f9f85">{{ fileName }}</span>
        </div>
        <template #footer>
          <!-- status -->
          <span class="dialog-footer">
            <el-button @click="handleCancel">取 消</el-button>
            <el-button type="primary" v-debounce @click="handleExportData">提 交</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from "vue";
import { getSession, readFile } from "@/utils";
import { store } from "@/store";
import { addUseCaseData, editUseCaseData } from "@/api/request-modules/iteration";
import { PRIORITY, STATUS } from "./contantOptions";
import xlsx from "xlsx";
import { ResponseParams } from "@/types/response";
import useMessageTip from "@/composables/useMessageTip";
import { useRoute, useRouter } from "vue-router";
import { ElLoading } from "element-plus";
import { CirclePlus, Remove } from "@element-plus/icons";
import fileSave from "@/utils/fileSave";

export default defineComponent({
  name: "useCaseAdd",
  components: { CirclePlus, Remove },

  setup() {
    const router = useRouter();
    const route = useRoute();
    // 迭代id保存
    const iterateId = computed(() => store.getters.iterateId);
    const isEdit = ref(false);
    const fileList = ref();
    const rawTableData = {
      name: "", // 用例名称
      type: "", // 用例类型 1.冒烟 2.功能
      input: "", // 输入
      level: "", // 用例等级 1.P0 2.P1 3.P2 4.P3
      premise: "", // 输入
      output: "", // 输出
      product_id: "", // 项目id
      iteration_id: "", // 迭代id
      remark: "" // 备注
    };
    // 等级
    let priority = JSON.parse(JSON.stringify(PRIORITY));

    const CASEPRIORITY = priority;
    const CASE_PRIORITY_LAST = [{ value: "同上", id: -1 }].concat(priority);
    // 用例类型
    let status = JSON.parse(JSON.stringify(STATUS));

    const CASE_STATUS = status;
    const CASE_STATUS_LAST = [{ label: "同上", value: -1 }].concat(status);

    const tableData = ref(
      Array(route.query.isEdit ? 1 : 2)
        .fill({})
        .map(() => {
          return { ...rawTableData };
        })
    );

    if (route.query.isEdit) {
      const userInfo: any = getSession("editUseCase", true) as any;
      isEdit.value = true;
      if (userInfo.length) {
        userInfo.forEach((item: Record<string, any>) => {
          item.type = item.type + "";
        });
        tableData.value = userInfo;
      } else {
        tableData.value[0] = userInfo;
        tableData.value[0].type = userInfo.type + "";
      }
    } else {
      // 填充数据处理，将类型，指派给默认设置为同上
      tableData.value.forEach((v, index) => {
        if (index >= 1) {
          v.type = "同上";
          v.level = "同上";
        }
      });
    }
    // 快捷导入弹框
    const exportShow = ref(false);
    const { tipMessage } = useMessageTip();
    // 文件上传前判断
    const beforeAvatarUpload = (file: any) => {
      if (!/\.(xls|xlsx)$/.test(file.name.toLowerCase())) {
        fileList.value.clearFiles();
        return tipMessage(400, `上传格式不正确，请上传xls或者xlsx格式`);
      }
    };
    const fileName = ref("");
    const exportData: any = ref([]);
    let timer: ReturnType<typeof setTimeout>;
    const uploadChange = async (file: any) => {
      if (!/\.(xls|xlsx)$/.test(file.name.toLowerCase())) {
        fileList.value.clearFiles();
        fileName.value = "";

        return tipMessage(400, `上传格式不正确，请上传xls或者xlsx格式`);
      }
      clearTimeout(timer);

      timer = setTimeout(async () => {
        let dataBinary = await readFile(file.raw);
        let workBook = xlsx.read(dataBinary, { type: "binary", cellDates: true });
        let workSheet = workBook.Sheets[workBook.SheetNames[0]];
        const data: any = xlsx.utils.sheet_to_json(workSheet, { raw: false });
        console.log(data);
        if (data && data.length) {
          const resultTable = [];
          for (let i = 0, l = data.length; i < l; i++) {
            if (data[i]["用例名称"]) {
              const obj: Record<string, any> = {};
              obj.name = data[i]["用例名称"];
              data[i]["用例类型"] === "冒烟用例" ? (obj.type = "1") : (obj.type = "2");
              const level = priority.filter((item: Record<string, any>) => item.value === data[i]["用例等级"]);
              obj.level = level.length ? level[0].id : -1;
              obj.premise = data[i]["前提"] || "";
              obj.input = data[i]["输入"] || "";
              obj.output = data[i]["输出"] || "";
              obj.remark = data[i]["备注"] || "";

              resultTable.push(obj);
            }
          }
          console.log(resultTable);
          exportData.value = resultTable;
          fileName.value = file.name;
          tipMessage(200, `上传成功`);
        } else {
          fileName.value = "";
          fileList.value.clearFiles();
          return tipMessage(400, `内容不能为空，请填写内容`);
        }
      }, 1000);
    };

    const handleExport = () => {
      exportShow.value = true;
    };
    // 取消导入
    const handleCancel = () => {
      exportData.value = [];
      exportShow.value = false;
    };
    // 确认导入数据
    const handleExportData = () => {
      if (!exportData.value.length) return tipMessage(400, `文件数据为空或文件数据格式有误`);
      let originTable = JSON.parse(JSON.stringify(tableData.value));
      for (let i = originTable.length - 1; i >= 0; i--) {
        if (!originTable[i].name) {
          originTable.splice(i, 1);
        } else {
          break;
        }
      }
      tableData.value = originTable;
      tableData.value.push.apply(tableData.value, exportData.value);
      exportShow.value = false;
      if (tableData.value.length > 30) {
        let loadingInstance1 = ElLoading.service({ fullscreen: true });

        setTimeout(() => {
          loadingInstance1.close();
        }, 3000);
      }
    };

    watch(
      () => exportShow.value,
      () => {
        exportData.value = [];
        fileName.value = "";
        if (!exportShow.value) {
          fileList.value.clearFiles();
        }
      }
    );

    const handlePlusTable = (index: number) => {
      // tableData.push({ ...rawTableData });
      tableData.value.splice(
        index + 1,
        0,
        Object.assign(
          { ...rawTableData },
          {
            level: "同上",
            type: "同上"
          }
        )
      );
    };
    const handleRemoveTable = (item: number) => {
      if (tableData.value.length <= 1) {
        return;
      }
      tableData.value.splice(item, 1);
    };
    const handleConfirmSave = () => {
      const post_table = JSON.parse(JSON.stringify(tableData.value));
      const resultTable = post_table.filter((v: Record<string, any>) => v.name !== "");
      if (resultTable.length) {
        if (resultTable[0].type === "同上" || resultTable[0].type === -1) return tipMessage(400, `请选择第1条的用例类型`);
        if (resultTable[0].level === -1 || resultTable[0].level === "同上") return tipMessage(400, `请选择第1条的用例等级`);
      }
      resultTable.forEach((itemObj: Record<string, any>, index: number) => {
        if (!itemObj.name) {
          tipMessage(400, `请输入第${index + 1}条的用例名称`);
          throw new Error("未选择类型！");
        }
        for (let key in itemObj) {
          if (itemObj[key] === -1 || itemObj[key] === "同上") {
            itemObj[key] = resultTable[index - 1][key as keyof typeof rawTableData];
          }
          // itemObj.type = itemObj.type * 1;
        }
        const typeArr = ["1", "2"];
        if (!typeArr.includes(itemObj.type)) {
          tipMessage(400, `请输入第${index + 1}条的用例类型`);
          throw new Error("未选择类型！");
        }
        if (!itemObj.level) {
          tipMessage(400, `请选择第${index + 1}条的用例等级`);
          throw new Error("未选择用例等级！");
        }
        itemObj.product_id = (getSession("productInfo", true) as Record<string, any>)?.id;
        itemObj.iteration_id = iterateId.value;
        console.log(resultTable);
      });
      if (resultTable.length) {
        resultTable.forEach((item: Record<string, any>) => {
          item.type = item.type * 1;
        });
        if (isEdit.value) {
          editUseCaseData<ResponseParams.ResponseDataSuccess>(resultTable).then((res) => {
            successCallBack(res.code);
          });
        } else {
          addUseCaseData<ResponseParams.ResponseDataSuccess>(resultTable).then((res) => {
            successCallBack(res.code);
          });
        }
      } else {
        router.go(-1);
      }

      const successCallBack = (code: number) => {
        tipMessage(code);
        if (code === 200) {
          router.push({ name: "useCase" });
        }
      };
    };
    return {
      fileSave,
      handleConfirmSave,
      CASE_PRIORITY_LAST,
      CASEPRIORITY,
      CASE_STATUS,
      CASE_STATUS_LAST,
      handleRemoveTable,
      handlePlusTable,
      tableData,
      isEdit,
      beforeAvatarUpload,
      uploadChange,
      exportShow,
      handleExport,
      handleExportData,
      fileList,
      handleCancel,
      fileName
    };
  }
});
</script>

<style scoped lang="less">
.container {
  padding: 20px;
}
.main {
  display: inline-block;
  height: 99%;
  box-sizing: border-box;
}
.action {
  font-size: 20px;
  cursor: pointer;
}
:deep(.el-upload--text) {
  width: 100%;
}
:deep(.el-upload-dragger) {
  width: 100%;
  line-height: 180px;
}
</style>
