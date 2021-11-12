<template>
  <div class="formWrapper">
    <el-container>
      <el-aside class="table-aside">
        <el-scrollbar  style="height:calc(100vh - 220px);" ref="scrollbar">
            <el-input
            clearable
            class="el-transfer-panel__filter"
            size="small"
            placeholder="请输入搜索内容"
            @input="filterMatch"
            v-model="filterText"
            prefix-icon="el-icon-search">
          </el-input>
          <el-menu @select="selectTable" :defaultActive="defaultActive">
            <transition-group
              enter-active-class="animate__animated  animate__fadeInDown"
            >
              <el-menu-item v-for="(item, index) in tableList" v-show="item.show === undefined ? true : item.show" :index="''+ index" :key="index + 'c'">
                <i class="el-icon-s-grid" style="color: #ff0000"></i>
                <el-input
                  class="input-new-tag"
                  v-if="item.inputVisible == undefined ? false : item.inputVisible"
                  v-model="item.remarks"
                  :ref="item.tableName"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(item)"
                  @blur="handleInputConfirm(item)"
                >
                </el-input>
                <span  title="右击修改表名称" v-else  @contextmenu.prevent="showInput(item)">{{item.remarks}}[{{item.tableName}}]</span>
              </el-menu-item>
            </transition-group>
          </el-menu>
        </el-scrollbar>

      </el-aside>

      <el-container>
        <el-main class="table-content">
          <el-table :data="tableData" style="width: 100%"            v-loading="tableLoading">
            <el-table-column
              type="index"
              width="50">
            </el-table-column>
            <el-table-column prop="columnName" label="名称" width="140">
            </el-table-column>
            <el-table-column prop="typeName" label="数据类型" width="120">
            </el-table-column>
            <el-table-column prop="columnSize" label="长度">
            </el-table-column>
            <el-table-column prop="decimalDigits" label="精度（小数位）">
            </el-table-column>
            <el-table-column prop="nullable" label="允许空值">
              <template slot-scope="scope">
            <span>
              {{scope.row.nullable}}
            </span>
              </template>
            </el-table-column>
            <el-table-column prop="primaryKey" label="主键">
              <template slot-scope="scope">
            <span>
              {{scope.row.primaryKey}}
            </span>
              </template>
            </el-table-column>
            <el-table-column prop="columnDef" label="默认值">
            </el-table-column>
            <el-table-column prop="remark" label="说明">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.remarks"
                  clearable>
                </el-input>
              </template>
            </el-table-column>
          </el-table>
        </el-main>

        <el-footer>
          <div>
            <el-button type="primary" icon="el-icon-arrow-left" @click="lastStep" style="float: left">上一步</el-button>
            <el-button type="primary"  style="float: right" @click="nextStep">下一步<i class="el-icon-arrow-right el-icon--right"></i></el-button>
          </div>
        </el-footer>
      </el-container>

    </el-container>
  </div>
</template>
<script>
export default {
  name: 'taskInfo',
  props: {
    formData: {
      type: Object,
      default: () => ({})
    },
  },
  data () {
    return {
      tableData: [],
      tableList: [],
      filterText: '',
      tableLoading: false,
      defaultActive: '0'
    }
  },
  filters: {
    boolString (val) {
      if (val || val === 'Y') {
        return 'Y'
      } else {
        return 'N'
      }
    }
  },
  created () {
    this.getTableList()
  },
  mounted () {
    this.handleScroll()
  },
  methods: {
    handleScroll () {
      const scrollbarEl = this.$refs.scrollbar.wrap
      scrollbarEl.onscroll = () => {
        if (scrollbarEl.scrollTop > 135) {
          this.isFixedTop = true
          // setTimeout(() => {
          //   scrollbarEl.scrollTop = 0
          // }, 1000)
        } else {
          this.isFixedTop = false
        }
      }
    },

    lastStep () {
      this.formData.fetchTableName = true
      this.formData.includeTables = []
      this.formData.includeRegex = []
      this.formData.excludeRegex = []
      this.formData.excludeTables = []
      this.$emit('lastStep')
    },
    nextStep () {
      this.$emit('nextStep', this.tableList)
    },
    filterMatch () {
      if (this.filterText) {
        this.tableList.forEach(item => {
          if (item.remarks.indexOf(this.filterText) > -1 || item.tableName.indexOf(this.filterText) > -1) {
            item.show = true
          } else {
            item.show = false
          }
        })
      } else {
        this.tableList.forEach(item => {
          item.show = true
        })
      }
    },
    selectTable (index, val) {
      this.tableLoading = true
      setTimeout(() => {
        this.tableData = this.tableList[index.replace('c', '')].columns
        this.tableLoading = false
      }, 1000)
    },
    getTableList() {
      this.$postJson('/datacenter/metadata/getTableModels', this.formData).then(res => {
        this.tableList = res.data
        this.tableList.forEach(item => {
          item.inputVisible = false
        })
        if (this.tableList.length > 0) {
          this.tableData = this.tableList[0].columns
        }
      })
    },
    handleInputConfirm(item) {
      item.inputVisible = false
      this.$forceUpdate()
    },
    showInput(item) {
      item.inputVisible = true
      this.$forceUpdate()
      this.$nextTick(_ => {
        this.$refs[item.tableName][0].$refs.input.focus()
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  .text-input {
    width: 400px;
  }

  .formWrapper {
    display: flex;
    justify-content: center;
    max-height: 100%;
  }

  .table-aside {
    width: 300px;
  }

  .table-content {
    height: calc(100vh - 240px);
  }
  .formWrapper{
    &::v-deep{
      .el-scrollbar__wrap {
     overflow-x: hidden;
    }
    }
  }
</style>
