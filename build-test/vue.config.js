/* eslint-disable prettier/prettier */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require("path");
const UglifyJsPlugin = require("terser-webpack-plugin");
const resolve = (dir) => path.resolve(__dirname, dir);
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const packageConfig = require("./package.json");

// const join = dir => path.join(__dirname, dir);
let cdn = {
  // css: ["/cdn/styles/element-plus/index.css"]
  // js: [
  //   "/cdn/vue/vue.runtime.global.prod.js",
  //   "/cdn/vue-router/vue-router.global.prod.min.js",
  //   "/cdn/vuex/vuex.global.prod.min.js",
  //   "/cdn/plugins/axios/axios.min.js"
  //   // "/cdn/plugins/element-plus/index.full.js"
  //   // "https://unpkg.com/element-plus/lib/index.full.js"
  // ]
};
const isPro = process.env.NODE_ENV === "production";

// 判断打包输出文件名称，生产则使用packjson中的version版本号，测试则使用时间戳进行命名
const folderName = isPro ? packageConfig.version : Date.parse(new Date());

module.exports = {
  productionSourceMap: false,
  indexPath: '../index.html', // 将打包好的index.html放到dist目录下(outputDir输出配置到了dist/版本号),所以这块要把index.html丢到版本号文件夹外层
  publicPath: 'https://file.vetscloud.com/'+ folderName,
  outputDir: 'dist/' + folderName,
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          javascriptEnabled: true
        }
      }
    }
    // extract:
    //   process.env.NODE_ENV === "production"
    //     ? {
    //         ignoreOrder: true
    //       }
    //     : false
  },
  chainWebpack: (config) => {
    if (process.env.use_analyzer) {
      config.plugin("webpack-bundle-analyzer").use(BundleAnalyzerPlugin);
    }
    if (isPro) {
      config.optimization.sideEffects(false);
      config.optimization.delete("splitChunks");
    }
    // 路径别名
    config.resolve.alias.set("@", resolve("src")).set("components", resolve("src/components")).set("api", resolve("src/api"));
    //  两种方案，可以选择不打包，src引入，也可以像splitChunks这样单独打包出来
    if (isPro) {
      config.plugin("html").tap((args) => {
        // html中添加cdn
        args[0].cdn = cdn;
        args[0].title = "Tomato项目管理工具";
        return args;
      });
    }
    // config.plugin("html").tap((args) => {
    //   args[0].title = "番茄系统";
    //   return args;
    // });
  },
  // pc端不需要rem可以去除这里的两个loader配置
  configureWebpack: (config) => {
    if (isPro) {
      // 打包文件大小配置
      config.performance = {
        maxEntrypointSize: 10000000,
        maxAssetSize: 30000000
      };
      // 这里vue-cli自带的terserOptions也可以去除，不需要引入
      config.plugins.push(
        new UglifyJsPlugin({
          terserOptions: {
            warnings: false,
            compress: {
              drop_debugger: true, // 注释console
              drop_console: true,
              pure_funcs: ["console.log"] // 移除console
            }
          },
          extractComments: false, // 是否将注释提取到一个单独的文件中
          // 开启多线程
          parallel: true
        }),
        new CleanWebpackPlugin()
      );
    }
    config.module.rules.push(
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto"
      },
      // {
      // test: /\.css$|.less$/,
      // use: [
      //       {
      //       loader: 'px2rem-loader',
      //       // options here
      //       options: {
      //         remUnit: 75,
      //         // 精确度
      //         remPrecision: 8
      //       }
      //     }
      //   ]
      // },
      {
        test: /\.less$/,
        use: [
          {
            loader: "style-resources-loader",
            options: {
              patterns: ["./src/styles/*.less"]
            }
          }
        ]
      },
      {
        test: "/.vue$/",
        loader: "css-loader",
        options: {
          loaders: {
            css: ExtractTextPlugin.extract({
              use: "css-loader",
              fallback: "vue-style-loader"
            })
          }
        }
      }
    );
    // 两种方案，可以选择不打包，src引入，也可以像splitChunks这样单独打包出来

      // config.externals = {
      //   vue: "Vue",
      //   "vue-router": "VueRouter",
      //   axios: "axios"
      //   // "element-plus": "ElementPlus"
      //   // "element-plus/lib/theme-chalk/index.css": "ElementPlus"
      // };
      if (isPro) {
        config.optimization = {
          splitChunks: {
            cacheGroups: {
              // 抽离所有使用了2次以上的公共代码
              common: {
                name: "chunk-common",
                chunks: "initial",
                minChunks: 2,
                maxInitialRequests: 5,
                minSize: 30,
                priority: 1,
                reuseExistingChunk: true,
                enforce: true
              },
              // 抽离node_modules下的库为一个chunk
              vendors: {
                name: "chunk-vendors",
                test: /[\\/]node_modules[\\/]/,
                chunks: "initial",
                priority: 2,
                reuseExistingChunk: true,
                enforce: true
              },
              wangEditor: {
                name: "chunk-wangEditor",
                test: /[\\/]node_modules[\\/]wangeditor[\\/]/,
                chunks: "initial",
                priority: 10,
                reuseExistingChunk: true,
                enforce: true
              },
              // 抽离element,
              element: {
                name: "chunk-element-ui",
                test: /[\\/]node_modules[\\/]element-plus[\\/]/,
                chunks: "all",
                priority: 10,
                reuseExistingChunk: true,
                enforce: true
              }
              // // 抽离vue
              // vue: {
              //   name: "chunk-vue",
              //   test: /[\\/]node_modules[\\/]vue[\\/]/,
              //   chunks: "all",
              //   priority: 4,
              //   reuseExistingChunk: true,
              //   enforce: true
              // },
            }
          }
        };
      } else {
        config.optimization = {
          splitChunks: {
            cacheGroups: {
              // 抽离所有使用了2次以上的公共代码
              common: {
                name: "chunk-aaa-common",
                chunks: "initial",
                minChunks: 2,
                maxInitialRequests: 5,
                minSize: 10000,
                priority: 1,
                reuseExistingChunk: true,
                enforce: true
              }
            }
          }
        };
      }
    
  },
  devServer: {
    disableHostCheck: true,
    port: 8080,
    https: true,
    // public: '0.0.0.0:8080',
    proxy: {
      "/api": {
        target: "http://10.1.1.248:8124",
        // target: "https://test.tomato.rvet.cn",
        // target: "http://10.11.12.25:8124/",
        changeOrigin: true,
        pathRewrite: {
          "^/api": ""
        }
      },
      "/data-api": {
        // target: "http://10.11.16.73:7077",
        target: "http://10.1.1.248:7077",
        changeOrigin: true
      },
      "/upload": {
        target: "http://10.1.1.248:12010",
        changeOrigin: true,
        pathRewrite: {
          "^/upload": ""
        }
      }
    }
  }
};
