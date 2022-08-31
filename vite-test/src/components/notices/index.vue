<template>
  <div class="notices">
    <!-- 顶部操作栏 -->
    <div class="notices-top">
      <span>消息提醒</span>
      <!-- notices-top__cleared -->
      <span class="notices-top__clear" @click="onClearMark"><i class="iconfont icon-clear"></i> 全部已读</span>
    </div>

    <!-- 数据展示区域 -->
    <page-table :tableData="tableData" @handlePagationChange="getMsgInfo" :show-header="false" layout="prev, pager, next, jumper">
      <template #main>
        <el-table-column prop="content">
          <template #default="scope">
            <span @click="onLink(scope.row.content, $event)" v-html="filterContent(scope.row.content)"></span>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" width="150"> </el-table-column>
      </template>
    </page-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { MsgItemsIter, getMessage, updateAllMsgStatus } from "@/composables/useGetNoticesData";
import { Pagation } from "@/composables/usePagation";

export default defineComponent({
  name: "notices",
  setup(props, content) {
    // 分页
    const pagi = reactive<Pagation>({
      pageIndex: 1,
      pageSize: 10
    });

    const tableData = reactive<Array<MsgItemsIter>>([]);

    // 更新所有消息
    const onClearMark = async () => {
      const isTrue = await updateAllMsgStatus();
      console.log(isTrue);
      content.emit("update:notices", 0);
    };

    // 点击消息跳转
    const onLink = (e: any, event: Event) => {
      console.log(e, event);
      const { target } = event as any;
      // let url =
      if (target.nodeName === "A") {
        // 跳转
        console.log(1);
      }
    };

    const filterContent = (content: string) => {
      return content.replace(/{{(.*)}}/g, ($1, $2) => `<a style='color: blue'>#${$2}</a>`);
    };
    const getMsgInfo = async () => {
      const { unread, list } = await getMessage(pagi);
      tableData.push(...list);
      // 更新notices值
      content.emit("update:notices", unread);
    };

    getMsgInfo();

    return {
      tableData,
      onClearMark,
      getMsgInfo,
      filterContent,
      onLink
    };
  }
});
</script>

<style lang="less">
.notices {
  .main {
    padding: 0;
  }
}
</style>

<style lang="less" scoped>
.notices {
  height: 700px;

  &-top {
    display: flex;
    justify-content: space-between;

    &__clear {
      cursor: pointer;
    }

    &__cleared {
      color: #ddd;
      cursor: not-allowed;
    }
  }
  &-link {
    color: blue;
  }
}
</style>
