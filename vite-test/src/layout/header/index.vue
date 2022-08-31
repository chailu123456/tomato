<template>
  <el-header class="header">
    <div>
      <span class="common-title">
        {{ routeName }}
      </span>
    </div>
    <!-- <div class="iteration__searchBox"> -->
    <el-form :inline="true" :model="searchParams" v-if="isIterationPage">
      <!-- <el-form-item label="迭代状态:">
        <el-select v-model="searchParams.status" placeholder="请选择" @change="handleSelectChange">
          <el-option v-for="item in STATUS" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item label="迭代:">
        <!-- <el-cascader
    placeholder="试试搜索：指南"
    :options="options"
    filterable></el-cascader> -->
        <el-select v-model="searchParams.demand" placeholder="请选择" @change="handleConditionSearch" filterable>
          <el-option v-for="item in demandList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item v-if="isIterationPage">
        <el-button type="primary" @click="handleConditionSearch">确定</el-button>
      </el-form-item>
      <el-form-item class="float-right" v-if="isIterationPage">
        <el-button type="primary" @click="handleChangeDialogStatus">新增迭代</el-button>
      </el-form-item> -->
    </el-form>
  </el-header>
</template>

<script lang="ts">
import { defineComponent, watch, ref, Ref } from "vue";
import { useRoute } from "vue-router";
import useMixin from "@/views/iteration/useMixin";
import { STATUS } from "@/utils/contantOptions";
import useGetDemandList from "@/views/iteration/useGetDemandList";
// import { languageMap } from "@/plugins/i18n/i18n";
export default defineComponent({
  setup() {
    const route = useRoute();
    const { searchParams, handleConditionSearch, handleChangeDialogStatus, demandList } = useMixin(false);
    let routeName: Ref = ref(null);
    // let language = Object.keys(languageMap);
    // let selectLanguage: Ref = ref("中文");
    const isIterationPage = ref(true);
    watch(
      () => route.path,
      (path) => {
        routeName.value = route.matched.find((v) => v.path === path)?.meta.title;
        if (/iteration/.test(path)) {
          isIterationPage.value = true;
        } else {
          isIterationPage.value = false;
        }
      },
      {
        immediate: true
      }
    );
    // const handleChangeLanguage = (res: string) => {
    //   selectLanguage.value = res;
    // };
    //#region 获取需求下拉列表
    const getDemandList = useGetDemandList();
    const getDemandListFn = (id: number) => {
      getDemandList(id).then((res) => {
        demandList.value = res;
      });
    };
    getDemandListFn(-1);
    const handleSelectChange = (id: number) => {
      searchParams.demand = null;
      getDemandListFn(id);
    };
    //#endregion
    return {
      isIterationPage,
      searchParams,
      routeName,
      demandList,
      handleSelectChange,
      STATUS,
      handleConditionSearch,
      handleChangeDialogStatus
      // selectLanguage
    };
  }
});
</script>

<style scoped lang="less">
.el-header,
.el-footer {
  background-color: #b3c0d1;
  color: #333;
  text-align: left;
  line-height: 80px;
}
.header {
  user-select: none;
  background-color: #ebf8f6 !important;
  display: flex;
  justify-content: space-between;
}
::v-deep(.el-form--inline .el-form-item__content) {
  vertical-align: unset;
}
// ::v-deep(.el-button) {
//   margin-top: 9%;
// }
</style>
