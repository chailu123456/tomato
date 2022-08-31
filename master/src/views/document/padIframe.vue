<template>
  <div class="pad">
    <div class="pad-top" v-show="isShareSidebar">
      <div class="pad-top__left">
        <i @click="goBack" class="iconfont icon-youjiantou pad-icon__back"></i>
        <div class="pad-top__left-wrap" :style="{ marginTop: status ? '0' : '-12px' }">
          <el-input
            :disabled="permission !== 2"
            @change="onUpdateDocTitle"
            maxlength="50"
            class="pad-top__input"
            v-model.trim="title"
            placeholder="请输入标题"
          />
          <span :class="[status ? 'doc-route-no' : 'doc-route']">文档存放于：我的空间/草稿箱</span>
        </div>
      </div>
      <div class="pad-top__members" v-if="onlineMembers.length">
        <el-avatar class="pad-top__members-item" v-for="member in onlineMembers" :key="member.id" size="15" :style="{ backgroundColor: member['color'] }">{{
          member.name
        }}</el-avatar>
      </div>
      <div class="pad-top__tools">
        <el-button type="primary" :disabled="permission !== 2" @click="handleShare">分享</el-button>
        <img class="el-icon-full-screen" @click="toggleEditorFullScreen" src="@/assets/yanshi.png" />
        <!-- 消息通知模块 start -->
        <div class="side-wrapper__notice" @click="() => show()">
          <el-popover placement="bottom-end" trigger="hover" :width="900" v-model:visible="visible">
            <template #reference>
              <div>
                <el-badge :value="notices" :hidden="notices <= 0 ? true : false" type="danger" :max="99">
                  <el-icon class="side-wrapper__notice-icon">
                    <Bell id="icon" />
                  </el-icon>
                </el-badge>
              </div>
            </template>
            <Notices @update:show="show" v-model:notices="notices" />
          </el-popover>
        </div>
        <el-dropdown v-if="status !== 2">
          <span class="pad-top__tools-more el-dropdown-link">...</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleMenuItem(item)" :disabled="item.id > 2 && permission !== 2" v-for="item in dropList" :key="item.id">
                <p style="margin: 0; padding: 5px 0">
                  {{ item.label }}
                </p>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <!--
      permission优先，然后是status
      1. permission 存在的情况
      2. else permission不存在的情况
      判断status === 2， status === 0
    -->
    <template v-if="isShowContainer">
      <div class="pad-container" v-if="permission">
        <Sidebar v-show="isShareSidebar" ref="sidebar" :docId="articleId" :permission="permission" @onEvent="onEvent" />
        <iframe class="pad-iframe" :allowtransparency="true" frameborder="no" scrolling="no" id="padIframe" :src="iframeHost"></iframe>
      </div>
      <!-- 无权限状态 -->
      <template v-else>
        <!-- 文档不存在状态 -->
        <template v-if="status === 2">
          <div class="pad-empty pad-empty__text">文档不存在</div>
        </template>
        <!-- 文档没有分享状态 -->
        <template v-else-if="status === 0">
          <div class="pad-empty pad-empty__text">当前文档尚未分享，暂时无法查看。</div>
        </template>
        <div class="pad-empty" v-else>
          <p>文档设置了权限，您可以向 {{ creator }} 申请权限</p>
          <p>
            <el-button type="primary" @click="onApplyPermission(1)">申请查看权限</el-button>
          </p>
          <p>
            <el-button @click="onApplyPermission(2)">申请编辑权限</el-button>
          </p>
        </div>
      </template>
    </template>
    <el-dialog
      title="分享"
      v-model="dialogVisible"
      top="8vh"
      width="40%"
      center
      :append-to-body="true"
      @close="beforeClose"
      :before-close="beforeClose"
      v-loading="shareLoading"
    >
      <el-form :model="formParams" label-width="100px" ref="shareFormRef">
        <ul class="rp-share-select">
          <li v-if="!hasPermissOpt" class="rp-share-select__column">
            <ShareClassify :classify_id="formParams.classify_id" :shareVisible="dialogVisible" @change="onChangeSelect" :trees="columnShareList" />
          </li>
          <li v-if="!hasPermissOpt" class="rp-share-tag">
            <div class="rp-classify">标签</div>
            <el-form-item class="rp-select" label>
              <el-select
                v-model="formParams.tag_id"
                @change="handleShareDialog('select')"
                :props="{ value: 'id', label: 'name' }"
                :remote-method="getTagList"
                multiple-limit="3"
                multiple
                remote
                filterable
                placeholder="请搜索标签"
              >
                <el-option v-for="item in classifyTag" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
          </li>
          <li v-if="!hasPermissOpt" class="rp-share-cooperation">
            <div class="rp-classify">邀请协作者</div>
            <div class="rp-people-list">
              <div class="people-list-show">
                <span v-for="(item, index) in selectPerson" :key="index">{{ item.staff_name }}</span>
              </div>
              <span class="rp-add-people" @click="handleAddPeople">+</span>
            </div>
          </li>
          <li class="rp-select-jurisdiction">
            <div class="rp-classify">
              链接分享
              <el-switch :before-change="() => handleShareDialog('linkShare')" v-model="link_share"></el-switch>
            </div>
            <div v-if="link_share" class="rp-select-jurisdiction__permiss">
              <el-select v-model="formParams.link_share" @change="handleShareDialog('select')" placeholder="请选择">
                <el-option v-for="item in LINKSHARE" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
              <el-button class="rp-select-jurisdiction__permiss-btns" v-if="link_share" @click="copyLink" type="text"> 复制链接</el-button>
            </div>
            <div class="rp-close" v-else>链接分享已关闭，仅协作者可查看和编辑（若公开分享开启，组织内其他成员也可查看或编辑）</div>
          </li>
          <li class="rp-select-jurisdiction">
            <div class="rp-classify">
              公开分享
              <el-switch :before-change="() => handleShareDialog('openShare')" v-model="open_share"></el-switch>
            </div>
            <el-select v-if="open_share" v-model="formParams.open_share" @change="handleShareDialog('select')" placeholder="请选择">
              <el-option v-for="item in PUBLICSHARE" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select>
            <div class="rp-close" v-else>公开分享已关闭，仅协作者可查看和编辑（若链接分享开启，获得链接的人可查看或编辑）</div>
          </li>
        </ul>
      </el-form>
    </el-dialog>
    <el-dialog title="添加成员" custom-class="position-dialog" v-model="dialogShadow" :append-to-body="true" width="40%">
      <div class="load-container" v-if="!allPeople">
        <div class="load"></div>
      </div>
      <div v-else>
        <el-input placeholder="输入姓名查找" v-model="filterText"></el-input>
        <el-scrollbar height="400px">
          <el-tree
            @check="handleCheckBoxEventByText"
            node-key="id"
            default-expand-all
            show-checkbox
            :check-strictly="true"
            :data="allPeople"
            :default-checked-keys="checkedKeys"
            :filter-node-method="filterNode"
            ref="keywordTreeRef"
          ></el-tree>
        </el-scrollbar>
      </div>
      <div>
        <el-divider direction="vertical"></el-divider>
      </div>
      <div>
        <el-scrollbar height="400px">
          <div v-for="(item, index) in selectPerson" :key="index" class="current-checked-nodes">
            <el-button icon="el-icon-user-solid" type="text">{{ item.staff_name }}</el-button>
            <el-icon style="margin-right: 10px" class="el-icon-close" @click="deleteCheckedKeys(item, index)">
              <Close />
            </el-icon>
          </div>
        </el-scrollbar>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" :disabled="!dialogShadow" @click="handleShadow">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { USER } from "../../store/state";
import { applyPermission, createDoc, getDocDetails, getDocTitle, updateDoc, updateShareDoc } from "@/api/request-modules/document";
import { useRouter } from "vue-router";
import { listenFullScreen, toggleFullScreen } from "@/utils/index";
import copyField from "@/utils/copyField";
import useDocument, { DocDetails, onUpdateCollection, onDeleteDoc, randomStringId, ParamsUpdateDocTitleInter, TagItemInter } from "@/composables/useDocument";
import { defineComponent, nextTick, reactive, onMounted, ref, watch } from "vue";
import { ResponseParams } from "@/types/response";
import { getDepartmentListPeople } from "@/api/request-modules/common";
import { setSession, getSession } from "@/utils";
import Notices from "@/components/notices/index.vue";
import Sidebar from "./components/sidebar.vue";
import { getShortCode, shortCode } from "@/api/request-modules/document";
import qs from "qs";
import { CLASSIFY, LINKSHARE, PUBLICSHARE } from "@/utils/index";
import { ElMessage } from "element-plus";
import ShareClassify from "./components/shareClassify.vue";
import { UploadFile } from "@/types/upload";
import { Bell, Close } from "@element-plus/icons";

interface Members {
  id: number;
  name: string;
  uuid: string;
  index: number;
  color: string;
  userId?: string;
}

export default defineComponent({
  name: "padIframe",
  components: {
    Notices,
    Sidebar,
    ShareClassify,
    Bell,
    Close
  },
  data() {
    return {
      notices: 0
    };
  },
  setup() {
    const locat = window.location;
    const isPro = locat.host.includes("tomato.petrvet.com") ? true : false;
    const iframeHost = (isPro ? "//online-editor.petrvet.com" : "//test.online-editor.rvet.cn") + `?t=${Date.now()}`;
    let content_id = ref(randomStringId()); // 编辑器文章id
    const router = useRouter();
    const articleId = ref(0); // 文章id
    let isShowIframe = ref(false); // 是否显示编辑器iframe
    let title = ref(""); // 文章title
    let permission = ref(0); // 0 无权限，1，可阅读，2 可编辑
    let status = ref(1); // 文档状态
    let isShowContainer = ref(false); // 是否渲染编辑器
    let hasPermissOpt = ref(true); // 是否操作权限按钮
    let creator = ref(""); // 创建者
    const visible = ref(false);
    const onlineMembers = ref<Members[]>([]);
    let needSend = true; // 是否需要发送消息到编辑器
    const sidebar = ref(); // sidebar ref
    const shareLoading = ref(false); // 分享dialog loading
    const columnShareList = ref(); // 分类列表
    const isShareSidebar = ref(true); // 是否显示sidebar
    let docDetails: DocDetails = {
      comment_permission: 0,
      content_id: "",
      create_by: "",
      creator: "",
      id: 0,
      is_collection: 0,
      link_share: 0,
      open_share: 0,
      permission: 0,
      status: 0,
      title: ""
    };
    const dropList: { id: number; label: string }[] = reactive([
      {
        id: 0,
        label: "新窗口打开"
      },
      {
        id: 1,
        label: "复制链接"
      },
      {
        id: 2,
        label: "收藏"
      },
      {
        id: 3,
        label: "导出所有文档为PDF"
      },
      {
        id: 4,
        label: "删除"
      },
      {
        id: 5,
        label: "文档权限"
      }
      // {
      //   id: 6,
      //   label: "历史记录"
      // }
    ]);
    // 分享弹框参数
    const formParams: any = reactive({
      root_classify_id: "",
      id: 57,
      status: 1,
      content_id: "",
      classify_id: "",
      comment_permission: "1",
      link_share: "1",
      open_share: "1",
      tag_id: [],
      department: [],
      team_worker: [],
      title: ""
    });

    const { useCreateChildren, useGetShareList, useGetTagList } = useDocument();

    // 控制消息框显示隐藏
    const show = (params?: string) => {
      if (params === "show") visible.value = true;
      else visible.value = !visible.value;
    };

    // 发送消息给Pad编辑器
    const connectWithPad = (name = "tomato", data?: any) => {
      let padIframe = document.getElementById("padIframe");
      const isIFrame = (input: HTMLElement | null): input is HTMLIFrameElement => input !== null && input.tagName === "IFRAME";
      if (padIframe) {
        if (isIFrame(padIframe) && padIframe.contentWindow) {
          padIframe?.contentWindow.postMessage(
            {
              name,
              data
            },
            "*"
          );
        }
      }
    };

    // 复制链接
    const copyLink = async () => {
      const currentLink = getSession("shortCode", true) as any;
      if (!currentLink) return;
      if (currentLink.content.includes("is_link_share")) {
        copyField(window.location.origin + "/document/padIframe?" + currentLink.code);
      } else {
        // const url = href.indexOf("content_id") > -1 ? href + "&is_link_share=1" : `${href}?docId=${articleId.value}&content_id=${content_id.value}&is_link_share=1`;
        const url = currentLink.content.indexOf("content_id") > -1 ? currentLink.content + "&is_link_share=1" : currentLink.content;
        await transformAddShortCode(url, true);
      }
    };

    const onDownload = (type: string, title: string) => {
      connectWithPad("download", {
        type,
        title
      });
    };

    // 新建标题
    const createDocTitle = async (title: string) => {
      const { data } = await createDoc({ title, content_id: content_id.value });
      return data;
    };

    // 更新标题
    const updateDocTitle = async (title: string, content_id: string, id: number) => {
      const { data } = await updateDoc({ title, id, content_id });
      formParams.title = title;
      document.title = docDetails.title;
      return data;
    };

    // 更新文档title
    const onUpdateDocTitle = () => {
      if (!title.value) return ElMessage.warning("请填写标题");
      updateDocTitle(title.value, content_id.value, articleId.value);
    };

    // 获取文档详情
    const onGetDocDetail = async (id: number) => {
      const { data } = await getDocDetails(id);
      return data;
    };

    // 申请文档权限
    const onApplyPermission = async (type: number) => {
      const { code } = await applyPermission({ type, wiki_id: articleId.value });
      if (code === 200) {
        ElMessage({
          type: "success",
          message: "申请成功"
        });
      }
    };

    // 切换操作收藏文本
    const handleCollectionValue = () => {
      const n = dropList.find((i) => i.id === 2);
      n!.label = docDetails.is_collection !== 2 ? "取消收藏" : "收藏";
    };
    let num = 0;
    // 分享弹框点击请求数据分享文章
    const shareArtical = async () => {
      await updateShareDoc(formParams);
    };

    // 二级分类
    // let classifyChildren = ref<TransformTabList[]>([]);
    let classifyTag = ref<TagItemInter[]>([]);

    // 成员列表
    const allPeople = ref();
    // 添加协作者
    const dialogShadow = ref(false);
    const filterText = ref();
    const dialogVisible = ref(false);
    // 协作者人员列表列表
    let selectPerson = ref<Array<Record<string, any>>>([]);

    const comment_permission = ref(false);
    const link_share = ref(false);
    const open_share = ref(false);
    // 监听标注评论
    watch(
      () => comment_permission.value,
      (newVal) => {
        if (num) {
          if (newVal) {
            formParams.comment_permission = "1";
          } else {
            formParams.comment_permission = "0";
          }
          shareArtical();
        }
      }
    );
    // 监听链接分享
    watch(
      () => link_share.value,
      (newVal) => {
        if (num) {
          if (newVal) {
            formParams.link_share = "1";
          } else {
            formParams.link_share = "0";
          }
          shareArtical();
        }
      }
    );
    // 监听公开分享
    watch(
      () => open_share.value,
      (newVal) => {
        if (num) {
          if (newVal) {
            formParams.open_share = "1";
          } else {
            formParams.open_share = "0";
          }
          shareArtical();
        }
      }
    );

    // 协作者选中列表id
    let checkedKeys: any = ref([]);
    const keywordTreeRef = ref();
    // 文字搜索时候点击的
    const handleCheckBoxEventByText = (checkedNodes: Record<string, any>) => {
      let ids = ref<string[]>([]);
      selectPerson.value.forEach((item) => {
        ids.value.push(item.staff_no);
      });
      const isTrue = ids.value.includes(checkedNodes.id);
      if (isTrue) {
        selectPerson.value.forEach((item, index) => {
          if (item.staff_no === checkedNodes.id) {
            selectPerson.value.splice(index, 1);
          }
        });
      } else {
        selectPerson.value.push({
          staff_name: checkedNodes.label,
          staff_no: checkedNodes.id,
          is_department: checkedNodes.is_department
        });
      }
    };
    // 删除成员
    const deleteCheckedKeys = (item: Record<string, any>, index: number) => {
      selectPerson.value.splice(index, 1);
      nextTick(() => {
        keywordTreeRef?.value.setCheckedKeys(selectPerson.value.map((v) => v.staff_no));
      });
    };
    //成员 搜索 过滤
    const filterNode = (value: any, data: any) => {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    };
    // 分享
    const handleShare = async () => {
      dialogVisible.value = true;
      hasPermissOpt.value = false;
      await getShareColumnList();
      if (!classifyTag.value.length) {
        await getTagList();
      }
      setTimeout(() => {
        num = 1;
      }, 100);
    };

    watch(
      () => filterText.value,
      (newValue) => {
        keywordTreeRef?.value.filter(newValue);
      }
    );

    // 添加协作者
    const handleAddPeople = async () => {
      await getPeople();
      dialogShadow.value = true;
    };

    const dataReverse = (people: Array<Record<string, any>>) => {
      let newArr = [];
      for (let i = 0; i < people.length; i += 1) {
        const { id, label, is_department, children } = people[i];
        let obj: Record<string, any> = {};
        obj.id = id;
        obj.label = label;
        obj.is_department = is_department;

        if (children && Array.isArray(children) && children.length) {
          obj.children = dataReverse(children);
        }
        newArr.push(obj);
      }
      return newArr;
    };

    const getPeople = () => {
      getDepartmentListPeople().then((res: any) => {
        allPeople.value = dataReverse(res.data);
      });
    };

    // 添加协作者弹框---确定
    const handleShadow = async () => {
      dialogShadow.value = false;
      formParams.team_worker = [];
      formParams.department = [];
      checkedKeys.value = [];
      if (selectPerson.value && selectPerson.value.length) {
        selectPerson.value.forEach((item) => {
          if (item.is_department) {
            formParams.department.push(item.staff_no * 1);
          } else {
            formParams.team_worker.push(item.staff_no);
          }
          checkedKeys.value.push(item.staff_no);
        });
      }
      shareArtical();
    };

    // 获取文章详情赋值给分享弹出formParams
    const setShareParams = (docDetails: Record<string, any>) => {
      checkedKeys.value = [];
      formParams.team_worker = [];
      formParams.department = [];
      const { id, status, classify_id, content_id, tag_ids, title, team_worker, department, root_classify_id } = docDetails;
      // 分享字段赋值
      formParams.id = id;
      formParams.status = status;
      formParams.classify_id = classify_id || "";
      formParams.root_classify_id = classify_id ? root_classify_id + "" : "";
      formParams.content_id = content_id;
      formParams.comment_permission = docDetails.comment_permission + "";
      formParams.link_share = docDetails.link_share + "";
      formParams.open_share = docDetails.open_share + "";
      formParams.tag_id = tag_ids;
      formParams.title = title;
      team_worker.forEach((item: Record<string, any>) => {
        formParams.team_worker.push(item.staff_no);
      });
      department.forEach((item: Record<string, any>) => {
        formParams.department.push(item.staff_no * 1);
      });

      // 分享字段赋值
      comment_permission.value = docDetails.comment_permission ? true : false;
      link_share.value = docDetails.link_share ? true : false;
      open_share.value = docDetails.open_share ? true : false;
      const allSelect = [...team_worker, ...department];

      allSelect.forEach((item) => {
        checkedKeys.value.push(item.staff_no);
      });
      selectPerson.value = allSelect;
    };

    // 获取文章的title
    const onGetDocTitle = async (content_id: string) => {
      const { data } = await getDocTitle(content_id);
      return data;
    };

    const handleMenuItem = async (item: Record<string, any>) => {
      if (item.id > 2 && permission.value !== 2) return;
      switch (item.id) {
        case 0:
          // 新窗口打开
          window.open(locat.href, "_blank");
          break;
        case 1:
          // 复制连接
          copyLink();
          break;
        case 2:
          // 收藏、取消收藏
          {
            const t = docDetails.is_collection === 1 ? 2 : 1;
            const isSucc = await onUpdateCollection(t, articleId.value);
            if (!isSucc) return;
            docDetails.is_collection = t;
            // 处理收藏和取消收藏文案
            handleCollectionValue();
          }
          break;
        case 3:
          // 导出文档为PDF
          // 发送消息给pad端
          localStorage.setItem("tree", JSON.stringify(sidebar.value.menuData));
          connectWithPad("tree", { tree: JSON.stringify(sidebar.value.menuData), title: title.value });
          break;
        case 4:
          // 删除
          onDeleteDoc(articleId.value, title.value);
          break;
        case 5:
          // 权限
          setTimeout(() => {
            num = 1;
          }, 100);
          dialogVisible.value = true;
          hasPermissOpt.value = true;
          break;
        case 6: // 历史记录
          break;
        default:
          console.log(1);
      }
    };
    /**
     * 返回功能分好几种情况处理
     * 1. 正常就是跳转到 documentCenter
     * 2. 如果是带origin参数，就跳到origin 指定的路由
     * 3. 如果iframeUrl 含有timeslider参数，说明目前是浏览记录页面，需要会到当前编辑页
     */
    const goBack = () => {
      // 默认
      let name = "documentCenter";
      name = (getSession("defaultActiveTab") as string) || "documentCenter";
      router.push({
        name,
        replace: true,
        query: {
          type: "docBack"
        }
      });
    };
    // 新增文档时链接转码  params参数   isCopy生成后是否进行复制  type: 判断url是不是旧的，即之前的版本(未生产短链)分享出去的链接 type=newArtical代表是新增的文档
    const transformAddShortCode = async (params: string, isCopy?: boolean, type?: string) => {
      shortCode<ResponseParams.ResponseDataSuccess>({ content: params }).then((res) => {
        if (res.code === 200) {
          // 保存转链后的信息
          setSession("shortCode", JSON.stringify(res.data));
          if (type) {
            if (type === "newArtical") {
              window.history.replaceState({}, "", `/document/padIframe?${res.data.code}`);
            } else {
              window.location.href = window.location.origin + "/document/padIframe?" + res.data.code;
              location.reload();
            }
          }
          if (isCopy) {
            copyField(window.location.origin + "/document/padIframe?" + res.data.code);
          }
        }
      });
    };
    // 链接解码
    const transformShortCode = async () => {
      let localUrl = window.location.href.split("?")[1];
      const { data } = await getShortCode({ id: localUrl });
      return data;
    };

    onMounted(async () => {
      // 判断链接中是否存在docId, 此处的判断主要是解决之前旧版本分享出去的文章链接（未转链的）转链成功后进行再次拿到锻炼的url刷新页面
      if (window.location.href.includes("docId")) {
        const hrefUrl = window.location.href.split("?")[1];
        transformAddShortCode(hrefUrl, false, "oldUrl");
        return;
      }
      // 获取短链信息
      const data = await transformShortCode();
      const linkData = qs.parse(data.content) as Record<string, any>;
      // contentId 默认为create时的本地创建的id
      if (!linkData.docId && !linkData.content_id) {
        // 初始化调用后台接口
        const { id } = await createDocTitle("");
        articleId.value = id;
        const a = "docId=" + id + "&content_id=" + content_id.value;
        // 拿到新增的文章id进行转换成短链接
        transformAddShortCode(a, false, "newArtical");
        // 重新跳转下
      } else {
        articleId.value = parseInt(linkData.docId, 10);
        // 如果contentid存在，表示位编辑，就用当前的contentid
        content_id.value = linkData.content_id;
        // 保存转链后的信息
        setSession("shortCode", JSON.stringify(data));
      }

      // 获取此文章的一些信息、如权限等
      docDetails = await onGetDocDetail(articleId.value);
      permission.value = docDetails.permission;
      status.value = docDetails.status;
      creator.value = docDetails.creator;
      /**
       * 这里写在判断外面是不管它是编辑or只读权限，先把iframe加载出来
       */
      // iframeUrl.value += content_id.value;
      if (permission.value === 2) {
        isShowIframe.value = true;
      }
      await setShareParams(docDetails);

      // 获取文档权限状态

      if (docDetails.is_collection === 1) {
        handleCollectionValue();
      }

      // 获取doc title
      onGetDocTitle(content_id.value).then(({ title: docTitle }) => {
        title.value = docTitle;
        formParams.title = docTitle;
        document.title = docDetails.title;
      });

      isShowContainer.value = true;
      // 定时发送消息给editor
      sendMsgToEditor();
      // 监听收到的消息
      window.addEventListener("message", (e) => {
        const { name, onlineMembers: d } = e.data;
        const onlineMem = Array.isArray(d) && d.filter((item: Record<string, any>) => item.name);

        // 收到成员消息更新
        if (name === "updateMembers") {
          let obj: { [key: string]: any } = {};
          const newArr =
            Array.isArray(onlineMem) &&
            onlineMem.reduce((prev, cur) => {
              obj[cur.userId] ? "" : (obj[cur.userId] = true && prev.push(cur));
              return prev;
            }, []);

          // 过滤掉自己
          onlineMembers.value = newArr;
        } else if (name === "getTomatoSuccess") {
          // 如果收到editor的消息，tomato就不需要再发送消息给用editor了
          needSend = false;
        }
      });
    });

    const session = getSession("user", true) as USER;
    const sendMsgToEditor = () => {
      setTimeout(() => {
        connectWithPad("tomato", {
          contentId: content_id.value,
          token: session?.token,
          permission: permission.value,
          docId: articleId.value,
          title: title.value,
          name: session?.name,
          userId: session?.userid
        });

        if (needSend) {
          sendMsgToEditor();
        }
      }, 500);
    };

    // 全屏
    const toggleEditorFullScreen = () => {
      // 处理全屏
      listenFullScreen((isClose: boolean) => {
        // 显示文档树
        isShareSidebar.value = !isClose;
        // 关闭全屏
        connectWithPad("fullScreen", { fullScreen: isClose });
      });
      // 通知编辑器，全屏
      toggleFullScreen();
      // 隐藏文档树
      isShareSidebar.value = false;
      connectWithPad("fullScreen", { fullScreen: !isShareSidebar.value });
    };
    // type: number, item: TreeItem | any, uploadFile?: UploadFile | any
    interface EventData {
      uploadFile?: UploadFile;
      content_id?: string;
      parent_id?: number;
      label?: string;
      id?: number;
      title?: string;
      data?: any;
    }
    // 侧边栏 sidebar事件
    const onEvent = async (params: { type: number; data: EventData; cb: (...rest: any) => void }) => {
      const { type, data = {}, cb } = params;
      const { uploadFile, content_id: contentId, data: d, parent_id, title } = data;

      if (type === 1 || type === 4) {
        // 新建子文档和导入子文档
        content_id.value = randomStringId();

        const param = {
          title: title!,
          parent_id: parent_id!,
          content_id: content_id.value
        };
        if (type === 4 && uploadFile?.name) {
          param.title = uploadFile.name.replace(/\.docx/g, "") ?? "未命名文档";
        }

        const data = await createChildren(param);
        if (data) {
          // 发送消息给编辑器
          connectWithPad("changeDoc", {
            contentId: content_id.value,
            token: session?.token,
            permission: permission.value,
            file: type === 4 ? uploadFile : null
          });
          // 更新sidebar 数据
          sidebar.value?.getTreeList();
          // 执行回调
          if ((type === 1 || type === 4) && typeof cb === "function") cb(data.id);
        }
      } else if (type === 2) {
        // 切换文档
        content_id.value = contentId!;
        // 发送消息给编辑器
        connectWithPad("changeDoc", {
          contentId: content_id.value,
          token: session?.token,
          permission: permission.value
        });
      } else if (type === 3) {
        // 下载pdf
        onDownload("pdf", d.label);
      } else if (type === 5) {
        // 更新到主文档下面
        // 发送消息给编辑器
        connectWithPad("changeDoc", {
          contentId: docDetails.content_id,
          token: session?.token,
          permission: permission.value
        });
      }
    };

    // 更新title
    const createChildren = async (params: Omit<ParamsUpdateDocTitleInter, "id">) => {
      return await useCreateChildren(params);
    };

    // 获取分享分类list
    const getShareColumnList = async () => {
      shareLoading.value = true;
      const data = await useGetShareList();
      shareLoading.value = false;
      columnShareList.value = data;
    };

    // 分类回调事件
    const onChangeSelect = (val: any) => {
      formParams.classify_id = val.id;
      updateShareDoc(formParams);
    };

    const getTagList = async (name?: string) => {
      const data = await useGetTagList(name);
      if (data) {
        classifyTag.value = data;
      }
    };

    const beforeClose = () => {
      dialogVisible.value = false;
    };

    // 操作分享弹窗
    const handleShareDialog = (type: "linkShare" | "openShare" | "select") => {
      if (type === "linkShare") {
        link_share.value = !link_share.value;
      } else if (type === "openShare") {
        open_share.value = !open_share.value;
      } else if (type === "select") {
        shareArtical();
      }
      return true;
    };

    return {
      handleShareDialog,
      beforeClose,
      getTagList,
      isShareSidebar,
      onChangeSelect,
      columnShareList,
      getShareColumnList,
      shareLoading,
      onEvent,
      sidebar,
      articleId,
      toggleEditorFullScreen,
      onlineMembers,
      iframeHost,
      onDownload,
      visible,
      show,
      goBack,
      title,
      onUpdateDocTitle,
      permission,
      onApplyPermission,
      isShowContainer,
      toggleFullScreen,
      dropList,
      handleMenuItem,
      handleShare,
      dialogVisible,
      formParams,
      dialogShadow,
      allPeople,
      handleCheckBoxEventByText,
      checkedKeys,
      selectPerson,
      deleteCheckedKeys,
      keywordTreeRef,
      filterText,
      filterNode,
      handleAddPeople,
      handleShadow,
      open_share,
      link_share,
      classifyTag,
      hasPermissOpt,
      copyLink,
      CLASSIFY,
      LINKSHARE,
      PUBLICSHARE,
      creator,
      status
    };
  }
});
</script>

<style lang="less" scoped>
.pad {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-radius: 0;
  z-index: 99;

  &-top {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    padding: 10px 0;
    border-bottom: 1px solid #dee0e3;
    padding: 10px 20px;

    &__left {
      display: flex;
      align-items: center;
      flex: 2;
      position: relative;

      &-wrap {
        width: 100%;
        display: flex;
        .doc-route {
          position: absolute;
          top: 22px;
          color: #a6a6a6;
          left: 46px;
          font-size: 0.1rem;
        }
        .doc-route-no {
          display: none;
        }
      }
    }

    &__members {
      flex: 2;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      display: flex;
      justify-content: flex-end;
      padding-right: 20px;

      &-item {
        flex-shrink: 0;
        margin-right: 5px;
        width: 30px;
        height: 30px;
        line-height: 30px;
        font-size: 10px;
        -webkit-text-size-adjust: none;
      }
    }

    &__back {
      float: left;
      display: inline-block;
      margin-top: 4px;
      margin-right: 8px;
      font-size: 24px;

      &:hover {
        cursor: pointer;
      }
    }

    &__tools {
      display: flex;
      align-items: center;
      margin-right: 30px;

      .el-icon-full-screen {
        width: 21px;
        margin: 0 24px 0 24px;
        opacity: 0.4;
        font-size: 18px;

        &:hover {
          cursor: pointer;
          color: rgb(143, 207, 194);
        }
      }

      &-more {
        margin-left: 16px;
        margin-top: -10px;
        display: flex;
        height: 100%;
        cursor: pointer;
        font-weight: bold;
        font-size: 20px;
      }
    }

    &__input {
      font-size: 20px;
      font-weight: bold;
    }
  }

  &-iframe {
    width: 100%;
    margin: 0 auto;
    height: 100%;
    display: block;
    flex: 1;
  }

  &-empty {
    padding-top: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;

    &__text {
      font-size: 26px;
    }
  }

  &-loading {
    display: flex;
    align-items: center;
    margin-top: 100px;
    justify-content: center;
    font-size: 30px;
    color: #4c4b4b;
  }

  &-icon {
    &__back {
      font-size: 30px;
      transform: rotate(180deg);
      margin-bottom: -7px;
      color: #666;
      cursor: pointer;
      transition: all 0.3s;
      border-radius: 6px;

      &:hover {
        background-color: #ddd;
      }
    }
  }

  &-container {
    display: flex;
    height: calc(100% - 53px);
    width: 100%;
  }
}

.rp-share-select {
  li {
    .rp-classify {
      margin: 12px 0 8px 0;

      .el-switch {
        transform: scale(0.8);
      }
    }
  }

  &__column {
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    &-select {
      width: 140px;
      margin-left: 10px;

      &:first-child {
        margin-left: 0;
      }
    }
  }

  .rp-share-tag {
    :deep(.el-form-item__content) {
      margin-left: 0 !important;

      .el-select {
        width: 100%;
      }
    }
  }

  .rp-share-cooperation {
    :deep(.el-form-item__label) {
      width: auto !important;
    }
  }

  .rp-select-jurisdiction {
    .rp-close {
      font-size: 12px;
      color: #bbbbbb;
    }

    .el-select {
      width: 100%;
    }

    &__permiss {
      display: flex;

      &-btns {
        margin-left: 10px;
      }
    }
  }
}

.rp-people-list {
  height: 32px;
  line-height: 32px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;

  div.people-list-show {
    float: left;
    height: 34px;
    overflow: hidden;
    overflow-y: scroll;
    width: calc(100% - 50px);
    padding: 0 10px;
  }

  span {
    display: inline-block;
    margin: 0px 4px;
    font-size: 12px;
    border-radius: 4px;
    color: #606266;
  }

  span.rp-add-people {
    font-size: 24px;
    float: right;
    width: 26px;
    text-align: center;
    border-left: 1px solid #dcdfe6;
    border-radius: 0;
    margin: 0;
    color: #919191;

    &:hover {
      cursor: pointer;
    }
  }
}

.side-wrapper__notice {
  line-height: 25px;
  text-align: center;
  cursor: pointer;

  &-circle {
    position: relative;
    z-index: 2;
    margin-left: 20px;
    margin-bottom: -8px;
    width: 18px;
    height: 18px;
    background-color: #999;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: #fff;
  }

  &-icon {
    font-size: 22px;
    color: #999;
    margin-top: 5px;
  }
}
</style>

<style lang="less">
.pad {
  &-top {
    .el-input__inner {
      border: none;
    }
    .el-input__wrapper {
      box-shadow: none;
    }

    .el-input.is-disabled .el-input__inner {
      background-color: none !important;
      color: #606266;
      box-shadow: none !important;
    }
    .el-input.is-disabled .el-input__wrapper {
      background: none !important;
      color: #606266;
      box-shadow: none !important;
    }
  }
}

.position-dialog {
  .el-dialog__body {
    position: relative;
    display: flex;

    div {
      &:nth-child(1) {
        // flex: 0 0 48%;
        width: 100%;
      }

      &:nth-child(2) {
        .el-divider--vertical {
          height: 100%;
        }
      }

      &:nth-child(3) {
        flex: 0 0 48%;
      }
    }

    .current-checked-nodes {
      display: flex;
      align-items: center;
      justify-content: space-between;

      i {
        cursor: pointer;

        &:hover {
          color: @rp-color-danger;
        }
      }
    }
  }

  .load-container {
    transform: scale(0.2);
    width: 200px;
    height: 200px;
    position: relative;
    margin: 60px auto;
  }

  .load {
    width: 150px !important;
    height: 150px;
    border: 20px solid #f3f3f3;
    border-top: 20px solid #0dc5c1;
    border-radius: 50%;
    animation: loading 1.2s infinite linear;
  }

  @keyframes loading {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
}
</style>
