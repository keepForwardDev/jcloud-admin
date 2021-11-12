<template>
  <div v-if="easyFlowVisible"
       style="height: calc(83vh);">
    <el-row>
      <!--顶部工具菜单-->
      <el-col :span="24">
        <div class="ef-tooltar">
          <el-link
            type="primary"
            :underline="false">
            {{data.name}}
          </el-link>
          <el-divider direction="vertical"></el-divider>
          <el-button
            type="text"
            icon="el-icon-delete"
            size="large"
            @click="deleteElement"
            :disabled="!this.activeElement.type">
          </el-button>
          <el-divider direction="vertical"></el-divider>
          <el-divider direction="vertical"></el-divider>
          <el-button
            type="text"
            icon="el-icon-plus"
            size="large"
            @click="zoomAdd">
          </el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button
            type="text"
            icon="el-icon-minus"
            size="large"
            @click="zoomSub">
          </el-button>
          <div style="float: right;margin-right: 5px">
            <el-button
              type="info"
              plain
              round
              icon="el-icon-back"
              @click="lastStep"
              size="mini">
              上一步
            </el-button>
            <el-button
              type="primary"
              plain
              round
              @click="saveData"
              icon="el-icon-document"
              size="mini">
              保存
            </el-button>
          </div>
        </div>
      </el-col>
    </el-row>
    <div style="display: flex;height: calc(100vh - 180px);">
      <div class="wrap-menu-lists">
        <el-scrollbar
          class="menu-scrollbar"
          ref="scrollbarMenu"
        >
          <node-menu
            @addNode="addNode"
            ref="nodeMenu"
            :menuList="tableList">
          </node-menu>
          <!-- <ul style="margin:0">
            <li v-for="item in 100" :key="item">ddfd</li>
          </ul> -->
        </el-scrollbar>

      </div>
      <div id="efContainer"
           ref="efContainer"
           class="container"
           v-flowDrag>
        <template v-for="node in data.nodeList">
          <flow-node
            :id="node.id"
            :key="node.id"
            :node="node"
            :activeElement="activeElement"
            @changeNodeSite="changeNodeSite"
            @nodeRightMenu="nodeRightMenu"
            @clickNode="clickNode">
          </flow-node>
        </template>
        <!-- 给画布一个默认的宽度和高度 -->
        <div style="position:absolute;top: 2000px;left: 2000px;">&nbsp;</div>
      </div>
      <!-- 右侧表单 -->
      <div style="width: 300px;border-left: 1px solid #dce3e8;background-color: #FBFBFB">
        <flow-node-form
          ref="nodeForm"
          @setLineLabel="setLineLabel"
          @repaintEverything="repaintEverything">
        </flow-node-form>
      </div>
    </div>
    <!-- 流程数据详情 -->
    <flow-info
      v-if="flowInfoVisible"
      ref="flowInfo"
      :data="data">
    </flow-info>
    <flow-help
      v-if="flowHelpVisible"
      ref="flowHelp">
    </flow-help>
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
import nodeMenu from '@/components/easy-flow/node_menu'
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
    },
    formData: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    tableList () {
      // const array = []
      // for (let i = 0; i < this.dataList.length; i++) {
      //   array.push({
      //     id: i,
      //     type: this.dataList[i].tableName + '#' + this.formData.dataSourceInfoId,
      //     name: this.dataList[i].remarks ? this.dataList[i].remarks : this.dataList[i].tableName,
      //     ico: 'fa fa-arrows',
      //     // 自定义覆盖样式
      //     style: {}
      //   })
      // }
      const array = this.dataList.map((item, index) => {
        return {
          id: index,
          type: item.tableName + '#' + this.formData.dataSourceInfoId,
          name: item.remarks ? item.remarks : item.tableName,
          ico: 'fa fa-arrows',
          // 自定义覆盖样式
          style: {}
        }
      })
      const obj = {
        id: '1',
        type: 'group',
        name: '表节点',
        ico: 'el-icon-video-play',
        open: true,
        children: array
      }
      return [obj]
    }
  },
  data () {
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
      zoom: 0.5
    }
  },
  // 一些基础配置移动该文件中
  mixins: [easyFlowMixin],
  components: {
    draggable, flowNode, nodeMenu, FlowInfo, FlowNodeForm, FlowHelp
  },
  directives: {
    flowDrag: {
      bind (el, binding, vnode, oldNode) {
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
  mounted () {
    this.jsPlumb = jsPlumb.getInstance()
    this.getRelation()
  },
  methods: {
    // 返回唯一标识
    getUUID () {
      return Math.random().toString(36).substr(3, 10)
    },
    jsPlumbInit () {
      this.jsPlumb.ready(() => {
        // 导入默认配置
        this.jsPlumb.importDefaults(this.jsplumbSetting)
        // 会使整个jsPlumb立即重绘。
        this.jsPlumb.setSuspendDrawing(false, true)
        // 初始化节点
        this.loadEasyFlow()
        // 单点击了连接线, https://www.cnblogs.com/ysx215/p/7615677.html
        this.jsPlumb.bind('click', (conn, originalEvent) => {
          this.activeElement.type = 'line'
          this.activeElement.sourceId = conn.sourceId
          this.activeElement.targetId = conn.targetId
          this.$refs.nodeForm.lineInit({
            from: conn.sourceId,
            to: conn.targetId,
            label: conn.getLabel()
          })
        })
        // 连线
        this.jsPlumb.bind('connection', (evt) => {
          const from = evt.source.id
          const to = evt.target.id
          if (this.loadEasyFlowFinish) {
            this.data.lineList.push({ from: from, to: to })
          }
        })

        // 删除连线回调
        this.jsPlumb.bind('connectionDetached', (evt) => {
          this.deleteLine(evt.sourceId, evt.targetId)
        })

        // 改变线的连接节点
        this.jsPlumb.bind('connectionMoved', (evt) => {
          this.changeLine(evt.originalSourceId, evt.originalTargetId)
        })

        // 连线右击
        this.jsPlumb.bind('contextmenu', (evt) => {
          console.log('contextmenu', evt)
        })

        // 连线
        this.jsPlumb.bind('beforeDrop', (evt) => {
          const from = evt.sourceId
          const to = evt.targetId
          if (from === to) {
            this.$message.error('节点不支持连接自己')
            return false
          }
          if (this.hasLine(from, to)) {
            this.$message.error('该关系已存在,不允许重复创建')
            return false
          }
          if (this.hashOppositeLine(from, to)) {
            this.$message.error('不支持两个节点之间连线回环')
            return false
          }
          this.$message.success('连接成功')
          return true
        })

        // beforeDetach
        this.jsPlumb.bind('beforeDetach', (evt) => {
          console.log('beforeDetach', evt)
        })
        this.jsPlumb.setContainer(this.$refs.efContainer)
      })
    },
    // 加载流程图
    loadEasyFlow () {
      // 初始化节点
      for (var i = 0; i < this.data.nodeList.length; i++) {
        const node = this.data.nodeList[i]
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
        const line = this.data.lineList[i]
        var connParam = {
          source: line.from,
          target: line.to,
          label: line.label ? line.label : '',
          connector: line.connector ? line.connector : '',
          anchors: line.anchors ? line.anchors : undefined,
          paintStyle: line.paintStyle ? line.paintStyle : undefined
        }
        this.jsPlumb.connect(connParam, this.jsplumbConnectOptions)
      }
      this.$nextTick(function () {
        this.loadEasyFlowFinish = true
      })
    },
    // 设置连线条件
    setLineLabel (from, to, label) {
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
        label: label
      })
      this.data.lineList.forEach(function (line) {
        if (line.from == from && line.to == to) {
          line.label = label
        }
      })
    },
    // 删除激活的元素
    deleteElement () {
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
    deleteLine (from, to) {
      this.data.lineList = this.data.lineList.filter(function (line) {
        if (line.from == from && line.to == to) {
          return false
        }
        return true
      })
      this.activeElement.type = ''
      this.activeElement.nodeId = ''
      // 清除右侧表单
      this.$refs.nodeForm.node = {}
    },
    // 改变连线
    changeLine (oldFrom, oldTo) {
      this.deleteLine(oldFrom, oldTo)
    },
    // 改变节点的位置
    changeNodeSite (data) {
      for (var i = 0; i < this.data.nodeList.length; i++) {
        const node = this.data.nodeList[i]
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
    addNode (evt, nodeMenu, mousePosition) {
      var screenX = evt.originalEvent.clientX; var screenY = evt.originalEvent.clientY
      const efContainer = this.$refs.efContainer
      var containerRect = efContainer.getBoundingClientRect()
      var left = screenX; var top = screenY
      // 计算是否拖入到容器中
      if (left < containerRect.x || left > containerRect.width + containerRect.x || top < containerRect.y || containerRect.y > containerRect.y + containerRect.height) {
        this.$message.error('请把节点拖入到画布中')
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
        this.$message.error('该节点已存在画布中！')
        return
      }
      var node = {
        id: nodeId,
        name: nodeMenu.name,
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
    deleteNode (nodeId) {
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
          this.jsPlumb.removeAllEndpoints(nodeId)
        })
        this.activeElement.type = ''
        this.activeElement.nodeId = ''
        // 清除右侧表单
        this.$refs.nodeForm.node = {}
      }).catch(() => {
      })
      return true
    },
    clickNode (nodeId) {
      this.activeElement.type = 'node'
      this.activeElement.nodeId = nodeId
      this.$refs.nodeForm.nodeInit(this.data, nodeId)
    },
    // 是否具有该线
    hasLine (from, to) {
      for (var i = 0; i < this.data.lineList.length; i++) {
        var line = this.data.lineList[i]
        if (line.from === from && line.to === to) {
          return true
        }
      }
      return false
    },
    // 是否含有相反的线
    hashOppositeLine (from, to) {
      return this.hasLine(to, from)
    },
    nodeRightMenu (nodeId, evt) {
      this.menu.show = true
      this.menu.curNodeId = nodeId
      this.menu.left = evt.x + 'px'
      this.menu.top = evt.y + 'px'
    },
    repaintEverything () {
      this.jsPlumb.repaint()
    },
    // 流程数据信息
    dataInfo () {
      this.flowInfoVisible = true
      this.$nextTick(function () {
        this.$refs.flowInfo.init()
      })
    },
    // 加载流程图
    dataReload () {
      this.easyFlowVisible = false
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
    zoomAdd () {
      if (this.zoom >= 1) {
        return
      }
      this.zoom = this.zoom + 0.1
      this.$refs.efContainer.style.transform = `scale(${this.zoom})`
      this.jsPlumb.setZoom(this.zoom)
    },
    zoomSub () {
      if (this.zoom <= 0) {
        return
      }
      this.zoom = this.zoom - 0.1
      this.$refs.efContainer.style.transform = `scale(${this.zoom})`
      this.jsPlumb.setZoom(this.zoom)
    },
    // 下载数据
    downloadData () {
      this.$confirm('确定要下载该流程数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        var datastr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.data, null, '\t'))
        var downloadAnchorNode = document.createElement('a')
        downloadAnchorNode.setAttribute('href', datastr)
        downloadAnchorNode.setAttribute('download', 'data.json')
        downloadAnchorNode.click()
        downloadAnchorNode.remove()
        this.$message.success('正在下载中,请稍后...')
      }).catch(() => {
      })
    },
    openHelp () {
      this.flowHelpVisible = true
      this.$nextTick(function () {
        this.$refs.flowHelp.init()
      })
    },
    lastStep () {
      this.$emit('lastStep')
    },
    saveData () {
      this.formData.tableRelation = this.data
      this.formData.tableInfo = this.dataList
      this.$postJson('/datacenter/metadata/saveTaskInfo', this.formData).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
          this.$emit('closeDialog')
        }
      })
    },
    getRelation () {
      if (this.formData.projectDicId) {
        this.$get('/datacenter/metadata/getEasyFlowTableRelation/' + this.formData.projectDicId).then(res => {
          if (res.code === 1) {
            this.data.nodeList = res.data.nodeList
            this.data.lineList = res.data.lineList
            this.dataReload()
          }
        })
      }
    }
  }
}
</script>
<style lang="scss">
  .menu-scrollbar{
    height: 100%;
    &::v-deep{
      .menu-scrollbar{
        .el-scrollbar__wrap{
          overflow-x: hidden;
        }
      }

    }
  }
  .wrap-menu-lists{
    width: 230px;
    border-right: 1px solid #dce3e8;
  }
</style>
