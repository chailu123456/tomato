(window.webpackJsonp=window.webpackJsonp||[]).push([["usecase"],{"39d7":function(e,t,n){},"66b6":function(e,t,n){"use strict";n("fc7e")},"67bf":function(e,t,n){},"71ee":function(e,t,n){"use strict";var a=n("7a23"),r=n("d257"),l=Object(a.defineComponent)({props:{fullscreen:{type:Boolean,default:!1}},emits:["update:fullscreen"],setup:function(e,t){var n=t.emit,l=e,o=function(){return Object(a.createVNode)("span",{class:"fullscreen-icon-global iconfont icon-fullscreen",onClick:c},null)},c=function(){n("update:fullscreen",!l.fullscreen),Object(r.P)(),Object(r.I)((function(e){n("update:fullscreen",e)}))};return function(e,t){return Object(a.openBlock)(),Object(a.createBlock)(o)}}}),o=(n("9a6d"),n("6b0d"));const c=n.n(o)()(l,[["__scopeId","data-v-d63bdac2"]]);t.a=c},"8b8f":function(e,t,n){},"8fcc":function(e,t,n){"use strict";n.r(t),n("b0c0");var a=n("7a23"),r={key:0,class:"rp-case-content"},l={class:"search-header"},o={class:"search-right"},c=Object(a.createTextVNode)("导 出"),u=function(e){return Object(a.pushScopeId)("data-v-238d9cbc"),e=e(),Object(a.popScopeId)(),e}((function(){return Object(a.createElementVNode)("span",{class:"js-drawer-uncloseable"},"新增用例",-1)})),i=Object(a.createTextVNode)("批量新增"),d=Object(a.createTextVNode)("快捷导入"),s=["onClick"],b={style:{"padding-left":"8px"}},f=Object(a.createTextVNode)("提BUG"),v=Object(a.createTextVNode)("删除"),p={class:"rp-test-list-num"},O={key:0,class:"rp-use-case-opation"},m=Object(a.createTextVNode)(" 基础项 "),j=Object(a.createTextVNode)("删除"),h={style:{"margin-bottom":"160px"}},g={class:"dialog-footer"},C=Object(a.createTextVNode)("取 消"),_=Object(a.createTextVNode)("确 定"),y={key:1,class:"empty-block"},w=n("5530"),k=n("1da1"),V=(n("96cf"),n("ac16"),n("d81d"),n("a9e3"),n("159b"),n("caad"),n("4de4"),n("3411")),N=n("71ee"),x=n("9b06"),S=n("4fba"),D=n("7f6ba"),T=n("81ab"),E=n("3740"),R=n("0613"),B=n("d257"),U=n("eaf6"),I=n("4a15"),P=n("f6f2"),A=n("3532"),F=Object(a.createElementVNode)("p",{style:{"margin-top":"0"}},"1、下载模板",-1),L=Object(a.createTextVNode)(" 下载测试用例模板，并按照规则填写内容 "),M=Object(a.createElementVNode)("p",null,"2、上传内容",-1),J=Object(a.createElementVNode)("i",{class:"el-icon-upload"},null,-1),z={class:"el-upload__text"},G=Object(a.createTextVNode)(" 将文件拖到此处，或"),K=Object(a.createElementVNode)("em",null,"点击选择文件上传",-1),H={class:"dialog-footer"},q=Object(a.createTextVNode)("取 消"),Q=Object(a.createTextVNode)("开始导入"),W=Object(a.createElementVNode)("p",null,"导入失败！",-1),Y=Object(a.createTextVNode)("失败原因已标识在表格中"),$={class:"dialog-footer"},X=Object(a.createTextVNode)("关 闭"),Z=Object(a.defineComponent)({props:{visible:{type:Boolean,default:!1}},emits:["update:visible","update"],setup:function(e,t){var n=t.emit,r=e,l=Object(a.ref)(""),o=Object(a.ref)(""),c=Object(a.ref)(!1),u=Object(a.computed)({get:function(){return r.visible},set:function(e){n("update:visible",e)}}),i=Object(R.c)(),d=Object(a.ref)(),s=Object(U.a)().tipMessage,b=Object(a.computed)((function(){var e;return null==i||null===(e=i.getters)||void 0===e?void 0:e.productInfo})),f=Object(a.computed)((function(){var e;return null==i||null===(e=i.getters)||void 0===e?void 0:e.iterateId})),v=function(){d.value.clearFiles(),o.value="",u.value=!1,c.value=!1},p=function(e){d.value.clearFiles();var t=e[0];t.uid=Object(I.a)(),d.value.handleStart(t)},O=function(){d.value.clearFiles(),o.value=""},m=new FormData,j=function(){var e=Object(k.a)(regeneratorRuntime.mark((function e(t){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(m=new FormData,/\.(xls|xlsx)$/.test(t.name.toLowerCase())){e.next=5;break}return d.value.clearFiles(),o.value="",e.abrupt("return",s(400,"上传格式不正确，请上传xls或者xlsx格式"));case 5:o.value=t.name,m.append("file",t.raw),m.append("iteration_id",f.value);case 8:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),h=function(){if(!o.value)return s(400,"请上传xls或者xlsx格式文件");var e=E.a.service({lock:!0,text:"导入中...",background:"rgba(0, 0, 0, 0.7)"});Object(T.Y)(m).then((function(t){if(t.data&&t.data.success)u.value=!1,n("update"),e.close();else{if(e.close(),400===t.code)return;u.value=!1,c.value=!0,l.value=t.data.url}}))},g=function(){Object(B.L)({product_id:b.value.id,type:[]},"/api/tomato/test-case/download-template")},C=function(){Object(A.a)("导入失败",l.value)};return function(e,t){var n=Object(a.resolveComponent)("el-icon"),r=Object(a.resolveComponent)("el-upload"),l=Object(a.resolveComponent)("el-button"),o=Object(a.resolveComponent)("el-dialog"),i=Object(a.resolveDirective)("debounce");return Object(a.openBlock)(),Object(a.createElementBlock)(a.Fragment,null,[Object(a.createVNode)(o,{title:"快捷导入","custom-class":"rp-usacase-upload",modelValue:Object(a.unref)(u),"onUpdate:modelValue":t[0]||(t[0]=function(e){return Object(a.isRef)(u)?u.value=e:null}),onClose:O,width:"30%"},{footer:Object(a.withCtx)((function(){return[Object(a.createElementVNode)("span",H,[Object(a.createVNode)(l,{onClick:v},{default:Object(a.withCtx)((function(){return[q]})),_:1}),Object(a.withDirectives)((Object(a.openBlock)(),Object(a.createBlock)(l,{type:"primary",onClick:h},{default:Object(a.withCtx)((function(){return[Q]})),_:1})),[[i]])])]})),default:Object(a.withCtx)((function(){return[Object(a.createElementVNode)("div",null,[F,Object(a.createElementVNode)("span",{style:{color:"#989797"}},[L,Object(a.createElementVNode)("a",{href:"#",style:{color:"#1f9f85"},onClick:g},"下载模板")])]),Object(a.createElementVNode)("div",null,[M,Object(a.createVNode)(r,{class:"upload-demo",ref_key:"fileList",ref:d,drag:"",action:"alert","auto-upload":!1,multiple:"","on-change":j,limit:1,"on-exceed":p},{default:Object(a.withCtx)((function(){return[J,Object(a.createElementVNode)("div",z,[Object(a.createElementVNode)("div",null,[Object(a.createVNode)(n,{class:"el-icon--upload"},{default:Object(a.withCtx)((function(){return[Object(a.createVNode)(Object(a.unref)(P.UploadFilled))]})),_:1})]),G,K])]})),_:1},512)])]})),_:1},8,["modelValue"]),Object(a.createVNode)(o,{title:"导入结果","custom-class":"rp-usacase-upload",modelValue:c.value,"onUpdate:modelValue":t[1]||(t[1]=function(e){return c.value=e}),width:"30%"},{footer:Object(a.withCtx)((function(){return[Object(a.createElementVNode)("span",$,[Object(a.createVNode)(l,{onClick:v},{default:Object(a.withCtx)((function(){return[X]})),_:1})])]})),default:Object(a.withCtx)((function(){return[Object(a.createElementVNode)("div",null,[W,Object(a.createElementVNode)("div",null,[Y,Object(a.createElementVNode)("span",{class:"table-link file-download-btn",onClick:C},"下载表格")])])]})),_:1},8,["modelValue"])],64)}}});n("66b6");var ee=Z,te=n("38d1"),ne=n("3a3a"),ae=n("c252");function re(){return le.apply(this,arguments)}function le(){return(le=Object(k.a)(regeneratorRuntime.mark((function e(){var t,n,a,r=arguments;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=r.length>0&&void 0!==r[0]?r[0]:1,n=r.length>1&&void 0!==r[1]?r[1]:20,a=r.length>2?r[2]:void 0,e.next=5,Object(T.B)(Object(w.a)(Object(w.a)({},a),{},{pageIndex:t,pageSize:n}));case 5:return e.abrupt("return",e.sent);case 6:case"end":return e.stop()}}),e)})))).apply(this,arguments)}var oe=n("6c02"),ce=n("6b59"),ue=n("6669"),ie=n("a4d4"),de=n("b3ae"),se=Object(a.defineComponent)({name:"useCase",components:{FullScreen:N.a,selectOption:x.a,WorkDrawer:S.a,ArrowUp:D.a,AddDialog:ee},setup:function(){var e,t,n=Object(oe.f)(),r=Object(a.computed)((function(){var e;return null===R.b||void 0===R.b||null===(e=R.b.getters)||void 0===e?void 0:e.productInfo})),l=Object(B.G)("user",!0),o=Object(a.ref)(!1),c=Object(U.a)().tipMessage,u=Object(a.ref)(!1),i=Object(a.ref)(),d=Object(a.ref)(),s=Object(oe.e)(),b=Object(a.ref)(""),f=Object(a.ref)(!1),v=Object(a.ref)(null),p=Object(a.ref)([]),O=Object(a.reactive)({list:[],total:0,bugType:{unpassed_num:0,zero_type_num:0}}),m=Object(a.ref)("-1"),j=Object(a.ref)(1),h=Object(a.ref)(!1),g=Object(a.ref)(),C=Object(a.ref)(!1),_=Object(a.computed)((function(){return R.b.getters.iterateId})),y=Object(a.ref)(!0),N=function(){"useCase"!==n.currentRoute.value.name||_.value?y.value=!0:y.value=!1};N();var x,S=Object(a.ref)(),D=Object(a.ref)(0),E=Object(a.ref)(-1),I={create_by:"",product_module_id:[],type:[],staff_no:[],name:null,status:[],level:[],product_id:null===(e=r.value)||void 0===e?void 0:e.id},P=Object(a.ref)({create_by:"",product_module_id:[],type:[],staff_no:[],name:null,status:[],level:[],product_id:null===(t=r.value)||void 0===t?void 0:t.id}),A=Object(a.ref)([]),F=function(){var e=Object(k.a)(regeneratorRuntime.mark((function e(t,n,a){var r,l,o,c,u,i,d,s,b,f,v;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(!a||null!=a&&a.product_id){e.next=3;break}return y.value=!1,e.abrupt("return");case 3:if(C.value=null!=n,j.value=t&&t.pageIndex||1,_.value){e.next=11;break}return O.total=0,O.list=[],O.bugType.unpassed_num=0,O.bugType.zero_type_num=0,e.abrupt("return");case 11:return r=JSON.parse(JSON.stringify(a||Object.assign(P.value,{iteration_id:_.value}))),Reflect.deleteProperty(r,"tempStaff"),l=Object(ne.a)(re,r),o=l.response,c=Object(ae.a)(o),u=c.pagation,e.next=17,u(t);case 17:i=e.sent,d=i.data,s=d.list,b=d.count,f=d.unpassed_num,v=d.zero_type_num,O.total=b,O.list=s,O.bugType.unpassed_num=f,O.bugType.zero_type_num=v,setTimeout((function(){var e=document.getElementsByClassName("content")[0],t=document.getElementsByClassName("search-header")[0];g.value&&(g.value.height=e.offsetHeight-t.offsetHeight-140)}),100);case 28:case"end":return e.stop()}}),e)})));return function(t,n,a){return e.apply(this,arguments)}}(),L=function(){var e=Object(k.a)(regeneratorRuntime.mark((function e(t){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(!0!==t){e.next=2;break}return e.abrupt("return");case 2:clearTimeout(x),x=setTimeout(Object(k.a)(regeneratorRuntime.mark((function e(){var t,n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(!h.value){e.next=8;break}return null===(t=g.value)||void 0===t||t.setCurrentPage(),j.value=1,e.next=5,F({pageIndex:1,pageSize:20},!0,Object.assign(P.value,{iteration_id:_.value}));case 5:h.value=!1,e.next=10;break;case 8:return e.next=10,F(null===(n=g.value)||void 0===n?void 0:n.getCurrentPage(),!0,Object.assign(P.value,{iteration_id:_.value}));case 10:C.value=!1,M();case 12:case"end":return e.stop()}}),e)}))),300);case 4:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}();Object(a.watch)((function(){return _.value}),(function(){var e;h.value=!0,L(),G(null===(e=r.value)||void 0===e?void 0:e.id),N(),q()}));var M=function(){_.value&&Object(T.D)({iteration_id:_.value}).then((function(e){p.value=e.data}))};Object(ue.a)(L,(function(){var e,t;P.value.product_id!=(null===(e=r.value)||void 0===e?void 0:e.id)&&(P.value.iteration_id=null),P.value.product_id=null===(t=r.value)||void 0===t?void 0:t.id,P.value.iteration_id=_.value,h.value=!0,L()}));var J=Object(a.ref)([]),z=Object(a.ref)([]),G=function(e){e&&Object(te.e)({product_id:e}).then((function(e){e.data&&e.data.length?(J.value=e.data,z.value=e.data[1].options.map((function(e){return{value:e.staff_no,label:e.staff_name}}))):(J.value=[],z.value=[])}))},K=function(e){var t;null===(t=S.value)||void 0===t||t.handleDrawerVisble(!0),D.value=9,E.value=e.id,Object(B.u)(e.id)};ie.a.on("drawStatus",(function(e){e||(E.value=-1)})),window.addEventListener("storage",(function(e){var t;"setUseCase"===e.key&&(F(null===(t=g.value)||void 0===t?void 0:t.getCurrentPage()),Object(B.A)("setUseCase"))}));var H=Object(a.ref)([]),q=function(){var e=Object(B.G)("iterateList",!0);e&&e.length?H.value=e.map((function(e){return{value:e.id,label:e.name}})):H.value=[]},Q=function(){var e=Object(k.a)(regeneratorRuntime.mark((function e(){var t;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if((t=JSON.parse(JSON.stringify(P.value))).type||delete t.type,O.total){e.next=4;break}return e.abrupt("return",c(400,"暂无数据，无法导出"));case 4:Object(B.L)(t,"/api/tomato/test-case/export");case 5:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),W=function(e){Object(T.k)(e).then((function(t){if(200===t.code)return F(g.value.getCurrentPage(),void 0,P.value),"staff_no"===e.field&&setTimeout((function(){var e;G(null===(e=r.value)||void 0===e?void 0:e.id)}),500),c(200,"成功")}))},Y=function(){var e,t=[];return null===(e=A.value)||void 0===e||e.forEach((function(e){t.push(e.id)})),t},$=Object(a.ref)({product_module_id:0}),X=function(){var e=Object(k.a)(regeneratorRuntime.mark((function e(t){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:$.value={ids:Y(),field:"product_module_id",product_module_id:t.id};case 1:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),Z=Object(a.ref)(),ee=function(){var e=Object(k.a)(regeneratorRuntime.mark((function e(t){var n,a,l,o;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t&&$.value.product_module_id===t&&($.value.product_module_id=0,Z.value&&Z.value[0].name&&($.value.product_module_name=(null===(l=Z.value[0])||void 0===l?void 0:l.name)||""),v.value=0),v.value=$.value.product_module_id,e.next=4,Object(de.a)({id:null===(n=r.value)||void 0===n?void 0:n.id,name:null===(a=r.value)||void 0===a?void 0:a.name});case 4:null!=(o=e.sent)&&o.length&&(Z.value=o,Z.value.unshift({value:-1,label:"管理模块",level:-1,id:-1,name:"管理模块"}));case 6:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),le=JSON.parse(JSON.stringify(V.b)),se=Object(a.reactive)([{value:"product_module_id",label:"模块",children:[]},{value:"level",label:"等级",children:V.a.map((function(e){return{value:e.id,label:e.value}}))},{value:"status",label:"结果",children:V.b},{value:"type",label:"类型",children:V.c},{value:"staff_no",label:"指派给",children:z},{value:"iteration_id",label:"迭代",children:H}]),be=Object(a.reactive)({btnArray:[{id:"-1",label:"所有",key:""},{id:"2",label:"未通过",key:"status"},{id:"5",label:"未执行",key:"status"},{id:"22",label:"冒烟用例",key:"type"},{id:"500",label:"我创建的",key:"create_by"},{id:"600",label:"指给我的",key:"staff_no"}],searchForm:[{type:"input",label:"名称",key:"name",val:""},{type:"select",label:"指派给",val:[],key:"staff_no",showRecord:!0,multiple:!0,valueKey:["staff_no","staff_name"],listData:J},{type:"customComponents",label:"模块",val:[],key:"product_module_id",componentIndex:2},{type:"select",label:"结果",multiple:!0,key:"status",val:[],listData:V.b},{type:"select",label:"类型",key:"type",val:[],listData:V.c},{type:"select",label:"等级",multiple:!0,key:"level",val:[],valueKey:["id","value"],listData:V.a},{type:"select",label:"创建人",val:[],key:"create_by",multiple:!0,valueKey:["staff_no","staff_name"],listData:p}]}),fe=function(){var e=Object(k.a)(regeneratorRuntime.mark((function e(t){var n,a,r;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:m.value="-1",n=Object(B.G)("productInfo",!0),P.value=JSON.parse(JSON.stringify(I)),P.value.product_id=n.id,t.key&&(a={create_by:[null==l?void 0:l.staff_no],staff_no:[null==l?void 0:l.staff_no]},(r={}).product_id=P.value.product_id,r[t.key]=a[t.key],"status"===t.key&&("2"===t.id?r[t.key]=[2]:r[t.key]=[5]),"type"===t.key&&(r[t.key]=[1]),P.value[t.key]=r[t.key]),P.value.iteration_id=_.value,pe();case 7:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),ve=function(){var e=Object(k.a)(regeneratorRuntime.mark((function e(t){var n,a;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:for(a in(n=JSON.parse(JSON.stringify(t))).product_id=r.value.id,t)P.value[a]=t[a];t.times&&t.times.length?(P.value.expected_start_time=t.times,n.expected_start_time=t.times):(P.value.expected_start_time=[],n.expected_start_time=[]),P.value.iteration_id=_.value,pe(),t.staff_no&&t.staff_no.length&&setTimeout((function(){var e;G(null===(e=r.value)||void 0===e?void 0:e.id)}),500);case 7:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),pe=function(){var e=Object(k.a)(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:h.value=!0,j.value=1,g.value.setCurrentPage(),F(g.value.getCurrentPage(),void 0,P.value);case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}();return Object(a.onMounted)((function(){var e,t=s.query.detailId;"useCase"===n.currentRoute.value.name&&t&&K({id:t}),G(null===(e=r.value)||void 0===e?void 0:e.id),q()})),Object(w.a)(Object(w.a)({product_module_id:v,sortChange:function(e){var t=e.prop,n=e.order;n&&(P.value.sort_name=t,P.value.sort_by="ascending"===n?1:2,F(g.value.getCurrentPage(),void 0,P.value))},handleBug:function(e){var t,n;null===(t=S.value)||void 0===t||t.handleDrawerVisble(!0),D.value=3,E.value=-12,null===(n=S.value)||void 0===n||n.resetUseCaseBug({id:e.id,name:e.name})},employeeLists:p,pageTableRef:g,stopAutoGetData:C,handleConditionSearch:L},Object(a.toRefs)(O)),{},{getData:F,formParams:P,page:j,PRIORITY:V.a,STATUS:V.c,RESOULT:V.b,tableResoult:le,handleCommand:function(e,t){var n={status:Number(e)};if(t)n={ids:[t.id],status:Number(e)};else{if(n.ids=[],!A.value||!A.value.length)return c(400,"请选择列表");A.value.forEach((function(e){n.ids.push(e.id)}))}!function(e){Object(T.W)(e).then((function(e){c(e.code),F(g.value.getCurrentPage())}))}(n)},selectMore:A,handleTypeList:function(e,t){e?(P.value.level=t,be.searchForm[5].val=t,P.value.status=[],be.searchForm[3].val=[]):(be.searchForm[3].val=[2],P.value.status=t,P.value.level=[],be.searchForm[5].val=[]),F(g.value.getCurrentPage(),void 0,P.value)},handleDeleteList:function(e){var t={ids:[]};if(e)t.ids=[e];else{if(t.ids=[],!A.value||!A.value.length)return c(400,"请选择要操作的列表");A.value.forEach((function(e){t.ids.push(e.id)}))}ce.a.confirm("此操作将永久删除该用例，是否继续？","提示",{confirmButtonText:"确定",cancelButtonText:"取消",confirmButtonClass:"el-button--danger-box",type:"error"}).then((function(){Object(T.h)(t).then((function(e){c(e.code),F(g.value.getCurrentPage())}))}))},handleSelectionChange:function(e){A.value=e},exportTaskDate:Q,searchArray:be,currentActive:m,quickSeacrh:fe,changeSearch:ve,addCaseDate:function(){var e;null===(e=S.value)||void 0===e||e.handleDrawerVisble(!0),D.value=9,E.value=-11},handleAddDate:function(){var e=n.resolve({name:"useCaseAdd"});window.open(e.href,"_blank")},handleQuickImport:function(){u.value=!0},isFullScreen:o,onChangeSelect:function(e,t,n){var a={ids:[t.id],field:n};if(n&&(a[n]=e),"staff_no"===n){var r=z.value.filter((function(t){return t.value===e}));a.staff_no=r[0].value,a.staff_name=r[0].label}W(a)},userList:J,typeDrawer:D,targetId:E,handleDetail:K,workDrawer:S,handleBasicChange:function(e){if("product_module_id"===e[0])f.value=!0;else{var t={ids:Y()},n=i.value.getCheckedNodes()[0].value;if(t[e[0]]=n,["status","level","type","iteration_id"].includes(e[0])&&(t[e[0]]=1*n),t.field=e[0],"staff_no"===e[0]){var a=z.value.filter((function(e){return e.value===n}));t.staff_name=a[0].label}W(t)}null==d||d.value.handleClose()},basicsOption:se,showDialog:u,basicUserList:z,cascaderPanel:i,basicBtn:d,isOpenEditModule:f,handleUpdateModule:function(){return null!==$.value.product_module_id&&$.value.product_module_id>=0&&$.value.field?(W($.value),f.value=!1,void(v.value=null)):c(400,"请选择模块")},handleChangeModule:X,handleCancle:function(){A.value=[],v.value=null,$.value.product_module_id=null,f.value=!1,F(g.value.getCurrentPage(),void 0,P.value)},product_module_name:b,updateUseList:function(){F(g.value.getCurrentPage(),void 0,P.value),setTimeout((function(){var e;G(null===(e=r.value)||void 0===e?void 0:e.id)}),1e3)},iterateId:_,hasData:y,moduleTree:Z,getModuleSelectTree:ee})}}),be=(n("e344"),n("95fb"),n("6b0d"));const fe=n.n(be)()(se,[["render",function(e,t,n,w,k,V){var N=Object(a.resolveComponent)("search-form"),x=Object(a.resolveComponent)("el-button"),S=Object(a.resolveComponent)("el-dropdown-item"),D=Object(a.resolveComponent)("el-dropdown-menu"),T=Object(a.resolveComponent)("el-dropdown"),E=Object(a.resolveComponent)("el-table-column"),R=Object(a.resolveComponent)("selectOption"),B=Object(a.resolveComponent)("page-table"),U=Object(a.resolveComponent)("ArrowUp"),I=Object(a.resolveComponent)("el-icon"),P=Object(a.resolveComponent)("el-cascader-panel"),A=Object(a.resolveComponent)("el-divider"),F=Object(a.resolveComponent)("FullScreen"),L=Object(a.resolveComponent)("WorkDrawer"),M=Object(a.resolveComponent)("AddDialog"),J=Object(a.resolveComponent)("module-select"),z=Object(a.resolveComponent)("el-dialog"),G=Object(a.resolveComponent)("el-empty"),K=Object(a.resolveDirective)("debounce");return e.hasData?(Object(a.openBlock)(),Object(a.createElementBlock)("div",r,[Object(a.createVNode)(B,{tableData:e.list,onHandlePagationChange:e.getData,onHandleSelectionChange:e.handleSelectionChange,total:e.total,isFullScreen:e.isFullScreen,ref:"pageTableRef",onSortChange:e.sortChange,stopAutoGetData:e.stopAutoGetData,highlight:!0,currentPage:e.page},{header:Object(a.withCtx)((function(){return[Object(a.createElementVNode)("div",l,[Object(a.createVNode)(N,{searchArray:e.searchArray,ref:"taskFormParams",currentActive:e.currentActive,onQuickSeacrh:e.quickSeacrh,onChangeSearch:e.changeSearch},null,8,["searchArray","currentActive","onQuickSeacrh","onChangeSearch"]),Object(a.createElementVNode)("div",o,[Object(a.createVNode)(x,{onClick:e.exportTaskDate,style:{"margin-right":"10px"},class:"all-option"},{default:Object(a.withCtx)((function(){return[c]})),_:1},8,["onClick"]),Object(a.createVNode)(T,{"split-button":"",placement:"bottom-end","popper-class":"case-btn",type:"primary",onClick:e.addCaseDate},{dropdown:Object(a.withCtx)((function(){return[Object(a.createVNode)(D,null,{default:Object(a.withCtx)((function(){return[Object(a.createVNode)(S,{onClick:e.handleAddDate},{default:Object(a.withCtx)((function(){return[i]})),_:1},8,["onClick"]),Object(a.createVNode)(S,{onClick:e.handleQuickImport},{default:Object(a.withCtx)((function(){return[d]})),_:1},8,["onClick"])]})),_:1})]})),default:Object(a.withCtx)((function(){return[u]})),_:1},8,["onClick"])])])]})),main:Object(a.withCtx)((function(){return[Object(a.createVNode)(E,{type:"selection",width:"40"}),Object(a.createVNode)(E,{sortable:"custom",prop:"id",label:"ID",width:"80"}),Object(a.createVNode)(E,{sortable:"custom",prop:"name","min-width":"180","class-name":"table-column-left",label:"用例标题"},{default:Object(a.withCtx)((function(t){return[Object(a.createElementVNode)("div",{onClick:function(n){return e.handleDetail(t.row)},class:"table-link"},Object(a.toDisplayString)(t.row.name),9,s)]})),_:1}),Object(a.createVNode)(E,{sortable:"custom",prop:"product_module_id",label:"模块","min-width":"90"},{default:Object(a.withCtx)((function(e){var t,n;return[Object(a.createElementVNode)("span",null,Object(a.toDisplayString)((null===(t=e.row)||void 0===t||null===(n=t.module)||void 0===n?void 0:n.name)||""),1)]})),_:1}),Object(a.createVNode)(E,{sortable:"custom",prop:"type",label:"用例类型",width:"130"},{default:Object(a.withCtx)((function(t){return[Object(a.createVNode)(R,{valueKey:["value","label"],keyVal:"type",currentVal:t.row.type,type:1,currentType:"type",item:t.row,optionsData:e.STATUS,onOnChangeSelect:e.onChangeSelect},null,8,["currentVal","item","optionsData","onOnChangeSelect"])]})),_:1}),Object(a.createVNode)(E,{sortable:"custom",prop:"level",label:"等级",width:"90"},{default:Object(a.withCtx)((function(t){return[Object(a.createVNode)(R,{valueKey:["id","value"],keyVal:"level",currentVal:t.row.level,type:1,currentType:"level",item:t.row,optionsData:e.PRIORITY,onOnChangeSelect:e.onChangeSelect},null,8,["currentVal","item","optionsData","onOnChangeSelect"])]})),_:1}),Object(a.createVNode)(E,{prop:"staff_name",sortable:"custom",label:"指派给",width:"120"},{default:Object(a.withCtx)((function(t){return[Object(a.createVNode)(R,{keyVal:"staff_no",valueKey:["staff_no","staff_name"],currentVal:t.row.staff_name,type:0,currentType:"staff_no",item:t.row,optionsData:e.userList,onOnChangeSelect:e.onChangeSelect},null,8,["currentVal","item","optionsData","onOnChangeSelect"])]})),_:1}),Object(a.createVNode)(E,{sortable:"custom",prop:"status",label:"执行结果",width:"148"},{default:Object(a.withCtx)((function(t){return[Object(a.createElementVNode)("div",b,[Object(a.createVNode)(R,{valueKey:["value","label"],keyVal:"status",currentVal:t.row.status,type:1,currentType:"status",item:t.row,optionsData:e.RESOULT,showDot:!0,onOnChangeSelect:e.onChangeSelect},null,8,["currentVal","item","optionsData","onOnChangeSelect"])])]})),_:1}),Object(a.createVNode)(E,{sortable:"custom",prop:"operate_time",label:"最近执行时间","min-width":"150"}),Object(a.createVNode)(E,{sortable:"custom",prop:"creator",label:"创建人",width:"130"}),Object(a.createVNode)(E,{sortable:"custom",prop:"create_time",label:"创建时间","min-width":"150"}),Object(a.createVNode)(E,{label:"操作",width:"180"},{default:Object(a.withCtx)((function(t){return[Object(a.createVNode)(x,{type:"primary",link:"",onClick:Object(a.withModifiers)((function(n){return e.handleBug(t.row)}),["stop"])},{default:Object(a.withCtx)((function(){return[f]})),_:2},1032,["onClick"]),Object(a.createVNode)(x,{class:"delete",link:"",onClick:Object(a.withModifiers)((function(n){return e.handleDeleteList(t.row.id)}),["stop"])},{default:Object(a.withCtx)((function(){return[v]})),_:2},1032,["onClick"])]})),_:1})]})),qucikSelect:Object(a.withCtx)((function(){return[Object(a.createElementVNode)("div",p,[Object(a.createElementVNode)("span",{class:"rp-test-num",onClick:t[0]||(t[0]=function(t){return e.handleTypeList(0,["2"])})},"未通过 "+Object(a.toDisplayString)(e.bugType.unpassed_num)+" 条",1),Object(a.createElementVNode)("span",{class:"rp-test-num",onClick:t[1]||(t[1]=function(t){return e.handleTypeList(1,[1])})},"L0 "+Object(a.toDisplayString)(e.bugType.zero_type_num)+" 条",1)])]})),_:1},8,["tableData","onHandlePagationChange","onHandleSelectionChange","total","isFullScreen","onSortChange","stopAutoGetData","currentPage"]),e.selectMore.length?(Object(a.openBlock)(),Object(a.createElementBlock)("div",O,[Object(a.createVNode)(T,{size:"small",trigger:"click",ref:"basicBtn"},{dropdown:Object(a.withCtx)((function(){return[Object(a.createVNode)(P,{style:{height:"220px"},onChange:e.handleBasicChange,ref:"cascaderPanel",options:e.basicsOption},null,8,["onChange","options"])]})),default:Object(a.withCtx)((function(){return[Object(a.createVNode)(x,null,{default:Object(a.withCtx)((function(){return[m,Object(a.createVNode)(I,null,{default:Object(a.withCtx)((function(){return[Object(a.createVNode)(U)]})),_:1})]})),_:1})]})),_:1},512),Object(a.createVNode)(A,{direction:"vertical"}),Object(a.createVNode)(x,{onClick:t[2]||(t[2]=function(t){return e.handleDeleteList(0)})},{default:Object(a.withCtx)((function(){return[j]})),_:1})])):Object(a.createCommentVNode)("",!0),Object(a.createVNode)(F,{fullscreen:e.isFullScreen,"onUpdate:fullscreen":t[3]||(t[3]=function(t){return e.isFullScreen=t})},null,8,["fullscreen"]),Object(a.createVNode)(L,{type:e.typeDrawer,targetId:e.targetId,onRefresh:e.updateUseList,ref:"workDrawer"},null,8,["type","targetId","onRefresh"]),Object(a.createVNode)(M,{visible:e.showDialog,"onUpdate:visible":t[4]||(t[4]=function(t){return e.showDialog=t}),onUpdate:e.getData},null,8,["visible","onUpdate"]),Object(a.createVNode)(z,{center:"",title:"更新模块",modelValue:e.isOpenEditModule,"onUpdate:modelValue":t[6]||(t[6]=function(t){return e.isOpenEditModule=t}),onClose:e.handleCancle,width:"30%"},{footer:Object(a.withCtx)((function(){return[Object(a.createElementVNode)("span",g,[Object(a.createVNode)(x,{onClick:e.handleCancle},{default:Object(a.withCtx)((function(){return[C]})),_:1},8,["onClick"]),Object(a.withDirectives)((Object(a.openBlock)(),Object(a.createBlock)(x,{type:"primary",onClick:e.handleUpdateModule},{default:Object(a.withCtx)((function(){return[_]})),_:1},8,["onClick"])),[[K]])])]})),default:Object(a.withCtx)((function(){return[Object(a.createElementVNode)("div",h,[Object(a.createVNode)(J,{value:e.product_module_id,"onUpdate:value":t[5]||(t[5]=function(t){return e.product_module_id=t}),list:e.moduleTree,onUpdateUseCase:e.getModuleSelectTree,onChange:e.handleChangeModule},null,8,["value","list","onUpdateUseCase","onChange"])])]})),_:1},8,["modelValue","onClose"])])):(Object(a.openBlock)(),Object(a.createElementBlock)("div",y,[Object(a.createVNode)(G,{"image-size":200})]))}],["__scopeId","data-v-238d9cbc"]]);t.default=fe},"95fb":function(e,t,n){"use strict";n("67bf")},"9a6d":function(e,t,n){"use strict";n("39d7")},ac16:function(e,t,n){var a=n("23e7"),r=n("825a"),l=n("06cf").f;a({target:"Reflect",stat:!0},{deleteProperty:function(e,t){var n=l(r(e),t);return!(n&&!n.configurable)&&delete e[t]}})},e344:function(e,t,n){"use strict";n("8b8f")},fc7e:function(e,t,n){}}]);