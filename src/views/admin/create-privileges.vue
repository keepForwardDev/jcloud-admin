<template>
  <d2-container>
    <el-container>
      <el-aside width="400px">

        <div style="width: 351px" class="el-tips">
              <span class="el-tips-icon">
                <i class="el-icon-info"/>
              </span>
          <span>当前选中的节点：<span style="color: #4A9FF9">{{ selectResource }}</span></span>
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
          <el-form-item label="权限名称" prop="name">
            <el-input placeholder="请输入菜单名称" style="width: 400px" v-model="formData.name">
            </el-input>
          </el-form-item>
          <el-form-item label="系统唯一编码" prop="name">
            <el-input style="width: 400px"  v-model="formData.code" placeholder="用于确定该权限的唯一性">
            </el-input>
          </el-form-item>
          <el-form-item label="所属上级">
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
          <el-form-item label="访问地址">
            <el-input style="width: 400px"  v-model="formData.url" placeholder="用于匹配访问的url，支持正则表达式">
            </el-input>
          </el-form-item>
          <el-form-item label="排序号" prop="sort">
            <el-input style="width: 400px" type="number"  v-model="formData.sort" placeholder="排序号越大越靠后">
            </el-input>
          </el-form-item>
          <el-form-item label="权限描述">
            <el-input style="width: 400px"   v-model="formData.description" placeholder="用于描述该权限的作用">
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
  name: 'admin-department',
  data () {
    return {
      filterText: '',
      selectResource: '',
      treeList: [],
      parentName: '',
      formData: {
        id: '',
        name: '',
        code: '',
        parentId: 0,
        url: '',
        description: '',
        sort: 0
      },
      formRules: {
        name: validNotNull(),
        code: validNotNull()
      }
    }
  },
  created () {
    this.getTree()
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
      this.selectResource = data.label
      this.$get('/resource/info/' + data.id).then(res => {
        if (res.code === 1) {
          this.formData = res.data
          this.parentName = res.data.parentName
        }
      })
    },
    getTree () {
      this.$get('/resource/treeList').then(res => {
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
        this.$get('/resource/delete/' + data.id).then(res => {
          if (res.code === 1) {
            this.getTree()
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
          this.$post('/resource/save', this.formData).then(res => {
            if (res.code === 1) {
              this.$message.success(res.msg)
              this.getTree()
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
