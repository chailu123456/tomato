<template>
  <router-view v-slot="{ Component }">
    <transition>
      <component :is="Component" />
    </transition>
  </router-view>
</template>
<script lang="ts">
import { defineComponent } from "vue";

// import { useStore } from "./store";
// import { login } from "api/request";

// 定义返回的数据接口格式
// interface Userinfo {
//   username?: string;
//   age?: number;
// }

// interface Data {
//   lists: Array<unknown>;
//   isOpen: boolean;
//   userInfo: Userinfo;
// }
/**
 * 调用示例
 */
export default defineComponent({
  //   // setup() {
  //   //   // store使用
  //   //   const store = useStore();
  //   //   // 定义data
  //   //   const data = reactive<Data>({
  //   //     lists: [],
  //   //     isOpen: false,
  //   //     userInfo: {}
  //   //   });
  //   //   // 接口调用
  //   //   // const getUserInfo = async () => {
  //   //   //   data.userInfo = await login<Userinfo>({ username: "1", password: 132 });
  //   //   // };
  //   //   // onMounted(getUserInfo);
  //   //   return {
  //   //     data,
  //   //     getUserInfo
  //   //   };
  //   // }
});
</script>

<style lang="less">
html,
body,
#app {
  position: relative;
  height: 100%;
  line-height: normal;
}
ul {
  padding: 0;
  margin: 0;
}
li {
  list-style: none;
}
</style>
