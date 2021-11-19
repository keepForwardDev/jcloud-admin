<template>
  <d2-container>
    <div  style="padding-left: 10px">
      <el-button type="primary" size="mini" @click.stop="() => append()">添加根级字典</el-button>
    </div>
    <div class="chain-tree-box"  v-loading="loading">
      <el-tree
        v-if="treeVisible"
        :load="loadNode"
        lazy
        node-key="id"
        @node-click="handleCheckChange"
        :expand-on-click-node="true"
        :auto-expand-parent="false"
        :highlight-current="true"
        ref="tree"
      >
            <span class="custom-tree-node" slot-scope="{ node }">
              <span :title="node.label">{{ node.label }}</span>
              <span>
                <el-button type="text" size="mini" @click.stop="() => append(node)">添加</el-button>
                <el-button type="text" size="mini" @click.stop="() => editNode(node)">编辑</el-button>
                <el-button type="text" size="mini" @click.stop="() => remove(node)">删除</el-button>
              </span>
            </span>
      </el-tree>
    </div>
    <el-dialog :title="dialogFormTitle" :visible.sync="dialogFormVisible" width="700px">
      <el-form ref="form"  :model="formData" label-width="120px" size="medium" :rules="formRules">
        <el-form-item label="字典名称" prop="name">
          <el-input placeholder="请输入字典名称" style="width: 400px" v-model="formData.name">
          </el-input>
        </el-form-item>
        <el-form-item label="唯一编码">
          <el-input style="width: 400px"  v-model="formData.nameKey" placeholder="用于确定该字典的唯一性" :disabled="formData.parentId !=0">
          </el-input>
        </el-form-item>
        <el-form-item label="排序号" prop="sort">
          <el-input style="width: 400px" type="number"  v-model="formData.sortNum" placeholder="排序号越大越靠后">
          </el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input style="width: 400px"   v-model="formData.remark" placeholder="用于描述该字典的作用">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveForm">保存</el-button>
      </span>
    </el-dialog>
  </d2-container>
</template>
<script>
import { validNotNull } from '@/libs/my-validate'
export default {
  name: 'admin-dictionary',
  data () {
    return {
      dialogFormVisible: false,
      dialogFormTitle: '新增',
      formData: {
        id: '',
        name: '',
        nameKey: '',
        sortNum: 0,
        remark: ''
      },
      formRules: {
        name: validNotNull()
      },
      loading: false,
      treeVisible: true
    }
  },
  methods: {
    loadNode (node, resolve) {
      let parentId = 0
      if (node.level !== 0) {
        parentId = node.data.id
      }
      this.$get('/dictionary/getByParentId/simple-dictionary/' + parentId).then(res => {
        if (res.code === 1) {
          this.loading = false
          resolve(res.data)
        }
      })
    },
    handleCheckChange (a1, a2) {

    },
    append (node) {
      if (node) {
        this.formData = {
          id: '',
          parentId: node.data.id,
          name: '',
          nameKey: '',
          sortNum: 0,
          remark: ''
        }
      } else {
        this.formData = {
          id: '',
          name: '',
          parentId: 0,
          nameKey: '',
          sortNum: 0,
          remark: ''
        }
      }
      this.dialogFormVisible = true
    },
    editNode (node) {
      this.formData = {
        id: node.data.id,
        name: node.data.label,
        nameKey: node.data.data.nameKey,
        sortNum: node.data.data.sortNum,
        remark: node.data.data.remark,
        parentId: node.data.data.parentId
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
          if (this.formData.parentId === 0 && !this.formData.nameKey) {
            this.$message({
              message: '唯一编码必须填写！',
              type: 'warning'
            })
            return
          }
          this.$post('/dictionary/cudOperation', this.formData).then(res => {
            if (res.code === 1) {
              this.$message.success(res.msg)
              this.dialogFormVisible = false
              this.refreshTree()
            }
          })
        }
      })
    },
    remove (node) {
      this.$confirm('是否确定要删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const formData = {
          id: node.data.id,
          deleted: 1
        }
        this.$post('/dictionary/cudOperation', formData).then(res => {
          if (res.code === 1) {
            this.$message.success(res.msg)
            this.refreshTree()
          }
        })
      })
    },
    refreshTree () {
      this.loading = true
      this.treeVisible = false
      setTimeout(() => {
        this.treeVisible = true
      }, 500)
    }
  },
  mounted () {
  }
}
</script>
<style>
  .chain-tree-box {
    padding: 10px;
  }
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
  .demo-form-inline {
    display: flex;
    justify-content: space-between;
  }
</style>
