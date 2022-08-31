<template>
  <div>
    <div class="form-margin">
      <el-form label-position="left" label-width="95px" ref="ruleFormRef" :rules="rules" :model="dialogParams">
        <el-form-item label="计划名称:" prop="name">
          <div style="display: flex">
            <el-input minlength="2" placeholder="计划名称，2-20个字" style="width: 50%" v-model="dialogParams.name" maxlength="20"> </el-input>
            <el-form-item label="计划版号:" style="margin-left: 20px" class="inline-form2" prop="version">
              <el-input v-model="dialogParams.version" placeholder="如2.9.3">
                <template #prepend>v</template>
              </el-input>
            </el-form-item>
          </div>
          <div>
            <!-- <el-form-item label="计划版号:" class="inline-form" prop="version">
              <el-input v-model="dialogParams.version" placeholder="如2.9.3">
                <template #prepend>v</template>
              </el-input>
            </el-form-item> -->
            <!-- <el-form-item label-width="130px" label="期望交付时间:" class="inline-form" prop="deliver_time">
            <el-input v-model="dialogParams.deliver_time" placeholder="请输入预估交付时间"></el-input>
          </el-form-item> -->
          </div>
        </el-form-item>

        <!-- <el-form-item label="所属项目:" prop="product" label-width="95px">
          <el-select disabled v-model="dialogParams.product_id" placeholder="请选择">
            <el-option v-for="item in productList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="关联需求:" prop="demand_ids" class="scroll__form__item">
          <el-scrollbar :height="dialogDemandList.length === 0 ? `50px` : `200px`">
            <el-tree
              :data="dialogDemandList"
              node-key="id"
              :default-checked-keys="dialogParams.demand_ids"
              @check="handleCheckChange"
              show-checkbox
              default-expand-all
              :props="defaultProps"
            >
            </el-tree>
          </el-scrollbar>
        </el-form-item>
        <el-form-item label="遗留bug:" prop="delay_list" class="scroll__form__item">
          <el-scrollbar :height="bugList.length === 0 ? `50px` : `200px`">
            <el-tree :data="bugList" node-key="iteration_id" @check="handleCheckBugLists" show-checkbox default-expand-all :props="bugProps"> </el-tree>
          </el-scrollbar>
        </el-form-item>
        <el-form-item label="需求说明:" prop="demand_doc">
          <el-checkbox v-model="noCheck" label="暂无"></el-checkbox>
          <ul class="plan-file-list" v-if="!noCheck">
            <li class="file-list-show" v-for="(item, index) in dialogParams.demand_docs" :key="index">
              <el-select class="file-select" v-model="item.type" @change="handleSelect(item)" placeholder="请选择">
                <el-option v-for="item in fileList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
              <el-input class="file-url" v-if="item.type === 1" v-model="item.url" placeholder="请输入需求链接地址"></el-input>
              <!-- <el-button class="file-btn" v-if="item.type === '2'" icon="el-icon-plus" type="normal">上传文件</el-button> -->
              <el-upload
                class="file-btn"
                v-if="item.type === 2"
                :file-list="item.size ? [item] : []"
                :on-remove="handleRemoveFiles"
                :on-success="(response:any, file:any, fileList: any) => handleSuccessFiles(response, file, fileList, index)"
                :action="api.uploadAssets"
                :limit="1"
              >
                <el-button icon="el-icon-plus" size="small">上传文件</el-button>
              </el-upload>
              <el-input class="file-remark" v-model="item.remark" maxlength="10" placeholder="备注，10字内"></el-input>

              <el-icon class="file-action" @click="handleOperation(index, item.type)" v-if="index === 0">
                <circle-plus />
              </el-icon>
              <el-icon style="color: #f56c6c" class="file-action" @click="handleOperation(index, item.type)" v-if="index > 0">
                <remove />
              </el-icon>

              <!-- <i @click="handleOperation(index, item.type)" v-if="index === 0" class="el-icon-circle-plus-outline file-action"></i> -->
              <!-- <i @click="handleOperation(index, item.type)" v-if="index > 0" style="color: #f56c6c" class="el-icon-remove-outline file-action"></i> -->
            </li>
          </ul>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts">
import useGetSelectList from "@/composables/useGetSelectList";
import useCreateAndEditPlan from "../composables/useCreateAndEditPlan";
import { defineComponent, ref, watch } from "vue";
import { CirclePlus, Remove } from "@element-plus/icons";
import api from "@/api/dict";
export default defineComponent({
  name: "dialogPlanManagement",
  components: { CirclePlus, Remove },
  setup() {
    const defaultProps = {
      children: "child_list",
      label: "name"
    };
    const bugProps = {
      children: "bug",
      label: "name"
    };
    const fileList = [
      {
        value: 1,
        label: "需求链接"
      },
      {
        value: 2,
        label: "需求文件"
      }
    ];
    const { dialogDemandList, dialogParams, handleCheckChange, ruleFormRef, rules, bugList, handleCheckBugLists, changeDemandDoc, noCheck } =
      useCreateAndEditPlan();
    //获取下拉列表
    const productList = ref();
    let { getProductLists } = useGetSelectList();
    getProductLists().then((res: Record<string, any>) => {
      productList.value = res.data;
    });

    // const noCheck = ref(false);

    watch(noCheck as any, (newVal) => {
      if (newVal) {
        (dialogParams as Record<string, any>).demand_docs = [
          {
            name: "",
            size: 0,
            type: 1,
            url: null
          }
        ];
      }
    });

    //#region type = 1 需求链接 type = 2 需求文件  type = 0 暂无
    // 文件上传
    const handleSuccessFiles = (response: Record<string, any>, file: File, fileList: Array<File>, index: number) => {
      // 七牛上传成功后有时候返回url为空
      const { size, url, filename } = response;
      if (response.url) {
        const type = 2;
        const defaultDialogParams = JSON.parse(JSON.stringify(dialogParams));
        (dialogParams as Record<string, any>).demand_docs[index] = {
          name: filename,
          size,
          type,
          url,
          remark: defaultDialogParams.demand_docs[index].remark
        };
      }
    };
    const handleSelect = (item: Record<string, any>) => {
      item.name = "";
      item.size = 0;
      item.url = "";
      item.remark = "";
    };
    // 新增需求
    const handleOperation = (index: number, type: number) => {
      if (index) {
        (dialogParams as Record<string, any>).demand_docs.splice(index, 1);
      } else {
        // (dialogParams as Record<string, any>).demand_docs.splice(
        //   index + 1,
        //   0,
        //   Object.assign({
        //     name: "",
        //     type: type === 1 ? 1 : 2,
        //     url: "",
        //     size: 0,
        //     remark: ""
        //   })
        // );
        (dialogParams as Record<string, any>).demand_docs.push(
          Object.assign({
            name: "",
            type: type === 1 ? 1 : 2,
            url: "",
            size: 0,
            remark: ""
          })
        );
      }
    };

    const handleRemoveFiles = () => {
      (dialogParams as Record<string, any>).demand_doc = {
        name: "",
        size: 0,
        type: 2,
        url: null
      };
    };
    //#endregion
    // const handleShowDocDetail = (detail: Record<string, any>) => {
    //   console.log(detail);
    //   // const {
    //   //   doc: { url, type, name }
    //   // } = block;
    //   // // type 为 1，打开新窗口跳转
    //   // if (type === 1) {
    //   //   window.open(`//${url}`, "_blank");
    //   // } else if (type === 2) {
    //   //   fileSave(name, url);
    //   // }
    //   // type为 2 下载文件
    // };
    return {
      rules,
      ruleFormRef,
      handleCheckChange,
      dialogDemandList,
      defaultProps,
      bugProps,
      dialogParams,
      productList,
      bugList,
      handleCheckBugLists,
      api,
      handleRemoveFiles,
      handleSuccessFiles,
      changeDemandDoc,
      noCheck,
      fileList,
      handleSelect,
      handleOperation
      // handleShowDocDetail
    };
  }
});
</script>

<style scoped lang="less">
.inline-form {
  width: 50%;
  display: inline-block;
}
.form-margin {
  margin-top: 10px;
}
.layout-flex {
  display: flex;
}
:deep(.el-form-item) {
  display: flex;
}
:deep(.el-form-item__content) {
  flex-grow: 1;
  display: inline-block;
}
:deep(.el-select) {
  width: 100%;
}
:deep(.el-tree-node__content) {
  height: unset;
}
:deep(.el-tree-node__label) {
  width: 100%;
  word-break: break-all;
  display: inline-block;
  white-space: break-spaces;
}
.demandDoc-margin {
  margin-top: 20px;
}
.plan-file-list {
  min-height: 70px;
  max-height: 260px;
  overflow: scroll;
  .file-list-show {
    display: flex;
    // align-items: center;
    margin-top: 10px;
    .file-select {
      width: 18%;
    }
    .file-url {
      width: 50%;
    }
    .file-btn {
      text-align: center;
      width: 50%;
      // margin-top: 36px;
      :deep(.el-upload) {
        width: 100%;
        .el-button {
          width: 100%;
          color: #1f9f85;
        }
      }
      :deep(.el-upload-list) {
        // position: absolute;
        margin-top: -40px;
        .el-upload-list__item:first-child {
          background: #fff;
          margin-top: 10px;
        }
      }
    }
    .file-remark {
      width: 28%;
    }
    .file-action {
      font-size: 20px;
      margin-left: 10px;
      color: #1f9f85;
      margin-top: 6px;
      &:hover {
        cursor: pointer;
      }
    }
  }
}
:deep(.el-upload-list__item) {
  transition: none !important;
}
.scroll__form__item {
  :deep(.el-form-item__label) {
    min-width: 105px !important;
  }
}
</style>
