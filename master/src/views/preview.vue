<!--
 * @Author: 宋绍华
 * @Date: 2022-08-04 10:16:42
 * @LastEditTime: 2022-08-19 18:16:02
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\preview.vue
-->
<template>
  <div v-loading="loading" class="rp">
    <div class="rp" v-if="!loading">
      <el-empty v-if="!iframeHost" :imageSize="details?.is_unpacked === 0 ? 0.1 : ''">
        <span v-if="details?.is_unpacked === 0" style="width: 100px; height: 100px; display: inline-block" v-loading="true"> </span>
        <span class="rp-text">{{ text }}</span>
      </el-empty>
      <iframe v-else frameborder="no" scrolling="no" style="width: 100vw; height: 100vh" :src="iframeHost" :allowtransparency="true"></iframe>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "preview"
};
</script>

<script lang="ts" setup>
import useDemandDoc, { Details } from "@/composables/useDemandDoc";
import router from "@/router";
import { onMounted, onUnmounted, ref } from "vue";
const { useGetDeamdDetails } = useDemandDoc();

const iframeHost = ref("");
const text = ref("正在加载中...");
const details = ref<Details>();
const loading = ref(true);
let timer: ReturnType<typeof setTimeout>;
onMounted(async () => {
  const { id } = router.currentRoute.value.query;
  const _id = parseInt(id as string);
  loading.value = true;
  if (_id && !isNaN(_id)) {
    await getDetails(_id);
    setText();
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }
});

// 获取需求详情
const getDetails = async (id: number) => {
  const data = await useGetDeamdDetails({ id });

  if (data) {
    details.value = data;
    document.title = data.title;
    // 如果iframeHost为空，则设置iframeHost
    if (!iframeHost.value && data.preview_url) {
      iframeHost.value = data.preview_url;
    } else if (details.value?.is_unpacked === 0 && details.value?.type !== 2) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        getDetails(id);
      }, 5000);
    } else {
      setText();
    }
  } else {
    text.value = "加载失败，请刷新重试";
  }
};

const setText = () => {
  if (!details.value) return;
  const { is_unpacked, type } = details.value;
  switch (is_unpacked) {
    case 0:
      // rp文件类型或者index.html文件类型
      if (type === 1 || type === 4) {
        text.value = "文件解析中，大约需要30s，正在解析中...";
      } else {
        window.location.href = "/noAccess";
      }
      break;
    case 2:
      if (type === 1) {
        text.value = "RP文件解析失败，请重新上传，或修改文件类别为“其他文件”";
      } else {
        text.value = "压缩包解压失败，请重新上传，或修改文件类别为“其他文件”";
      }
      break;
    case 3:
      text.value = "压缩包未包含index.html或start.html，请重新上传，或修改文件类别为“其他文件”";
      break;
  }
};

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
  }
});
</script>
<style lang="less" scoped>
.rp {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  &-text {
    margin: 0;
    font-size: var(--el-font-size-base);
    color: var(--el-text-color-secondary);
  }
}

:global(.rp .el-empty__bottom) {
  display: flex;
  flex-direction: column;
  align-items: center;
}
:global(.rp .el-empty__description) {
  display: none;
}
</style>
