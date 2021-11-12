<template>
  <div class="formWrapper">
    <div class="el-transfer" style="text-align: left; display: inline-block;">
      <transfer ref="originTable" title="该数据源的表" :listData="allTables" v-on:disableBtn="disableBtn"></transfer>
      <div class="el-transfer__buttons">
        <div>
          <el-button type="primary" class="el-transfer__button" @click="moveToRight(0)" :disabled="rightBtnDisabled">
            <i class="el-icon-arrow-right"></i>
          </el-button>
        </div>
        <div>
          <el-button type="primary" class="el-transfer__button" @click="moveToLeft" :disabled="leftBtnDisabled">
            <i class="el-icon-arrow-left"></i>
          </el-button>
        </div>
        <div>
          <el-button type="primary" class="el-transfer__button" @click="moveToRight(1)" :disabled="rightBtnDisabled">
            <i class="el-icon-delete"></i>
          </el-button>
        </div>
      </div>

      <transfer ref="selectTable" title="已选择表" :listData="formData.includeTables" v-on:disableBtn="disableBtn" :tableRegex="formData.includeRegex" showFooter></transfer>

      <div class="el-transfer__buttons"></div>

      <transfer ref="ignoreTable" title="已忽略表" :listData="formData.excludeTables" v-on:disableBtn="disableBtn"  :tableRegex="formData.excludeRegex"  showFooter></transfer>

      <div class="step-control">
        <el-button type="primary" icon="el-icon-arrow-left" @click="lastStep" style="float: left">上一步</el-button>
        <el-button type="primary"  style="float: right" @click="nextStep">下一步<i class="el-icon-arrow-right el-icon--right"></i></el-button>
      </div>

    </div>
  </div>
</template>
<script>
import transfer from './transfer'
export default {
  name: 'taskInfo',
  components: {
    transfer
  },
  props: {
    formData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      allTables: [],
      rightBtnDisabled: true,
      leftBtnDisabled: true
    }
  },
  computed: {
  },
  created() {
    this.getTables()
  },
  methods: {
    lastStep() {
      this.$emit('lastStep')
    },
    nextStep() {
      this.$emit('nextStep')
    },
    moveToRight(val) {
      const refTable = this.$refs.originTable
      const selectTables = refTable.checkDatas
      let tmp;
      if (val) { // 忽略的表
        tmp = this.formData.excludeTables
      } else { // 已选择的表
        tmp = this.formData.includeTables
      }

      let deleteCount = 0
      selectTables.sort()
      selectTables.forEach(index => {
        tmp.push(this.allTables[index - deleteCount])
        this.allTables.splice(index - deleteCount, 1)
        deleteCount++
      })
      this.$refs.originTable.checkDatas = []
      refTable.checkAll()
    },
    moveToLeft() {
      const refSelectedTable = this.$refs.selectTable
      const refIgnoreTable = this.$refs.ignoreTable
      const selectedTables = refSelectedTable.checkDatas
      const ignoreTables = refIgnoreTable.checkDatas
      let deleteCount1 = 0
      selectedTables.sort()
      ignoreTables.sort()
      selectedTables.forEach(index => {
        this.allTables.splice(0, 0, this.formData.includeTables[index - deleteCount1])
        this.formData.includeTables.splice(index - deleteCount1, 1)
        deleteCount1++
      })
      let deleteCount2 = 0
      ignoreTables.forEach(index => {
        this.allTables.splice(0, 0, this.formData.excludeTables[index - deleteCount2])
        this.formData.excludeTables.splice(index - deleteCount2, 1)
        deleteCount2++
      })
      refSelectedTable.checkDatas = []
      refIgnoreTable.checkDatas = []
      refSelectedTable.checkAll()
      refIgnoreTable.checkAll()
    },
    disableBtn() {
      if (this.$refs.originTable) {
        this.rightBtnDisabled = this.$refs.originTable.checkDatas.length === 0
      }
      if (this.$refs.selectTable) {
        const value = this.$refs.selectTable.checkDatas.length + this.$refs.ignoreTable.checkDatas.length
        this.leftBtnDisabled = value === 0
      }
    },
    lastStep() {
      this.formData.includeTables = []
      this.formData.includeRegex = []
      this.formData.excludeRegex = []
      this.formData.excludeTables = []
      this.$emit('lastStep')
    },
    nextStep() {
      this.formData.fetchTableName = false
      this.$emit('nextStep')
    },
    getTables() {
      this.$postJson('/datacenter/metadata/getTableModels', this.formData).then(res => {
        this.allTables = res.data
        this.formData.includeTables = res.reserveData.includeTables
        this.formData.includeRegex = res.reserveData.includeRegex
        this.formData.excludeRegex = res.reserveData.excludeRegex
        this.formData.excludeTables = res.reserveData.excludeTables
      })
    }
  }
}
</script>
<style lang="less" scoped>
  .formWrapper {
    display: flex;
    justify-content: center;
    padding-top: 20px;
    max-height: 100%;
  }

  .step-control {
    padding-top: 20px;
  }

</style>
