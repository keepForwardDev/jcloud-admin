<template>
  <d2-container>
    <div class="search-area">
      <el-form :inline="true" :model="search">
        <el-form-item label="所属任务">
          <el-input v-model="search.taskId"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="search.status" placeholder="请选择状态">
            <el-option v-for="(item,index) in statusList" :label="item.name" :value="item.value" :key="index">{{item.name}}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="btn-area">
    </div>
    <div class="table-area">
      <el-table
        :data="tableData"
        v-loading="listLoading"
        style="width: 100%">
        <el-table-column
          type="index"
          width="50">
        </el-table-column>
        <el-table-column
          prop="taskName"
          label="所属任务">
        </el-table-column>
        <el-table-column
          prop="projectDicStr"
          label="所属项目">
        </el-table-column>
        <el-table-column
          prop="dataSourceInfoName"
          label="所属数据源">
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态">
          <template slot-scope="scope">
            <span v-if="scope.row.status" style="font-size: 20px;color: #64d62a">
              <i class="el-icon-success"></i>
            </span>
            <span v-else style="font-size: 20px;color: #ff0000a3">
              <i class="el-icon-error"></i>
            </span>
          </template>
        </el-table-column>

        <el-table-column
          prop="msg"
          label="描述">
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间">
        </el-table-column>
      </el-table>
      <div class="el-page">
        <el-pagination
          :current-page="pager.currentPage"
          :page-sizes="pageSizes"
          :page-size="pager.pageSize"
          :layout="pagerSetting"
          :total="pager.totalCount"
          @size-change="handlePageSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

    </div>
  </d2-container>
</template>
<script>
export default {
  name: 'input-log',
  data () {
    return {
      search: {
        taskId: '',
        status: ''
      },
      formData: {
        id: ''
      },
      pager: {
        totalCount: 0,
        pageCount: 1,
        pageSize: 10,
        currentPage: 1
      },
      pageSizes: [10, 20, 40, 60, 100],
      pagerSetting: 'total, sizes, prev, pager, next, jumper',
      tableData: [], // 表格数据
      listLoading: false, // 表格loading动画
      dialogTitle: '',
      newDataTitle: '新建', // 新建数据的title
      editDataTitle: '查看', // 编辑数据的title
      dialogFormVisible: false, // 弹窗是否展示
      listPath: '/datacenter/metadata/taskLogPageList', // 列表请求地址
      savePath: '', // 保存地址
      deletePath: '', // 删除地址
      statusList: [{
        name: '失败',
        value: 0
      }, {
        name: '成功',
        value: 1
      }]
    }
  },
  filters: {
    boolString (value) {
      if (value) {
        return '成功'
      } else {
        return '失败'
      }
    }
  },
  watch: {

  },
  created () {
    this.getList()
  },
  methods: {
    // ==================================== 二、数据请求类 ================================
    // /**
    //  * @param {boolean} flag 判断是否为第1页
    //  */
    getList (flag) {
      this.listLoading = true
      if (flag) {
        this.pager.currentPage = 1
      }
      const params = Object.assign({}, this.search, {
        pageSize: this.pager.pageSize,
        currentPage: this.pager.currentPage
      })
      this.$get(this.listPath, params).then(res => {
        this.listLoading = false
        if (res.code === 1) {
          this.tableData = res.data.list
          this.pager.totalCount = res.data.totalCount
          this.pager.pageCount = res.data.pageCount
          this.pager.pageSize = res.data.pageSize
          this.pager.currentPage = res.data.currentPage
        }
      }).catch(_ => {
        this.listLoading = false
      })
    },
    showForm () {
      this.step = 0
      this.dialogTitle = this.newDataTitle
      this.formData = {
      }
      this.dialogFormVisible = true
    },
    saveForm () {
      this.$refs.form.validate((valid, object) => {
        if (!valid) {
          this.$message({
            message: '请完善相关信息填写！',
            type: 'warning'
          })
        } else {
          this.$post(this.savePath, this.formData).then(res => {
            if (res.code === 1) {
              this.$message.success(res.msg)
            }
          })
          this.dialogFormVisible = false
        }
      })
    },
    editData (row) {
      this.step = 0
      this.dialogTitle = this.editDataTitle
      this.dialogFormVisible = true
    },
    deleteData (row) {
      this.$confirm('确定删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$get(this.deletePath + '/' + row.id).then(res => {
          if (res.code === 1) {
            this.$message({
              message: '删除成功！',
              type: 'success'
            })
            this.getList(true)
          }
        })
      })
    },
    resetQuery () {
      this.search = {}
      this.getList(true)
    },
    handleCurrentChange (val) {
      this.pager.currentPage = val
      this.getList()
    },
    handlePageSizeChange (val) {
      this.pager.pageSize = val
      this.getList(true)
    }
  }
}
</script>
<style lang="scss" scoped>
  .el-page {
    padding-top: 10px;
    padding-bottom: 10px;
    float: right;
  }
</style>
