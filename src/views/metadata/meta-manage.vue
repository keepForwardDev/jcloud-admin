<template>
  <d2-container>
    <el-container>
      <el-aside class="table-aside">
        <el-scrollbar style="height:calc(100vh - 145px);" ref="scrollbar">
          <div style="text-align: center">
            <el-radio @change="getDataModel('', 0)" v-model="search.showStyle" label="0">按项目展示</el-radio>
            <el-radio @change="getDataModel('', 1)" v-model="search.showStyle" label="1">按数据源展示</el-radio>
          </div>
          <el-input
            clearable
            class="el-transfer-panel__filter"
            size="small"
            placeholder="请输入搜索内容"
            @input="filterMatch"
            v-model="search.tableName"
            prefix-icon="el-icon-search">
          </el-input>
          <el-menu @select="selectTable" :defaultActive="defaultActive">
            <el-submenu :index="index + ''" v-for="(item, index) in tableList" :key="index">
              <template slot="title">
                <i class="fa fa-database"></i>
                <span>{{item.title}}</span>
              </template>
              <transition-group
                enter-active-class="animate__animated  animate__fadeInDown"
              >
                <el-menu-item v-for="(item1, index1) in item.tables"
                              v-show="item1.show === undefined ? true : item1.show" :index="index1 + ''"
                              :key="index1 + 'c'" title="右击修改表名称">
                  <div style="width: 300px" @contextmenu.prevent="showInput(item1)">
                    <i class="el-icon-s-grid" style="color: #ff0000"></i>
                    <el-input
                      class="input-new-tag"
                      style="width: 200px;"
                      v-if="item1.inputVisible == undefined ? false : item1.inputVisible"
                      v-model="item1.remarks"
                      :ref="item1.tableName"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(item1)"
                      @blur="handleInputConfirm(item1)"
                    >
                    </el-input>
                    <span v-else :title="item1.tableName">{{defaultStr(item1.remarks, item1.tableName)}}</span>
                  </div>
                </el-menu-item>
              </transition-group>
            </el-submenu>
          </el-menu>
        </el-scrollbar>
      </el-aside>
      <el-container>
        <el-header>
          <!--          <el-tabs v-model="tabName">
                      <el-tab-pane label="基本信息" name="info"></el-tab-pane>
                      <el-tab-pane label="依赖关系" name="relation"></el-tab-pane>
                    </el-tabs>-->
          <div class="el-tabs el-tabs--top">
            <div class="el-tabs__header is-top">
              <div class="el-tabs__nav-wrap is-top">
                <div class="el-tabs__nav-scroll">
                  <div role="tablist" class="el-tabs__nav is-top" style="transform: translateX(0px);">
                    <div class="el-tabs__active-bar is-top" :style="{width: '56px', transform: tabTransform}"></div>
                    <div id="tab-info"
                         :class="{'el-tabs__item':true, 'is-top': true, 'is-active': !dependenceShow}" @click="showTab(false)" >基本信息
                    </div>
                    <div id="tab-relation"
                         :class="{'el-tabs__item':true, 'is-top': true, 'is-active': dependenceShow}" @click="showTab(true)" >依赖关系
                    </div>
                  </div>

                  <div role="tablist" class="el-tabs__nav is-top" style="transform: translateX(0px);float: right">
                    <div  title="编辑" :class="{'el-tabs__item':  true, 'actice-edit': editAble}" @click="editAble = !editAble">
                      <i class="fa fa-edit" style="font-size: 20px"></i>
                    </div>
                    <div  class="el-tabs__item" title="保存" @click="saveTableInfo">
                      <i :class="{'fa fa-floppy-o': true, 'enableBtn': saveBtn }" style="font-size: 20px"></i>
                    </div>
                    <div  class="el-tabs__item" title="下载" @click="tableList.length > 0 ? dialogFormVisible = true : null">
                      <i :class="{'fa fa-download':true, 'enableBtn': tableList.length === 0}" style="font-size: 20px"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-header>
        <div v-show="!dependenceShow" >
          <el-scrollbar style="height: calc(100vh - 203px)" class="table-content">
            <el-table :data="tableData" style="width: 100%" v-loading="tableLoading">
              <el-table-column
                type="index"
                width="50">
              </el-table-column>
              <el-table-column prop="columnName" label="名称" width="140">
              </el-table-column>
              <el-table-column prop="typeName" label="数据类型" width="120">
              </el-table-column>
              <el-table-column prop="columnSize" label="长度">
              </el-table-column>
              <el-table-column prop="decimalDigits" label="精度（小数位）">
              </el-table-column>
              <el-table-column prop="nullable" label="允许空值">
                <template slot-scope="scope">
            <span>
              {{scope.row.nullable}}
            </span>
                </template>
              </el-table-column>
              <el-table-column prop="primaryKey" label="主键">
                <template slot-scope="scope">
            <span>
              {{scope.row.primaryKey}}
            </span>
                </template>
              </el-table-column>
              <el-table-column prop="columnDef" label="默认值">
              </el-table-column>
              <el-table-column prop="remark" label="说明" v-if="editAble">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.remarks" clearable>
                  </el-input>
                </template>
              </el-table-column>
              <el-table-column prop="remark" v-if="!editAble" label="说明 ">
                <template slot-scope="scope">
              <span :title="scope.row.remarks">
                  {{scope.row.remarks}}
              </span>
                </template>
              </el-table-column>
            </el-table>
          </el-scrollbar>
        </div>
        <div id="echart" style="height: calc(100vh - 203px);" v-show="dependenceShow">
        </div>
      </el-container>
    </el-container>
    <el-dialog title="选择导出的格式" width="500px" :visible.sync="dialogFormVisible">

      <div>
        导出方式：
        <el-radio v-model="downloadStyle" label="0">按项目导出</el-radio>

        <el-radio v-model="downloadStyle" label="1">按数据源导出</el-radio>
      </div>

      <div style="margin-top: 20px">
        导出的表：
        <el-select v-model="downloadSelectTables" filterable clearable multiple placeholder="请选择" style="width: 80%">
          <el-option
            v-for="item in tableSelections"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
      <div style="margin-top: 20px">
        文件类型：
        <el-radio v-model="fileStyle" label="0">EXCEL</el-radio>
        <el-radio v-model="fileStyle" label="1">WORD</el-radio>
        <el-radio v-model="fileStyle" label="2">HTML</el-radio>
        <el-radio v-model="fileStyle" label="3">MD</el-radio>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="downloadFile">导出</el-button>
      </span>
    </el-dialog>
  </d2-container>
</template>
<script>
import * as echarts from 'echarts'
export default {
  name: 'meta-manage',
  data () {
    return {
      defaultActive: '0',
      tableList: [],
      tableData: [],
      tableSelections: [],
      tableLoading: false,
      tabName: 'info',
      dataSourceInfoId: '',
      dataSourceList: [],
      search: {
        showStyle: '0',
        tableName: ''
      },
      editAble: false,
      editItem: {}, // 编辑的对象
      editTableName: '', // 编辑对象的tableName
      dialogFormVisible: false,
      downloadStyle: '0',
      fileStyle: '0',
      downloadSelectTables: [],
      dependenceShow: false,
      tabTransform: 'translateX(0px)'
    }
  },
  filters: {
    boolString (val) {
      if (val) {
        return 'Y'
      } else {
        return 'N'
      }
    }
  },
  computed: {
    saveBtn() {
      if (this.editAble && this.tableData.length > 0) {
        return false
      }
      return true
    }
  },
  mounted () {
    this.getDataModel('', this.search.showStyle)
  },
  methods: {
    selectTable (index, array) {
      this.editItem = this.tableList[array[0]].tables[array[1]]
      this.getColumnModel()
      if (this.dependenceShow) {
        this.getOption()
      }
    },
    filterMatch () {
      if (this.search.tableName) {
        this.tableList.forEach(item => {
          item.tables.forEach(item1 => {
            if (item1.remarks.indexOf(this.search.tableName) > -1 || item1.tableName.indexOf(this.search.tableName) > -1) {
              item1.show = true
            } else {
              item1.show = false
            }
          })
        })
      } else {
        this.tableList.forEach(item => {
          item.tables.forEach(item1 => {
            item1.show = true
          })
        })
      }
    },
    handleInputConfirm (item) {
      item.inputVisible = false
      this.saveTableInfo()
      this.$forceUpdate()
    },
    showInput (item) {
      item.inputVisible = true
      this.editAble = true
      this.editItem = item
      this.editTableName = item.remarks
      this.$forceUpdate()
      this.$nextTick(_ => {
        this.$refs[item.tableName][0].$refs.input.focus()
      })
    },
    saveTableInfo() {
      if (this.editAble) {
        this.$postJson('/datacenter/metadata/saveTableInfo', this.editItem).then(res => {
          if (res.code === 1) {
            this.editAble = false
            this.$message.success(res.msg)
          }
        })
      }
    },
    getDataModel (tableName, groupType) {
      this.search.tableName = ''
      this.$get('/datacenter/metadata/getTableInfo', {
        tableName: tableName,
        groupType: groupType
      }).then(res => {
        if (res.code === 1) {
          this.tableList = res.data
          if (this.tableList.length > 0) {
            this.editItem = this.tableList[0].tables[0]
            this.getColumnModel()
            this.tableList.forEach(item => {
              item.tables.forEach(t => {
                this.tableSelections.push({
                  label: t.remarks + '-' + t.tableName,
                  value: t.id
                })
              })
            })
          }
        }
      })
    },
    getColumnModel () {
      const api = '/datacenter/metadata/getColumnModel/' + this.editItem.id
      if (!this.editItem.columns) {
        this.tableLoading = true
        this.$get(api).then(res => {
          if (res.code === 1) {
            setTimeout(() => {
              this.tableData = res.data
              this.editItem.columns = res.data
              this.tableLoading = false
            }, 500)
          }
        })
      } else {
        this.tableData = this.editItem.columns
      }
    },
    defaultStr (str1, str2) {
      if (str1) {
        return str1
      } else {
        return str2
      }
    },
    downloadFile() {
      location.href = `/datacenter/metadata/downloadTableInfo?groupType=${this.downloadStyle}&fileType=${this.fileStyle}&ids=${this.downloadSelectTables.join(',')}`
    },
    showTab(val) {
      if (val === this.dependenceShow) {
        return
      }
      if (val) {
        this.getOption()
        this.tabTransform = 'translateX(96px)'
      } else {
        this.tabTransform = 'translateX(0px)'
      }
      this.dependenceShow = val
    },
    initEchart(id, option) {
      const chartDom = document.getElementById(id)
      const myChart = echarts.init(chartDom)
      myChart.setOption(option, true)
    },
    getOption() {
      this.$get('/datacenter/metadata/getTableRelation/' + this.editItem.id).then(res => {
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
              focusNodeAdjacency: true,
              edgeSymbol: ['', 'arrow'],
              // edgeSymbolSize: [80, 10],
              edgeLabel: {
                normal: {
                  show: true,
                  textStyle: {
                    fontSize: 20
                  },
                  formatter(x) {
                    return x.data.name;
                  }
                }
              },
              label: {
                show: true,
                formatter(x) {
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
          this.initEchart("echart", option)
        }
      })
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

  .actice-edit {
    color: #3c9604;
  }
  .enableBtn {
    color: #909399;
  }
</style>
