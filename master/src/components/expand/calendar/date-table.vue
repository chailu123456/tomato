<template>
  <table
    :class="{
      'el-calendar-table': true,
      'is-range': isInRange
    }"
    cellspacing="0"
    cellpadding="0"
  >
    <thead v-if="!hideHeader">
      <th v-for="day in weekDays" :key="day">{{ day }}</th>
    </thead>
    <tbody>
      <tr
        v-for="(row, index) in rows"
        :key="index"
        :class="{
          'el-calendar-table__row': true,
          'el-calendar-table__row--hide-border': index === 0 && hideHeader
        }"
      >
        <td v-for="(cell, key) in row" :key="key" :class="getCellClass(cell)" @click="pickDay(cell)">
          <div class="el-calendar-day">
            <slot name="dateCell" :data="getSlotData(cell)">
              <div class="today">{{ isToday(cell.text, cell) }}</div>
            </slot>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
// @ts-nocheck
import { computed, defineComponent, ref, PropType, unref } from "vue";
import dayjs, { Dayjs } from "dayjs";
import localeData from "dayjs/plugin/localeData";
import { rangeArr } from "element-plus/lib/components/time-picker";
dayjs.extend(localeData);
import "dayjs/locale/zh-cn";
export const getPrevMonthLastDays = (date: Dayjs, amount) => {
  const lastDay = date.subtract(1, "month").endOf("month").date();
  return rangeArr(amount).map((_, index) => lastDay - (amount - index - 1));
};
export const getMonthDays = (date: Dayjs) => {
  const days = date.daysInMonth();
  return rangeArr(days).map((_, index) => index + 1);
};
export default defineComponent({
  props: {
    todoDay: {
      type: Array as PropType<Array<unknown>>,
      default: () => []
    },
    selectedDay: {
      type: Object as PropType<Dayjs>
    },
    range: {
      type: Array as PropType<Array<Dayjs>>
    },
    date: {
      type: Object as PropType<Dayjs>
    },
    hideHeader: {
      type: Boolean
    }
  },
  emits: ["pick"],
  setup(props, ctx) {
    const WEEK_DAYS = ref(["周日", "周一", "周二", "周三", "周四", "周五", "周六"]);
    const now = dayjs();
    // todo better way to get Day.js locale object
    const firstDayOfWeek = (now as any).$locale().weekStart || 0;
    const toNestedArr = (days) => {
      return rangeArr(days.length / 7).map((_, index) => {
        const start = index * 7;
        return days.slice(start, start + 7);
      });
    };
    const getFormattedDate = (day, type): Dayjs => {
      let result;
      if (type === "prev") {
        result = props.date.startOf("month").subtract(1, "month").date(day);
      } else if (type === "next") {
        result = props.date.startOf("month").add(1, "month").date(day);
      } else {
        result = props.date.date(day);
      }
      return result;
    };
    const getCellClass = ({ text, type }) => {
      const classes = [type];
      if (type === "current") {
        const date_ = getFormattedDate(text, type);
        if (date_.isSame(props.selectedDay, "day")) {
          classes.push("is-selected");
        }
        if (date_.isSame(now, "day")) {
          classes.push("is-today");
        }
      }
      return classes;
    };
    const isToday = (text, { type }) => {
      const date_ = getFormattedDate(text, type);
      if (date_.isSame(now, "day")) {
        return "今";
      }
      return text;
    };
    const pickDay = ({ text, type, list }) => {
      const date = getFormattedDate(text, type);
      ctx.emit("pick", date, list);
    };
    const getSlotData = ({ text, type, list }) => {
      const day = getFormattedDate(text, type);
      return {
        isSelected: day.isSame(props.selectedDay),
        type: `${type}-month`,
        day: day.format("YYYY-MM-DD"),
        date: day.toDate(),
        list: list
      };
    };
    const isInRange = computed(() => {
      return props.range && props.range.length;
    });
    const rows = computed(() => {
      let days = [];
      if (isInRange.value) {
        const [start, end] = props.range;
        const currentMonthRange = rangeArr(end.date() - start.date() + 1).map((_, index) => ({
          text: start.date() + index,
          type: "current"
        }));
        let remaining = currentMonthRange.length % 7;
        remaining = remaining === 0 ? 0 : 7 - remaining;
        const nextMonthRange = rangeArr(remaining).map((_, index) => ({
          text: index + 1,
          type: "next"
        }));
        days = currentMonthRange.concat(nextMonthRange);
      } else {
        const firstDay = props.date.startOf("month").day() || 7;
        const prevMonthDays = getPrevMonthLastDays(props.date, firstDay - firstDayOfWeek).map((day) => ({
          text: day,
          type: "prev"
        }));
        const currentMonthDays = getMonthDays(props.date).map((day) => ({
          text: day,
          type: "current"
        }));
        days = [...prevMonthDays, ...currentMonthDays];
        const nextMonthDays = rangeArr(42 - days.length).map((_, index) => ({
          text: index + 1,
          type: "next"
        }));
        days = days.concat(nextMonthDays);
      }
      // 遍历所有current
      days.forEach((day, index) => {
        if (day.type === "current") {
          props.todoDay.forEach((tododay) => {
            const date = Number(tododay.date.split("-")[2]);
            if (day.text === date) {
              day.list = tododay.list;
            }
          });
        }
      });
      const nestedArr = toNestedArr(days);
      // 优化，如果nestedArr有一整行全是next，就隐藏截取掉
      nestedArr.forEach((values, index) => {
        const isPlainNext = new Set();
        values.forEach((item) => {
          isPlainNext.add(item.type);
        });
        if (isPlainNext.size === 1 && isPlainNext.has("next")) {
          nestedArr.splice(index, 1);
        }
      });
      return nestedArr;
    });
    const weekDays = computed(() => {
      const start = firstDayOfWeek;
      if (start === 0) {
        return WEEK_DAYS.value;
      } else {
        return WEEK_DAYS.value.slice(start).concat(WEEK_DAYS.value.slice(0, start));
      }
    });
    return {
      isInRange,
      weekDays,
      rows,
      getCellClass,
      pickDay,
      getSlotData,
      isToday
    };
  }
});
</script>
<style scoped lang="less">
.el-calendar-day {
  div {
    text-align: center;
  }
}
.el-calendar-table td.is-selected {
  background: rgba(50, 210, 178, 0.1);
}
.is-today {
  .today {
    border-radius: 50%;
    margin: 0 auto;
    color: #fff;
    width: 26px;
    height: 26px;
    background: rgba(31, 159, 133, 1);
  }
}
</style>
