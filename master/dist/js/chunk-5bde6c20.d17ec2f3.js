(window.webpackJsonp=window.webpackJsonp||[]).push([["chunk-5bde6c20"],{4484:function(e,t,a){},"5e68":function(e,t,a){},"9c84":function(e,t,a){"use strict";a("5e68")},b781:function(e,t,a){"use strict";var n=a("1da1"),r=a("5530"),i=(a("96cf"),a("a9e3"),a("b0c0"),a("7db0"),a("a15b"),a("d81d"),a("99af"),a("4de4"),a("7a23")),l=a("59a4"),c=a("afbc"),o=a("23c4"),u=a("5a0c"),d=a.n(u),s=a("a4d4"),m=a("6b59"),b=a("7b31"),v=a("913c"),p=a("867b"),f=a("d257"),_=a("0613"),O=a("2d40"),j={class:"calendar-slot-tips"},g={class:"calendar-slot-tips__title"},k={key:0},y={class:"calendar-slot-tips__body"},h={key:0,class:"calendar-slot-tips__body-label"},x=Object(i.createTextVNode)(" 至 "),w={class:"calendar-slot-tips__footer"},A=Object(i.defineComponent)(Object(r.a)(Object(r.a)({},{name:"calendar-slot-dialog"}),{},{props:{tipsVisible:{type:Boolean,default:!1},item:{type:Object,default:function(){return{}}},type:{type:Number,default:0},personInfo:{type:Object,default:function(){return{}}}},emits:["update:tipsVisible","handleItem","updateData"],setup:function(e,t){var a=t.emit,u=e,A=["iteration","task","bug","abeyancen"],D=Object(i.ref)(),B=Object(i.reactive)({abeyancen:{name:"",remark:"",type:"abeyancen",typeName:"待办",detailArr:[{id:0,label:"参与人",value:""},{id:1,label:"时间",type:"time",value:"",color:"",index:0},{id:2,label:"提醒",value:""},{id:3,label:"重复",value:""}],btns:[{id:0,label:"完成",icon:"circle-check",disabled:!1},{id:1,label:"编辑",icon:"edit",disabled:!1},{id:2,label:"删除",icon:"delete",disabled:!1}]},task:{name:"",type:"task",typeName:"任务",detailArr:[{id:0,label:"迭代",value:""},{id:1,label:"时间",type:"time",value:"",color:"",index:0},{id:2,label:"工时",value:""},{id:3,label:"优先级",value:"",color:""},{id:4,label:"状态",value:"",color:""}],btns:[{id:3,label:"完成",icon:"circle-check",disabled:!1},{id:4,label:"详情",icon:"view",disabled:!1},{id:5,label:"删除",icon:"delete",disabled:!1}]},iteration:{name:"",type:"iteration",typeName:"迭代",detailArr:[{id:0,label:"项目",value:""},{id:1,label:"开发",value:"",type:"time",color:"",index:0},{id:2,label:"联调",value:"",type:"time",color:"",index:0},{id:3,label:"测试",value:"",type:"time",color:"",index:0},{id:4,label:"进度",value:"",color:""}],btns:[{id:6,label:"查看详情",icon:"view",disabled:!1}]},bug:{name:"",type:"bug",typeName:"BUG",detailArr:[{id:0,label:"迭代",value:""},{id:1,label:"时间",value:""},{id:2,label:"环境",value:""},{id:3,label:"级别",value:"",color:""},{id:4,label:"状态",value:""}],btns:[{id:7,label:"解决",icon:"circle-check"},{id:8,label:"详情",icon:"view"}]}}),I=Object(f.G)("user",!0),T=Object(l.a)(),V=T.noticeOpts,N=T.repeatOpt,C=T.useHandleBackLogStatus,R=T.useHandleTaskStatus,E=T.useUpdateBugStatus,S=T.useDelCalenderBackLog,Y=Object(i.computed)((function(){return u.tipsVisible}));Object(i.watch)((function(){return u.tipsVisible}),(function(e){e&&Q()}));var M=function(){var e=Object(n.a)(regeneratorRuntime.mark((function e(t){var i,l,o,b,j,g,k,y,h,x,w,A,D,B,I,T,V,N,C,R,E,S,Y,M,U,G,H,J,Q,K,W,X,Z,$,ee,te,ae;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:l=!0,o=null===(i=u.personInfo)||void 0===i?void 0:i.day,b=o?d()(o).format("YYYY-MM-DD"):d()().format("YYYY-MM-DD"),e.t0=t,e.next=0===e.t0?6:1===e.t0?13:2===e.t0?16:3===e.t0?20:4===e.t0?25:5===e.t0?29:6===e.t0?33:7===e.t0?37:8===e.t0?42:44;break;case 6:if(j=u.item,g=j.id,!(j.status>0)){e.next=9;break}return e.abrupt("return");case 9:return e.next=11,F(g,1,b);case 11:return l=e.sent,e.abrupt("break",44);case 13:return a("handleItem",Object(r.a)(Object(r.a)({},u.item),{},{type:4,target_id:u.item.id})),a("update:tipsVisible",!1),e.abrupt("return");case 16:return k=u.item,y=k.id,h=k.is_repeat,x=k.name,l=!1,m.a.confirm(x,"删除",{confirmButtonText:"删除将来所有的事件",cancelButtonText:"仅删除此事件",showConfirmButton:h>0,distinguishCancelAndClose:!0,callback:function(){var e=Object(n.a)(regeneratorRuntime.mark((function e(t){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if("confirm"!==t&&"cancel"!==t){e.next=7;break}return e.next=3,z(y,"confirm"===t?2:1,b);case 3:if(l=e.sent){e.next=6;break}return e.abrupt("return");case 6:s.a.emit("refreshBacklog");case 7:q();case 8:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}()}),e.abrupt("break",44);case 20:return w=u.item.id,e.next=23,L(w,2);case 23:return l=e.sent,e.abrupt("break",44);case 25:return v.d.value===(null===(A=u.item)||void 0===A?void 0:A.product_id)?(v.f.demand=null===(V=u.item)||void 0===V?void 0:V.iteration_id,_.b.commit(O.a.updateIterateId,null===(N=u.item)||void 0===N?void 0:N.iteration_id)):null!==(C=u.item)&&void 0!==C&&C.product_id&&(v.d.value=null===(R=u.item)||void 0===R?void 0:R.product_id,Object(f.Q)(u.item),_.b.commit(O.a.updateProductId,null===(E=u.item)||void 0===E?void 0:E.product_id),_.b.commit(O.a.updateProductInfo),Object(p.a)()(null===(S=u.item)||void 0===S?void 0:S.product_id).then((function(e){var t;v.c.value=e,v.f.demand=null===(t=u.item)||void 0===t?void 0:t.iteration_id,_.b.commit(O.a.updateIterateId,v.f.demand)}))),null!==(D=u.item)&&void 0!==D&&D.iteration_id&&(Object(v.g)(null===(Y=u.item)||void 0===Y?void 0:Y.iteration_id),_.b.commit(O.a.updateIterateId,null===(M=u.item)||void 0===M?void 0:M.iteration_id)),c.a.push({name:"exploitation",query:{productId:null===(B=u.item)||void 0===B?void 0:B.product_id,iteration_id:null===(I=u.item)||void 0===I?void 0:I.iteration_id,name:null===(T=u.item)||void 0===T?void 0:T.name}}),e.abrupt("break",44);case 29:return U=u.item.id,l=!1,m.a.confirm("请确认是否删除该任务？","删除",{confirmButtonText:"确认",cancelButtonText:"取消",type:"error",callback:function(){var e=Object(n.a)(regeneratorRuntime.mark((function e(t){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if("confirm"!==t){e.next=8;break}return e.next=3,L(U,999);case 3:if(l=e.sent){e.next=6;break}return e.abrupt("return");case 6:s.a.emit("refreshBacklog"),q();case 8:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}()}),e.abrupt("break",44);case 33:return v.d.value===(null===(G=u.item)||void 0===G?void 0:G.product.id)?(v.f.demand=null===(Q=u.item)||void 0===Q?void 0:Q.id,_.b.commit(O.a.updateIterateId,v.f.demand)):null!==(K=u.item)&&void 0!==K&&K.product.id&&(v.d.value=null===(W=u.item)||void 0===W?void 0:W.product.id,Object(f.Q)(u.item),_.b.commit(O.a.updateProductId,null===(X=u.item)||void 0===X?void 0:X.product.id),_.b.commit(O.a.updateProductInfo),Object(p.a)()(null===(Z=u.item)||void 0===Z?void 0:Z.product.id).then((function(e){var t;v.c.value=e,v.f.demand=null===(t=u.item)||void 0===t?void 0:t.id,_.b.commit(O.a.updateIterateId,v.f.demand)}))),null!==(H=u.item)&&void 0!==H&&H.id&&(Object(v.g)(null===($=u.item)||void 0===$?void 0:$.id),_.b.commit(O.a.updateIterateId,null===(ee=u.item)||void 0===ee?void 0:ee.id)),c.a.push({name:"homepage",query:{productId:null===(J=u.item)||void 0===J?void 0:J.product_id}}),e.abrupt("break",44);case 37:return te=u.item.id,e.next=40,P(te,2);case 40:return l=e.sent,e.abrupt("break",44);case 42:return c.a.push({name:"test",query:{id:null===(ae=u.item)||void 0===ae?void 0:ae.id}}),e.abrupt("break",44);case 44:l&&(s.a.emit("refreshBacklog"),q());case 45:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),F=function(){var e=Object(n.a)(regeneratorRuntime.mark((function e(t,a,n){var r;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,C({id:t,status:a,month:n});case 2:return r=e.sent,b.a.success(r?"操作成功":"操作失败"),e.abrupt("return",!!r);case 5:case"end":return e.stop()}}),e)})));return function(t,a,n){return e.apply(this,arguments)}}(),z=function(){var e=Object(n.a)(regeneratorRuntime.mark((function e(t,a,n){var r;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,S({id:t,type:a,month:n});case 2:return r=e.sent,b.a.success(r?"操作成功":"操作失败"),e.abrupt("return",!!r);case 5:case"end":return e.stop()}}),e)})));return function(t,a,n){return e.apply(this,arguments)}}(),L=function(){var e=Object(n.a)(regeneratorRuntime.mark((function e(t,a){var n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,R({ids:[t],status:a});case 2:return n=e.sent,b.a.success(n?"操作成功":"操作失败"),e.abrupt("return",!!n);case 5:case"end":return e.stop()}}),e)})));return function(t,a){return e.apply(this,arguments)}}(),P=function(){var e=Object(n.a)(regeneratorRuntime.mark((function e(t,a){var n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,E({id:t,status:a});case 2:return n=e.sent,b.a.success(n?"操作成功":"操作失败"),e.abrupt("return",!!n);case 5:case"end":return e.stop()}}),e)})));return function(t,a){return e.apply(this,arguments)}}(),q=function(){a("updateData"),a("update:tipsVisible",!1)},U=function(e,t){var a=d()().format("YYYY-MM-DD");return t?e.real_end_time&&e.real_end_time>e.end_time?"#ff0000":4!==e.status||e.real_end_time?!e.real_end_time&&e.end_time<a?"#ff0000":"":"#ff0000":!e.status&&a>=e.begin_time||5===e.status&&!e.real_begin_time&&a>=e.begin_time?"#ff0000":4!==e.status||e.real_begin_time?e.real_begin_time&&e.real_begin_time>e.begin_time?"#ff0000":"":"#ff0000"},G=function(){var e=u.item;return e.complete_percent-e.time_percent},H=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,t=u.item,a=t.start_time,n=t.end_time,r=Date.now(),i=new Date(a).getTime(),l=new Date(n).getTime(),c=[i,l];return r>c[e]},J=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1,a=u.item,n=a.test_time,r=a.union_time,i=a.release_time,l=a.dev_time,c=a.real_dev_time,o=a.real_test_time,d=a.real_union_time,s=a.real_release_time,m=new Date(l).getTime(),b=new Date(n).getTime(),v=new Date(r).getTime(),p=new Date(i).getTime(),f=new Date(c).getTime(),_=new Date(o).getTime(),O=new Date(d).getTime();return new Date(s).getTime(),1===t?0===e?f>m:f>v:2===t?0===e?O>v:O>b:3===t&&(0===e?_>b:_>p)},Q=function(){var e=A[u.type-1];switch(D.value=B[e],e){case"abeyancen":var t=u.item,a=t.create_by,n=t.name,r=t.department,i=t.participant,l=t.remark,c=t.start_time,d=t.end_time,s=t.ahead_time_enum,m=t.is_repeat,b=t.status,v=D.value;v.name=n,v.remark=l,v.btns[0].label=3===b?"已完成":"完成",v.btns[0].disabled=1===b,v.btns[1].disabled=(null==I?void 0:I.staff_no)!==a,v.btns[1].disabled=1===b;var p=i.map((function(e){return e.staff_name})).join("，"),f=r.map((function(e){return e.staff_name})).join("，");v.detailArr[0].value="".concat(p).concat(f?"，".concat(f):""),v.detailArr[1].value=[c,d],v.detailArr[1].color=H()?"#ff0000":"";var _=[H(),H(1)].filter((function(e){return e}));v.detailArr[1].index=_.length>1?2:_.indexOf(!0),v.detailArr[2].value=V[s-1].label,v.detailArr[3].value=N[m].label;break;case"task":var O=u.item,j=O.name,g=O.iteration_name,k=O.begin_time,y=O.end_time,h=O.hours,x=O.level,w=O.status,T=D.value;T.name=j,T.detailArr[0].value=g,T.btns[0].disabled=2===w||3===w;var C=[U(u.item,0),U(u.item,1)].filter((function(e){return e}));T.detailArr[1].color=C.length?"#ff0000":"",T.detailArr[1].index=C.length>1?2:C.indexOf("#ff0000"),T.detailArr[1].value=[k,y],T.detailArr[2].value="".concat(h,"h"),T.detailArr[3].value=o.p[x-1].value,T.detailArr[4].value=o.v[w].label;break;case"iteration":var R=u.item,E=R.product,S=R.name,Y=R.dev_time,M=R.test_time,F=R.union_time,z=R.release_time,L=R.complete_percent,P=R.status,q=D.value,Q=function(e){var t=o.u.find((function(t){return t.value===e}));return null==t?void 0:t.label}(P);q.name="".concat(function(){var e,t=u.item,a=t.test_time,n=t.union_time,r=t.release_time,i=new Date(a).getTime(),l=new Date(n).getTime(),c=new Date(r).getTime(),o=null===(e=u.personInfo)||void 0===e?void 0:e.day,d=new Date(o).getTime();return d>=l&&d<i?"联调":d>=i&&d<c?"测试":d>=c?"发布":"开发"}(),"-").concat(S),q.detailArr[0].value=null==E?void 0:E.name,q.detailArr[1].value=[Y,F];var K=[J(0),J(1)].filter((function(e){return e}));q.detailArr[1].color=K.length?"#ff0000":"",q.detailArr[1].index=K.length>1?2:K.indexOf(!0),q.detailArr[2].value=[F,F];var W=[J(0,2),J(1,2)].filter((function(e){return e}));q.detailArr[2].color=W.length?"#ff0000":"",q.detailArr[2].index=W.length>1?2:W.indexOf(!0),q.detailArr[3].value=[M,z];var X=[J(0,3),J(1,3)].filter((function(e){return e}));q.detailArr[3].color=X.length?"#ff0000":"",q.detailArr[3].index=X.length>1?2:X.indexOf(!0),q.detailArr[4].value="".concat(L,"% (").concat(Q,"，").concat(G()>=0?"提前":"落后"," ").concat(Math.abs(G()),"%)"),q.detailArr[4].color=G()>0?"#1F9F85":"#ff0000";break;case"bug":var Z=u.item,$=Z.name,ee=Z.iteration_name,te=Z.create_time,ae=Z.level,ne=Z.status,re=Z.env,ie=D.value;ie.name=$,ie.btns[0].label=2===ne?"已解决":"解决",ie.btns[0].disabled=2===ne,ie.detailArr[0].value=ee||"主干",ie.detailArr[1].value=te,ie.detailArr[2].value=o.j[re-1].value,ie.detailArr[3].value=o.b[ae-1].label,ie.detailArr[3].color=o.b[ae-1].color,ie.detailArr[4].value=o.c[ne+1].label}};return function(e,t){var a=Object(i.resolveComponent)("el-button"),n=Object(i.resolveComponent)("el-dialog");return Object(i.openBlock)(),Object(i.createElementBlock)("div",j,[Object(i.createVNode)(n,{"custom-class":"calendar-slot-tips",modelValue:Object(i.unref)(Y),"onUpdate:modelValue":t[0]||(t[0]=function(e){return Object(i.isRef)(Y)?Y.value=e:null}),width:"500px","append-to-body":"","show-close":!1,"before-close":q},{footer:Object(i.withCtx)((function(){var e;return[Object(i.createElementVNode)("div",w,[(Object(i.openBlock)(!0),Object(i.createElementBlock)(i.Fragment,null,Object(i.renderList)(null===(e=D.value)||void 0===e?void 0:e.btns,(function(e){return Object(i.openBlock)(),Object(i.createBlock)(a,{onClick:function(t){return M(e.id)},disabled:e.disabled,key:e.id,class:"calendar-slot-tips__footer-icon",type:"text",icon:"el-icon-circle-check"},{default:Object(i.withCtx)((function(){return[Object(i.createTextVNode)(Object(i.toDisplayString)(e.label),1)]})),_:2},1032,["onClick","disabled"])})),128))])]})),default:Object(i.withCtx)((function(){var e,t,a,n,r,l;return[Object(i.createElementVNode)("p",g,[Object(i.createElementVNode)("span",{class:Object(i.normalizeClass)(["calendar-slot-tips__tag","calendar-slot-tips__tag-".concat(null===(e=D.value)||void 0===e?void 0:e.type)])},Object(i.toDisplayString)(null===(t=D.value)||void 0===t?void 0:t.typeName),3),Object(i.createTextVNode)(Object(i.toDisplayString)(null===(a=D.value)||void 0===a?void 0:a.name),1)]),null!==(n=D.value)&&void 0!==n&&n.remark?(Object(i.openBlock)(),Object(i.createElementBlock)("span",k,Object(i.toDisplayString)(null===(r=D.value)||void 0===r?void 0:r.remark),1)):Object(i.createCommentVNode)("",!0),Object(i.createElementVNode)("div",y,[(Object(i.openBlock)(!0),Object(i.createElementBlock)(i.Fragment,null,Object(i.renderList)(null===(l=D.value)||void 0===l?void 0:l.detailArr,(function(e){return Object(i.openBlock)(),Object(i.createElementBlock)("p",{key:e.id},[e.value?(Object(i.openBlock)(),Object(i.createElementBlock)("span",h,Object(i.toDisplayString)(e.label)+"：",1)):Object(i.createCommentVNode)("",!0),"time"!==e.type?(Object(i.openBlock)(),Object(i.createElementBlock)("span",{key:1,style:Object(i.normalizeStyle)("color: ".concat(e.color))},Object(i.toDisplayString)(e.value),5)):(Object(i.openBlock)(),Object(i.createElementBlock)(i.Fragment,{key:2},[Object(i.createElementVNode)("span",{style:Object(i.normalizeStyle)([0===e.index||2===e.index?"color: ".concat(e.color):""])},Object(i.toDisplayString)(e.value[0]),5),x,Object(i.createElementVNode)("span",{style:Object(i.normalizeStyle)([1===e.index||2===e.index?"color: ".concat(e.color):""])},Object(i.toDisplayString)(e.value[1]),5)],64))])})),128))])]})),_:1},8,["modelValue"])])}}})),D=(a("9c84"),a("e37a"),a("6b0d"));const B=a.n(D)()(A,[["__scopeId","data-v-be6699d0"]]);t.a=B},e37a:function(e,t,a){"use strict";a("4484")}}]);