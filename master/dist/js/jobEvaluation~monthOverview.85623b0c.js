(window.webpackJsonp=window.webpackJsonp||[]).push([["jobEvaluation~monthOverview"],{"01a2":function(e,t,n){},"04d1":function(e,t,n){var r=n("342f").match(/firefox\/(\d+)/i);e.exports=!!r&&+r[1]},"17a4":function(e,t,n){},"1e0c":function(e,t,n){"use strict";n("c4b2")},"4e82":function(e,t,n){"use strict";var r=n("23e7"),a=n("1c0b"),o=n("7b0b"),c=n("50c4"),i=n("d039"),l=n("addb"),u=n("a640"),s=n("04d1"),b=n("d998"),d=n("2d00"),p=n("512c"),f=[],m=f.sort,j=i((function(){f.sort(void 0)})),O=i((function(){f.sort(null)})),h=u("sort"),v=!i((function(){if(d)return d<70;if(!(s&&s>3)){if(b)return!0;if(p)return p<603;var e,t,n,r,a="";for(e=65;e<76;e++){switch(t=String.fromCharCode(e),e){case 66:case 69:case 70:case 72:n=3;break;case 68:case 71:n=4;break;default:n=2}for(r=0;r<47;r++)f.push({k:t+r,v:n})}for(f.sort((function(e,t){return t.v-e.v})),r=0;r<f.length;r++)t=f[r].k.charAt(0),a.charAt(a.length-1)!==t&&(a+=t);return"DGBEFHACIJK"!==a}}));r({target:"Array",proto:!0,forced:j||!O||!h||!v},{sort:function(e){void 0!==e&&a(e);var t=o(this);if(v)return void 0===e?m.call(t):m.call(t,e);var n,r,i=[],u=c(t.length);for(r=0;r<u;r++)r in t&&i.push(t[r]);for(n=(i=l(i,function(e){return function(t,n){return void 0===n?-1:void 0===t?1:void 0!==e?+e(t,n)||0:String(t)>String(n)?1:-1}}(e))).length,r=0;r<n;)t[r]=i[r++];for(;r<u;)delete t[r++];return t}})},"512c":function(e,t,n){var r=n("342f").match(/AppleWebKit\/(\d+)\./);e.exports=!!r&&+r[1]},"5ae4":function(e,t,n){"use strict";n.r(t);var r=n("1da1"),a=n("5530"),o=(n("96cf"),n("4ec9"),n("d3b7"),n("3ca3"),n("ddb0"),n("b64b"),n("a9e3"),n("ac1f"),n("5319"),n("159b"),n("d81d"),n("b0c0"),n("7a23")),c=(n("fb6a"),n("4e82"),n("0a56")),i=n("df96"),l=Object(o.defineComponent)(Object(a.a)(Object(a.a)({},{name:"tips-view"}),{},{setup:function(e){return function(e,t){var n=Object(o.resolveComponent)("el-icon"),r=Object(o.resolveComponent)("el-popover");return Object(o.openBlock)(),Object(o.createBlock)(r,{placement:"bottom-start",width:400,trigger:"hover"},{reference:Object(o.withCtx)((function(){return[Object(o.createVNode)(n,{class:"el-icon-warning-outline"},{default:Object(o.withCtx)((function(){return[Object(o.createVNode)(Object(o.unref)(i.a))]})),_:1})]})),default:Object(o.withCtx)((function(){return[Object(o.renderSlot)(e.$slots,"default")]})),_:3})}}})),u=(n("f757"),n("6b0d")),s=n.n(u),b=s()(l,[["__scopeId","data-v-187bccf3"]]),d=n("d257"),p=n("a4d4"),f=function(e){return Object(o.pushScopeId)("data-v-a28235d4"),e=e(),Object(o.popScopeId)(),e},m={class:"job-table"},j={style:{display:"inline-block",position:"relative"}},O=f((function(){return Object(o.createElementVNode)("div",null,[Object(o.createElementVNode)("span",{style:{"font-weight":"bold"}},"计划完成数："),Object(o.createTextVNode)(" 计划完成时间在本月的任务和需求数量； ")],-1)})),h=f((function(){return Object(o.createElementVNode)("div",null,[Object(o.createElementVNode)("span",{style:{"font-weight":"bold"}}," 实际完成数："),Object(o.createTextVNode)(" 实际完成时间在本月的任务和需求数量； ")],-1)})),v=f((function(){return Object(o.createElementVNode)("div",null,[Object(o.createElementVNode)("span",{style:{"font-weight":"bold"}}," 已完成计划耗时："),Object(o.createTextVNode)(" 即已完成的工作项计划消耗工时，本月实际完成的任务，计划消耗的工时； ")],-1)})),_=f((function(){return Object(o.createElementVNode)("div",null,[Object(o.createElementVNode)("span",{style:{"font-weight":"bold"}}," 已完成实际耗时："),Object(o.createTextVNode)(" 即已完成的工作项实际消耗工时，本月实际完成的任务，实际消耗的工时； ")],-1)})),g=f((function(){return Object(o.createElementVNode)("div",null,[Object(o.createElementVNode)("span",{style:{"font-weight":"bold"}}," 按时完成率："),Object(o.createTextVNode)(" 计划完成时间在本月1日到当日且按时完成的工作项数量/计划完成时间在本月1日到当日的工作项数量 ")],-1)})),y={style:{display:"inline-block",position:"relative"}},w=f((function(){return Object(o.createElementVNode)("div",null,[Object(o.createElementVNode)("span",{style:{"font-weight":"bold"}},"缺陷密度："),Object(o.createTextVNode)(" 单位测试时间内，（BUG*级别）之和 ")],-1)})),k={style:{display:"inline-block",position:"relative"}},N=f((function(){return Object(o.createElementVNode)("div",null,[Object(o.createElementVNode)("span",{style:{"font-weight":"bold"}},"利用率："),Object(o.createTextVNode)(" （实际工作项耗时 + 修复缺陷耗时）/ 本月工作日工时 ")],-1)})),V={key:0,class:"statistics"},x=Object(o.createTextVNode)(" 共有成员 "),S=f((function(){return Object(o.createElementVNode)("span",null,null,-1)})),C={class:"statistics-controller"},E={class:"calendar-title__text"},D=Object(o.defineComponent)(Object(a.a)(Object(a.a)({},{name:"job-table"}),{},{props:{form:{type:Object,default:function(){return{}}},hiddenPagation:{type:Boolean,default:!1},fullscreen:{type:Boolean,default:!1},pageSize:{type:Number,default:20}},setup:function(e,t){var n=t.expose,i=e,l=Object(o.ref)(),u=Object(o.reactive)({list:[],tempList:[],total:0,tempPageIndex:0,stopAutoGetData:!1,pageSize:i.pageSize,currentPage:1,columnList:[{prop:"staff_name",label:"姓名",minWidth:60},{prop:"job_name",label:"岗位",minWidth:90},{prop:"iteration_num",label:"参与迭代数",minWidth:80},{prop:"task_completed_hours",label:"完成工作工时",minWidth:90},{prop:"task_completed_num",label:"完成工作数",minWidth:90},{prop:"task_on_time_rate2",label:"工作准点率",minWidth:110},{prop:"task_avg_hours",label:"工作项平均工时",minWidth:90},{prop:"bug_num",label:"产生bug数"},{prop:"bug_rate",label:"缺陷密度",minWidth:110},{prop:"post_bug_num",label:"提交bug数"},{prop:"post_bug_rate",label:"提交缺陷密度",minWidth:120}],statistic:{backend:0,frontend:0,others:0,participant:0,product:0,test:0,total:0}}),s=Object(o.ref)(1),f=Object(o.computed)((function(){var e=u.total,t=u.pageSize;return p.a.emit("total",e),e&&t?Math.ceil(e/t):0})),D=Object(o.computed)((function(){return u.statistic}));Object(o.watch)((function(){return i.form}),(function(){Object(o.nextTick)((function(){var e,t;s.value=1,P(),null===(e=l.value)||void 0===e||null===(t=e.pageTable)||void 0===t||t.clearSort()}))}),{immediate:!0,deep:!0});var L=Object(c.a)().useGetStaffWorkQualityList,I=function(e){var t=e.pageIndex,n=e.pageSize;n!==u.pageSize?u.currentPage=1:u.currentPage=t,u.pageSize=n,u.list=u.tempList.slice((u.currentPage-1||0)*n,u.currentPage*n)},P=function(){var e=Object(r.a)(regeneratorRuntime.mark((function e(){var t,n,r;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=Object.assign({},i.form),e.next=3,L(t);case 3:(n=e.sent)&&n.list?(u.tempPageIndex=1,u.total=n.count,u.tempList=null===(r=n.list)||void 0===r?void 0:r.map((function(e){return Object(a.a)(Object(a.a)({},e),{},{task_on_time_rate2:e.task_on_time_rate?"".concat(e.task_on_time_rate,"%"):0})})),u.list=u.tempList.slice(0,l.value.pageSize),u.statistic=n.statistic):(u.list=[],u.tempList=[],u.total=0);case 5:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),F=function(e){var t=l.value.pageSize,n=0,r=0;if("prev"===e)s.value>=1&&(s.value>1&&(s.value-=1),n=s.value-1,r=s.value);else{if(s.value>=f.value)return;s.value<f.value?(s.value+=1,n=s.value-1||0,r=s.value):s.value>=1&&(s.value-=1,n=s.value||0,r=s.value+1)}u.list=u.tempList.slice(n*t,r*t)},B=function(e){var t=e.prop,n=e.order;u.currentPage=1,s.value=1,u.tempList=u.tempList.sort(Object(d.B)("task_on_time_rate2"===t?"task_on_time_rate":t,"ascending"===n)),u.list=u.tempList.slice(0,u.pageSize)};return n({tableData:u}),function(t,n){var r=Object(o.resolveComponent)("el-table-column"),a=Object(o.resolveComponent)("page-table");return Object(o.openBlock)(),Object(o.createElementBlock)("div",m,[Object(o.createVNode)(a,{hiddenPagation:!e.hiddenPagation,stripe:"",pageSize:Object(o.unref)(u).pageSize,onSortChange:B,tableData:Object(o.unref)(u).list,onHandlePagationChange:I,total:Object(o.unref)(u).tempList.length,ref_key:"pageTableRef",ref:l,stopAutoGetData:Object(o.unref)(u).stopAutoGetData,isFullScreen:e.fullscreen,currentPage:Object(o.unref)(u).currentPage,className:"job-evaluation-table"},{main:Object(o.withCtx)((function(){return[Object(o.createVNode)(r,{label:"基本信息","label-class-name":"job-table-column"},{default:Object(o.withCtx)((function(){return[Object(o.createVNode)(r,{sortable:"custom",label:"姓名",prop:"staff_name","min-width":"60"}),Object(o.createVNode)(r,{sortable:"custom",label:"岗位",prop:"job_name","min-width":"90"})]})),_:1}),Object(o.createVNode)(r,{label:"工作项（需求+任务)","label-class-name":"job-table-column"},{header:Object(o.withCtx)((function(e){return[Object(o.createElementVNode)("div",j,[Object(o.createElementVNode)("span",null,Object(o.toDisplayString)(e.column.label),1),Object(o.createVNode)(b,null,{default:Object(o.withCtx)((function(){return[O,h,v,_,g]})),_:1})])]})),default:Object(o.withCtx)((function(){return[Object(o.createVNode)(r,{sortable:"custom",label:"计划完成数",prop:"plan_num","min-width":"90"}),Object(o.createVNode)(r,{sortable:"custom",label:"实际完成数",prop:"real_num","min-width":"90"}),Object(o.createVNode)(r,{sortable:"custom",label:"已完成计划耗时",prop:"plan_hours","min-width":"90"}),Object(o.createVNode)(r,{sortable:"custom",label:"已完成实际耗时",prop:"real_hours","min-width":"90"}),Object(o.createVNode)(r,{sortable:"custom",label:"按时完成率",prop:"on_time_rate","min-width":"90"},{default:Object(o.withCtx)((function(e){return[Object(o.createElementVNode)("span",null,Object(o.toDisplayString)(e.row.on_time_rate)+"%",1)]})),_:1})]})),_:1}),Object(o.createVNode)(r,{label:"缺陷","label-class-name":"job-table-column"},{header:Object(o.withCtx)((function(e){return[Object(o.createElementVNode)("div",y,[Object(o.createElementVNode)("span",null,Object(o.toDisplayString)(e.column.label),1),Object(o.createVNode)(b,null,{default:Object(o.withCtx)((function(){return[w]})),_:1})])]})),default:Object(o.withCtx)((function(){return[Object(o.createVNode)(r,{sortable:"custom",label:"产生缺陷数",prop:"bug_num","min-width":"90"}),Object(o.createVNode)(r,{sortable:"custom",label:"修复耗时",prop:"bug_hours","min-width":"90"}),Object(o.createVNode)(r,{sortable:"custom",label:"缺陷密度",prop:"bug_rate","min-width":"90"}),Object(o.createVNode)(r,{sortable:"custom",label:"提交缺陷数",prop:"post_bug_num","min-width":"90"}),Object(o.createVNode)(r,{sortable:"custom",label:"提交缺陷密度",prop:"post_bug_rate","min-width":"100"})]})),_:1}),Object(o.createVNode)(r,{label:"利用率"},{header:Object(o.withCtx)((function(e){return[Object(o.createElementVNode)("div",k,[Object(o.createElementVNode)("span",null,Object(o.toDisplayString)(e.column.label),1),Object(o.createVNode)(b,null,{default:Object(o.withCtx)((function(){return[N]})),_:1})])]})),default:Object(o.withCtx)((function(){return[Object(o.createVNode)(r,{sortable:"custom",label:"工时利用率",prop:"hours_rate","min-width":"90"},{default:Object(o.withCtx)((function(e){return[Object(o.createElementVNode)("span",null,Object(o.toDisplayString)(e.row.hours_rate)+"%",1)]})),_:1})]})),_:1})]})),_:1},8,["hiddenPagation","pageSize","tableData","total","stopAutoGetData","isFullScreen","currentPage"]),e.hiddenPagation?Object(o.createCommentVNode)("",!0):(Object(o.openBlock)(),Object(o.createElementBlock)("div",V,[x,Object(o.createElementVNode)("span",null," "+Object(o.toDisplayString)(Object(o.unref)(D).total)+"个",1),Object(o.createTextVNode)("，其中产品 "+Object(o.toDisplayString)(Object(o.unref)(D).product)+"人，前端 "+Object(o.toDisplayString)(Object(o.unref)(D).frontend)+"人，后端 "+Object(o.toDisplayString)(Object(o.unref)(D).backend)+"人，测试 "+Object(o.toDisplayString)(Object(o.unref)(D).test)+"人，其他 "+Object(o.toDisplayString)(Object(o.unref)(D).others)+"人",1),S,Object(o.createElementVNode)("div",C,[Object(o.createElementVNode)("i",{onClick:n[0]||(n[0]=function(e){return F("prev")}),class:"iconfont icon-arrowup"}),Object(o.createElementVNode)("span",E,Object(o.toDisplayString)(Object(o.unref)(s))+" / "+Object(o.toDisplayString)(Object(o.unref)(f)),1),Object(o.createElementVNode)("i",{onClick:n[1]||(n[1]=function(e){return F("next")}),class:"iconfont icon-arrowdown"})])]))])}}}));n("1e0c");var L=s()(D,[["__scopeId","data-v-a28235d4"]]),I=n("71ee"),P=n("23c4"),F=n("59a4"),B=n("6c02"),T=n("5a0c"),Y=n.n(T),z=n("afbc"),A={class:"job-eva",id:"job-eva"},R={class:"job-eva-form"},M=Object(o.defineComponent)(Object(a.a)(Object(a.a)({},{name:"jobEvaluation"}),{},{props:{showForm:{type:Boolean,default:!0},searchParams:{type:Object,default:function(){return{}}}},setup:function(e){var t=e,n=Object(o.reactive)({filter_type:2,staff_name:"",product_id:"",iteration_id:"",department_code:[],position_type:[],start_month:"",end_month:""}),i=Object(o.ref)(!1),l=Object(o.reactive)({proList:[],IterList:[]}),u=Object(o.ref)(),s=Object(o.ref)("2"),b=new Map,d=Object(B.e)(),p=Object(F.a)().useGetProductList,f=Object(c.a)(),m=f.useGetIterateList,j=f.disabledDate,O=Object(o.reactive)({btnArray:[{id:"-1",label:"所有",key:"filter_type"},{id:"1",label:"我的部门",key:"filter_type"},{id:"2",label:"我的项目",key:"filter_type"},{id:"3",label:"我的岗位",key:"filter_type"},{id:"4",label:"本月",key:"month"},{id:"5",label:"上月",key:"month"}],searchForm:[{type:"input",label:"名称",key:"staff_name",val:"",placeholder:"请输入名称搜索"},{type:"customComponents",componentIndex:1,label:"部门",key:"department_code",val:[],valueKey:["id","value"],listData:[]},{type:"select",label:"项目",val:[],key:"product_id",valueKey:["id","name"],listData:[]},{type:"select",label:"迭代",selectType:"virtual",val:"",key:"iteration_id",valueKey:["value","name"],listData:[]},{type:"select",label:"岗位",multiple:!0,key:"position_type",val:[],valueKey:["value","label"],listData:P.o},{type:"daterange",dateType:"monthrange",format:"YYYY-MM",label:"时间",val:[],key:"month",valueKey:[],placeholder:"请选择月份",disabledDate:j,isLink:!0}]});Object(o.watch)((function(){return t.searchParams}),(function(e){Object.keys(e).length&&(n.product_id=e.product_id,n.start_month=e.month,n.end_month=e.month)}),{deep:!0,immediate:!t.showForm}),Object(o.onMounted)(Object(r.a)(regeneratorRuntime.mark((function e(){var r,o,c,i;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(r=d.query,o=r.productId,c=r.month,i=r.iterationId,t.showForm){e.next=5;break}n.filter_type=void 0,e.next=15;break;case 5:if(!c&&!i){e.next=15;break}return n.product_id=o?parseInt(o):void 0,n.filter_type=void 0,e.next=10,g(n.product_id);case 10:n.product_id&&w(Number(n.product_id),Number(n.iteration_id)),O.searchForm[2].val=n.product_id,i&&(n.iteration_id=parseInt(i),O.searchForm[3].val=n.iteration_id),c&&(n.start_month=c,n.end_month=c,O.searchForm[5].val=[c,c]),(c||i)&&z.a.replace({path:d.path,query:Object(a.a)(Object(a.a)({},d.query),{},{iterationId:void 0,month:void 0})});case 15:case"end":return e.stop()}}),e)}))));var h=function(e){Object.keys(n).forEach((function(e){n[e]=void 0})),"filter_type"===e.key?n.filter_type="-1"===e.id?void 0:Number(e.id):"4"===e.id?(n.start_month=Y()().format("YYYY-MM"),n.end_month=Y()().format("YYYY-MM")):(n.start_month=Y()().add(-1,"month").startOf("month").format("YYYY-MM"),n.end_month=n.start_month)},v=function(e){Object.keys(n).forEach((function(t){!e.month||"start_month"!==t&&"end_month"!==t?n[t]=e[t]||void 0:(n.start_month=e.month[0],n.end_month=e.month[1])}))},_=function(){var e=Object(r.a)(regeneratorRuntime.mark((function e(){var t;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,p();case 2:(t=e.sent)&&(l.proList=t);case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),g=function(){var e=Object(r.a)(regeneratorRuntime.mark((function e(t){var r,a;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(l.proList.length){e.next=8;break}return e.next=3,_();case 3:return e.next=5,k(t);case 5:r=e.sent,O.searchForm[2].listData=l.proList,r&&(l.IterList=r,b.set(n.product_id||-1,r),O.searchForm[3].listData=null===(a=l.IterList)||void 0===a?void 0:a.map((function(e){return{label:e.name,value:e.id}})));case 8:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),y=function(e){"select"===e.type&&"product_id"===e.key&&(O.searchForm[3].val="",w(e.val))},w=function(){var e=Object(r.a)(regeneratorRuntime.mark((function e(t,r){var a,o;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(l.IterList=[],n.iteration_id=r||"",!b.get(t)){e.next=6;break}l.IterList=b.get(t),e.next=10;break;case 6:return e.next=8,k(t);case 8:(o=e.sent)&&(l.IterList=o,b.set(t,o));case 10:O.searchForm[3].listData=null===(a=l.IterList)||void 0===a?void 0:a.map((function(e){return{label:e.name,value:e.id}}));case 11:case"end":return e.stop()}}),e)})));return function(t,n){return e.apply(this,arguments)}}(),k=function(){var e=Object(r.a)(regeneratorRuntime.mark((function e(t){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,m({product_id:t});case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),N=function(){w(-1)};return function(t,r){var a=Object(o.resolveComponent)("search-form");return Object(o.openBlock)(),Object(o.createElementBlock)("div",A,[Object(o.createElementVNode)("div",R,[e.showForm?(Object(o.openBlock)(),Object(o.createBlock)(a,{key:0,ref:"searchform",searchArray:Object(o.unref)(O),onQuickSeacrh:h,onChangeSearch:v,onChange:y,onResetSearch:N,currentActive:s.value,onClick:g},null,8,["searchArray","currentActive"])):Object(o.createCommentVNode)("",!0),Object(o.createVNode)(I.a,{fullscreen:i.value,"onUpdate:fullscreen":r[0]||(r[0]=function(e){return i.value=e})},null,8,["fullscreen"])]),Object(o.createVNode)(L,{class:Object(o.normalizeClass)(["job-eva-table",{"table-auto-height":!e.showForm}]),ref_key:"jobTable",ref:u,fullscreen:i.value,"hidden-pagation":e.showForm,form:Object(o.unref)(n)},null,8,["class","fullscreen","hidden-pagation","form"])])}}}));n("eaec");const W=s()(M,[["__scopeId","data-v-3e506fb7"]]);t.default=W},addb:function(e,t){var n=Math.floor,r=function(e,t){var c=e.length,i=n(c/2);return c<8?a(e,t):o(r(e.slice(0,i),t),r(e.slice(i),t),t)},a=function(e,t){for(var n,r,a=e.length,o=1;o<a;){for(r=o,n=e[o];r&&t(e[r-1],n)>0;)e[r]=e[--r];r!==o++&&(e[r]=n)}return e},o=function(e,t,n){for(var r=e.length,a=t.length,o=0,c=0,i=[];o<r||c<a;)o<r&&c<a?i.push(n(e[o],t[c])<=0?e[o++]:t[c++]):i.push(o<r?e[o++]:t[c++]);return i};e.exports=r},c4b2:function(e,t,n){},d998:function(e,t,n){var r=n("342f");e.exports=/MSIE|Trident/.test(r)},eaec:function(e,t,n){"use strict";n("17a4")},f757:function(e,t,n){"use strict";n("01a2")}}]);