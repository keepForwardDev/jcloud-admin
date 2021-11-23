<template>
  <div>
    <el-button
      v-for="(item, index) in part1Operation"
      :key="index"
      size="mini"
      :type="item.type"
      @click="item.operation">
      {{item.label}}
    </el-button>
    <el-dropdown style="padding-left: 10px" v-if="operationList.length > showAllLimit">
      <el-button type="primary" size="mini">
        更多<i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item @click.native="item.operation" v-for="(item, index) in moreOperation" :key="index"> {{item.label}} </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>
<script>
export default {
  name: 'tableOperation',
  props: {
    operationList: {
      type: Array,
      default: () => {
        return []
      }
    },
    showAllLimit: {
      type: Number,
      default: 3
    }
  },
  computed: {
    part1Operation () {
      return this.operationList.length > this.showAllLimit ? this.operationList.slice(0, 2) : this.operationList
    },
    moreOperation () {
      return this.operationList.length > this.showAllLimit ? this.operationList.slice(2, this.operationList.length) : []
    }
  }
}
</script>
