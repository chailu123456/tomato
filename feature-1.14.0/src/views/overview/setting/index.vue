<template>
  <div class="rp-setting-person">
    <el-form :model="dialogParams" :rules="rules" ref="formRef" label-width="120px" class="product-form">
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
        {{ dialogParams.remark }}
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
        <el-button plain type="primary" @click="handleConfirmSave">编辑信息</el-button>
        <el-popconfirm v-if="isShowDelBtn" title="确认删除该项目吗？" @confirm="handleDelete">
          <template #reference>
            <el-button plain type="danger">删 除</el-button>
          </template>
        </el-popconfirm>
      </el-form-item>
    </el-form>

    <!-- 编辑弹窗 -->
    <HandleProduct :dialogParams="dialogParams" v-model:visible="visible" />
  </div>
</template>

<script lang="ts">
import { selectProductList, updateStatus } from "@/api/request-modules/product";
import useWatchChangeProduct from "@/composables/useWatchChangeProduct";
import { ResponseParams } from "@/types/response";
import { setSession } from "@/utils";
import useGetDemandList from "@/views/iteration/useGetDemandList";
import { replaceProductId, demandList } from "@/views/iteration/useMixin";
import { computed, defineComponent, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import HandleProduct from "@/layout/header/components/handleProduct.vue";
import useCeateOrEditProduct from "@/layout/header/composables/useCeateOrEditProduct";

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
    const { productLists, productId } = replaceProductId();
    const { getProductPermission } = useCeateOrEditProduct();
    const formRef = ref<(HTMLElement & { resetFields: () => void; clearValidate: () => void; validate: (...args: Array<any>) => void }) | null>(null);
    const visible = ref(false);
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
      is_report: 0
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
        () => productLists.value,
        (newValue) => {
          if (newValue.length) {
            getProduct();
            getPermission();
          }
        }
      );
      // 获取项目的权限，是否显示删除按钮
      getPermission();
    });
    const getPermission = async () => {
      isShowDelBtn.value = await getProductPermission(productId.value);
    };
    const getProduct = () => {
      const productDetail = (productLists.value as Array<Record<string, any>>).find((v) => v.id === productId.value);
      Object.keys(dialogParams).forEach((key) => {
        // @ts-ignore
        dialogParams[key] = productDetail[key];
      });
    };

    useWatchChangeProduct(
      () => {
        /** */
      },
      () => {
        if (!productLists.value.length) return;
        getProduct();
        getPermission();
      }
    );
    //#region 点击保存
    const handleConfirmSave = () => {
      visible.value = true;
    };
    //#endregion
    //#region 删除
    const getDemandList = useGetDemandList();
    const router = useRouter();
    const handleDelete = () => {
      updateStatus([
        {
          status: 0,
          id: productId.value
        }
      ]).then(() => {
        // 重新获取当前产品列表，更新
        selectProductList<ResponseParams.ResponseDataSuccess>().then((res: Record<string, any>) => {
          productLists.value = res.data;
          productId.value = productLists.value[0] ? productLists.value[0].id : [];
          setSession("productId", productId.value);
          setSession("productInfo", typeof productLists.value[0] !== "undefined" ? JSON.stringify(productLists.value[0]) : "");
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
            productLists.value.forEach((v: Record<string, any>) => {
              cacheObj.push({
                projectId: v.id,
                iterationId: null,
                yapi_default_iteration_id: v.yapi_default_iteration_id
              });
            });
            setSession("cacheProject", JSON.stringify(cacheObj));
          });
        });
      });
    };
    //#endregion
    return {
      dialogParams,
      rules,
      handleConfirmSave,
      formRef,
      handleDelete,
      visible,
      handleUrl,
      isShowDelBtn
    };
  }
});
</script>

<style lang="less" scoped>
.rp-setting-person {
  background: #fff;
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
    .is-plain {
      color: #1f9f85;
      background: rgb(233, 245, 243);
      border-color: rgb(165, 217, 206);
    }
    .el-button--danger.is-plain {
      color: #f56c6c;
      background: #fef0f0;
      border-color: #fbc4c4;
    }
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
