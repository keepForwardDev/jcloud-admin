<template>
  <d2-container>
    <el-container>
      <el-aside width="400px">

        <div style="width: 351px" class="el-tips">
              <span class="el-tips-icon">
                <i class="el-icon-info"/>
              </span>
          <span>当前选中的节点：<span style="color: #4A9FF9">{{ selectMenu }}</span></span>
        </div>
        <div style="padding-top: 10px;padding-bottom: 10px">
          <el-input
            v-model="filterText"
            placeholder="请输入内容"
            size="medium"
          >
            <i slot="suffix" class="el-input__icon el-icon-search"/>
          </el-input>
        </div>
        <div class="tree-aside">
          <el-scrollbar style="height:calc(100vh - 250px);" ref="scrollbar">
            <el-tree
              default-expand-all
              ref="groupTree"
              node-key="id"
              :data="treeList"
              :filter-node-method="filterNode"
              accordion
              highlight-current
              @node-click="handleNodeClick"
            >
              <span class="custom-tree-node" slot-scope="{ data }">
                <span :title="data.label">{{ data.label }}</span>
                <span>
                  <i class="fa fa-times closeBtn" @click="deleteNode(data)"></i>
                </span>
              </span>
            </el-tree>
          </el-scrollbar>
        </div>
      </el-aside>

      <el-main>
        <el-form ref="form"  :model="formData" label-width="120px" size="medium" :rules="formRules">
          <el-form-item label="菜单类型" prop="type">
            <el-select v-model="formData.type">
              <el-option v-for="item in menuTypeList" :label="item.name" :value="item.value" :key="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="菜单名称" prop="title">
            <el-input placeholder="请输入菜单名称" style="width: 400px" v-model="formData.title">
            </el-input>
          </el-form-item>
          <el-form-item label="上级菜单">
            <el-input v-model="parentName" style="width: 400px"  readonly clearable/>
            <el-popover
              placement="right"
              width="400"
              height="400"
              trigger="click"
            >
              <div class="tree-aside">
                <el-scrollbar style="height:200px">
                  <el-tree
                    ref="groupTree1"
                    node-key="id"
                    :data="treeList"
                    accordion
                    highlight-current
                    @node-click="selectNode"
                  />
                </el-scrollbar>
              </div>
              <el-button slot="reference" icon="el-icon-edit-outline" circle />
            </el-popover>
          </el-form-item>
          <el-form-item label="组件名称" prop="name">
            <el-input style="width: 400px"  v-model="formData.name" placeholder="组件的export name,路由跳转名称">
            </el-input>
          </el-form-item>
          <el-form-item label="访问地址" prop="path">
            <el-input style="width: 400px"  v-model="formData.path" placeholder="组件访问地址,起始路径/为绝对路径 不加为相对路径">
            </el-input>
          </el-form-item>
          <el-form-item label="组件地址">
            <el-input style="width: 400px"  v-model="formData.component" placeholder="组件路径，相对views的路径，父级可以为空">
            </el-input>
          </el-form-item>
          <el-form-item label="重定向路径">
            <el-input style="width: 400px"  v-model="formData.redirect" placeholder="点击菜单重定向的路由路径">
            </el-input>
          </el-form-item>
          <el-form-item label="排序号" prop="sort">
            <el-input style="width: 400px" type="number"  v-model="formData.sort" placeholder="排序号越大越靠后">
            </el-input>
          </el-form-item>
          <el-form-item label="icon">
            <el-input style="width: 400px"   v-model="formData.meta.icon" placeholder="菜单icon">
            </el-input>
          </el-form-item>
          <el-form-item label="是否缓存菜单">
            <el-radio-group v-model="formData.meta.cache">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="是否隐藏">
            <el-radio-group v-model="formData.hidden">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="菜单备注">
            <el-input style="width: 400px"   v-model="formData.remark">
            </el-input>
          </el-form-item>
          <el-form-item label="">
            <el-button type="primary" icon="el-icon-edit" @click="saveForm">保存</el-button>
            <el-button @click="clearForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-main>

    </el-container>

  </d2-container>
</template>
<script>
import { validNotNull } from '@/libs/my-validate'
export default {
  name: 'admin-menu',
  data () {
    return {
      filterText: '',
      selectMenu: '',
      treeList: [],
      parentName: '',
      formData: {
        id: '',
        title: '',
        name: '',
        hidden: false,
        parentId: 0,
        redirect: '',
        path: '',
        component: '',
        sort: 0,
        meta: {
          icon: '',
          cache: false
        },
        remark: ''
      },
      formRules: {
        name: validNotNull(),
        type: validNotNull(),
        title: validNotNull(),
        path: validNotNull(),
        sort: validNotNull()
      },
      menuTypeList: []
    }
  },
  created () {
    this.getMenuType()
    this.getMenuTree()
  },
  watch: {
    filterText (val) {
      this.$refs.groupTree.filter(val)
    }
  },
  methods: {
    filterNode (value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    handleNodeClick (data) {
      this.selectMenu = data.label
      this.$get('/menu/info/' + data.id).then(res => {
        if (res.code === 1) {
          this.formData = res.data
          this.parentName = res.data.parentName
        }
      })
    },
    getMenuTree () {
      this.$get('/menu/treeList').then(res => {
        if (res.code === 1) {
          this.treeList = res.data
        }
      })
    },
    deleteNode (data) {
      this.$confirm('是否确定要删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$get('/menu/delete/' + data.id).then(res => {
          if (res.code === 1) {
            this.getMenuTree()
            this.clearForm()
            this.$message.success(res.msg)
          }
        })
      })
    },
    selectNode (node) {
      if (this.formData.id === node.id) {
        this.$message.warning('不支持选择自己！')
      } else {
        if (this.parentName === node.label) {
          this.parentName = ''
          this.formData.parentId = ''
        } else {
          this.parentName = node.label
          this.formData.parentId = node.id
        }
      }
    },
    saveForm () {
      this.$refs.form.validate((valid, object) => {
        if (!valid) {
          this.$message({
            message: '请完善相关信息填写！',
            type: 'warning'
          })
        } else {
          this.$postJson('/menu/save', this.formData).then(res => {
            if (res.code === 1) {
              this.$message.success(res.msg)
              this.getMenuTree()
              this.clearForm()
            }
          })
        }
      })
    },
    clearForm () {
      this.parentName = ''
      this.formData = {
        id: '',
        title: '',
        name: '',
        hidden: false,
        parentId: 0,
        redirect: '',
        path: '',
        component: '',
        sort: 0,
        meta: {
          icon: '',
          cache: false
        },
        remark: ''
      }
    },
    getMenuType () {
      this.$get('/dictionary/selectList/menuType').then(res => {
        if (res.code === 1) {
          this.menuTypeList = res.data
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  .el-tips {
    border: 1px solid #abdcff;
    background-color: #f0faff;
    position: relative;
    padding: 8px 8px 8px 38px;
    border-radius: 4px;
    color: #515a6e;
    font-size: 14px;
    line-height: 16px;

    .el-tips-icon {
      color: #2d8cf0;
      font-size: 16px;
      top: 6px;
      left: 12px;
      position: absolute;
    }
  }

  .tree-aside {
    ::v-deep .el-scrollbar__wrap {
      overflow-x: hidden !important;
    }
  }

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }

  .closeBtn {
    padding-right: 20px;
    display: none;
  }

  .custom-tree-node:hover {
    .closeBtn {
      display: block;
    }
  }
</style>
