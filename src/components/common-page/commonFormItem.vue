<template>
  <el-form-item :label="formInfo.name" :prop="formInfo.key">
    <el-select v-if="isShowSelect" v-model="formData[formInfo.key]" :placeholder="activePlaceholder" :multiple="formInfo.multiple" :disabled="isDisabled">
      <el-option v-for="option in optionList" :key="option.value" :label="option.label" :value="Number(option.value)" />
    </el-select>
    <el-date-picker v-if="isShowDate" v-model="formData[formInfo.key]" :type="datePickerType" :placeholder="activePlaceholder" :range-separator="datePickerSplit" :value-format="datePickerFormat" :disabled="isDisabled" />
    <el-input v-if="isShowInput" v-model.trim="formData[formInfo.key]" :placeholder="activePlaceholder" :disabled="isDisabled">
      <template v-if="prependText" slot="prepend">{{ prependText }}</template>
      <template v-if="appendText" slot="append">{{ appendText }}</template>
    </el-input>
    <el-input v-if="isShowTextarea" v-model="formData[formInfo.key]" type="textarea" :rows="formInfo.textareaRows || 3" :placeholder="activePlaceholder"  show-word-limit resize="none" :disabled="isDisabled" />
    <el-cascader v-if="isShowCascader" v-model="formData[formInfo.key]" :popper-class="formInfo.popperClass||''" :options="optionList" :props="{ value:cascaderDefaultValue, label: cascaderDefaultLabel, multiple: formInfo.multiple, checkStrictly: formInfo.checkStrictly }" clearable :disabled="isDisabled" />
    <el-radio-group v-if="isShowRadio" v-model="formData[formInfo.key]" :disabled="isDisabled">
      <el-radio v-for="item in optionList" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
    </el-radio-group>
    <el-checkbox-group v-if="isShowCheckbox" v-model="formData[formInfo.key]" :disabled="isDisabled">
      <el-checkbox v-for="item in optionList" :key="item.value" :label="item.value">{{ item.label }}</el-checkbox>
    </el-checkbox-group>
    <el-input-number v-if="isShowInputNumber" v-model="formData[formInfo.key]" :min="formInfo.min || 0" :max="formInfo.max" />
    <Tinymce v-if="isShowRichText" :id="formInfo.tinymceRef || 'tinymce'" :ref="formInfo.tinymceRef || 'tinymce'" v-model="formData[formInfo.key]" height="600px" :readonly='isDisabled'/>
    <CommonUpload v-if="isShowUpload" :limit="formInfo.uploadInfo.limit || 1"  :form-data="formData" :form-data-key="formInfo.key" :accept-file-type="formInfo.uploadInfo.acceptFileType" :max-size="formInfo.uploadInfo.maxSize" :operation-text="formInfo.uploadInfo.operationText" :is-async-upload="formInfo.uploadInfo.isAsyncUpload" :show-type="formInfo.uploadInfo.type" />
    <CommonTag v-if="isShowTag" :data-list.sync="formData[formInfo.key]" />
  </el-form-item>
</template>
<script>
import * as commonApi from '@/api/commonapi.js'
import Tinymce from '@/components/Tinymce/index.vue'
import CommonUpload from '@/components/common-page/commonUpload.vue'
const commonOptionList = require('@/consts/commonOptionList.js')
export default {
  name: 'commonFormItem',
  components: {
    Tinymce,
    CommonUpload
  },
  props: {
    formInfo: { // 表单配置信息
      type: Object,
      default: () => {
        return {}
      }
    },
    formData: { // 表单信息
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      optionList: [],
      placeholderMap: new Map([
        ['select', '请选择'],
        ['datePicker', '请选择'],
        ['input', '请输入'],
        ['cascader', '请选择'],
        ['textarea', '请输入']
      ])
    }
  },
  computed: {
    isDisabled () {
      return this.formInfo.isReadOnly || false
    },
    isShowInputNumber () {
      return this.formInfo.type === 'inputNumber'
    },
    isShowTag () {
      return this.formInfo.type === 'tag'
    },
    isShowRichText () {
      return this.formInfo.type === 'richText'
    },
    isShowTitle () {
      return this.formInfo.type === 'title'
    },
    isShowInputList () {
      return this.formInfo.type === 'inputList'
    },
    prependText () {
      if (!this.isShowInput || !this.formInfo.inputInfo) return ''
      return this.formInfo.inputInfo.prependText
    },
    appendText () {
      if (!this.isShowInput || !this.formInfo.inputInfo) return ''
      return this.formInfo.inputInfo.appendText
    },
    isShowUpload () {
      return this.formInfo.type === 'upload'
    },
    isShowAdd () {
      return this.formInfo.type === 'add'
    },
    isShowAddTable () {
      return this.formInfo.type === 'addTable'
    },
    isShowRadio () {
      return this.formInfo.type === 'radio'
    },
    isShowCheckbox () {
      return this.formInfo.type === 'checkbox'
    },
    isShowSelect () {
      if (!this.formInfo.optionKey && !this.formInfo.optionList) return false
      return this.formInfo.type === 'select'
    },
    isShowCascader () {
      if (!this.formInfo.treeKey) return false
      return this.formInfo.type === 'cascader'
    },
    isShowDate () {
      return this.formInfo.type === 'datePicker' && !!this.formInfo.dateType
    },
    isShowInput () {
      return this.formInfo.type === 'input'
    },
    isShowTextarea () {
      return this.formInfo.type === 'textarea'
    },
    activePlaceholder () {
      return this.formInfo.placeholder || `${this.placeholderMap.get(this.formInfo.type)}${this.formInfo.name}` || ''
    },
    datePickerType () {
      return this.formInfo.dateType || 'date'
    },
    datePickerSplit () {
      return this.formInfo.dateSplit || '至'
    },
    datePickerFormat () {
      return this.formInfo.dateFormat || 'yyyy-MM-dd HH:mm:ss'
    },
    cascaderDefaultValue () {
      return this.formInfo.defaultValue || 'id'
    },
    cascaderDefaultLabel () {
      return this.formInfo.defaultLabel || 'label'
    },
    isAutoComplete () {
      return this.formInfo.type === 'autocomplete'
    }
  },
  mounted () {
    this.getOptionList()
  },
  methods: {
    async getOptionList () {
      // default
      if (this.formInfo.optionList) {
        this.optionList = this.formInfo.optionList
      }
      if (!this.formInfo.optionKey && !this.formInfo.treeKey) {
        return
      }
      const commonOption = Object.entries(commonOptionList).find(([key, value]) => {
        return key === this.formInfo.optionKey
      })
      if (!commonOption) {
        if (this.formInfo.optionKey) {
          const res = await commonApi.getDictionaryListByKey(this.formInfo.optionKey)
          this.optionList = res.data.map(item => {
            return {
              ...item,
              value: item.value || item.id,
              label: item.label || item.name
            }
          })
        } else if (this.formInfo.treeKey) {
          const res = await commonApi.getDictionaryTreeByKey(this.formInfo.treeKey)
          this.optionList = res.data
        }
      } else {
        this.optionList = commonOption[1]
      }
    }
  }
}
</script>
