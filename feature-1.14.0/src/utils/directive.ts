export default (app: any): void => {
  // app.directive("debounce", {
  //   beforeMount(el: any, binding: Record<string, any>) {
  //     let timer: ReturnType<typeof setTimeout>;
  //     const fn = binding.value;

  //     el.addEventListener("click", function () {
  //       console.log(el);
  //       if (timer) {
  //         clearTimeout(timer);
  //       }
  //       timer = setTimeout(binding.value(), 1500);
  //     });
  //   }
  // });

  // 对element-plus button组件添加防抖
  app.directive("debounce", {
    beforeMount(el: any) {
      el.addEventListener("click", () => {
        el.classList.add("is-disabled");
        el.disabled = true;
        setTimeout(() => {
          el.disabled = false;
          el.classList.remove("is-disabled");
        }, 1500); //我这里设置的是2000毫秒也就是2秒
      });
    }
  });
  // element-plus table组件加载更多
  app.directive("loadmore", {
    beforeMount(el: any, binding: any) {
      const selectWrap = el.querySelector(".el-table__body-wrapper");
      selectWrap.addEventListener("scroll", () => {
        if (selectWrap.scrollTop) {
          if (selectWrap.scrollHeight - selectWrap.scrollTop <= selectWrap.clientHeight + 1) {
            binding.value(1);
          }
        }
      });
    },
    updated(el: any, binding: any) {
      let selectWrap = el.querySelector(".el-table__body-wrapper");
      selectWrap.removeEventListener("scroll", binding.value());
      selectWrap = null;
    }
  });
};
