<template>
  <div class="flow-menu" ref="tool">
    <div v-for="(menu,index)  in  menuList" :key="menu.id">
      <span class="ef-node-pmenu" @click="openMenu(menu, index)">
        <el-radio v-model="projectDicId" :label="menu.id">{{menu.name}}</el-radio>
        <i style="padding-left: 30px"  :class="{'el-icon-caret-bottom': menu.open,'el-icon-caret-right': !menu.open}"></i>
      </span>
      <ul v-show="menu.open" class="ef-node-menu-ul">
        <draggable @end="end" @start="move" v-model="menu.children" :options="draggableOptions">
          <li v-for="subMenu in menu.children" class="ef-node-menu-li" :title="subMenu.type" :key="subMenu.id" :type="subMenu.type">
            {{subMenu.name}}
          </li>
        </draggable>
      </ul>
    </div>
  </div>
</template>
<script>
import draggable from 'vuedraggable'

var mousePosition = {
  left: -1,
  top: -1
}

export default {
  props: {
    menuList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      activeNames: '1',
      // draggable配置参数参考 https://www.cnblogs.com/weixin186/p/10108679.html
      draggableOptions: {
        preventOnFilter: false,
        sort: false,
        disabled: false,
        ghostClass: 'tt',
        // 不使用H5原生的配置
        forceFallback: true,
        // 拖拽的时候样式
        // fallbackClass: 'flow-node-draggable'
      },
      // 默认打开的左侧菜单的id
      defaultOpeneds: [],
      nodeMenu: {},
      projectDicId: '',
      lastIndex: 0
    }
  },
  components: {
    draggable
  },
  created() {
    /**
     * 以下是为了解决在火狐浏览器上推拽时弹出tab页到搜索问题
     * @param event
     */
    if (this.isFirefox()) {
      document.body.ondrop = function (event) {
        // 解决火狐浏览器无法获取鼠标拖拽结束的坐标问题
        mousePosition.left = event.layerX
        mousePosition.top = event.clientY - 50
        event.preventDefault();
        event.stopPropagation();
      }
    }
  },
  mounted () {
    if (this.menuList.length > 0) {
      this.projectDicId = this.menuList[0].id
      this.changeVal(this.projectDicId)
    }
  },
  methods: {
    // 根据类型获取左侧菜单对象
    getMenuByType(type) {
      for (let i = 0; i < this.menuList.length; i++) {
        let children = this.menuList[i].children;
        for (let j = 0; j < children.length; j++) {
          if (children[j].type === type) {
            return children[j]
          }
        }
      }
    },
    // 拖拽开始时触发
    move(evt, a, b, c) {
      var type = evt.item.attributes.type.nodeValue
      this.nodeMenu = this.getMenuByType(type)
    },
    // 拖拽结束时触发
    end(evt, e) {
      this.$emit('addNode', evt, this.nodeMenu, mousePosition)
    },
    // 是否是火狐浏览器
    isFirefox() {
      var userAgent = navigator.userAgent
      if (userAgent.indexOf("Firefox") > -1) {
        return true
      }
      return false
    },
    openMenu(menu, index) {
      if (this.lastIndex !== index) {
        this.menuList[this.lastIndex].open = false
        this.changeVal(menu.id)
      }
      this.lastIndex = index
      this.projectDicId = menu.id
      menu.open = !menu.open
      this.$forceUpdate()
    },
    changeVal(val) {
      this.$get('/datacenter/metadata/getEasyFlowTableRelation/' + val).then(res => {
        this.$emit('dataReload', res.data, val)
      })
    }
  }
}
</script>
