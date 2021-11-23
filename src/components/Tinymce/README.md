# 富文本组件

**当前使用 CND 方式引入使用**

nuxt 项目中使用时，`nuxt.config.js`配置文件加入：

```js
export default {
  head: {
    script: [
      { src: 'https://member.boshiyun.com.cn/pc/newtinymcepolicy/tinymce/tinymce.min.js' }
    ]
  }
}
```

非 nuxt 项目中使用：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>demo</title>
  <!-- tinymce 富文本组件 -->
  <script src="https://member.boshiyun.com.cn/pc/newtinymcepolicy/tinymce/tinymce.min.js"></script>
</head>
<body>
  ...do some
</body>
</html>
```

## 使用方式

```html
<template>
  <!-- 一个页面出现单个时，可以不需要加`id`，出现多个必选要加`id` -->
  <Tinymce height="600px" v-model="richText" ref="bs-tinymce" />
</template>

<script>
import Tinymce from '@/components/Tinymce';

export default {
  components: {
    Tinymce
  },
  data() {
    return {
      richText: ''
    }
  },
  methods: {
    /**
     * 设置富文本内容
     * @param {string} value
     */
    setTinymceRichValue(value) {
      this.$nextTick(() => {
          this.$refs['bs-tinymce'].setContent(value);
      })
    }
  }
}
</script>

```