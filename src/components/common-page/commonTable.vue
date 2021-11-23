<template>
  <div class="table-area">
    <el-table
      show-overflow-tooltip
      :data="tableData"
      v-loading="tableLoading"
      @sort-change="changeSort"
      @selection-change="changeSelectList"
      style="width: 100%">
      <el-table-column v-if="isShowSelect" type="selection" width="55" fixed align="center" />
      <el-table-column v-for="(item, key) in tableHeader" :key="key" min-height="46" :prop="item.prop" :label="item.label" :fixed="item.fixed || false" :sortable="item.sortable||false" :size="item.size || 100" :align="item.alignType||'center'">
        <template slot-scope=" { row }">
          <div v-if="item.formatter">
            <div v-if="item.html" v-html="item.formatter(row[item.prop])" />
            <span v-else>
              {{item.formatter(row[item.prop])}}
            </span>
          </div>
          <div v-else>
            <div v-if="item.html" v-html="row[item.prop]" />
            <span v-else>
              {{row[item.prop]}}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column v-if="isShowOperation" label="操作" align="center" fixed="right" :min-width="`${operateWidth}px`">
        <template slot-scope="{ row }">
          <slot name="operate" :row="row" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  name: 'commonTable',
  props: {
    tableData: { // 表格数据
      type: Array,
      default: () => {
        return []
      }
    },
    tableHeader: { // 表头配置信息
      type: Array,
      default: () => {
        return []
      }
    },
    tableLoading: { // 表格加载动画
      type: Boolean,
      default: false
    },
    multipleSelection: { // 多选
      type: Array,
      default: () => {
        return []
      }
    },
    isShowOperation: {
      type: Boolean,
      default: () => {
        return true
      }
    },
    isShowSelect: {
      type: Boolean,
      default: () => {
        return true
      }
    },
    operateWidth: {
      type: Number,
      default: () => {
        return 120
      }
    }
  },
  data () {
    return {

    }
  },
  methods: {
    changeSort (sort) {
      this.$emit('sort-events', sort)
    },
    changeSelectList (val) {
      this.$emit('update:multipleSelection', val)
    }
  }
}
</script>
