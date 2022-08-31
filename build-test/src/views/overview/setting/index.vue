<template>
  <div class="rp-setting-person">
    <el-form :model="dialogParams" :rules="rules" ref="formRef" label-width="120px" class="product-form">
      <el-form-item label="项目logo">
        <img class="rp-setting-person-logo" :src="dialogParams.logo || CONSTVAR.LOGO" />
      </el-form-item>
      <el-form-item label="项目名称">
        {{ dialogParams.name }}
      </el-form-item>
      <el-form-item label="项目ID">
        <span>{{ dialogParams.id }}</span>
      </el-form-item>
      <el-form-item label="项目代号">
        <span>{{ dialogParams.code }}</span>
      </el-form-item>
      <el-form-item label="提醒地址" prop="notify_url">
        <span class="product-form__url" v-for="n in handleUrl" :key="n">{{ n }}</span>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <span style="word-break: break-all">{{ dialogParams.remark }}</span>
      </el-form-item>
      <el-form-item label="需求审批" prop="is_approval">
        <p v-if="dialogParams.is_approval === 1" style="margin: 0">
          需要审批
          <span style="margin-left: 5px; color: #999">(需求池内的需求需要提交审批单，领导审批通过后才可以排期迭代)</span>
        </p>
        <p v-else style="margin: 0">
          无需审批
          <span style="margin-left: 5px; color: #999">(需求池内的需求无需提交审批单，可以直接进行排期迭代)</span>
        </p>
      </el-form-item>
      <el-form-item label="邮件汇报" prop="is_report">
        <p v-if="dialogParams.is_report === 1" style="margin: 0">
          需要汇报 <span style="margin-left: 5px; color: #999">(每周通过邮件向领导汇报项目进度时，需要统计本项目)</span>
        </p>
        <p v-else style="margin: 0">无需汇报 <span style="margin-left: 5px; color: #999">(每周通过邮件向领导汇报项目进度时，无需统计本项目)</span></p>
      </el-form-item>
      <el-form-item class="flex_layout">
        <el-button plain type="primary" @click="handleConfirmSave($event)">编辑信息</el-button>
        <el-button plain type="success" @click="handleProject(4, $event)">结项</el-button>
        <el-button plain @click="handleProject(dialogParams.state !== 3 ? 3 : 1, $event)">{{ dialogParams.state === 3 ? "取消搁置" : "搁置" }}</el-button>
        <el-button @click="handleDelete($event)" plain type="danger">删 除</el-button>
      </el-form-item>
    </el-form>

    <!-- 编辑弹窗 -->
    <HandleProduct :dialogParams="dialogParams" v-model:visible="visible" @updateInfo="onUpdateInfo" />
  </div>
</template>

<script lang="ts">
import { selectProductList, updateStatus } from "@/api/request-modules/product";
import useWatchChangeProduct from "@/composables/useWatchChangeProduct";
import { ResponseParams } from "@/types/response";
import { setSession } from "@/utils";
import { CONSTVAR } from "@/utils/enum";
import useGetDemandList from "@/views/iteration/useGetDemandList";
import { demandList } from "@/views/iteration/useMixin";
import { computed, defineComponent, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import HandleProduct from "@/layout/header/components/handleProduct.vue";
import useCeateOrEditProduct from "@/layout/header/composables/useCeateOrEditProduct";
import { ElMessage, ElMessageBox } from "element-plus";
import useHome from "@/composables/useHomePage";
import useApproval from "@/composables/useApproval";
import useCommon, { ProjectItem } from "@/composables/useCommon";
import { store } from "@/store";
import { MutationType } from "@/store/mutation-types";

const { useUnshelve } = useApproval();
const checkAddress = (rule: Array<unknown>, value: string, callback: (...args: Array<unknown>) => void): void => {
  const reg = /https:\/\/qyapi.weixin.qq.com\/cgi-bin\/webhook\/send\?key=(\w|\d|-){1,}/g;
  if (!value) {
    callback();
    return;
  }
  if (!reg.test(value)) {
    callback(new Error("格式错误，正确格式为 https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key="));
  } else {
    callback();
  }
};
const rules = {
  name: [
    { required: true, message: "请输入产品名称", trigger: "blur" },
    { min: 2, max: 10, message: "长度在 2 到 10 个字符", trigger: "blur" }
  ],
  remark: [
    { required: false, message: "请输入产品描述", trigger: "blur" },
    { min: 0, max: 200, message: "长度在 0 到 200 个字符", trigger: "blur" }
  ],
  notify_url: [
    {
      validator: checkAddress,
      trigger: "blur"
    }
  ]
};
export default defineComponent({
  components: {
    HandleProduct
  },
  setup() {
    const { getProductPermission } = useCeateOrEditProduct();
    const { useHandleProjectStatus } = useHome();
    const { useGetProjectList } = useCommon();
    const productList = computed(() => store.getters.productList);
    const productId = computed(() => store.getters.productId);

    const formRef = ref<(HTMLElement & { resetFields: () => void; clearValidate: () => void; validate: (...args: Array<any>) => void }) | null>(null);
    const visible = ref(false);
    // @ts-ignore
    const dialogParams = reactive({
      // 项目名称
      name: "",
      // 备注
      remark: "",
      // 编辑的id
      id: 0,
      // 项目代号
      code: "",
      // 提醒地址
      notify_url: "",
      // 是否需要审批
      is_approval: 0,
      // 是否需要邮件报告
      is_report: 0,
      // 项目logo
      logo: "",
      // 当前状态
      state: 0
    });

    const isShowDelBtn = ref(false);

    const handleUrl = computed(() => {
      const { notify_url } = dialogParams;
      if (!notify_url.includes("，") && notify_url) {
        return notify_url.split(",");
      }
      return [notify_url];
    });

    onMounted(() => {
      watch(
        () => productList.value,
        (newValue) => {
          if (newValue.length) {
            getProduct();
            getPermission();
          }
        },
        {
          deep: true
        }
      );
      // 获取项目的权限，是否显示删除按钮
      getPermission();
    });
    const getPermission = async () => {
      isShowDelBtn.value = await getProductPermission(productId.value);
    };

    const getProduct = () => {
      const productDetail = (productList.value as ProjectItem[]).find((v) => v.id === parseInt(productId.value));

      productDetail &&
        Object.keys(dialogParams).forEach((key) => {
          const k = key as keyof typeof productDetail;
          // @ts-ignore
          dialogParams[k] = productDetail![k];
        });
    };

    useWatchChangeProduct(
      () => {
        /** */
      },
      () => {
        if (!productList.value.length) return;
        getProduct();
        getPermission();
      }
    );
    const hideBtnbackground = (e: any) => {
      if (e) {
        let target = e.target;
        if (target.nodeName == "SPAN" || target.nodeName == "I") {
          target = e.target.parentNode;
        }
        target.blur();
      }
    };
    //#region 点击保存
    const handleConfirmSave = (e: any) => {
      hideBtnbackground(e);
      visible.value = true;
    };
    //#endregion
    //#region 删除
    const getDemandList = useGetDemandList();
    const router = useRouter();
    const handleDelete = async (e: any) => {
      hideBtnbackground(e);

      const confirm = await ElMessageBox.confirm("确认删除该项目吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        confirmButtonClass: "el-button--danger-box"
      });

      if (confirm !== "confirm") return;

      updateStatus([
        {
          status: 0,
          id: productId.value
        }
      ]).then(() => {
        // 重新获取当前产品列表，更新
        selectProductList<ResponseParams.ResponseDataSuccess>().then((res: Record<string, any>) => {
          store.commit(MutationType.updateProductList, res.data);
          // 设置项目缓存
          store.commit(MutationType.updateProductInfo, productList.value[0]);
          store.commit(MutationType.updateProductId, productList.value[0].id);
          router.replace({
            query: Object.assign(
              { ...router.currentRoute.value.query },
              {
                productId: productId.value
              }
            )
          });
          demandList.value = [];
          getDemandList(productId.value).then((res) => {
            demandList.value = res;
            const cacheObj = [] as Array<any>;
            productList.value.forEach((v: Record<string, any>) => {
              cacheObj.push({
                projectId: v.id,
                iterationId: null,
                yapi_default_iteration_id: v.yapi_default_iteration_id
              });
            });
            setSession("cacheProject", JSON.stringify(cacheObj));
          });
          return true;
        });
      });
    };

    // 结项和搁置
    const handleProject = async (type: number, e?: any) => {
      hideBtnbackground(e);

      let isSucc: boolean | null = false;

      const val = type === 3 ? "是否确认将项目变更为搁置状态" : type === 4 ? "是否确认将项目变更为结项状态" : "是否确认将项目取消搁置";
      const typeStr = await ElMessageBox.confirm(`${val}？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      });
      if (typeStr === "confirm") {
        if (type === 1) {
          isSucc = await handleShelve();
        } else {
          isSucc = await useHandleProjectStatus({ product_id: productId.value, state: type });
        }

        if (!isSucc) return;
      }
      ElMessage.success("操作成功");

      await getProjectList();
      getProduct();
      getPermission();
    };

    // 取消搁置
    const handleShelve = async () => {
      const isSucc = await useUnshelve(productId.value);
      return isSucc;
    };
    // 获取新的项目list
    const getProjectList = async () => {
      const data = await useGetProjectList();
      if (data) {
        store.commit(MutationType.updateProductList, data);
        return true;
      }
      return false;
    };

    const onUpdateInfo = () => {
      getProjectList();
    };
    //#endregion
    return {
      onUpdateInfo,
      getProjectList,
      handleProject,
      dialogParams,
      rules,
      handleConfirmSave,
      formRef,
      handleDelete,
      visible,
      handleUrl,
      isShowDelBtn,
      CONSTVAR
    };
  }
});
</script>

<style lang="less" scoped>
.rp-setting-person {
  background: #fff;

  &-logo {
    width: 40px;
    height: 40px;
  }
}
.product-form {
  width: 50%;
  margin-left: 6%;
  margin-top: 2%;

  &__url {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
    color: #666;
  }
  :deep(.el-form-item) {
    &__label {
      padding-right: 30px;
    }
    display: flex;
  }
  :deep(.el-form-item__content) {
    flex-grow: 1;
  }
  .flex_layout {
    :deep(.el-form-item__content) {
      display: flex;
      justify-content: center;
      position: absolute;
      right: 40px;
      top: 100px;
    }
  }
}
</style>
