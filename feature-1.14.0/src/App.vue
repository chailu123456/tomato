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
