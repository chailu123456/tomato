(window.webpackJsonp=window.webpackJsonp||[]).push([["chunk-5b0913f4"],{"1e28":function(e,t,n){"use strict";n("32d2")},"32d2":function(e,t,n){},7676:function(e,t,n){"use strict";var a=n("7a23"),c=Object(a.defineComponent)({name:"Close"});const o={xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 1024 1024"},l=Object(a.createVNode)("path",{fill:"currentColor",d:"M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"},null,-1);c.render=function(e,t,n,c,r,i){return Object(a.openBlock)(),Object(a.createBlock)("svg",o,[l])},c.__file="packages/components/Close.vue",t.a=c},fbaf:function(e,t,n){"use strict";var a=n("2909"),c=n("1da1"),o=n("5530"),l=(n("96cf"),n("d81d"),n("99af"),n("159b"),n("4de4"),n("caad"),n("2532"),n("a434"),n("7a23")),r=n("9fe0"),i=n("3740"),u=n("7676"),s={key:0,class:"load-container"},f=[Object(l.createElementVNode)("div",{class:"load"},null,-1)],d={key:1},p={class:"dialog-footer"},b=Object(l.createTextVNode)("确 定"),v=Object(l.defineComponent)(Object(o.a)(Object(o.a)({},{name:"handlePerson"}),{},{props:{visible:{type:Boolean,default:!1},item:{type:Object,default:function(){return{}}},checkStrictly:{type:Boolean,default:!0},disabledNode:{type:Boolean,default:!1},onlyEmployee:{type:Boolean,default:!1},isRadio:{type:Boolean,default:!1},title:{type:String,default:"添加成员"},isOldOneShowClose:{type:Boolean,default:!0}},emits:["update:visible","submit"],setup:function(e,t){var n,v=t.emit,m=e,O=Object(l.ref)(""),h=Object(l.ref)(),j=Object(l.ref)(),k=[],_=Object(l.ref)(),y=Object(l.ref)([]),w=Object(l.ref)([]),C=Object(l.ref)(),g=Object(l.reactive)({department:[],team_worker:[]});Object(l.watch)((function(){return m.visible}),function(){var e=Object(c.a)(regeneratorRuntime.mark((function e(t){var c,o,l,r,u,s,f,d,p,b;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(O.value="",!t){e.next=8;break}return e.next=4,x();case 4:m.item.id&&(l=m.item,r=l.department,u=l.participant,s=null==r?void 0:r.map((function(e){return e.staff_no})),f=null==u?void 0:u.map((function(e){return e.staff_no})),y.value.length=0,w.value.length=0,(c=y.value).push.apply(c,Object(a.a)(s).concat(Object(a.a)(f))),d=[],p=[],r.forEach((function(e){var t=e.staff_no,n=e.staff_name;d.push({staff_name:n,staff_no:t,is_department:!0})})),u.forEach((function(e){var t=e.staff_no,n=e.staff_name;p.push({staff_name:n,staff_no:t,is_department:!1})})),(o=w.value).push.apply(o,d.concat(p)),k.push.apply(k,d.concat(p))),n=i.a.service({fullscreen:!1,target:j.value.dialogRef,customClass:"handlePersonFullScreen"}),e.next=9;break;case 8:null===(b=n)||void 0===b||b.close();case 9:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}()),Object(l.watch)((function(){return O.value}),(function(e){null==C||C.value.filter(e)}));var x=function(){Object(r.e)().then((function(e){h.value=function e(t){for(var n=[],a=0;a<t.length;a+=1){var c={};c.id=t[a].id,c.label=t[a].label,c.is_department=t[a].is_department,c.disabled=m.disabledNode&&t[a].is_department,t[a].children&&t[a].children.length&&(c.children=e(t[a].children)),n.push(c)}return n}(e.data),n.close()}))},N=function(e){return!k.map((function(e){return e.staff_no})).includes(e)},V=function(e,t){if(m.isRadio)if(t.checkedKeys.length){var n=e.id,a=e.label,c=e.is_department;w.value=[{staff_name:a,staff_no:n,is_department:c,isNew:N(n)}]}else w.value=[];else if(m.onlyEmployee){var o=null==C?void 0:C.value.getCheckedNodes();if(Array.isArray(o)){var r=o.filter((function(e){return!e.is_department}));w.value=r.map((function(e){return{staff_name:e.label,staff_no:e.id,is_department:!1,isNew:N(e.id)}}))}}else{var i=Object(l.ref)([]);w.value.forEach((function(e){i.value.push(e.staff_no)})),i.value.includes(e.id)?w.value.forEach((function(t,n){t.staff_no===e.id&&w.value.splice(n,1)})):w.value.push({staff_name:e.label,staff_no:e.id,is_department:e.is_department,isNew:N(e.id)})}},B=function(e,t){return!e||-1!==t.label.indexOf(e)},E=function(){var e=Object(c.a)(regeneratorRuntime.mark((function e(){var t;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:g.team_worker=[],g.department=[],y.value=[],w.value&&w.value.length&&w.value.forEach((function(e){e.is_department?g.department.push(1*e.staff_no):g.team_worker.push(e.staff_no),y.value.push(e.staff_no)})),R(),t=Object(o.a)({selectPerson:Object.assign([],w.value)},Object.assign({},g)),v("submit",t);case 7:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),R=function(e){"close"===e&&(y.value.length=0,w.value.length=0),v("update:visible",!1)},S=function(e,t,n){m.isRadio&&(t?(_.value=e.id,null==C||C.value.setCheckedKeys([e.id])):_.value===e.id&&(null==C||C.value.setCheckedKeys([])))};return function(t,n){var a=Object(l.resolveComponent)("el-input"),c=Object(l.resolveComponent)("el-tree"),o=Object(l.resolveComponent)("el-scrollbar"),r=Object(l.resolveComponent)("el-divider"),i=Object(l.resolveComponent)("el-button"),v=Object(l.resolveComponent)("el-icon"),k=Object(l.resolveComponent)("el-dialog");return Object(l.openBlock)(),Object(l.createBlock)(k,{title:e.title,ref_key:"handleperson",ref:j,"custom-class":"position-dialog",modelValue:e.visible,"onUpdate:modelValue":n[1]||(n[1]=function(e){return Object(l.isRef)(visible)?visible.value=e:null}),"before-close":function(){return R("close")},"append-to-body":!0,width:"600px"},{footer:Object(l.withCtx)((function(){return[Object(l.createElementVNode)("span",p,[Object(l.createVNode)(i,{type:"primary",onClick:Object(l.withModifiers)(E,["stop"])},{default:Object(l.withCtx)((function(){return[b]})),_:1},8,["onClick"])])]})),default:Object(l.withCtx)((function(){return[h.value?(Object(l.openBlock)(),Object(l.createElementBlock)("div",d,[Object(l.createVNode)(a,{placeholder:"输入姓名查找",modelValue:O.value,"onUpdate:modelValue":n[0]||(n[0]=function(e){return O.value=e})},null,8,["modelValue"]),Object(l.createVNode)(o,{height:"400px"},{default:Object(l.withCtx)((function(){return[Object(l.createVNode)(c,{onCheck:V,"node-key":"id","default-expand-all":"","show-checkbox":"","check-strictly":e.checkStrictly,data:h.value,"default-checked-keys":Object(l.unref)(y),"filter-node-method":B,onCheckChange:S,ref_key:"keywordTreeRef",ref:C},null,8,["check-strictly","data","default-checked-keys"])]})),_:1})])):(Object(l.openBlock)(),Object(l.createElementBlock)("div",s,f)),Object(l.createElementVNode)("div",null,[Object(l.createVNode)(r,{direction:"vertical"})]),Object(l.createElementVNode)("div",null,[Object(l.createVNode)(o,{height:"400px"},{default:Object(l.withCtx)((function(){return[(Object(l.openBlock)(!0),Object(l.createElementBlock)(l.Fragment,null,Object(l.renderList)(Object(l.unref)(w),(function(e,t){return Object(l.openBlock)(),Object(l.createElementBlock)("div",{key:t,class:"current-checked-nodes"},[Object(l.createVNode)(i,{icon:"el-icon-user-solid",type:"text"},{default:Object(l.withCtx)((function(){return[Object(l.createTextVNode)(Object(l.toDisplayString)(e.staff_name),1)]})),_:2},1024),e.isNew||m.isOldOneShowClose?(Object(l.openBlock)(),Object(l.createBlock)(v,{key:0,onClick:function(e){return function(e,t){w.value.splice(t,1),Object(l.nextTick)((function(){null==C||C.value.setCheckedKeys(w.value.map((function(e){return e.staff_no})))}))}(0,t)}},{default:Object(l.withCtx)((function(){return[Object(l.createVNode)(Object(l.unref)(u.a))]})),_:2},1032,["onClick"])):Object(l.createCommentVNode)("",!0)])})),128))]})),_:1})])]})),_:1},8,["title","modelValue","before-close"])}}}));n("1e28");const m=v;t.a=m}}]);