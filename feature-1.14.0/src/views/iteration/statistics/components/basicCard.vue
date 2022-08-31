<template>
  <div class="statistics-card">
    <el-card :style="{ height: height + 'px' }" class="card">
      <span>
        {{ title }}
        <el-tooltip v-if="tooltip && tooltip.length" placement="right" effect="light">
          <template #content>
            <div style="white-space: pre; font-size: 13px" v-for="(i, index) in tooltip" :key="index">
              <span style="font-weight: bold; font-size: 13px">{{ i.title }}：</span>
              <span>{{ i.content }}</span>
            </div>
          </template>
          <i class="el-icon-info"></i>
        </el-tooltip>
      </span>
      <div class="card-content">
        <slot></slot>
      </div>
    </el-card>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from "vue";
interface arrayParam {
  title: string;
  content: [];
}
export default defineComponent({
  props: {
    height: {
      type: Number as PropType<number>,
      default: 400
    },
    title: {
      type: String as PropType<string>,
      default: ""
    },
    tooltip: {
      type: Array as PropType<Array<arrayParam>>,
      default: () => []
    }
  },
  setup() {
    return {};
  }
});
</script>
<style lang="less" scoped>
.card {
  width: 100%;
  span {
    display: block;
    height: 24px;
    line-height: 24px;
  }
  &-content {
    height: calc(100% - 44px);
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
:deep(.el-card__body, .el-main) {
  padding: 10px;
  height: 100%;
}
</style>
