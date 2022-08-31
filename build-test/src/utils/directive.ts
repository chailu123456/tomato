/*
 * @Author: 宋绍华
 * @Date: 2022-05-11 10:58:00
 * @LastEditTime: 2022-05-11 15:58:41
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\utils\directive.ts
 */
export default (app: any): void => {
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
  interface SpinningElement extends HTMLInputElement {
    inputEle?: HTMLInputElement;
    _blurHandler: (showing: Event) => void;
  }
  // input指令添加，去除首尾空格
  app.directive("trim", {
    inserted: (el: SpinningElement) => {
      let inputEle = HTMLInputElement as any;
      if (el.tagName !== "INPUT") {
        inputEle = el.querySelector("input");
      } else {
        inputEle = el;
      }
      const handler = function (event: any) {
        const newVal = event.target.value.trim();
        if (event.target.value != newVal) {
          event.target.value = newVal;
          const evt = document.createEvent("HTMLEvents");
          evt.initEvent("input", true, true);
          inputEle.dispatchEvent(evt);
        }
      };
      el.inputEle = inputEle;
      el._blurHandler = handler;
      inputEle.addEventListener("blur", handler);
    },
    unbind(el: any) {
      const { inputEle } = el;
      inputEle.removeEventListener("blur", el._blurHandler);
    }
  });
};
