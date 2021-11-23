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
        <TableOperation :operation-list="tableOperationList(row)" />
      </template>
    </CommonTable>
    <!-- 分页组件  -->
    <div class="el-page">
      <el-pagination :current-page="pager.currentPage" :page-sizes="pageSizes" :page-size="pager.pageSize" :layout="pagerSetting" :total="pager.totalCount" @size-change="handlePageSizeChange" @current-change="handleCurrentChange" />
    </div>
    <!-- 弹窗  -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" custom-class="edit-message" width="680px">
      <CommonForm ref="form" :form-data="formData" :form-rules="formRules" v-if="dialogFormVisible" :formSettingInfo="formSettingInfo"></CommonForm>
      <span slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveForm">保存</el-button>
      </span>
    </el-dialog>
    <privileges-component ref="privilegeRef" :privileges="privileges" :drawerTitle="drawerTitle" :apiResources="apiResources"></privileges-component>
    <privileges-view ref="privilegeViewRef" :showTab="[1]" :privileges="privileges" :apiResources="apiResources"></privileges-view>
  </d2-container>
</template>
<script>
import SearchBar from '@/components/common-page/searchBar.vue'
import CommonTable from '@/components/common-page/commonTable.vue'
import TableOperation from '@/components/common-page/tableOperation.vue'
import CommonForm from '@/components/common-page/commonForm.vue'
import privilegesComponent from '@/views/admin/components/privileges'
import {
  validNotNull
} from '@/libs/my-validate'
import privilegesView from './components/privileges-view'

export default {
  name: 'admin-clients',
  components: {
    privilegesComponent,
    privilegesView,
    SearchBar,
    CommonTable,
    TableOperation,
    CommonForm
  },
  data() {
    const customValidator = (rule, value, callback) => {
      if (value.startsWith('http')) {
        callback()
      } else {
        callback(new Error('请输入正确的URL回调'))
      }
    }
    return {
      searchList: [{
        key: 'clientName',
        name: '应用名称',
        type: 'input'
      }, {
        key: 'clientId',
        name: 'app_key',
        type: 'input'
      }, {
        key: 'status',
        name: '审核状态',
        type: 'select',
        optionKey: 'statusList'
      }],
      tableHeader: [{
        prop: 'clientName',
        label: '应用名称'
      }, {
        prop: 'clientId',
        label: 'app_key'
      }, {
        prop: 'createUserName',
        label: '所属用户'
      }, {
        prop: 'remarks',
        label: '备注'
      }, {
        prop: 'webServerRedirectUri',
        label: '回调地址'
      }, {
        prop: 'deleted',
        label: '启用状态',
        html: true,
        formatter: function(value) {
          if (value) {
            return "<span style='color: red'>禁用</span>"
          } else {
            return "<span style='color: #a4cc05'>启用</span>"
          }
        }
      }, {
        prop: 'status',
        label: '审核状态',
        html: true,
        formatter: (value) => {
          if (value === 0) {
            return "<span style='color: #e6a23c'>待审核</span>"
          } else if (value === 1) {
            return "<span style='color: #a4cc05'>已通过</span>"
          } else if (value === 2) {
            return "<span style='color: red'>未通过</span>"
          }
          return ''
        }
      }],
      search: {},
      formSettingInfo: [{
        key: 'clientName',
        name: '应用名称',
        type: 'input'
      },
        {
          key: 'webServerRedirectUri',
          name: '回调地址',
          type: 'input'
        },
        {
          key: 'roleIds',
          name: '权限角色模板',
          type: 'select',
          optionList: [],
          multiple: true
        },
        {
          key: 'status',
          name: '审核状态',
          type: 'select',
          optionKey: 'statusList'
        },
        {
          key: 'deleted',
          name: '是否启用',
          type: 'select',
          optionKey: 'deletedList'
        },
        {
          key: 'remarks',
          name: '备注',
          type: 'input'
        }
      ],
      formData: {
        id: '',
        clientName: '',
        webServerRedirectUri: '',
        remarks: '',
        status: 1,
        deleted: 0,
        roleIds: []
      },
      formRules: {
        clientName: validNotNull(),
        webServerRedirectUri: [{
          required: true,
          message: '该项为必填项，请填写完整',
          trigger: 'blur'
        },
          {
            validator: customValidator,
            trigger: 'blur'
          }
        ]
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
      tableLoading: false, // 表格loading动画
      dialogTitle: '',
      newDataTitle: '新建应用', // 新建数据的title
      editDataTitle: '修改应用', // 编辑数据的title
      dialogFormVisible: false, // 弹窗是否展示
      listPath: '/clientDetails/pageList', // 列表请求地址
      savePath: '/clientDetails/save', // 保存地址
      deletePath: '/clientDetails/delete', // 删除地址
      drawerTitle: '',
      privileges: {
        resourceIds: [],
        apiConfig: [],
        id: '',
        resourceType: 0,
        privilegeType: 2, // 应用
        serviceId: ''
      },
      apiResources: []
    }
  },
  filters: {
    statusString(val) {
      if (val === 0) {
        return '待审核'
      } else if (val === 1) {
        return '已通过'
      } else if (val === 2) {
        return '未通过'
      }
    },
    enableString(val) {
      if (val) {
        return '禁用'
      } else {
        return '启用'
      }
    }
  },
  created() {
    this.getList()
    this.getRoleList()
  },
  methods: {
    // ==================================== 二、数据请求类 ================================
    // /**
    //  * @param {boolean} flag 判断是否为第1页
    //  */
    getList(flag) {
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
    tableOperationList(row) {
      return [{
        type: 'primary',
        label: '编辑',
        operation: () => {
          this.editData(row)
        },
        disabled: false,
        available: true
      },
        {
          type: 'danger',
          label: '删除',
          operation: () => {
            this.deleteData(row)
          },
          disabled: false,
          available: true
        },
        {
          label: '授权API',
          operation: () => {
            this.grant(row, 1)
          },
          disabled: false,
          available: true
        },
        {
          label: '权限预览',
          operation: () => {
            this.viewPrivileges(row)
          },
          disabled: false,
          available: true
        }
      ].filter(item => item.available)
    },
    showForm() {
      this.dialogTitle = this.newDataTitle
      this.formData = {
        id: '',
        clientName: '',
        webServerRedirectUri: '',
        remarks: '',
        status: 1,
        deleted: 0,
        roleIds: []
      }
      this.dialogFormVisible = true
    },
    saveForm() {
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
    editData(row) {
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
    deleteData(row) {
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
    resetQuery() {
      this.search = {}
      this.getList(true)
    },
    handleCurrentChange(val) {
      this.pager.currentPage = val
      this.getList()
    },
    handlePageSizeChange(val) {
      this.pager.pageSize = val
      this.getList(true)
    },
    grant(row, type) {
      this.privileges.resourceType = type
      this.privileges.id = row.id
      if (type === 0) {
        this.drawerTitle = row.clientName + '菜单权限'
        this.privileges.serviceId = ''
      } else if (type === 1) {
        this.drawerTitle = row.clientName + 'API权限'
        if (this.apiResources.length > 0) {
          this.privileges.serviceId = this.apiResources[0].url
        }
      } else {
        this.drawerTitle = row.clientName + '自定义权限'
        this.privileges.serviceId = ''
      }
      this.$refs.privilegeRef.showDrawer()
      this.$nextTick(() => {
        this.$refs.privilegeRef.getPrivileges()
      })
    },
    getRoleList() {
      this.$get('/role/labelNodes').then(res => {
        if (res.code === 1) {
          this.formSettingInfo.filter(item => item.key === 'roleIds')[0].optionList = res.data
        }
      })
    },
    viewPrivileges(row) {
      this.privileges.id = row.id
      this.$refs.privilegeViewRef.show()
    }
  }
}
</script>
