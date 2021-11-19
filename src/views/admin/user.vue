<template>
  <d2-container>
    <div class="search-area">
      <el-form :inline="true" :model="search">
        <el-form-item label="用户名称">
          <el-input placeholder="请输入用户名称"  size="mini" v-model="search.name">
          </el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input placeholder="请输入手机号"  size="mini" v-model="search.phone">
          </el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input placeholder="请输入邮箱" size="mini" v-model="search.email">
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" @click="getList">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="btn-area">
      <el-button type="primary" size="mini" @click="showForm">新建</el-button>
      <el-button type="primary" size="mini" icon="el-icon-refresh" :disabled="selection.length === 0" @click="resetPassword">密码重置</el-button>
    </div>
    <div class="table-area">
      <el-table
        @selection-change="handleSelectionChange"
        :data="tableData"
        v-loading="listLoading"
        style="width: 100%">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          prop="name"
          label="名称">
        </el-table-column>
        <el-table-column
          prop="phone"
          label="手机号">
        </el-table-column>
        <el-table-column
          prop="email"
          label="邮箱">
        </el-table-column>
        <el-table-column
          prop="sourceFromStr"
          label="用户来源">
        </el-table-column>
        <el-table-column
          prop="sourceFromStr"
          label="是否启用">
          <template slot-scope="scope">
            <span>{{scope.row.enabled | boolString}}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="注册时间">
        </el-table-column>
        <el-table-column label="操作" width="230">
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
                <el-dropdown-item @click.native="grant(scope.row, 0)">授权菜单</el-dropdown-item>
                <el-dropdown-item @click.native="grant(scope.row, 1)">授权API</el-dropdown-item>
                <el-dropdown-item @click.native="grant(scope.row, 2)">授权自定义权限</el-dropdown-item>
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

    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" width="700px">
      <el-form ref="form" :model="formData" label-width="80px" :rules="formRules">
        <el-form-item label="用户名称" prop="name">
          <el-input v-model="formData.name"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone">
            <template slot="append"><span @click="checkUse">查询是否可用</span></template>
          </el-input>
        </el-form-item>
        <el-form-item label="所属部门">
          <el-select v-model="formData.departmentId"  style="width: 300px" filterable >
            <el-option v-for="item in departmentList" :label="item.name" :value="item.id" :key="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户角色">
          <el-select multiple  v-model="formData.roleIds" style="width: 300px" filterable>
            <el-option  v-for="item in roleList" :label="item.label" :value="item.value" :key="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
            action="/common/upload/singleFile"
            list-type="picture-card"
            :file-list="fileList"
            accept=".jpeg,.png,.jpg,.gif,.bmp"
            :on-success="handleAvatarSuccess">
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="formData.sex">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.enabled">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveForm">保存</el-button>
      </span>
    </el-dialog>
    <privileges-component  ref="privilegeRef" :privileges="privileges" :drawerTitle="drawerTitle" :apiResources="apiResources" :resourceTreeList="resourceTreeList" :menuTreeList="menuTreeList" ></privileges-component>
    <privileges-view ref="privilegeViewRef" :privileges="privileges" :apiResources="apiResources" :resourceTreeList="resourceTreeList" :menuTreeList="menuTreeList"></privileges-view>
  </d2-container>
</template>
<script>
import { validNotNull } from '@/libs/my-validate'
import privilegesComponent from '@/views/admin/components/privileges'
import privilegesView from './components/privileges-view'
export default {
  name: 'admin-user',
  data () {
    const customValidator = (rule, value, callback) => {
      var regex = /^1[345789]\d{9}$/
      if (regex.test(value)) {
        callback()
      } else {
        callback(new Error('请输入正确的手机号码！'))
      }
    }
    return {
      keyword: '',
      keywordType: '1',
      search: {
        name: '',
        phone: '',
        email: ''
      },
      formData: {
        id: '',
        name: '',
        avatar: '',
        sex: 1,
        phone: '',
        email: '',
        roleIds: [],
        departmentId: '',
        enabled: 1
      },
      formRules: {
        name: validNotNull(),
        phone: [
          { required: true, message: '该项为必填项，请填写完整', trigger: 'blur' },
          { validator: customValidator, trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
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
      newDataTitle: '新建用户', // 新建数据的title
      editDataTitle: '修改用户', // 编辑数据的title
      dialogFormVisible: false, // 弹窗是否展示
      listPath: '/user/list', // 列表请求地址
      savePath: '/user/save', // 保存地址
      deletePath: '/user/delete', // 删除地址
      departmentList: [],
      roleList: [],
      fileList: [],
      selection: [],
      drawerTitle: '',
      privileges: {
        resourceIds: [],
        apiConfig: [],
        id: '',
        resourceType: 0,
        privilegeType: 0, // 用户
        serviceId: ''
      },
      apiResources: [],
      menuTreeList: [],
      resourceTreeList: []
    }
  },
  components: {
    privilegesComponent,
    privilegesView
  },
  filters: {
    boolString (value) {
      if (value) {
        return '是'
      } else {
        return '否'
      }
    }
  },
  watch: {

  },
  created () {
    this.getList()
    this.getRoleList()
    this.getDepartmentList()
    this.getMenuTree()
    this.getCustomResource()
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
        name: '',
        avatar: '',
        sex: 1,
        phone: '',
        email: '',
        roleIds: [],
        departmentId: '',
        enabled: 1
      }
      this.dialogFormVisible = true
    },
    saveForm () {
      if (this.fileList.length > 0) {
        this.formData.avatar = this.fileList[0].url
      }
      this.$refs.form.validate((valid, object) => {
        if (!valid) {
          this.$message({
            message: '请完善相关信息填写！',
            type: 'warning'
          })
        } else {
          this.$postJson(this.savePath, this.formData).then(res => {
            if (res.code === 1) {
              this.$message.success(res.msg)
              this.dialogFormVisible = false
              this.getList(true)
            } else {
              this.$message.error(res.msg)
            }
          })
        }
      })
    },
    editData (row) {
      this.dialogTitle = this.editDataTitle
      if (row.avatar) {
        this.fileList = []
        this.fileList.push({
          name: '',
          url: row.avatar
        })
      } else {
        this.fileList = []
      }
      this.formData = {
        id: row.id,
        name: row.name,
        avatar: row.avatar,
        sex: row.sex,
        phone: row.phone,
        email: row.email,
        roleIds: row.roleIds,
        departmentId: row.departmentId,
        enabled: row.enabled
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
    handleAvatarSuccess (res, file) {
      if (this.fileList.length > 0) {
        this.fileList = []
      }
      this.fileList.push({
        name: res.data.fileName,
        url: res.data.fileUrl
      })
    },
    handleSelectionChange(val) {
      if (val.length > 0) {
        this.selection = val.map(item => item.id)
      } else {
        this.selection = []
      }
    },
    resetPassword () {
      this.$confirm('确定重置吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$get('/user/resetPassword', this.selection).then(res => {
          if (res.code === 1) {
            this.$alert('密码已重置为：<span style="color: red">' + res.data + '</span> 请牢记！', '重置成功', {
              dangerouslyUseHTMLString: true
            })
          }
        })
      })
    },
    getDepartmentList () {
      this.$get('/department/listDepartment').then(res => {
        if (res.code === 1) {
          this.departmentList = res.data
        }
      })
    },
    getRoleList () {
      this.$get('/role/labelNodes').then(res => {
        if (res.code === 1) {
          this.roleList = res.data
        }
      })
    },
    checkUse () {
      if (this.formData.phone) {
        this.$get('/user/checkPhone/' + this.formData.phone, {
          id: this.formData.id
        }).then(res => {
          if (res.code === 1 && res.data) {
            this.$message.success('可以使用！')
          } else {
            this.$message.error('不可使用！')
          }
        })
      }
    },
    grant (row, type) {
      this.privileges.resourceType = type
      this.privileges.id = row.id
      if (type === 0) {
        this.drawerTitle = row.name + '菜单权限'
        this.privileges.serviceId = ''
      } else if (type === 1) {
        this.drawerTitle = row.name + 'API权限'
        if (this.apiResources.length > 0) {
          this.privileges.serviceId = this.apiResources[0].url
        }
      } else {
        this.drawerTitle = row.name + '自定义权限'
        this.privileges.serviceId = ''
      }
      this.$refs.privilegeRef.showDrawer()
      this.$nextTick(() => {
        this.$refs.privilegeRef.getPrivileges()
      })
    },
    viewPrivileges (row) {
      this.privileges.id = row.id
      this.$refs.privilegeViewRef.show()
    },
    getMenuTree () {
      this.$get('/menu/treeList').then(res => {
        if (res.code === 1) {
          this.menuTreeList = res.data
        }
      })
    },
    getCustomResource () {
      this.$get('/resource/treeList').then(res => {
        if (res.code === 1) {
          this.resourceTreeList = res.data
        }
      })
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
