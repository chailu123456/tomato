<!--
 * @Author: 宋绍华
 * @Date: 2022-05-12 10:51:41
 * @LastEditTime: 2022-08-18 16:54:06
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\project\home\index.vue
-->
<template>
  <div class="home">
    <!-- 基本信息，进度信息 -->
    <BaseInfo :detail="currentRt.productDetails" :indicators="currentRt.indicators" :product-id="productId" />
    <!-- 事件时间轴 -->
    <EventTimeLine :timelines="currentRt.timeLine" />
    <!-- 项目成员 -->
    <ProjectMembers :detail="currentRt.productDetails" @updateInfo="getProductDetails" />
  </div>
</template>

<script lang="ts">
import useHome, { IndicatorsResp, ProductDetailsResp, TimelineResp } from "@/composables/useHomePage";
import { store } from "@/store";
import { replaceProductId } from "@/views/iteration/useMixin";
import { computed, onMounted, reactive, watch } from "vue";
import BaseInfo from "./components/baseInfo.vue";
import EventTimeLine from "./components/eventTimeLine.vue";
import ProjectMembers from "./components/projectMembers.vue";
interface HomeRt {
  timeLine: TimelineResp[];
  productDetails: ProductDetailsResp | null;
  indicators: IndicatorsResp | null;
}

export default {
  name: "productHome",
  components: {
    BaseInfo,
    EventTimeLine,
    ProjectMembers
  }
};
</script>

<script lang="ts" setup>
const currentRt = reactive<HomeRt>({
  timeLine: [],
  productDetails: null,
  indicators: null
});

const { useGetTimeline, useGetProductDetails, useGetIndicators } = useHome();
const { productId } = replaceProductId();

const productList = computed(() => store.getters.productList);

onMounted(() => {
  currentRt.productDetails = null;
  if (productId.value) {
    getTimeLine();
    getProductDetails();
    getIndicators();
  }
  createWatch();

  setTimeout(() => {
    // 如果判断到无项目，就显示无数据
    if (!productList.value.length) {
      window.location.href = "/noAccess";
    }
  }, 1000);
});

const createWatch = () => {
  watch(
    () => productId.value,
    (newVal) => {
      if (!newVal) return;
      getTimeLine();
      getProductDetails();
      getIndicators();
    }
  );
};

// 获取时间轴信息
const getTimeLine = async () => {
  const data = await useGetTimeline(productId.value);
  if (data) currentRt.timeLine = data;
};

// 获取项目详情信息
const getProductDetails = async () => {
  const data = await useGetProductDetails(productId.value);
  if (data) currentRt.productDetails = data;
};

// 获取项目进度信息
const getIndicators = async () => {
  const data = await useGetIndicators(productId.value);
  if (data) currentRt.indicators = data;
};
</script>
<style lang="less" scoped>
.home {
  background-color: #fff;
  border-radius: 4px;
  padding: 10px;
}
</style>
