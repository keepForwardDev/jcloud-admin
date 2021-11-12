<template>
  <div>
    <el-drawer
      :title="drawerTitle"
      :visible.sync="drawerVisible"
      direction="rtl"
      size="30%"
      :before-close="handleDrawerClose">

      <el-scrollbar style=" height: calc(100vh - 150px);" class="drawer-scrollbar">
        <div class="drawer-content">
          <div class="drawer-item">
            <el-tree
              default-expand-all
              empty-text="当前暂无数据"
              ref="treeBox"
              show-checkbox
              node-key="id"
              :data="treeList"
            >
             <span class="custom-tree-node" slot-scope="{ data }">
                <span class="tree-title" :title="data.extra">{{ data.label }}</span>
                <i class="el-icon-edit-outline closeBtn" @click="editLimit(data)" title="修改api调用次数" v-if="privileges.resourceType === 1"></i>
              </span>

            </el-tree>
          </div>
        </div>
      </el-scrollbar>
      <div class="drawer-footer">
        <el-button type="primary" @click="savePrivileges">保存</el-button>
      </div>
    </el-drawer>
    <el-dialog title="api调用限制" :visible.sync="dialogFormVisible1" width="500px">
      <el-form ref="form1" :model="formData1" label-width="120px" :rules="formRules1">
        <el-form-item label="api调用路径">
          <span>{{formData1.apiPath}}</span>
        </el-form-item>
        <el-form-item label="调用次数" prop="apiLimit">
          <el-input v-model="formData1.apiLimit" type="number"></el-input>
        </el-form-item>
        <el-form-item label="调用策略">
          <el-select v-model="formData1.apiLimitStrategy">
            <el-option label="次数" :value="0"></el-option>
            <el-option label="每天" :value="1"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible1 = false">取 消</el-button>
        <el-button type="primary" @click="saveForm1" >确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { validNotNull } from '@/libs/my-validate'
export default {
  name: 'privileges',
  data () {
    return {
      treeList: [],
      dialogFormVisible1: false,
      drawerVisible: false,
      formData1: {
        apiPath: '',
        apiLimit: '',
        apiLimitStrategy: 0
      },
      editNode: {},
      formRules1: {
        apiLimit: validNotNull()
      }
    }
  },
  props: {
    drawerTitle: {
      type: String,
      default: ''
    },
    privileges: {
      type: Object,
      default: () => {
        return {
          resourceIds: [],
          apiConfig: [],
          id: '',
          resourceType: 0,
          privilegeType: 1, // 角色
          serviceId: ''
        }
      }
    },
    apiResources: {
      type: Array,
      default: () => {
        return []
      }
    },
    menuTreeList: {
      type: Array,
      default: () => {
        return []
      }
    },
    resourceTreeList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  mounted () {

  },
  methods: {
    changeService (val) {
      this.getPrivileges()
    },
    handleDrawerClose (done) {
      done()
    },
    savePrivileges () {
      const checkNodes = this.$refs.treeBox.getCheckedNodes()
      const checkKeys = this.$refs.treeBox.getCheckedKeys()
      const halfCheckKeys = this.$refs.treeBox.getHalfCheckedKeys()
      const array = []
      if (this.privileges.resourceType === 1) { // api
        checkNodes.forEach(item => {
          if (item.children) {
            return
          }
          array.push({
            apiPath: item.data.apiPath,
            apiLimit: item.data.apiLimit,
            apiLimitStrategy: item.data.apiLimitStrategy
          })
        })
        this.privileges.resourceIds = []
        this.privileges.apiConfig = array
      } else {
        this.privileges.resourceIds = [...checkKeys, ...halfCheckKeys]
      }
      this.$postJson('/privilege/savePrivileges', this.privileges).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
        }
      })
    },
    getPrivileges () {
      this.$get('/privilege/getPrivileges', {
        resourceType: this.privileges.resourceType,
        id: this.privileges.id,
        privilegeType: this.privileges.privilegeType,
        serviceId: this.privileges.serviceId
      }).then(res => {
        if (res.code === 1) {
          if (this.privileges.resourceType === 0) {
            this.treeList = this.menuTreeList
          } else if (this.privileges.resourceType === 1) {
            this.treeList = res.data.apiTree
            this.privileges.apiConfig = res.data.apiConfig
          } else {
            this.treeList = this.resourceTreeList
          }
          this.$nextTick(() => {
            res.data.resourceIds.forEach(r => {
              this.$refs.treeBox.setChecked(r, true, false)
            })
          })
        }
      })
    },
    editLimit (data) {
      this.dialogFormVisible1 = true
      this.editNode = data
      this.formData1.apiPath = data.data.apiPath
      this.formData1.apiLimit = data.data.apiLimit
      this.formData1.apiLimitStrategy = data.data.apiLimitStrategy
    },
    saveForm1 () {
      this.$refs.form1.validate((valid, object) => {
        if (!valid) {
          this.$message({
            message: '请完善相关信息填写！',
            type: 'warning'
          })
        } else {
          this.editNode.data.apiPath = this.formData1.apiPath
          this.editNode.data.apiLimit = this.formData1.apiLimit
          this.editNode.data.apiLimitStrategy = this.formData1.apiLimitStrategy
          this.dialogFormVisible1 = false
        }
      })
    },
    showDrawer () {
      this.drawerVisible = true
    }
  }
}
</script>
<style lang="scss" scoped>
  .drawer-scrollbar {
    ::v-deep .el-scrollbar__wrap {
      overflow-x: hidden !important;
    }
  }

  .drawer-footer {
    z-index: 10;
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    border-top: 1px solid #e8e8e8;
    padding: 10px 16px;
    text-align: left;
    background: #fff;
  }

  .drawer-content {
    .drawer-item {
      padding: 20px;
    }
  }
  .custom-tree-node {
    width: 100%;
    .tree-title {
      width: 70%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: inline-block;
    }
    .closeBtn {
      display: none;
      position: absolute;
      right: 10px
    }
  }
  .custom-tree-node:hover {
    .closeBtn {
      display: inline-block;
      color: #409EFF;
    }
    .api-limit {
      display: none;
    }
  }
</style>
