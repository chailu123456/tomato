<template>
  <div class="demand-origin">
    <el-select-v2
      v-model="inputValue"
      style="width: 100%"
      filterable
      remote
      :height="350"
      :remote-method="remoteMethod"
      clearable
      :options="options"
      :loading="loading"
      @change="change"
      placeholder="请输入姓名"
    >
      <template #default="{ item }">
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap">
          <span style="margin-right: 8px">{{ item.label }}</span>
          <span style="color: var(--el-text-color-secondary); font-size: 13px">
            {{ item.organization }}
          </span>
        </div>
      </template>
    </el-select-v2>
  </div>
</template>
<script lang="ts">
export default {
  name: "demand-origin"
};
</script>
<script lang="ts" setup>
import { defineProps, ref, defineEmits, watch } from "vue";
import { ResponseParams } from "@/types/response";
import { getDemandOriginList } from "@/api/request-modules/product";

const props = defineProps({
  val: {
    type: String,
    default: () => ""
  }
});

const emit = defineEmits(["updateOrigin"]);

interface ListItem {
  value: string;
  label: string;
}

interface P {
  name: string;
}

const options = ref<ListItem[]>([]);
const inputValue = ref<string>(props.val);
const loading = ref(false);
const remoteMethod = (query: string) => {
  console.log(query);
  if (query) {
    loading.value = true;
    setTimeout(() => {
      getDataOrigin({ name: query });
    }, 200);
  } else {
    options.value = [];
  }
};

const getDataOrigin = (params: P) => {
  getDemandOriginList<ResponseParams.ResponseDataSuccess>(params).then((res) => {
    if (res.data && res.data.length) {
      loading.value = false;
      options.value = res.data.filter((item) => {
        return item.label.includes(params.name);
      });
    } else {
      options.value = [];
    }
  });
};

watch(
  () => props.val,
  (newVal) => {
    inputValue.value = newVal;
  }
);

const change = (val: any) => {
  emit("updateOrigin", val);
};
</script>
<style lang="less">
.demand-origin {
  .el-select-v2__wrapper {
    border: none;
  }
}
</style>
