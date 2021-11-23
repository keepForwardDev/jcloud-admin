<template>
  <div class="search-area">
    <el-form :inline="true" :model="searchData">
      <SearchBarItem v-for="(item, index) in searchList" :key="index" :search-info="item" :search-data="searchData"/>
      <el-form-item>
        <el-button type="primary" size="mini" @click="getList">查询</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import SearchBarItem from '@/components/common-page/searchBarItem.vue'
export default {
  name: 'searchBar',
  components: {
    SearchBarItem
  },
  props: {
    searchList: { // 搜索表单配置信息
      type: Array,
      default: () => {
        return []
      }
    },
    searchData: { // 搜索表单信息
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {

    }
  },
  mounted() {
  },
  methods: {
    getList () {
      this.$emit('getList')
    }
  }
}
</script>
