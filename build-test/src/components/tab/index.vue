<template>
  <el-row>
    <el-col :span="18">
      <el-tabs v-model="currentTabVal" @tab-click="handleTab">
        <el-tab-pane v-for="item in editableTabs" :key="item.id" :label="item.name" :name="item.id"> </el-tab-pane>
      </el-tabs>
    </el-col>
    <el-col :span="6">
      <span style="display: inline-block; width: 4%; border-bottom: 2px solid #e5e7ed; height: 20px; margin-top: 18px; float: left"></span>
      <el-input
        @change="handleSearch"
        @keyup.enter="handleConditionSearch"
        clearable
        class="rp-tab-search"
        placeholder="搜索文章标题"
        prefix-icon="el-icon-search"
        v-model="searchVal"
      >
      </el-input>
    </el-col>
  </el-row>
</template>

<script lang="ts">
import { toRefs, ref, defineComponent, computed } from "vue";
export default defineComponent({
  name: "Tab",
  props: {
    tabsValue: {
      type: String,
      default: () => "1"
    },
    editableTabs: {
      type: Array,
      default: () => [
        {
          name: "全部",
          id: "1"
        }
      ]
    }
  },
  setup(props, { emit }) {
    const currentTabVal = computed(() => props.tabsValue);
    const searchVal = ref(window.location.href.includes("guifan") ? "规范" : "");
    const handleTab = (params: Record<string, any>) => {
      const obj: Record<string, any> = { name: params.props.label, id: params.props.name };
      emit("handleTab", obj);
    };

    const handleConditionSearch = () => {
      emit("handleUpdateSearchVal", searchVal.value);
    };

    const handleSearch = (val: string) => {
      if (!val) emit("handleUpdateSearchVal", "");
    };

    return {
      ...toRefs(props),
      handleTab,
      handleConditionSearch,
      handleSearch,
      currentTabVal,
      searchVal
    };
  }
});
</script>
<style scoped lang="less">
.rp-tab-search {
  width: 96%;
  height: 38px;
  line-height: 34px;
  border-bottom: 2px solid #e5e7ed;
}
:deep(.el-tabs__item) {
  line-height: 34px;
}
:deep(.el-tabs__nav-next) {
  line-height: 34px;
}
:deep(.el-tabs__nav-prev) {
  line-height: 34px;
}
</style>
