<template>
  <div class="table-aside">
    <div style="display: flex;height: calc(100vh - 200px);">
      <el-scrollbar class="project-table">
        <div>
          <node-menu @addNode="addNode" v-on:dataReload="dataReload" ref="nodeMenu" :menuList="tableList"></node-menu>
        </div>
      </el-scrollbar>
      <el-scrollbar>
        <div id="efContainer1" ref="efContainer" v-flowDrag v-if="easyFlowVisible">
          <template v-for="node in data.nodeList">
            <flow-node
              :id="node.id"
              :key="node.id"
              :node="node"
              :activeElement="activeElement"
              @changeNodeSite="changeNodeSite"
              @nodeRightMenu="nodeRightMenu"
              @clickNode="clickNode"
            >
            </flow-node>
          </template>
        </div>
      </el-scrollbar>
    </div>

    <el-dialog title="编辑信息" :visible.sync="dialogFormVisible">
      <el-form :model="node" ref="dataForm" label-width="80px" v-show="activeElement.type === 'node'">
        <el-form-item label="表名">
          <el-input v-model="node.type" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="node.name" :disabled="!node.id" ></el-input>
        </el-form-item>
        <el-form-item label="left坐标">
          <el-input v-model="node.left" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="top坐标">
          <el-input v-model="node.top" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="ico图标">
          <el-input v-model="node.ico" :disabled="!node.id"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-check" @click="repaintEverything">保存</el-button>
        </el-form-item>
      </el-form>

      <el-form :model="node" ref="dataForm" label-width="80px" v-show="activeElement.type === 'line'">
        <el-form-item label="条件">
          <el-input v-model="node.label"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-check" @click="setLineLabel(node.from, node.to, node.label)">保存</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import '@/components/easy-flow/index.css'
import draggable from 'vuedraggable'
// import { jsPlumb } from 'jsplumb'
// 使用修改后的jsplumb
import '@/components/easy-flow/jsplumb'
import { easyFlowMixin } from '@/components/easy-flow/mixins'
import flowNode from '@/components/easy-flow/node'
import nodeMenu from '@/views/metadata/components/project-node-menu'
import FlowInfo from '@/components/easy-flow/info'
import FlowHelp from '@/components/easy-flow/help'
import FlowNodeForm from '@/components/easy-flow/node_form'
import lodash from 'lodash'
export default {
  props: {
    // 数据
    dataList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  computed: {
    tableList() {
      const result = []
      this.dataList.forEach(item => {
        const array = []
        const obj = {
          id: item.id + '',
          type: 'group',
          name: item.name,
          ico: 'el-icon-video-play',
          open: false,
          children: array
        }
        item.tables.forEach(it => {
          array.push({
            id: it.id,
            dataSourceInfoId: it.dataSourceInfoId,
            type: it.dataSourceTableName + '#' + it.dataSourceInfoId,
            name: it.tableName ? it.tableName : it.dataSourceTableName,
            ico: 'fa fa-arrows',
            // 自定义覆盖样式
            style: {}
          })
        })
        result.push(obj)
      })
      return result
    }
  },
  data() {
    return {
      // jsPlumb 实例
      jsPlumb: null,
      // 控制画布销毁
      easyFlowVisible: true,
      // 控制流程数据显示与隐藏
      flowInfoVisible: false,
      // 是否加载完毕标志位
      loadEasyFlowFinish: false,
      flowHelpVisible: false,
      // 激活的元素、可能是节点、可能是连线
      activeElement: {
        // 可选值 node 、line
        type: undefined,
        // 节点ID
        nodeId: undefined,
        // 连线ID
        sourceId: undefined,
        targetId: undefined
      },
      data: {
        nodeList: [],
        lineList: []
      },
      zoom: 0.5,
      node: {},
      dialogFormVisible: false,
      projectDicId: ''
    }
  },
  // 一些基础配置移动该文件中
  mixins: [easyFlowMixin],
  components: {
    draggable, flowNode, nodeMenu, FlowInfo, FlowNodeForm, FlowHelp
  },
  directives: {
    'flowDrag': {
      bind(el, binding, vnode, oldNode) {
        if (!binding) {
          return
        }
        el.onmousedown = (e) => {
          if (e.button == 2) {
            // 右键不管
            return
          }
          //  鼠标按下，计算当前原始距离可视区的高度
          let disX = e.clientX
          let disY = e.clientY
          el.style.cursor = 'move'

          document.onmousemove = function (e) {
            // 移动时禁止默认事件
            e.preventDefault()
            const left = e.clientX - disX
            disX = e.clientX
            el.scrollLeft += -left

            const top = e.clientY - disY
            disY = e.clientY
            el.scrollTop += -top
          }

          document.onmouseup = function (e) {
            el.style.cursor = 'auto'
            document.onmousemove = null
            document.onmouseup = null
          }
        }
      }
    }
  },
  mounted() {
    this.jsPlumb = jsPlumb.getInstance()
  },
  methods: {
    // 返回唯一标识
    getUUID() {
      return Math.random().toString(36).substr(3, 10)
    },
    jsPlumbInit() {
      this.jsPlumb.ready(() => {
        // 导入默认配置
        this.jsPlumb.importDefaults(this.jsplumbSetting)
        // 会使整个jsPlumb立即重绘。
        this.jsPlumb.setSuspendDrawing(false, true);
        // 初始化节点
        this.loadEasyFlow()
        // 单点击了连接线, https://www.cnblogs.com/ysx215/p/7615677.html
        this.jsPlumb.bind('click', (conn, originalEvent) => {
          this.activeElement.type = 'line'
          this.activeElement.sourceId = conn.sourceId
          this.activeElement.targetId = conn.targetId
          this.node = {
            from: conn.sourceId,
            to: conn.targetId,
            label: conn.getLabel()
          }
          this.$emit('enableBtn')
        })
        // 连线
        this.jsPlumb.bind("connection", (evt) => {
          let from = evt.source.id
          let to = evt.target.id
          if (this.loadEasyFlowFinish) {
            this.data.lineList.push({from: from, to: to})
          }
        })

        // 删除连线回调
        this.jsPlumb.bind("connectionDetached", (evt) => {
          this.deleteLine(evt.sourceId, evt.targetId)
        })

        // 改变线的连接节点
        this.jsPlumb.bind("connectionMoved", (evt) => {
          this.changeLine(evt.originalSourceId, evt.originalTargetId)
        })

        // 连线右击
        this.jsPlumb.bind("contextmenu", (evt) => {
          console.log('contextmenu', evt)
        })

        // 连线
        this.jsPlumb.bind("beforeDrop", (evt) => {
          let from = evt.sourceId
          let to = evt.targetId
          if (from === to) {
            this.$message.error('节点不支持连接自己')
            return false
          }
          if (this.hasLine(from, to)) {
            this.$message.error('该关系已存在,不允许重复创建')
            return false
          }
          if (this.hashOppositeLine(from, to)) {
            this.$message.error('不支持两个节点之间连线回环');
            return false
          }
          this.$message.success('连接成功')
          return true
        })

        // beforeDetach
        this.jsPlumb.bind("beforeDetach", (evt) => {
          console.log('beforeDetach', evt)
        })
        this.jsPlumb.setContainer(this.$refs.efContainer)
      })
    },
    // 加载流程图
    loadEasyFlow() {
      this.jsPlumb.deleteConnectionsForElement()
      // 初始化节点
      for (var i = 0; i < this.data.nodeList.length; i++) {
        let node = this.data.nodeList[i]
        // 设置源点，可以拖出线连接其他节点
        this.jsPlumb.makeSource(node.id, lodash.merge(this.jsplumbSourceOptions, {}))
        // // 设置目标点，其他源点拖出的线可以连接该节点
        this.jsPlumb.makeTarget(node.id, this.jsplumbTargetOptions)
        if (!node.viewOnly) {
          this.jsPlumb.draggable(node.id, {
            containment: 'parent',
            stop: function (el) {
              // 拖拽节点结束后的对调
              console.log('拖拽结束: ', el)
            }
          })
        }
      }
      // 初始化连线
      for (var i = 0; i < this.data.lineList.length; i++) {
        let line = this.data.lineList[i]
        var connParam = {
          source: line.from,
          target: line.to,
          label: line.label ? line.label : '',
          connector: line.connector ? line.connector : '',
          anchors: line.anchors ? line.anchors : undefined,
          paintStyle: line.paintStyle ? line.paintStyle : undefined,
        }
        this.jsPlumb.connect(connParam, this.jsplumbConnectOptions)
      }
      this.$nextTick(function () {
        this.loadEasyFlowFinish = true
      })
    },
    // 设置连线条件
    setLineLabel(from, to, label) {
      var conn = this.jsPlumb.getConnections({
        source: from,
        target: to
      })[0]
      if (!label || label === '') {
        conn.removeClass('flowLabel')
        conn.addClass('emptyFlowLabel')
      } else {
        conn.addClass('flowLabel')
      }
      conn.setLabel({
        label: label,
      })
      this.data.lineList.forEach(function (line) {
        if (line.from == from && line.to == to) {
          line.label = label
        }
      })
      this.dialogFormVisible = false
    },
    // 删除激活的元素
    deleteElement() {
      if (this.activeElement.type === 'node') {
        this.deleteNode(this.activeElement.nodeId)
      } else if (this.activeElement.type === 'line') {
        this.$confirm('确定删除所点击的线吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          var conn = this.jsPlumb.getConnections({
            source: this.activeElement.sourceId,
            target: this.activeElement.targetId
          })[0]
          this.jsPlumb.deleteConnection(conn)
        }).catch(() => {
        })
      }
    },
    // 删除线
    deleteLine(from, to) {
      this.data.lineList = this.data.lineList.filter(function (line) {
        if (line.from == from && line.to == to) {
          return false
        }
        return true
      })
      this.activeElement.type = ''
      this.activeElement.nodeId = ''
    },
    // 改变连线
    changeLine(oldFrom, oldTo) {
      this.deleteLine(oldFrom, oldTo)
    },
    // 改变节点的位置
    changeNodeSite(data) {
      for (var i = 0; i < this.data.nodeList.length; i++) {
        let node = this.data.nodeList[i]
        if (node.id === data.nodeId) {
          node.left = data.left
          node.top = data.top
        }
      }
    },
    /**
     * 拖拽结束后添加新的节点
     * @param evt
     * @param nodeMenu 被添加的节点对象
     * @param mousePosition 鼠标拖拽结束的坐标
     */
    addNode(evt, nodeMenu, mousePosition) {
      var screenX = evt.originalEvent.clientX, screenY = evt.originalEvent.clientY
      let efContainer = this.$refs.efContainer
      var containerRect = efContainer.getBoundingClientRect()
      var left = screenX, top = screenY
      // 计算是否拖入到容器中
      if (left < containerRect.x || left > containerRect.width + containerRect.x || top < containerRect.y || containerRect.y > containerRect.y + containerRect.height) {
        this.$message.error("请把节点拖入到画布中")
        return
      }
      left = left - containerRect.x + efContainer.scrollLeft
      top = top - containerRect.y + efContainer.scrollTop
      // 居中
      left -= 85
      top -= 16
      var nodeId = nodeMenu.type
      const filterTable = this.data.nodeList.filter(item => item.type === nodeMenu.type)
      if (filterTable.length > 0) {
        this.$message.error("该节点已存在画布中！")
        return
      }
      var node = {
        id: nodeId,
        name: nodeMenu.name,
        dataSourceInfoId: nodeMenu.dataSourceInfoId,
        type: nodeId,
        left: left + 'px',
        top: top + 'px',
        ico: nodeMenu.ico,
        state: 'success'
      }
      /**
       * 这里可以进行业务判断、是否能够添加该节点
       */
      this.data.nodeList.push(node)
      this.$nextTick(function () {
        this.jsPlumb.makeSource(nodeId, this.jsplumbSourceOptions)
        this.jsPlumb.makeTarget(nodeId, this.jsplumbTargetOptions)
        this.jsPlumb.draggable(nodeId, {
          containment: 'parent',
          stop: function (el) {
            // 拖拽节点结束后的对调
            console.log('拖拽结束: ', el)
          }
        })
      })
    },
    /**
     * 删除节点
     * @param nodeId 被删除节点的ID
     */
    deleteNode(nodeId) {
      this.$confirm('确定要删除所选节点', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        /**
         * 这里需要进行业务判断，是否可以删除
         */
        this.data.nodeList = this.data.nodeList.filter(function (node) {
          if (node.id === nodeId) {
            // 伪删除，将节点隐藏，否则会导致位置错位
            // node.show = false
            return false
          }
          return true
        })
        this.$nextTick(function () {
          this.jsPlumb.removeAllEndpoints(nodeId);
        })
        this.activeElement.type = ''
        this.activeElement.nodeId = ''
      }).catch(() => {
      })
      return true
    },
    clickNode(nodeId) {
      this.activeElement.type = 'node'
      this.activeElement.nodeId = nodeId
      this.$emit('enableBtn')
      this.data.nodeList.filter((node) => {
        if (node.id === nodeId) {
          this.node = node
        }
      })
    },
    // 是否具有该线
    hasLine(from, to) {
      for (var i = 0; i < this.data.lineList.length; i++) {
        var line = this.data.lineList[i]
        if (line.from === from && line.to === to) {
          return true
        }
      }
      return false
    },
    // 是否含有相反的线
    hashOppositeLine(from, to) {
      return this.hasLine(to, from)
    },
    nodeRightMenu(nodeId, evt) {
      this.menu.show = true
      this.menu.curNodeId = nodeId
      this.menu.left = evt.x + 'px'
      this.menu.top = evt.y + 'px'
    },
    repaintEverything() {
      this.jsPlumb.repaint()
      this.dialogFormVisible = false
    },
    // 流程数据信息
    dataInfo() {
      this.flowInfoVisible = true
      this.$nextTick(function () {
        this.$refs.flowInfo.init()
      })
    },
    // 加载流程图
    dataReload(val, projectDicId) {
      this.data.lineList = val.lineList
      this.data.nodeList = val.nodeList
      this.easyFlowVisible = false
      this.projectDicId = projectDicId
      this.$nextTick(() => {
        // data = lodash.cloneDeep(data)
        this.easyFlowVisible = true
        // this.data = data
        this.$nextTick(() => {
          this.jsPlumb = jsPlumb.getInstance()
          this.$nextTick(() => {
            this.jsPlumbInit()
          })
        })
      })
    },
    zoomAdd() {
      if (this.zoom >= 1) {
        return
      }
      this.zoom = this.zoom + 0.1
      this.$refs.efContainer.style.transform = `scale(${this.zoom})`
      this.jsPlumb.setZoom(this.zoom)
    },
    zoomSub() {
      if (this.zoom <= 0) {
        return
      }
      this.zoom = this.zoom - 0.1
      this.$refs.efContainer.style.transform = `scale(${this.zoom})`
      this.jsPlumb.setZoom(this.zoom)
    },
    saveData() {
      this.$postJson('/datacenter/metadata/saveEasyFlow/' + this.projectDicId, this.data).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .table-aside {
    border-right: 1px solid #dce3e8;
    ::v-deep .el-scrollbar__wrap {
      overflow-x: hidden !important;
    }
  }

  .relation-container {
    ::v-deep .el-container {
      overflow-x: hidden !important;
    }
  }

  #efContainer1 {
    position: relative;
    width: 3000px;
    height: 3000px;
  }
  .project-table {
    width: 450px;
    border-right: 1px solid #dce3e8;
    height: calc(100vh - 200px);
  }
</style>
