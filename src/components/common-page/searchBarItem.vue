<template>
  <el-form-item :label="searchInfo.name">
    <el-select size="mini" v-if="isShowSelect" v-model="searchData[searchInfo.key]" :placeholder="activePlaceholder" clearable>
      <el-option v-for="option in optionList" :key="option.value" :label="option.label" :value="option.value" />
    </el-select>
    <el-date-picker size="mini" v-if="isShowDate" v-model="searchData[searchInfo.key]" :type="datePickerType" :placeholder="activePlaceholder" :start-placeholder='datePickerStartPlaceHolder' :end-placeholder='datePickerEndPlaceHolder' :range-separator="datePickerSplit" :value-format="datePickerFormat" clearable />
    <el-input clearable size="mini" v-if="isShowInput" v-model="searchData[searchInfo.key]" :placeholder="activePlaceholder" />
    <el-cascader size="mini" v-if="isShowCascader" v-model="searchData[searchInfo.key]" :options="optionList" :props="{ checkStrictly: true, value:cascaderDefaultValue }" clearable />
  </el-form-item>
</template>
<script>
import * as commonApi from '@/api/commonapi.js'
const commonOptionList = require('@/consts/commonOptionList.js')
export default {
  name: 'searchBarItem',
  props: {
    searchInfo: { // 搜索配置信息
      type: Object,
      default: () => {
        return {}
      }
    },
    searchData: { // 搜索表单信息
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
        ['cascader', '请选择']
      ])
    }
  },
  computed: {
    isShowSelect () {
      return this.searchInfo.type === 'select'
    },
    isShowDate () {
      return this.searchInfo.type === 'datePicker' && !!this.searchInfo.dateType
    },
    isShowInput () {
      return this.searchInfo.type === 'input'
    },
    isShowCascader () {
      return this.searchInfo.type === 'cascader'
    },
    activePlaceholder () {
      return this.searchInfo.placeholder || this.placeholderMap.get(this.searchInfo.type) || ''
    },
    datePickerType () {
      return this.searchInfo.dateType || 'date'
    },
    datePickerSplit () {
      return this.searchInfo.dateSplit || '至'
    },
    datePickerStartPlaceHolder () {
      return this.searchInfo.dateStartPlaceHolder || '开始日期'
    },
    datePickerEndPlaceHolder () {
      return this.searchInfo.dateEndPlaceHolder || '结束日期'
    },
    datePickerFormat () {
      return this.searchInfo.dateFormat || 'yyyy-MM-dd'
    },
    cascaderDefaultValue () {
      return this.searchInfo.defaultValue || 'value'
    }
  },
  mounted () {
    this.getOptionList()
  },
  methods: {
    async getOptionList () {
      const commonOption = Object.entries(commonOptionList).find(([key, value]) => {
        return key === this.searchInfo.optionKey
      })
      if (!commonOption) {
        if (this.searchInfo.optionKey) {
          const res = await commonApi.getDictionaryListByKey(this.searchInfo.optionKey)
          this.optionList = res.data.map(item => {
            return {
              ...item,
              value: item.value || item.id,
              label: item.label || item.name
            }
          })
        } else if (this.searchInfo.treeKey) {
          const res = await commonApi.getDictionaryTreeByKey(this.searchInfo.optionKey)
          this.optionList = res.data
        }
      } else {
        this.optionList = commonOption[1]
      }
    }
  }
}
</script>
