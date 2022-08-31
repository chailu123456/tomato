<template>
  <div class="rp-demand-pool">
    <el-row :gutter="20">
      <el-col :span="18">
        <p>需求名称</p>
        <el-input v-model="formParams.name" placeholder="4-100字" maxlength="100"></el-input>
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
        <div class="demand-opation">
          <el-button class="btnItem" type="primary" v-debounce @click="handleConfirm">保 存</el-button>
          <el-button class="btnItem" @click="handleCancel">返回</el-button>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="demand-detail">
          <el-form :rules="rules" :model="formParams" label-position="right" class="demand-form" ref="formRef">
            <el-form-item label="优先级" prop="level" class="default-css" label-width="100px">
              <el-select class="elect-pool" v-model="formParams.level" placeholder="--所有--">
                <el-option v-for="item in PRIORITY" :key="item.value" :label="item.value" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="所属模块" class="product-module default-css" prop="product_module_name" label-width="100px" @click="handleModule">
              <el-popover placement="bottom" ref="popover" :width="300" trigger="click">
                <template #reference>
                  <el-input
                    v-model="formParams.product_module_name"
                    readonly
                    class="origin_path_name"
                    suffix-icon="el-icon-arrow-down"
                    placeholder="请选择所属模块"
                  ></el-input>
                </template>
                <el-tree :data="moduleList" :expand-on-click-node="false" default-expand-all @node-click="handleNodeClick"></el-tree>
              </el-popover>
            </el-form-item>
            <el-form-item label="需求类型" class="default-css" label-width="100px">
              <el-select class="elect-pool" v-model="formParams.type">
                <el-option v-for="item in requireTypes" :key="item.value" :label="item.value" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="收集时间" prop="collect_time" label-width="100px">
              <el-date-picker v-model="formParams.collect_time" type="date" value-format="YYYY-MM-DD" placeholder="选择日期"> </el-date-picker>
            </el-form-item>
            <el-form-item label="来源方" prop="origin_path" label-width="100px" class="demand-level default-css" @click="handleAddPeople">
              <el-popover placement="top-start" title="" :width="200" trigger="hover" :content="formParams.origin_path">
                <template #reference>
                  <el-input v-model="originPath" readonly class="origin_path_name" suffix-icon="el-icon-arrow-down" placeholder="请选择来源方"></el-input>
                </template>
              </el-popover>
            </el-form-item>
            <el-form-item label="来源备注" prop="origin_remark" label-width="100px" class="demand-level">
              <el-input type="textarea" class="origin_remark" :autosize="{ minRows: 8, maxRows: 10 }" v-model="formParams.origin_remark"></el-input>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
    </el-row>
    <peopleTree @dialogShadow="dialogShadow" :staff="staff" @personMsg="personMsg" v-if="show"></peopleTree>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs, ref, defineComponent, getCurrentInstance, onBeforeUnmount, onMounted } from "vue";
import E from "wangeditor";
import { useRoute, useRouter } from "vue-router";
import api from "@/api/dict";
import { PRIORITY } from "@/utils/contantOptions";
import { ResponseParams } from "@/types/response";
import { RequestParams } from "@/types/request";
import { getDemandDetail, createDemand, editDemand } from "@/api/request-modules/product";
import { getSettingModule } from "@/api/request-modules/product";
import dayjs from "dayjs";
import { videoUpload } from "@/api/request-modules/common";
import { replaceProductId } from "@/views/iteration/useMixin";
import { getSession, hideText } from "@/utils";
import peopleTree from "@/components/peopleTree/index.vue";
import { getStaffDetail } from "@/api/request-modules/product";
import { requireTypes } from "@/utils/contantOptions";
import { Plus } from "@element-plus/icons";

export default defineComponent({
  name: "editDemandPool",
  components: {
    peopleTree,
    Plus
  },
  setup() {
    const data = reactive({});
    const editRef = ref<HTMLElement>();
    const formRef = ref();
    const popover = ref();
    const show = ref(false);
    const route = useRoute();
    const router = useRouter();
    const internalInstance = getCurrentInstance();
    const global: any = internalInstance?.appContext.config.globalProperties;
    const isEdit = route.query.demand_id as any;

    const userName = JSON.parse(getSession("user") as any);

    const { productId } = replaceProductId();

    const staff: Record<string, any> = ref({ staff_name: userName.name, staff_no: userName.staff_no });
    const originPath = ref("");
    let instance: any;
    let formParams = reactive<RequestParams.CreateDemand>({
      id: 0,
      name: "",
      collect_time: dayjs().format("YYYY-MM-DD"),
      origin: "",
      origin_path: "",
      level: 1,
      type: 1,
      description: " ",
      create_by: userName.staff_no,
      creator: userName.name,
      origin_remark: "",
      parent_id: 0,
      product_id: 0,
      child_list: [],
      attachment: [],
      product_module_id: 0,
      product_module_name: "主干"
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
      instance.config.onchange = () => {
        if (instance.txt.html() === "") {
          instance.txt.html(" &nbsp");
        }
      };
      instance.config.uploadVideoAccept = ["wmv", "mp4", "mpge", "mov", "wmv", "flv", "rmvb", "3gp"];
      instance.config.uploadVideoMaxSize = 100 * 1024 * 1024 * 1024; // 102400m
      instance.config.uploadVideoServer = api.uploadAssets;
      instance.create();
      if (isEdit) {
        getDetailFn(isEdit);
      } else {
        getStaffDetail({ staff_no: userName.staff_no }).then((res: any) => {
          if (res.data) {
            const name = res.data.job_path + "/" + res.data.staff_name;
            formParams.origin = userName.staff_no;
            formParams.origin_path = name;
            staff.value.staff_name = name;
            originPath.value = hideText(name);
          }
        });
      }
      instance.config.customUploadVideo = function (resultFiles: any, insertVideoFn: any) {
        // resultFiles 是 input 中选中的文件列表
        // insertVideoFn 是获取视频 url 后，插入到编辑器的方法
        const formData = new FormData();
        formData.append("file", resultFiles[0]);

        videoUpload<any>(formData).then((res) => {
          if (res && res.url) {
            // 上传视频，返回结果，将视频地址插入到编辑器中
            insertVideoFn(res.url);
          }
        });
      };
    });
    onBeforeUnmount(() => {
      instance.destroy();
      instance = null;
    });
    const rules = {
      name: [
        { required: true, message: "请输入需求名称", trigger: "blur" },
        { min: 4, max: 100, message: "长度在 4 到 100 个字符", trigger: "blur" }
      ],
      origin: [
        { required: false, message: "请输入需求来源", trigger: "blur" },
        { min: 2, max: 10, message: "长度在 2 到 10 个字符", trigger: "blur" }
      ],
      level: [{ required: true, message: "请选择优先级", trigger: "change" }],
      type: [{ required: true, message: "请选择需求类型", trigger: "change" }],
      collect_time: [{ type: "date", required: false, message: "请选择时间", trigger: "change" }]
    };

    const handleConfirm = () => {
      formParams.description = instance.txt.html();
      formRef.value.validate((valid: boolean) => {
        if (valid) {
          const filesLists = formParams.attachment.map((v: Record<string, any>) => {
            return {
              title: v.name,
              addr: v.response ? v.response.url : v.url,
              size: v.response ? v.response.size : v.size
            };
          });
          const params = Object.assign(formParams, { attachment: filesLists });
          if (isEdit) {
            editDemand<ResponseParams.ResponseDataSuccess>(params).then((res) => {
              if (res.code === 200) {
                global.$message({
                  message: "成功",
                  type: "success"
                });
                router.push({ name: "demandPool" });
              }
            });
          } else {
            formParams.product_id = productId;
            // 新增需求
            createDemand<ResponseParams.ResponseDataSuccess>(params).then((res) => {
              if (res.code === 200) {
                global.$message({
                  message: "成功",
                  type: "success"
                });
                router.push({ name: "demandPool" });
              }
            });
          }
        }
      });
    };
    const getDetailFn = (id: number) => {
      // 获取详情
      getDemandDetail<ResponseParams.ResponseDataSuccess>({ id: id }).then((res) => {
        if (res.data) {
          const {
            child_list,
            collect_time,
            origin,
            origin_path,
            description,
            name,
            parent_id,
            type,
            product_module_name,
            product_module_id,
            origin_remark,
            product_id,
            level,
            id,
            attachment
          } = res.data as Record<string, any>;
          formParams.id = id;
          formParams.name = name;
          formParams.description = instance && instance.txt.html(description);
          formParams.level = level;
          formParams.type = type;
          formParams.origin = origin;
          formParams.collect_time = collect_time;
          formParams.child_list = child_list;
          formParams.parent_id = parent_id;
          formParams.product_id = product_id;
          formParams.origin_remark = origin_remark;
          formParams.origin_path = origin_path ? origin_path : origin;
          originPath.value = hideText(origin_path ? origin_path : origin) === "-" ? "" : hideText(origin_path ? origin_path : origin);
          formParams.product_module_id = product_module_id;
          formParams.product_module_name = product_module_name;
          staff.value.staff_name = origin_path ? origin_path : origin;
          staff.value.staff_no = origin;
          formParams.attachment = attachment.map((v: Record<string, any>) => {
            return {
              name: v.title,
              url: v.addr,
              size: v.size
            };
          });
        }
      });
    };
    const handleCancel = () => {
      router.go(-1);
    };
    //#region 文件上传
    // 文件上传
    const handleSuccessFiles = (response: Record<string, any>, file: Record<string, any>, fileList: Array<Record<string, any>>) => {
      // 七牛上传成功后有时候返回url为空
      if (response.url) formParams.attachment = fileList.slice();
    };
    const handleRemoveFiles = (file: Record<string, any>, fileList: Record<string, any>) => {
      formParams.attachment = fileList.slice();
    };
    // 所属模块选中事件
    const handleModule = () => {
      popover.value.show();

      // if (val < 0) {
      //   router.push({ name: "moduleManage" });
      // } else {
      //   formParams.product_module_id = val[val.length - 1];
      // }
    };
    const handleAddPeople = () => {
      show.value = true;
    };
    const dialogShadow = (val: boolean) => {
      show.value = val;
    };
    const moduleList: any = ref([]);
    // getModuleList<ResponseParams.ResponseDataSuccess>({ product_id: productId.value }).then((res) => {
    //   if (res.data && res.data.length) {
    //     moduleList.value = res.data;
    //     moduleList.value.unshift({ id: 0, name: "主干" });
    //     moduleList.value.unshift({ id: -1, name: "+添加模块" });
    //   } else {
    //     moduleList.value = [
    //       { id: -1, name: "+添加模块" },
    //       { id: 0, name: "主干" }
    //     ];
    //   }
    // });
    // 对数据进行转换
    const dataReverse = (people: Array<Record<string, any>>) => {
      let newArr = [];
      for (let i = 0; i < people.length; i += 1) {
        let obj: Record<string, any> = {};
        obj.value = people[i].id;
        obj.label = people[i].name;
        obj.level = people[i].level;
        obj.parent_id = people[i].parent_id;
        obj.product_id = people[i].product_id;
        if (people[i].children && people[i].children.length) obj.children = dataReverse(people[i].children);

        newArr.push(obj);
      }
      return newArr;
    };
    getSettingModule({ product_id: productId.value }).then(async (res: any) => {
      if (res.data && res.data.length) {
        moduleList.value = res.data;
        moduleList.value.unshift({ id: 0, name: "主干" });
        moduleList.value.unshift({ id: -1, name: "+ 添加模块" });
        moduleList.value = dataReverse(moduleList.value);
      } else {
        moduleList.value = [];
        moduleList.value.unshift({ id: 0, name: "主干" });
        moduleList.value.unshift({ id: -1, name: "+ 添加模块" });
        moduleList.value = dataReverse(moduleList.value);
      }
    });
    const handleNodeClick = (data: Record<string, any>) => {
      if (data.value < 0) {
        router.push({ name: "moduleManage" });
      }
      popover.value.hide();
      formParams.product_module_id = data.value;
      formParams.product_module_name = data.label;
    };
    const personMsg = (val: Record<string, any>) => {
      formParams.origin = val?.staff_no || "";
      formParams.origin_path = val?.staff_name || "";
      staff.value.staff_name = val?.staff_name || "";
      staff.value.staff_no = val?.staff_no || "";
      originPath.value = val?.staff_name ? hideText(val?.staff_name || "") : "";
    };
    //#endregion
    return {
      editRef,
      formRef,
      formParams,
      ...toRefs(data),
      PRIORITY,
      rules,
      handleConfirm,
      handleCancel,
      handleSuccessFiles,
      handleRemoveFiles,
      api,
      moduleList,
      handleModule,
      handleAddPeople,
      show,
      dialogShadow,
      personMsg,
      staff,
      requireTypes,
      originPath,
      handleNodeClick,
      popover
    };
  }
});
</script>
<style scoped lang="less">
.rp-demand-pool {
  height: calc(100% - 40px);
  background: #fff;
  // margin: 20px;
  padding: 20px 40px;
  .rp-project-name {
    position: absolute;
    width: 300px;
    top: 4px;
    right: 130px;
    z-index: 99;
    height: 50px;
    line-height: 50px;
    background: #fff;
    font-size: 14px;
    span {
      font-weight: 700;
      font-size: 16px;
      color: @rp-color-text-title;
    }
  }
  .demand-form {
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;

    :deep(.el-form-item) {
      display: flex;
    }

    :deep(.el-form-item__content) {
      .elect-pool {
        width: 100%;
      }
      .el-date-editor {
        // width: 100%;
      }
    }
    .demand-name {
      :deep(.el-form-item__content) {
        width: 260px;
      }
    }
    .demand-level {
      margin-right: 20px;
    }
  }
  .editContainer {
    margin-top: 10px;
  }
  .demand-detail {
    .default-css {
      :deep(.el-input__inner) {
        width: 174px !important;
      }
    }
  }

  :deep(.origin_remark) {
    .el-textarea__inner {
      width: 220px !important;
    }
  }
  :deep(.w-e-toolbar) {
    z-index: 2 !important;
  }
  :deep(.w-e-text-container) {
    z-index: 1 !important;
    min-height: 450px !important;
    height: auto !important;
  }
  .demand-opation {
    text-align: center;
    .btnItem {
      width: 90px;
      margin-top: 10px;
    }
  }
  :deep(.el-upload-list__item) {
    transition: none !important;
  }
}
</style>
