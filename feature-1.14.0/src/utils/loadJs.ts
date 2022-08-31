/**
 * 加载第三方cdn
 *  loadJS("https://cdn.skypack.dev/jquery", function () {
        加载成功执行
    });
 */

export const loadJs = (url: string, success: any) => {
  const domScript: any = document.createElement("script");
  domScript.src = url;
  success =
    success ||
    function () {
      console.log("成功");
    };
  domScript.onload = domScript.onreadystatechange = function () {
    if (!this.readyState || "loaded" === this.readyState || "complete" === this.readyState) {
      success();
      this.onload = this.onreadystatechange = null;
      this.parentNode.removeChild(this);
    }
  };
  document.getElementsByTagName("head")[0].appendChild(domScript);
};
