<!--
 * @Author: 宋绍华
 * @Date: 2022-04-27 16:43:15
 * @LastEditTime: 2022-04-27 18:21:07
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\components\iteration-tip\index.vue
-->
<template>
  <div>
    <el-popover placement="bottom-start" :width="400" trigger="hover">
      <template #reference>
        <el-icon class="el-icon-warning-outline">
          <warning />
        </el-icon>
      </template>
      <div v-html="msg[type - 1].detail"></div>
      <!-- <div v-if="type === 1">
        迭代进度节点轴线图：迭代计划节点时间与实际时间的对比图。上半部分为实际节点开始时间，下半部分为计划节点开始时间（即新增/编辑迭代时输入的时间） 颜色含义：
        <div class="green-block"><span></span>：当前已经进行到的节点（包含已完成的节点）</div>
        <div class="red-block"><span></span>：当前进行到的节点的开始时间晚于计划开始时间，推测此节点后的节点可能会延期，标红以作警示；</div>
        <div class="yellow-block"><span></span>：当前进行到的节点的开始时间早于计划开始时间，推测此节点后的节点可能会提前开始，标亮以作提示；</div>
      </div>
      <div v-if="type === 2">按时开始或完成的任务数量占比，未开始任务或未完成但按时开始的任务默认为准点，公式=1-有延期的任务数/总任务数</div>
      <div v-if="type === 3">
        单位测试时间内提交/产生的BUG数量*权重之和，其中一般BUG权重为1，中等BUG为1.5，严重BUG为2；公式=Σ(BUG数*权重/测试工时)，四位小数
      </div> -->
    </el-popover>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import { Warning } from "@element-plus/icons";

export default defineComponent({
  name: "IterationTip",
  components: { Warning },
  props: {
    type: {
      type: Number,
      default: () => 1
    }
  },
  setup() {
    const msg = reactive([
      {
        detail: `
        迭代进度节点轴线图：迭代计划节点时间与实际时间的对比图。上半部分为实际节点开始时间，下半部分为计划节点开始时间（即新增/编辑迭代时输入的时间） 颜色含义：
        <div class="green-block" style="color: #1f9f85;"><span style="display: inline-block;width: 20px;height: 10px;background: #1f9f85;"></span>：当前已经进行到的节点（包含已完成的节点）</div>
        <div class="red-block" style="color: red;"><span style="display: inline-block;width: 20px;height: 10px;background: red;"></span>：当前进行到的节点的开始时间晚于计划开始时间，推测此节点后的节点可能会延期，标红以作警示；</div>
        <div class="yellow-block" style="color: #80ad0a;"><span style="display: inline-block;width: 20px;height: 10px;background: #80ad0a;"></span>：当前进行到的节点的开始时间早于计划开始时间，推测此节点后的节点可能会提前开始，标亮以作提示；</div>
     `
      },
      {
        detail: "按时开始或完成的任务数量占比，未开始任务或未完成但按时开始的任务默认为准点，公式=1-有延期的任务数/总任务数"
      },
      {
        detail: "单位测试时间内提交/产生的BUG数量*权重之和，其中一般BUG权重为1，中等BUG为1.5，严重BUG为2；公式=Σ(BUG数*权重/测试工时)"
      }
    ]);
    return {
      visible: ref(false),
      msg
    };
  }
});
</script>

<style lang="less" scoped>
.el-icon-warning-outline {
  color: rgba(45, 153, 255);
  font-size: 14px;
}
span {
  display: inline-block;
  width: 20px;
  height: 10px;
}
.green-block {
  color: #1f9f85;
  span {
    background: #1f9f85;
  }
}
.red-block {
  color: red;
  span {
    background: red;
  }
}
.yellow-block {
  color: #80ad0a;
  span {
    background: #80ad0a;
  }
}
</style>
