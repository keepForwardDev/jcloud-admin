<template>
  <div class="el-transfer-panel el-transfer-panel1">
    <p class="el-transfer-panel__header">
      <el-checkbox :indeterminate="isIndeterminate" v-model="allChecked" @change="changeAll" :disabled="listData.length === 0">{{title}}<span>{{checkPercent}}</span></el-checkbox>
    </p>
    <div class="el-transfer-panel__body1 is-with-footer">
      <el-input
        clearable
        class="el-transfer-panel__filter"
        size="small"
        placeholder="请输入搜索内容"
        prefix-icon="el-icon-search"
        @input="filterMatch"
        v-model="filterText">
      </el-input>
      <el-checkbox-group class="el-transfer-panel__list1 is-filterable" v-model="checkDatas" @change="checkAll">
        <el-checkbox v-for="(table,index) in listData"  v-if="table.show === undefined ? true : table.show" :label="index" :key="index" class="el-transfer-panel__item">{{table[props.name]}}[{{table[props.label]}}]</el-checkbox>
      </el-checkbox-group>
      <p class="el-transfer-panel__empty" v-show="noMatch">无匹配数据</p>
      <p class="el-transfer-panel__empty" v-show="listData.length == 0">无数据</p>
    </div>

    <div class="el-transfer-panel__footer" v-if="showFooter">
      <el-input
        class="input-new-tag"
        v-if="selectTableRegexVisible"
        v-model="selectTableRegexValue"
        ref="selectInput"
        size="small"
        placeholder="请输入匹配表名的正则"
        @keyup.enter.native="handleSelectInputConfirm"
        @blur="handleSelectInputConfirm"
      >
      </el-input>
      <el-button v-else class="button-new-tag" size="small" @click="showSelectInput">+ 正则匹配</el-button>
      <div class="tab-wrap">
        <el-tag
          class="regTags"
          v-for="(tag,index) in tableRegex"
          :key="tag"
          closable
          @close="tableRegex.splice(index, 1)"
          :type="tag">
          {{tag}}
        </el-tag>

      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'transfer',
  data() {
    return {
      filterText: '',
      checkDatas: [],
      noMatch: false,
      allChecked: false,
      selectTableRegexValue: '',
      selectTableRegexVisible: false
    }
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    listData: {
      type: Array,
      default: () => {
        return []
      }
    },
    props: {
      type: Object,
      default: () => {
        return {
          label: 'tableName',
          name: 'remarks',
          value: 'value'
        }
      }
    },
    showFooter: {
      type: Boolean,
      default: false
    },
    tableRegex: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  computed: {
    checkPercent() {
      const total = this.listData.length
      if (total== 0) {
        return 0;
      } else {
        return this.checkDatas.length + '/' + total
      }
    },
    isIndeterminate() {
      return this.checkDatas.length != this.listData.length && this.checkDatas.length > 0
    }
  },
  methods: {
    checkboxChange(val) {
    },
    changeAll(val) {
      this.checkDatas = []
      if (val) {
        let index = 0
        this.listData.forEach(item => {
          this.checkDatas.push(index)
          index++
        })
      }
    },
    checkAll(val) {
      if (this.checkDatas.length === this.listData.length && this.checkDatas.length > 0) {
        this.allChecked = true
      } else {
        this.allChecked = false
      }
    },
    filterMatch() {
      if (!this.filterText) {
        this.listData.forEach(item => {
          item.show = true
        })
      } else {
        this.listData.forEach(item => {
          const str = item[this.props.label] + item[this.props.name]
          if (str.indexOf(this.filterText) < 0) {
            item.show = false
          } else {
            item.show = true
          }
        })
      }
    },
    handleSelectInputConfirm() {
      let inputValue = this.selectTableRegexValue;
      if (inputValue) {
        this.tableRegex.push(inputValue);
      }
      this.selectTableRegexVisible = false;
      this.selectTableRegexValue = '';
    },
    showSelectInput() {
      this.selectTableRegexVisible = true
      this.$nextTick(_ => {
        this.$refs.selectInput.$refs.input.focus();
      });
    }
  },
  watch: {
    checkDatas: {
      handler(newValue,oldValue){
        this.$emit('disableBtn')
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  .el-transfer-panel__body1 {
    height: 500px;
  }

  .el-transfer-panel__body1.is-with-footer {
    padding-bottom: 60px;
  }

  .el-transfer-panel__list1.is-filterable {
    height: 500px;
    padding-top: 0;
  }

  .el-transfer-panel__list1 {
    margin: 0;
    padding: 6px 0;
    list-style: none;
    height: 50%;
    overflow: auto;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }

  .el-transfer-panel1 {
    width: 300px;
  }

  .el-transfer-panel__footer {
    height: 100px;
    /*overflow: auto;*/
  }

  .button-new-tag {
    width: 100%;
  }
  .regTags {
    margin: 10px
  }
  .tab-wrap{
    max-height: 68px;
    overflow: auto;
  }
</style>
