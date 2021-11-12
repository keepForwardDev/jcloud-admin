<template>

  <div class="formWrapper">
    <el-form ref="form" :rules="rules" :model="formData" label-width="120px">
      <el-form-item label="任务名称" prop="name">
        <el-input v-model="formData.name" class="text-input"></el-input>
      </el-form-item>
      <el-form-item label="所属项目"  prop="projectDicId">
        <el-select v-model="formData.projectDicId" placeholder="请选择所属项目" class="text-input">
          <el-option v-for="item in projectList" :label="item.name" :value="item.value" :key="item.id">{{item.name}}</el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="数据源名称" prop="dataSourceInfoId">
        <el-select v-model="formData.dataSourceInfoId" placeholder="请选择所属项目" class="text-input">
          <el-option v-for="item in dataSourceList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="是否调度">
        <el-radio-group v-model="formData.isTask">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
<!--      <el-form-item label="调度策略">
        <el-radio-group v-model="formData.inStrategy">
          <el-radio :label="0" >增量</el-radio>
          <el-radio :label="1">全量</el-radio>
        </el-radio-group>
      </el-form-item>-->
      <el-form-item label="描述">
        <el-input
          class="text-input"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4}"
          placeholder="请输入内容"
          v-model="formData.remark">
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="nexStep">下一步</el-button>
        <el-button @click="closeDialog">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: 'taskInfo',
  props: {
    formData: {
      type: Object,
      default: () => ({})
    },
    projectList: {
      type: Array,
      default: () => {
        return []
      }
    },
    dataSourceList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    var checkUnique = (rule, value, callback) => {
      if (this.formData.projectDicId && this.formData.dataSourceInfoId) {
        if (this.formData.id) {
          callback()
        } else {
          this.$get('/datacenter/metadata/isTaskExists/' + this.formData.projectDicId + '/' + this.formData.dataSourceInfoId).then(res => {
            if (res.data) {
              callback()
            } else {
              callback(new Error('当前数据源对应的项目已存在，不允许创建多个！'))
            }
          })
        }
      } else {
        callback()
      }
    }
    return {
      rules: {
        name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
        projectDicId: [
          { required: true, validator: checkUnique, trigger: 'change' }],
        dataSourceInfoId: [
          { required: true, validator: checkUnique, trigger: 'change' }]
      }
    }
  },
  created() {
  },
  methods: {
    nexStep () {
      this.formData.fetchTableName = true
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$emit('nextStep')
        }
      })
    },
    closeDialog () {
      this.$emit('closeDialog')
    }
  }
}
</script>
<style lang="scss" scoped>
  .text-input {
    width: 400px;
  }

  .formWrapper {
    display: flex;
    justify-content: center;
    padding-top: 20px;
  }

</style>
