<template>
  <div class="form-area">
    <el-form ref="commonForm" class="common-form" :model="formData" :rules="formRules" :label-width="formLabelWidth" @submit.native.prevent>
      <CommonFormItem v-for="(item, index) in formSettingInfo" :key="index" :form-info="item" :form-data="formData"/>
    </el-form>
  </div>
</template>
<script>
import CommonFormItem from '@/components/common-page/commonFormItem.vue'
export default {
  name: 'commonForm',
  components: {
    CommonFormItem
  },
  props: {
    formSettingInfo: { // 搜索表单配置信息
      type: Array,
      default: () => {
        return []
      }
    },
    formData: { // 表单数据
      type: Object,
      default: () => {
        return {}
      }
    },
    formRules: { // 表单校验信息
      type: Object,
      default: () => {
        return {}
      }
    },
    formLabelWidth: {
      type: String,
      default: '120px'
    }
  },
  data () {
    return {

    }
  },
  mounted () {
  },
  methods: {
    getList () {
      this.$emit('getList')
    },
    validForm () {
      let flag = false
      this.$refs.commonForm.validate((valid, object) => {
        if (!valid) {
          this.$message({
            message: '请完善相关信息填写！',
            type: 'warning'
          })
        }
        flag = valid
      })
      return flag
    }
  }
}
</script>
