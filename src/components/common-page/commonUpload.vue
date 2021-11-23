<template>
  <div class="common-upload" :class="{'is-row':isShowImageList,'is-col':isShowFileList}">
    <div v-if="isShowFileList" class="common-upload-file">
      <div v-for="(item, index) in fileList" :key="index" class="file-item">
        <i class="file-item-icon el-icon-link" />
        <span class="file-item-name">{{ item.name }}</span>
        <i class="file-item-delete el-icon-close" @click="deleteFile(item,index)" />
      </div>
    </div>
    <div v-if="isShowImageList" class="common-upload-image">
      <div v-for="(item, index) in fileList" :key="index" class="image-item" :style="{'width':imageWidth, 'height':imageHeight}">
        <img :src="item.url">
        <i class="image-item-delete el-icon-close" @click="deleteFile(item,index)" />
      </div>
    </div>
    <div v-if="isShowUploadButton" class="common-upload-wrapper">
      <el-upload :multiple="isMultiple" action="/upload/singleFile" :auto-upload="!isAsyncUpload" :before-upload="beforeUpload" :on-success="onSuccessUpload" :on-error="onErrorUpload" :show-file-list="false" :accept="acceptFileType" :on-change="onChangeUpload">
        <button v-if="showType ==='image'" class="common-upload-button">
          <i class="common-upload-icon el-icon-plus" />
          <span>{{ operationText }}</span>
        </button>
        <el-button v-if="showType==='file'" icon="el-icon-upload2">{{ operationText }}</el-button>
      </el-upload>
      <span class="common-upload-tip">{{ activeTip }}</span>
    </div>
  </div>
</template>
<script>
import { validFileLimit, validFileSize, validFileType } from '@/libs/util.js'
import { fileTypeMap } from '@/consts/commonOptionList.js'
export default {
  name: 'CommonUpload',
  props: {
    fileList: {
      type: Array,
      default: () => {
        return []
      }
    },
    showType: {
      type: String,
      default: 'image'
    },
    tip: {
      type: String,
      default: ''
    },
    uploadUrl: {
      type: String,
      default: ''
    },
    isAsyncUpload: {
      type: Boolean,
      default: true
    },
    limit: {
      type: Number,
      default: 1
    },
    maxSize: {
      type: Number,
      default: 5
    },
    acceptFileType: {
      type: String,
      default: 'image/gif,image/jpg,image/jpeg,image/png,.pdf'
    },
    operationText: {
      type: String,
      default: '上传文件'
    },
    imageWidth: {
      type: String,
      default: '100px'
    },
    imageHeight: {
      type: String,
      default: '100px'
    },
    formData: { // 表单信息
      type: Object,
      default: () => {
        return {}
      }
    },
    formDataKey: {
      type: String,
      default: ''
    }
  },
  mounted () {
    if (this.formData[this.formDataKey]) {
      const array = this.formData[this.formDataKey].split(',')
      for (let i = 0; i < array.length; i++) {
        this.fileList.push({
          name: array[i].substring(array[i].lastIndexOf('/') + 1, array[i].length),
          url: array[i].indexOf('http') !== -1 ? array[i] : (location.origin + array[i])
        })
      }
    }
  },
  data () {
    return {
      tempImageList: []
    }
  },
  computed: {
    isShowFileList () {
      return !!this.fileList.length && !this.isShowImageList
    },
    isShowImageList () {
      return !!this.fileList.length && this.showType === 'image'
    },
    isShowUploadButton () {
      return this.fileList.length < this.limit
    },
    isMultiple () {
      return this.limit > 1
    },
    activeFileType () {
      return fileTypeMap.get(this.acceptFileType) || []
    },
    activeTip () {
      return this.tip || `仅支持${this.activeFileType.join(',')}文件格式上传，大小不超过${this.maxSize}M`
    }
  },
  methods: {
    deleteFile (file, index) {
      this.fileList.splice(index, 1)
      this.formData[this.formDataKey] = this.fileList.map(item => item.url).join(',')
      this.$message.success('删除成功！')
    },
    async beforeUpload (file) {
      const isValidType = await validFileType([file], this.activeFileType)
      const isValidLimit = await validFileLimit([...this.fileList, file], this.limit)
      const isValidSize = await validFileSize([file], this.maxSize)
      return Promise.all([isValidType, isValidLimit, isValidSize])
    },
    async onChangeUpload (file, fileList) {
      if (!this.isAsyncUpload) return
      await this.beforeUpload(file).then(async () => {
        this.formatImageUrl(file)
      }).catch(() => { })
    },
    formatImageUrl (file) {
      if (!file.raw.type.includes('image')) return
      const tempImage = {}
      tempImage.name = file.name
      tempImage.url = URL.createObjectURL(file.raw)
      tempImage.type = 'image'
      this.fileList.push(tempImage)
    },
    onSuccessUpload (res) {
      if (this.isAsyncUpload) return
      if (res.code !== 1) return this.$message.error('上传失败..请重试！')
      this.$message.success('上传成功！')
      this.fileList.push({
        name: res.data.fileName,
        url: res.data.fileUrl
      })
      this.formData[this.formDataKey] = this.fileList.map(item => item.url).join(',')
    },
    onErrorUpload () {
      this.$message.error('上传失败..请重试！')
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/assets/style/variables.scss';
@import '@/assets/style/mixin.scss';
.common-upload {
  &.is-col {
    @include columnLeft;
  }
  &.is-row {
    @include left;
  }
  &-wrapper {
    @include left;
  }
  &-file {
    @include columnLeft;
    gap: 10px;
    margin-bottom: 10px;
    .file-item {
      @include left;
      padding: 0 12px;
      color: $primaryTextColor;
      width: 100%;
      height: 30px;
      line-height: 30px;
      background: #f5f5f5;
      border-radius: 4px;
      font-size: 14px;
      &-icon {
        margin-right: 6px;
      }
      &-name {
        flex: 1;
      }
      &-delete {
        margin-left: 12px;
        @include hoverOpacity;
      }
    }
  }
  &-image {
    @include left;
    gap: 20px;
    margin-right: 10px;
    .image-item {
      position: relative;
      width: 100px;
      height: 100px;
      @include center;
      img {
        width: 100%;
        height: 100%;
        border-radius: 4px;
        border: 1px solid #dbdbdb;
      }
      &-delete {
        font-size: 16px;
        position: absolute;
        top: 4px;
        right: 4px;
        @include hoverOpacity;
        color: #dbdbdb;
      }
    }
  }
  .el-button {
    color: $primaryTextColor;
  }
  &-button {
    width: 100px;
    height: 100px;
    background: #f5f5f5;
    border: 1px dashed #dbdbdb;
    border-radius: 4px;
    @include columnCenter;
    font-size: 14px;
    color: #666;
    line-height: 20px;
    @include hoverOpacity;
  }
  &-icon {
    font-size: 20px;
    margin-bottom: 6px;
  }
  &-tip {
    margin-left: 20px;
    line-height: 20px;
    font-size: 14px;
    color: #cccccc;
  }
}
</style>
