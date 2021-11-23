<template>
  <div class="common-tag">
    <el-tag
      v-for="(tag, index) in dataList"
      :key="index"
      closable
      :disable-transitions="false"
      @close="handleClose(tag)"
    >
      {{ tag }}
    </el-tag>
    <el-input
      v-if="inputVisible"
      ref="saveTagInput"
      v-model="inputValue"
      class="input-new-tag"
      size="small"
      @keyup.enter.native="handleInputConfirm"
      @blur="handleInputConfirm"
    />
    <el-button
      v-else
      class="button-new-tag"
      size="small"
      @click="showInput"
    >新增</el-button>
  </div>
</template>
<script>
export default {
  name: 'CommonTag',
  components: {},
  props: {
    dataList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      inputVisible: false,
      inputValue: ''
    }
  },
  computed: {
  },
  mounted() {
  },
  methods: {
    handleClose(tag) {
      this.dataList.splice(this.dataList.indexOf(tag), 1)
    },

    showInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    handleInputConfirm() {
      const inputValue = this.inputValue
      if (inputValue) {
        this.dataList.push(inputValue)
      }
      this.inputVisible = false
      this.inputValue = ''
    }
  }
}
</script>
<style lang="scss" scoped>
  @import '@/assets/style/mixin.scss';
.common-tag {
  .el-tag {
    margin-right: 10px;
  }
  .button-new-tag {
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    vertical-align: bottom;
  }
}
</style>
