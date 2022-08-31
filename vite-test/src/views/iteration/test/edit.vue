<template>
  <div class="container">
    <div class="main">
      <div class="leftBox">
        <h4>标题</h4>
        <el-input v-model="formParams.name" placeholder="请输入标题"></el-input>
        <!-- <el-select style="width: 90%" v-model="projectList.id" placeholder="--所有--">
          <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select> -->
        <div>
          <h4>重现步骤</h4>
          <div class="edit" ref="editRef"></div>
          <div>
            <el-upload :on-change="handleFileChange" :action="api.uploadAssets" multiple>
              <el-button icon="el-icon-plus" size="medium" type="text">上传附件</el-button>
            </el-upload>
          </div>
          <div class="btnGroup">
            <el-button class="btnItem" type="primary" @click="handleChangeBug">确定</el-button>
          </div>
        </div>
      </div>
      <div class="rightBox">
        <el-form :model="formParams" class="demo-form-inline" label-width="100px">
          <el-form-item label="优先级">
            <el-select v-model="formParams.level" placeholder="--所有--">
              <el-option v-for="item in BUG_LEVEL" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="类型">
            <el-select v-model="formParams.level" placeholder="--所有--">
              <el-option v-for="item in []" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Bug状态">
            <el-select v-model="formParams.status" placeholder="--所有--">
              <el-option v-for="item in BUG_STATUS_DELETE" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="指派给:">
            <el-select v-model="formParams.staff_name" filterable placeholder="请选择" @change="setFiled" clearable>
              <el-option v-for="item in employeeLists" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="备注:" class="rp-Table__remark">
            <el-input :autosize="{ minRows: 2, maxRows: 4 }" show-word-limit placeholder="请输入备注" type="textarea" v-model="formParams.remark" maxlength="50"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getSession, BUG_LEVEL, BUG_STATUS } from "@/utils/index";
import useMixin from "../useMixin";
import { ResponseParams } from "@/types/response";
import { useStore } from "@/store";
import E from "wangeditor";
import { createBug, updateBug } from "@/api/request-modules/test";
import useMessageTip from "@/composables/useMessageTip";
import api from "@/api/dict";
export default defineComponent({
  name: "testEdit",
  setup() {
    const { tipMessage } = useMessageTip();
    const editRef = ref<HTMLElement>();
    let instance: any;
    const content = reactive({
      html: "",
      text: ""
    });
    onMounted(() => {
      instance = new E(editRef.value);
      instance.config.uploadFileName = "file";
      instance.config.uploadImgServer = api.uploadAssets;
      instance.config.uploadImgHooks = {
        customInsert: (insertImgFn: (url: string) => void, result: Record<string, any>) => {
          insertImgFn(result.url);
        }
      };
      instance.create();
      if (isEdit) {
        let bug = getSession("editBug", true) as any;
        if (bug) {
          formParams.description = instance && instance.txt.html(bug.description);
          formParams.name = bug.name;
          formParams.staff_name = bug.staff_name;
          formParams.staff_no = bug.staff_no;
          formParams.status = bug.status;
          formParams.level = bug.level;
          formParams.id = bug.id;
        }
      }
    });
    onBeforeUnmount(() => {
      instance.destroy();
      instance = null;
    });
    const syncHTML = () => {
      content.html = instance.txt.html();
    };
    const BUG_STATUS_DELETE = BUG_STATUS.slice().splice(1, BUG_STATUS.length);
    const employeeLists = computed(() => useStore() && useStore().getters.employeeLists);
    const route = useRoute();
    const router = useRouter();
    const { searchParams } = useMixin();
    let formParams = reactive({
      // bug描述
      description: "",
      // bug名称
      name: null,
      // 指派员工姓名
      staff_name: null,
      // 指派员工工号
      staff_no: null,
      status: null,
      level: null,
      id: null,
      fileList: [] as Array<Record<string, any>>
    });
    const isEdit = route.query.isEdit;

    const setFiled = (staff_name: string) => {
      if (!staff_name) {
        formParams.staff_no = null;
        return;
      }
      const staff_no = employeeLists.value.find((list: Record<string, any>) => list.staff_name === staff_name).staff_no;
      formParams.staff_no = staff_no;
    };
    const handleChangeBug = () => {
      formParams.description = instance.txt.html();
      const params = Object.assign(formParams, { iteration_id: searchParams.demand });
      if (isEdit) {
        // 更新
        updateBug<ResponseParams.ResponseDataSuccess>(params as any).then((res) => {
          tipMessage(res.code);
          setTimeout(() => {
            router.go(-1);
          }, 0);
        });
      } else {
        delete (params as Partial<typeof params>).id;
        // 创建
        createBug<ResponseParams.ResponseDataSuccess>(params as any).then((res) => {
          tipMessage(res.code);
          router.push({
            path: "/iteration/test",
            query: { ...router.currentRoute.value.query }
          });
        });
      }
    };
    // 文件上传
    const handleFileChange = (file: Record<string, any>, fileList: Array<Record<string, any>>) => {
      formParams.fileList = fileList;
    };
    return {
      handleFileChange,
      api,
      route,
      searchParams,
      formParams,
      BUG_LEVEL,
      employeeLists,
      BUG_STATUS_DELETE,
      handleChangeBug,
      setFiled,
      editRef,
      syncHTML,
      content
      // handleUploadSuccess
    };
  }
});
</script>
<style lang="less" scoped>
.main {
  height: calc(100vh - 170px);
  overflow-y: auto;
  display: flex;
  .leftBox {
    margin-right: 30px;
    flex-grow: 2;
    .btnGroup {
      text-align: center;
      .btnItem {
        margin-top: 30px;
        width: 150px;
        height: 40px;
        //  line-height: 40px;
      }
    }
  }
  .rightBox {
    flex-grow: 1;
  }
}
::v-deep(.el-form-item) {
  display: flex;
}
::v-deep(.el-select) {
  width: 100%;
}
::v-deep(.el-form-item__content) {
  flex: 1;
}
</style>
