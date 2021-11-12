<template>
  <d2-container>
    <el-container>
      <el-header>
        <div class="el-tabs el-tabs--top">
          <div class="el-tabs__header is-top">
            <div class="el-tabs__nav-wrap is-top">
              <div class="el-tabs__nav-scroll">
                <div role="tablist" class="el-tabs__nav is-top" style="transform: translateX(0px);">
                  <div class="el-tabs__active-bar is-top" :style="{width: '56px', transform: tabTransform}"></div>
                  <div id="tab-info"
                       :class="{'el-tabs__item':true, 'is-top': true, 'is-active': !processShow}"
                       @click="showTab(false)">关系图
                  </div>
                  <div id="tab-relation"
                       :class="{'el-tabs__item':true, 'is-top': true, 'is-active': processShow}" @click="showTab(true)">
                    流程图
                  </div>
                </div>

                <div role="tablist" class="el-tabs__nav is-top" style="transform: translateX(0px);float: right">

                  <div class="el-tabs__item" title="保存" @click="saveRelation">
                    <i :class="{'fa fa-floppy-o': true, editAble: !processShow}" style="font-size: 20px"></i>
                  </div>

                  <div class="el-tabs__item" title="修改信息" @click="editElement">
                    <i :class="{'fa fa-edit': true, editAble: !editAble}" style="font-size: 20px"></i>
                  </div>

                  <div class="el-tabs__item" title="删除" @click="deleteElement">
                    <i :class="{'fa fa-trash': true, editAble: !editAble}" style="font-size: 20px"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-header>
      <el-container v-if="!processShow">
        <el-aside class="table-aside" width="250px">
          <el-scrollbar style="height:calc(100vh - 230px);" ref="scrollbar">
            <el-menu @select="selectProject" :defaultActive="defaultActive">
              <el-menu-item v-for="(item, index) in projectList" :index="''+ index" :key="index + 'c'">
                <i class="el-icon-s-grid" style="color: #ff0000"></i>
                <span style="padding-left: 20px">{{item.name}}</span>
              </el-menu-item>
            </el-menu>
          </el-scrollbar>
        </el-aside>

        <el-main>
          <div id="relationGraph" style="height: calc(100vh - 250px)" v-show="!processShow">

          </div>
        </el-main>
      </el-container>
      <div id="proceeGraph" style="height: calc(100vh - 203px);" v-show="processShow">
        <project-relation :dataList="dataList" v-on:enableBtn="enableBtn" ref="projectRelation"></project-relation>
      </div>
    </el-container>
  </d2-container>
</template>
<script>
import * as echarts from 'echarts'
import projectRelation from './components/project-relation-panel'

export default {
  name: 'meta-relation',
  data () {
    return {
      defaultActive: '0',
      projectList: [],
      tabTransform: '',
      processShow: false,
      currentProjectId: '',
      dataList: [],
      editAble: false
    }
  },
  components: {
    projectRelation
  },
  mounted () {
    this.getProjectTable()
    this.getProjectList()
  },
  methods: {
    selectProject (val, array) {
      this.currentProjectId = this.projectList[val].value
      this.getEchartRelation()
    },
    getProjectList () {
      this.$get('/dictionary/selectList/boshi_project').then(res => {
        if (res.code === 1) {
          this.projectList = res.data
          if (this.projectList.length > 0) {
            setTimeout(() => {
              this.selectProject(0)
            }, 500)
          }
        }
      })
    },
    getProjectTable () {
      this.$get('/datacenter/metadata/getProjectTable').then(res => {
        this.dataList = res.data
      })
    },
    showTab (val) {
      if (val === this.processShow) {
        return
      }
      if (val) {
        this.tabTransform = 'translateX(75px)'
      } else {
        this.tabTransform = 'translateX(0px)'
        this.selectProject(0)
        this.editAble = false
      }
      this.processShow = val
    },
    saveRelation () {
      if (this.processShow) {
        this.$refs.projectRelation.saveData()
      }
    },
    getEchartRelation () {
      this.$get('/datacenter/metadata/getProjectTableRelation/' + this.currentProjectId).then(res => {
        if (res.code === 1) {
          const option = {
            title: {
              text: '依赖关系',
              show: false
            },
            series: [{
              type: 'graph',
              layout: 'force',
              symbolSize: 58,
              draggable: true,
              roam: true,
              zoom: 0.25,
              focusNodeAdjacency: true,
              edgeSymbol: ['', 'arrow'],
              // edgeSymbolSize: [80, 10],
              edgeLabel: {
                normal: {
                  show: true,
                  textStyle: {
                    fontSize: 20
                  },
                  formatter (x) {
                    return x.data.name
                  }
                }
              },
              label: {
                show: true,
                formatter (x) {
                  return x.data.nickName
                }
              },
              force: {
                repulsion: 2000,
                edgeLength: 120
              },
              data: res.data.data,
              links: res.data.links
            }]
          }
          this.initEchart('relationGraph', option)
        }
      })
    },
    initEchart (id, option) {
      const chartDom = document.getElementById(id)
      const myChart = echarts.init(chartDom)
      myChart.setOption(option, true)
    },
    enableBtn () {
      this.editAble = true
    },
    deleteElement () {
      if (this.editAble) {
        this.$refs.projectRelation.deleteElement()
      }
    },
    editElement () {
      if (this.editAble) {
        this.$refs.projectRelation.dialogFormVisible = true
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  .table-aside {
    ::v-deep .el-scrollbar__wrap {
      overflow-x: hidden !important;
    }
  }

  .editAble {
    color: #909399;
  }

  #relationGraph {
    overflow: hidden;
  }
</style>
