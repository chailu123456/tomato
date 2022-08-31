<template>
  <div class="container bugedit">
    <div class="main">
      <div class="leftBox">
        <h4>标题</h4>
        <el-input v-model="formParams.name" placeholder="请输入标题"></el-input>
        <div>
          <h4>重现步骤</h4>
          <div class="editContainer" ref="editRef"></div>
          <div>
            <el-upload :file-list="formParams.attachment" :on-remove="handleRemoveFiles" :on-success="handleSuccessFiles" :action="api.uploadAssets" multiple>
              <el-button size="medium" type="text">
                <el-icon>
                  <Plus />
                </el-icon>
                <span> 上传附件 </span>
              </el-button>
            </el-upload>
          </div>
          <div class="btnGroup">
            <el-button class="btnItem" type="primary" v-debounce @click="handleChangeBug">确定</el-button>
            <el-button class="btnItem" @click="handleCancel">返回</el-button>
          </div>
        </div>
      </div>
      <div class="rightBox">
        <el-form :rules="rules" :model="formParams" class="demo-form-inline" label-width="100px" ref="formRef">
          <el-form-item label="所属迭代">
            <el-select v-model="formParams.iteration_id" placeholder="主干">
              <el-option v-for="item in newDemandList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="所属环境">
            <el-select v-model="formParams.env" placeholder="测试">
              <el-option v-for="item in ENVLIST" :key="item.id" :label="item.value" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="级别" prop="level">
            <el-select v-model="formParams.level" placeholder="--所有--">
              <el-option v-for="item in BUG_LEVEL" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="类型" prop="type">
            <el-select v-model="formParams.type" placeholder="--所有--">
              <el-option v-for="item in BUG_TYPE" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Bug状态" prop="status">
            <el-select v-model="formParams.status" placeholder="--所有--" :disabled="!isEdit">
              <el-option v-for="item in BUG_STATUS_DELETE" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="指派给:" prop="staff_name">
            <el-select v-model="formParams.staff_no" filterable placeholder="请选择" @change="setFiled" clearable>
              <el-option-group v-for="group in employeeLists" :key="group.staff_no" :label="group.label">
                <el-option v-for="item in group.options" :key="item.staff_no" :label="item.staff_name" :value="item.staff_no"></el-option>
              </el-option-group>
              <!-- <el-option v-for="item in employeeLists" :key="item.staff_no" :label="item.staff_name" :value="item.staff_no"> </el-option> -->
            </el-select>
          </el-form-item>
          <el-form-item label="备注:" class="rp-Table__remark">
            <el-input rows="7" show-word-limit placeholder="请输入备注" type="textarea" v-model="formParams.remark" maxlength="200"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onActivated, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { BUG_LEVEL, BUG_STATUS, BUG_TYPE, ENVLIST } from "@/utils/index";
import { getSession } from "@/utils/sesssion";
import { ResponseParams } from "@/types/response";
import E from "wangeditor";
import { videoUpload } from "@/api/request-modules/common";
import { createBug, getBugDetail, updateBug } from "@/api/request-modules/test";
import useMessageTip from "@/composables/useMessageTip";
import api from "@/api/dict";
import { Plus } from "@element-plus/icons";

import { ElMessage } from "element-plus";
import { demandList } from "@/views/iteration/useMixin";
export default defineComponent({
  name: "bugEdit",
  components: { Plus },
  setup() {
    const { tipMessage } = useMessageTip();
    const editRef = ref<HTMLElement | null>();
    const formRef = ref();
    const route = useRoute();
    const isEdit = route.query.bugId;
    let instance: any;
    const content = reactive({
      html: "",
      text: ""
    });
    const newDemandList = JSON.parse(JSON.stringify(demandList.value)) || [];
    newDemandList.unshift({ name: "主干", id: 0 });

    // 项目id
    const currentProductId: string = getSession("productId", true) as string;

    onActivated(() => {
      if (instance && !isEdit) {
        instance.txt.html("<p>[步骤]</p><p>[结果]</p><p>[期望]</p>");
      }
    });
    onMounted(() => {
      instance = new E(editRef.value);
      instance.config.uploadFileName = "file";
      instance.config.uploadImgTimeout = 10000;
      instance.config.uploadImgServer = api.uploadAssets;
      instance.config.uploadImgHooks = {
        customInsert: (insertImgFn: (url: string) => void, result: Record<string, any>) => {
          insertImgFn(result.url);
        }
      };
      instance.config.uploadVideoAccept = ["wmv", "mp4", "mpge", "mov", "wmv", "flv", "rmvb", "3gp"];
      instance.config.uploadVideoMaxSize = 100 * 1024 * 1024 * 1024; // 102400m
      instance.config.uploadVideoServer = api.uploadAssets;
      instance.create();
      instance.txt.html("<p>[步骤]</p><p>[结果]</p><p>[期望]</p>");

      instance.config.customUploadVideo = function (resultFiles: any, insertVideoFn: any) {
        // resultFiles 是 input 中选中的文件列表
        // insertVideoFn 是获取视频 url 后，插入到编辑器的方法
        const formData = new FormData();
        formData.append("file", resultFiles[0]);
        // insertVideoFn("http://file.vetscloud.com/4a9ba4a783184de1a80d19bb7ff43d71.avi");

        videoUpload<any>(formData).then((res) => {
          if (res && res.url) {
            // 上传视频，返回结果，将视频地址插入到编辑器中
            insertVideoFn(res.url);
          }
        });
      };

      if (isEdit) {
        // 获取bug详情
        getBugDetail<ResponseParams.ResponseDataSuccess>(route.query.bugId as string).then((res) => {
          const { remark, type, description, name, staff_name, env, staff_no, status, level, id, attachment, iteration_id, iteration_name } =
            res.data as Record<string, any>;
          formParams.description = instance && instance.txt.html(description);
          formParams.name = name;
          formParams.staff_name = staff_name;
          formParams.staff_no = staff_no;
          formParams.status = status;
          formParams.level = level;
          formParams.type = type === 0 ? null : type;
          formParams.id = id;
          formParams.env = env;
          formParams.currentIterationName = iteration_name;
          formParams.attachment = attachment.map((v: Record<string, any>) => {
            return {
              name: v.title,
              url: v.addr,
              size: v.size
            };
          });
          formParams.remark = remark;
          formParams.iteration_id = iteration_id || 0;
        });
      } else {
        if (route.query.product_id) {
          formParams.currentIterationName = route.query.currentIterationName + "";
          formParams.iteration_id = Number(route.query.currentIterationId) || 0;
        }
        formParams.status = 0;
      }
      // 复制值跳转
      if (route.params.coypVal) {
        const coypVal: string | any = route.params.coypVal;
        const { type, staff_name, staff_no, level, env, currentIterationId, currentIterationName } = JSON.parse(coypVal);
        setTimeout(() => {
          formParams.staff_name = staff_name;
          formParams.staff_no = staff_no;
          formParams.status = 0;
          formParams.env = env;

          formParams.iteration_id = currentIterationId || 0;
          formParams.currentIterationName = currentIterationName;
          formParams.level = level;
          formParams.type = type === 0 ? null : type;
        }, 500);
      }
    });
    let formParams: Record<string, any> = reactive({
      // bug描述
      description: "",
      // bug名称
      name: "",
      // 指派员工姓名
      staff_name: null,
      // 指派员工工号
      staff_no: null,
      status: null as null | number,
      level: null,
      id: null,
      iteration_id: 0,
      env: 1,
      product_id: currentProductId,
      type: null,
      remark: null,
      attachment: [] as Array<Record<string, any>>,
      currentIterationName: ""
    });
    onBeforeUnmount(() => {
      instance.txt.clear();
      instance.destroy();
      instance = null;
      editRef.value = null;
    });
    const BUG_STATUS_DELETE = BUG_STATUS.slice().splice(1, BUG_STATUS.length);
    const router = useRouter();

    const employeeLists: any = getSession("iterationPeopleList", true) as any;

    const setFiled = (staff_no: string) => {
      if (!staff_no) {
        formParams.staff_no = null;
        return;
      }
      // const staff_name = employeeLists.find((list: Record<string, any>) => list.staff_no === staff_no).staff_name;
      // formParams.staff_name = staff_name;
      const list: Record<string, any> = employeeLists[1];
      list.options.forEach((item: any) => {
        if (staff_no === item.staff_no) {
          formParams.staff_no = item.staff_no;
          formParams.staff_name = item.staff_name;
        }
      });
    };
    const handleChangeBug = () => {
      if (!formParams.name) {
        ElMessage({
          showClose: true,
          message: "请输入标题",
          type: "warning"
        });
        return;
      }
      formRef.value.validate((valid: boolean) => {
        if (valid) {
          formParams.description = instance.txt.html();
          const filesLists = formParams.attachment.map((v: Record<string, any>) => {
            return {
              title: v.name,
              addr: v.response ? v.response.url : v.url,
              size: v.response ? v.response.size : v.size
            };
          });
          const params = Object.assign(formParams, { attachment: filesLists });
          if (isEdit) {
            // 更新
            updateBug<ResponseParams.ResponseDataSuccess>(params as any).then((res) => {
              if (res.code === 200) {
                tipMessage(res.code);
                setTimeout(() => {
                  // router.go(-1);
                  router.push({
                    name: "test"
                  });
                }, 0);
              }
            });
          } else {
            delete (params as Partial<typeof params>).id;
            // 创建
            createBug<ResponseParams.ResponseDataSuccess>(params as any).then((res) => {
              if (res.code === 200) {
                tipMessage(res.code);
                router.push({
                  name: "test",
                  query: { ...router.currentRoute.value.query }
                });
              }
            });
          }
        }
      });
    };
    const handleBack = () => {
      router.go(-1);
    };
    // 文件上传
    const handleSuccessFiles = (response: Record<string, any>, file: Record<string, any>, fileList: Array<Record<string, any>>) => {
      // 七牛上传成功后有时候返回url为空
      if (response.url) formParams.attachment = fileList.slice();
    };
    const handleRemoveFiles = (file: Record<string, any>, fileList: Record<string, any>) => {
      formParams.attachment = fileList.slice();
    };
    //#region 表单校验
    const rules = {
      level: [{ required: true, message: "请选择级别", trigger: "change" }],
      type: [{ required: true, message: "请选择类型", trigger: "change" }],
      status: [{ required: true, message: "请选择状态", trigger: "change" }],
      staff_name: [{ required: true, message: "请选择指派人", trigger: "change" }]
    };
    const handleCancel = () => {
      router.go(-1);
    };
    return {
      rules,
      handleRemoveFiles,
      handleSuccessFiles,
      api,
      route,
      formParams,
      ENVLIST,
      BUG_LEVEL,
      employeeLists,
      BUG_STATUS_DELETE,
      handleChangeBug,
      setFiled,
      editRef,
      content,
      BUG_TYPE,
      formRef,
      handleBack,
      handleCancel,
      isEdit,
      newDemandList
    };
  }
});
</script>
<style lang="less" scoped>
.container {
  padding: 20px;
  height: 100% !important;
  .main {
    height: calc(100% - 40px);
    overflow: hidden;
    display: flex;
    flex-direction: row;
    .leftBox {
      // margin-right: 5px;
      overflow: hidden;
      overflow-y: scroll;
      flex: 3;
      .btnGroup {
        text-align: center;
        position: fixed;
        z-index: 9;
        bottom: 20px;
        left: calc(50% - 210px);
        .btnItem {
          margin-top: 30px;
          width: 100px;
          // height: 40px;
          //  line-height: 40px;
        }
      }
    }
    .rightBox {
      flex: 1;
    }
  }
}
:deep(.w-e-text-container) {
  z-index: 1 !important;
  min-height: 500px !important;
  height: auto !important;
}
:deep(.el-form-item) {
  display: flex;
}
:deep(.el-select) {
  width: 100%;
}
:deep(.el-form-item__content) {
  flex: 1;
}
:deep(.el-upload-list__item) {
  transition: none !important;
}
:deep(.w-e-toolbar) {
  z-index: 2 !important;
}
:deep(.w-e-text-container) {
  z-index: 1 !important;
}
</style>

<style lang="less">
.bugedit {
  .main {
    display: inherit;
  }
}
</style>
