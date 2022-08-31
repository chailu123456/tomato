<template>
  <div class="progress-item">
    <p>{{ title }}</p>
    <p v-if="!isStatus">
      <span class="progress-item__progressText"
        >{{ total }}<span class="symbol">{{ unit }}</span></span
      >
      <i class="el-icon-top progress-item__progressText--up" v-if="today > 0"></i>
      <i class="el-icon-bottom progress-item__progressText--down" v-else></i>
      <span :class="[today > 0 ? 'progress-item__progressText--up' : 'progress-item__progressText--down']">{{ today }}{{ unit }}</span>
    </p>
    <p class="progress-title" v-if="!isStatus">
      <slot></slot>
    </p>
    <p v-if="isStatus">
      <slot></slot>
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "iterationCard",
  props: {
    title: {
      type: String as PropType<string>,
      default: ""
    },
    total: {
      type: Number as PropType<number>,
      default: 0
    },
    today: {
      type: Number as PropType<number>,
      default: 0
    },
    unit: {
      type: String as PropType<string>,
      default: ""
    },
    isStatus: {
      // 是否是发布状态card
      type: Boolean as PropType<boolean>,
      default: false
    }
  }
});
</script>

<style lang="less" scoped>
.progress-item {
  position: relative;
  border-radius: 10px;
  box-sizing: border-box;
  padding: 20px 30px 0;
  text-align: left;
  flex: 0 0 24%;
  height: 170px;
  background: rgba(231, 248, 245);
  // margin-right: 50px;
}
.progress-item__progressText {
  color: #003300;
  i {
    font-weight: 700;
  }
  margin-right: 20px;
  font-weight: 700;
  font-size: 30px;
}
.progress-item__progressText--up {
  color: #009966;
}
.progress-title {
  color: #a3a4a4;
}
.progress-item__progressText--down {
  color: #fe4066;
}
.progress-item__icon {
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(254, 64, 102);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  position: absolute;
  right: 30px;
  top: 50%;
  transform: translateY(-70%);
  i {
    font-size: 50px;
  }
}
&:last-child {
  margin-right: 0;
}
</style>
