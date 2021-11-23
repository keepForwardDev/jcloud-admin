<template>
  <d2-container>
    <!--  搜索条件 -->
    <SearchBar :searchList="searchList" :searchData="search" v-on:getList="getList"></SearchBar>
    <!--  按钮 -->
    <div class="btn-area">
      <el-button type="primary" size="mini" @click="showForm">新建</el-button>
    </div>
    <!-- 表格  -->
    <CommonTable :tableData="tableData" :tableLoading="tableLoading" :tableHeader="tableHeader">
      <template slot="operate" slot-scope="{ row }">
        <TableOperation :operation-list="tableOperationList(row)"/>
      </template>
    </CommonTable>
    <!-- 分页组件  -->
    <div class="el-page">
      <el-pagination :current-page="pager.currentPage" :page-sizes="pageSizes" :page-size="pager.pageSize"
                     :layout="pagerSetting" :total="pager.totalCount" @size-change="handlePageSizeChange"
                     @current-change="handleCurrentChange"/>
    </div>
    <!-- 弹窗  -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" custom-class="edit-message" width="680px">
      <CommonForm ref="form" :form-data="formData" :form-rules="formRules" v-if="dialogFormVisible"
                  :formSettingInfo="formSettingInfo"></CommonForm>
      <span slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveForm">保存</el-button>
      </span>
    </el-dialog>
  </d2-container>
</template>
<script>
import SearchBar from '@/components/common-page/searchBar.vue'
import CommonTable from '@/components/common-page/commonTable.vue'
import TableOperation from '@/components/common-page/tableOperation.vue'
import CommonForm from '@/components/common-page/commonForm.vue'
import { validNotNull } from '@/libs/my-validate'

export default {
  name: 'admin-clients',
  components: {
    SearchBar,
    CommonTable,
    TableOperation,
    CommonForm
  },
  data() {
    return {
      searchList: [], // 搜索列表配置
      tableHeader: [], // 表头配置
      search: {},
      formSettingInfo: [], // 表单配置
      formData: {}, // 表单数据
      formRules: {}, // 表单必填项配置
      pager: { // 分页插件配置
        totalCount: 0,
        pageCount: 1,
        pageSize: 10,
        currentPage: 1
      },
      pageSizes: [10, 20, 40, 60, 100],
      pagerSetting: 'total, sizes, prev, pager, next, jumper',
      tableData: [], // 表格数据
      tableLoading: false, // 表格loading动画
      dialogTitle: '', // 表单弹窗标题
      newDataTitle: '新建', // 新建数据的title
      editDataTitle: '修改', // 编辑数据的title
      dialogFormVisible: false, // 弹窗是否展示
      listPath: '', // 列表请求地址
      savePath: '', // 保存地址
      deletePath: ''// 删除地址
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /**
     * flag 是否返回第一页
     * @param flag
     */
    getList(flag) { // 列表请求
      this.tableLoading = true
      if (flag) {
        this.pager.currentPage = 1
      }
      const params = Object.assign({}, this.search, {
        pageSize: this.pager.pageSize,
        currentPage: this.pager.currentPage
      })
      this.$get(this.listPath, params).then(res => {
        this.tableLoading = false
        if (res.code === 1) {
          this.tableData = res.data.list
          this.pager.totalCount = res.data.totalCount
          this.pager.pageCount = res.data.pageCount
          this.pager.pageSize = res.data.pageSize
          this.pager.currentPage = res.data.currentPage
        }
      }).catch(_ => {
        this.tableLoading = false
      })
    },
    tableOperationList(row) { // 表格操作配置
      return []
    },
    showForm() { // 新建按钮
      this.dialogTitle = this.newDataTitle
      this.formData = {}
      this.dialogFormVisible = true
    },
    saveForm() { // 保存表单按钮
      const valid = this.$refs.form.validForm()
      if (valid) {
        this.$post(this.savePath, this.formData).then(res => {
          if (res.code === 1) {
            this.$message.success(res.msg)
            this.getList(true)
          }
        })
        this.dialogFormVisible = false
      }
    },
    editData(row) { // 编辑按钮
      this.dialogTitle = this.editDataTitle
      this.formData = {
        id: row.id,
        clientName: row.clientName,
        webServerRedirectUri: row.webServerRedirectUri,
        remarks: row.remarks,
        status: row.status,
        deleted: row.deleted,
        roleIds: row.roleIds
      }
      this.dialogFormVisible = true
    },
    deleteData(row) { // 删除按钮
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
    handleCurrentChange(val) {
      this.pager.currentPage = val
      this.getList()
    },
    handlePageSizeChange(val) {
      this.pager.pageSize = val
      this.getList(true)
    }
  }
}
</script>
