<template>
  <d2-container>
    <div class="search-area">
      <el-form :inline="true" :model="search">
        <el-form-item label="应用名称">
          <el-input placeholder="请输入应用名称" size="mini" v-model="search.clientName">
          </el-input>
        </el-form-item>
        <el-form-item label="app_key">
          <el-input placeholder="请输入应用app_key" size="mini" v-model="search.clientId">
          </el-input>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="search.status"  size="mini" placeholder="请选择审核状态" clearable>
            <el-option :label="item" :value="index" v-for="(item,index) in statusList" :key="item" ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" @click="getList">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="btn-area">
      <el-button type="primary" size="mini"  @click="showForm">新建</el-button>
    </div>
    <div class="table-area">
      <el-table
        :data="tableData"
        v-loading="listLoading"
        style="width: 100%">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          prop="clientName"
          label="应用名称">
        </el-table-column>
        <el-table-column
          prop="clientId"
          label="app_key">
        </el-table-column>
        <el-table-column
          prop="createUserName"
          label="所属用户">
        </el-table-column>
        <el-table-column
          prop="remarks"
          label="备注">
        </el-table-column>
        <el-table-column
          prop="webServerRedirectUri"
          label="回调地址">
        </el-table-column>
        <el-table-column
          prop="deleted"
          label="启用状态">
          <template slot-scope="scope">
            <span v-if="scope.row.deleted" style="color: red">
              {{scope.row.deleted | enableString}}
            </span>
            <span v-else style="color: #a4cc05">
              {{scope.row.deleted | enableString}}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="审核状态">
          <template slot-scope="scope">
            <span  v-if="scope.row.status === 0" style="color: #e6a23c">
              {{scope.row.status | statusString}}
            </span>
            <span  v-if="scope.row.status === 1" style="color: #a4cc05">
              {{scope.row.status | statusString}}
            </span>
            <span  v-if="scope.row.status === 2" style="color: red">
              {{scope.row.status | statusString}}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="editData(scope.row)">编辑
            </el-button>
            <el-button
              size="mini"
              type="danger"
              @click="deleteData(scope.row)">删除
            </el-button>
            <el-dropdown style="padding-left: 10px">
              <el-button type="primary" size="mini">
                更多<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="grant(scope.row, 1)">授权API</el-dropdown-item>
                <el-dropdown-item @click.native="viewPrivileges(scope.row)">权限预览</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
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

    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" width="500px">
      <el-form ref="form" :model="formData" label-width="120px" :rules="formRules">
        <el-form-item label="应用名称" prop="clientName">
          <el-input v-model="formData.clientName"></el-input>
        </el-form-item>
        <el-form-item label="回调地址" prop="webServerRedirectUri">
          <el-input v-model="formData.webServerRedirectUri"></el-input>
        </el-form-item>
        <el-form-item label="权限角色模板">
          <el-select multiple  v-model="formData.roleIds"  filterable>
            <el-option  v-for="item in roleList" :label="item.label" :value="item.value" :key="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="formData.status"  placeholder="请选择审核状态">
            <el-option :label="item" :value="index" v-for="(item,index) in statusList" :key="item" ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否启用">
          <el-radio-group v-model="formData.deleted">
            <el-radio :label="0">是</el-radio>
            <el-radio :label="1">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remarks"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveForm">保存</el-button>
      </span>
    </el-dialog>
    <privileges-component  ref="privilegeRef" :privileges="privileges" :drawerTitle="drawerTitle" :apiResources="apiResources" ></privileges-component>
    <privileges-view ref="privilegeViewRef" :showTab="[1]" :privileges="privileges" :apiResources="apiResources"></privileges-view>
  </d2-container>
</template>
<script>
import privilegesComponent from '@/views/admin/components/privileges'
import { validNotNull } from '@/libs/my-validate'
import privilegesView from './components/privileges-view'
export default {
  name: 'admin-clients',
  components: {
    privilegesComponent,
    privilegesView
  },
  data () {
    const customValidator = (rule, value, callback) => {
      if (value.startsWith('http')) {
        callback()
      } else {
        callback(new Error('请输入正确的URL回调'))
      }
    }
    return {
      search: {
        clientName: '',
        clientId: '',
        status: ''
      },
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
        webServerRedirectUri: [
          { required: true, message: '该项为必填项，请填写完整', trigger: 'blur' },
          { validator: customValidator, trigger: 'blur' }
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
      listLoading: false, // 表格loading动画
      dialogTitle: '',
      newDataTitle: '新建应用', // 新建数据的title
      editDataTitle: '修改应用', // 编辑数据的title
      dialogFormVisible: false, // 弹窗是否展示
      listPath: '/clientDetails/pageList', // 列表请求地址
      savePath: '/clientDetails/save', // 保存地址
      deletePath: '/clientDetails/delete', // 删除地址
      roleList: [],
      statusList: ['待审核', '已通过', '未通过'],
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
    statusString (val) {
      if (val === 0) {
        return '待审核'
      } else if (val === 1) {
        return '已通过'
      } else if (val === 2) {
        return '未通过'
      }
    },
    enableString (val) {
      if (val) {
        return '禁用'
      } else {
        return '启用'
      }
    }
  },
  created () {
    this.getList()
    this.getRoleList()
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
              this.getList(true)
            }
          })
          this.dialogFormVisible = false
        }
      })
    },
    editData (row) {
      this.step = 0
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
    },
    grant (row, type) {
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
    getRoleList () {
      this.$get('/role/labelNodes').then(res => {
        if (res.code === 1) {
          this.roleList = res.data
        }
      })
    },
    viewPrivileges (row) {
      this.privileges.id = row.id
      this.$refs.privilegeViewRef.show()
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
  .btn-area{
    margin-bottom: 10px;
  }
</style>
