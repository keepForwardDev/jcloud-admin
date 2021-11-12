<template>
  <d2-container>
    <div class="search-area">
      <el-form :inline="true" :model="search">
        <el-form-item label="角色名称">
          <el-input placeholder="请输入角色名称" size="mini" v-model="search.name">
          </el-input>
        </el-form-item>
        <el-form-item label="角色编码">
          <el-input placeholder="请输入角色唯一编码" size="mini" v-model="search.code">
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" @click="getList">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="btn-area">
      <el-button type="primary" size="mini" @click="showForm">新建</el-button>
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
          prop="name"
          label="角色名称">
        </el-table-column>
        <el-table-column
          prop="code"
          label="角色编码">
        </el-table-column>
        <el-table-column
          prop="description"
          label="描述">
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
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name"></el-input>
        </el-form-item>
        <el-form-item label="角色唯一编码" prop="code">
          <el-input v-model="formData.code"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveForm" :disabled="saveBtnDisabled">保存</el-button>
      </span>
    </el-dialog>
    <privileges-component  ref="privilegeRef" :privileges="privileges" :drawerTitle="drawerTitle" :apiResources="apiResources" :resourceTreeList="resourceTreeList" :menuTreeList="menuTreeList" ></privileges-component>
  </d2-container>
</template>
<script>
import { validNotNull, validNotCN } from '@/libs/my-validate'
import privilegesComponent from '@/views/admin/components/privileges'
export default {
  name: 'admin-clients',
  data () {
    return {
      search: {
        name: '',
        code: ''
      },
      formData: {
        id: '',
        name: '',
        code: '',
        description: ''
      },
      formRules: {
        name: validNotNull(),
        code: [{ required: true, message: '该项为必填项，请填写完整！' }, { validator: validNotCN, trigger: 'blur' }]
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
      newDataTitle: '新建角色', // 新建数据的title
      editDataTitle: '修改角色', // 编辑数据的title
      dialogFormVisible: false, // 弹窗是否展示
      listPath: '/role/list', // 列表请求地址
      savePath: '/role/save', // 保存地址
      deletePath: '/role/delete', // 删除地址
      statusList: ['待审核', '已通过', '未通过'],
      saveBtnDisabled: false,
      drawerTitle: '',
      privileges: {
        resourceIds: [],
        apiConfig: [],
        id: '',
        resourceType: 0,
        privilegeType: 1, // 角色
        serviceId: ''
      },
      apiResources: [],
      menuTreeList: [],
      resourceTreeList: []
    }
  },
  components: {
    privilegesComponent
  },
  created () {
    this.getList()
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
        code: '',
        description: ''
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
          this.saveBtnDisabled = true
          this.$post(this.savePath, this.formData).then(res => {
            if (res.code === 1) {
              this.$message.success(res.msg)
              this.getList(true)
            }
          }).then(() => {
            this.saveBtnDisabled = false
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
        name: row.name,
        code: row.code,
        description: row.description
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
