<!--
 * @Author: 宋绍华
 * @Date: 2022-04-21 10:45:39
 * @LastEditTime: 2022-05-28 14:50:31
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\App.vue
-->
<template>
  <router-view v-slot="{ Component }">
    <transition>
      <component :is="Component" />
    </transition>
  </router-view>
</template>

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
