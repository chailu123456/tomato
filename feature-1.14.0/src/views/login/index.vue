<template>
  <section class="login">
    <div class="login__wrapper">
      <div class="login__wrapper__left">
        <i class="iconfont icon-fanqielogo3x"></i>
        <img src="@/assets/login-img.png" alt="" />
      </div>
      <div class="login__wrapper__right">
        <div>
          <div class="qr-code" id="canvasRef"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import useLogin from "./hooks/useLogin";
import { RouterLink } from "vue-router";
export default defineComponent({
  props: {
    // @ts-ignore
    ...RouterLink.props,
    inactiveClass: String
  },
  setup() {
    const { getQRCode } = useLogin("canvasRef");
    onMounted(getQRCode);
  }
});
</script>

<style lang="less" scoped>
section {
  width: 70%;
  height: 645px;
  box-shadow: 0px 2px 24px 0px rgba(25, 140, 116, 0.15);
  margin: 0 auto;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  .login__wrapper {
    display: flex;
    height: 100%;
    img {
      width: 100%;
      height: 100%;
    }
    .login__wrapper__left {
      width: 50%;
      flex: 1;
      position: relative;
      .icon-fanqielogo3x {
        font-size: 80px;
        position: absolute;
        color: #fff;
        top: 5%;
        left: 50%;
        transform: translateX(-50%);
      }
    }
    .login__wrapper__right {
      flex: 1;
      align-items: center;
      display: flex;
      justify-content: center;
      .qr-code {
        height: 300px;
        width: 300px;
        margin: 0 auto;
      }
      p {
        text-align: center;
        line-height: 0px;
      }
    }
  }
}
</style>
