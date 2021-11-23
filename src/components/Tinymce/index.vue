<template>
  <div class="tinymce-container editor-container" :class="{ fullscreen: fullscreen }" v-loading="loading">
    <textarea class="tinymce-textarea" :id="id" placeholder="Bhanu Pratap welcomes you, please enter some text here...."></textarea>
  </div>
</template>

<script>
import plugins from "./plugins"
import toolbar from "./toolbar"
import { uploadFile } from '@/api/commonapi'

/**
 * 富文本组件
 */
export default {
  name: "Tinymce",
  props: {
    id: {
      type: String,
      default: `vue-tinymce-${Date.now()}`,
    },
    value: {
      type: String,
      default: "",
    },
    toolbar: {
      type: Array,
      required: false,
      default () {
        return []
      },
    },
    menubar: {
      type: String,
      default: "file edit insert view format table",
    },
    height: {
      type: String,
      default: "300px",
    },
    uuid: {
      type: String,
      default: "",
    },
    addSaving: {
      type: Boolean,
      default: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      hasChange: false,
      hasInit: false,
      fullscreen: false,
      editBol: false,
      ifChange: false,
      ifedit: false,
      editChange: false,
      tempContent: "",
      haveChanging: false,
      accept: ".jpg,.jpeg,.png",
      saveChange: false,
      loading: false,
    }
  },
  watch: {
    value (val, oldval) {
      this.haveChanging = true
      if (!this.hasChange && this.hasInit) {
        this.$nextTick(() => {
          if (val) {
            this.setContent(val)
          } else {
            this.setContent("")
          }
        })
        // setTimeout(() => {
        //   if (val) {
        //     this.setContent(val);
        //   } else {
        //     this.setContent("");
        //   }
        // });
      }
    },
    uuid (val, oldval) {
      this.ifChange = false
      this.hasChange = true
      this.$emit("callContent", this.ifChange)
      this.$nextTick(() => {
        if (this.value && this.value != null) {
          this.setContent(this.value)
        } else {
          this.setContent("")
        }
        this.haveChanging = true
        this.saveChange = true
      })
    },
  },
  mounted () {
    this.$nextTick(() => {
      this.initTinymce()
    })
    // this.initTinymce()
  },
  destroyed () {
    this.destroyTinymce()
  },
  methods: {
    initTinymce () {
      const startDate = Date.now()
      this.loading = true
      const THAT = this
      const origin = window.location.origin
      window.tinymce.init({
        selector: `textarea#${this.id}`,
        height: THAT.height || "calc(100vh - 176px)",
        body_class: "panel-body",
        font_formats: "微软雅黑=微软雅黑;Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,微软雅黑,Arial,sans-serif",
        fontsize_formats: "8px 10px 12px 14px 16px 18px 24px 36px",
        object_resizing: true,
        toolbar: this.toolbar.length ? this.toolbar : toolbar,
        menubar: this.menubar,
        plugins: plugins,
        language: "zh_CN",
        end_container_on_empty_block: true,
        powerpaste_word_import: "clean",
        code_dialog_height: 450,
        code_dialog_width: 1000,
        advlist_bullet_styles: "square",
        advlist_number_styles: "default",
        imagetools_cors_hosts: ["www.tinymce.com", "codepen.io"],
        default_link_target: "_blank",
        link_title: false,
        relative_urls: false,
        readonly: THAT.readonly ? 1 : 0,
        // tinydrive_token_provider: 'URL_TO_YOUR_TOKEN_PROVIDER',
        // tinydrive_dropbox_app_key: 'YOUR_DROPBOX_APP_KEY',
        // tinydrive_google_drive_key: 'YOUR_GOOGLE_DRIVE_KEY',
        // tinydrive_google_drive_client_id: 'YOUR_GOOGLE_DRIVE_CLIENT_ID',
        // images_upload_url: '/common/upload',
        // remove_script_host:true,
        save_enablewhendirty: false,
        images_upload_handler (blobInfo, success, failure) {
          const formData = new FormData()
          formData.append("file", blobInfo.blob(), blobInfo.filename())
          uploadFile(formData).then((res) => {
            if (res.code == 1) {
              success(res.data.fileUrl.indexOf('http')!=-1?res.data.fileUrl:(origin + res.data.fileUrl))
            } else {
              THAT.$message.error("图片上传失败")
            }
          })
        },
        file_picker_callback (callback, value, meta) {
          const input = document.createElement("input")
          input.setAttribute("type", "file")
          input.onchange = function () {
            const file = this.files[0]
            const formData = new FormData()
            formData.append("file", file)
            uploadFile(formData).then((res) => {
              if (res.data.code == 1) {
                callback(origin + res.data.fileUrl)
              } else {
                THAT.$message.error("文件上传失败")
              }
            })
          }
          input.click()
        },
        save_onsavecallback (editor) {
          THAT.$emit("callsave", editor.getContent())
          THAT.haveChanging = false
          THAT.ifChange = false
        },
        init_instance_callback (editor) {
          // console.clear();
          // console.log("init_instance_callback");
          const tip = `富文本组件初始化用了 ${(Date.now() - startDate) / 1000
          } 秒`
          console.warn("init_instance_callback >>", tip)
          console.log(`%c ${tip}`, "background-color: #32D300; padding: 2px 6px; color: #fff; border-radius: 2px")
          // 初始化完成时触发一个事件给父组件
          THAT.$emit("inited", true)
          // 对应的取消加载状态
          THAT.loading = false
          if (THAT.value) {
            editor.setContent(THAT.value)
          }
          THAT.hasInit = true
          editor.on("KeyUp", ev => {
            let currKey = 0, e = ev || event || window.event
            currKey = e.keyCode || e.which || e.charCode
            if (currKey == 83 && (e.ctrlKey || e.metaKey)) {
              e.preventDefault()
              THAT.$emit("callsave", editor.getContent())
              THAT.hasChange = false
            }
          })
          editor.on("NodeChange Change KeyUp SetContent", () => {
            THAT.ifChange = true
            THAT.$emit("callContent", THAT.ifChange)
            setTimeout(() => {
              THAT.hasChange = true
              THAT.$emit("input", editor.getContent())
              if (THAT.saveChange) {
                editor.undoManager.clear()
                THAT.saveChange = false
              }
            })
          })
          editor.on("Focus", () => {
            THAT.haveChanging = false
            if (!THAT.tempContent) {
              THAT.tempContent = editor.getContent()
            }
          })
          editor.on("Blur", () => {
            if (THAT.haveChanging) {
              THAT.$emit("callsave", editor.getContent())
              THAT.haveChanging = false
              THAT.ifChange = false
            }
          })
        },
        setup (editor) {
          if (THAT.addSaving) {
            editor.ui.registry.addButton("customInsertButton", {
              text: "标注",
              icon: "sourcecode",
              tooltip: "插入标注",
              height: 500,
              onAction () {
                if (!THAT.value) {
                  THAT.$Message.info("笔记内容不能为空")
                  return
                }
                // editor.insertContent(`<br><p class = "main_insert" data-mark>${formatDate()} ${THAT.nickName}我添加的标注：</p>`);
              },
            })
          }
          editor.on("FullscreenStateChanged", (e) => {
            THAT.fullscreen = e.state
          })
          editor.on("focus", () => {
            // document.body.click()
            THAT.hasInit = true
            THAT.editBol = true
          })
        },
      })
    },
    destroyTinymce () {
      if (window.tinymce.get(this.id)) {
        window.tinymce.get(this.id).destroy()
      }
    },
    /**
     * 设置富文本内容
     * @description 暴露给父组件调用的方法
     * @param {string} value
     */
    setContent (value) {
      const tinymc = window.tinymce.get(this.id)
      // 这个插件是异步初始化的，有可能实例化了，但是对象没完成导致为 null
      // 所以这里要做一下调用处理
      try {
        tinymc.setContent(value)
      } catch (error) {
        console.warn("设置富文本内容出错 >>", error)
        console.warn("tinymc >>", tinymc)
      }
    },
    getContent () {
      window.tinymce.get(this.id).getContent()
    },
  },
};
</script>

<style scoped>
  .tinymce-container {
    position: relative;
  }
  .edit-images {
    position: absolute;
    right: 10px;
    top: 3px;
    height: 33px;
    overflow: hidden;
  }
  .tinymce-container >>> .mce-fullscreen {
    z-index: 10000;
  }
  .tinymce-textarea {
    visibility: hidden;
    z-index: -1;
  }
  .editor-custom-btn-container {
    position: absolute;
    right: 4px;
    top: 4px;
    /*z-index: 2005;*/
  }
  .fullscreen .editor-custom-btn-container {
    z-index: 10000;
    position: fixed;
  }
</style>
