<template>
  <div class="container-component">
    <div class="d2-container-full">
      <div class="d2-container-full__body">
        <el-row :gutter="40" class="panel-group">
          <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
            <div class="card-panel" @click="handleSetLineChartData('newVisitis')">
              <div class="card-panel-icon-wrapper icon-people">
                <i class="fa fa-folder" style="font-size: 50px"></i>
              </div>
              <div class="card-panel-description">
                <div class="card-panel-text">
                  总项目数
                </div>
                <d2-count-up :start="0" :end="countData.projectCount" :duration="2" class="card-panel-num"/>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
            <div class="card-panel" @click="handleSetLineChartData('messages')">
              <div class="card-panel-icon-wrapper icon-message">
                <i class="el-icon-s-grid" style="font-size: 50px"></i>
              </div>
              <div class="card-panel-description">
                <div class="card-panel-text">
                  总表数
                </div>
                <d2-count-up :start="0" :end="countData.tableCount" :duration="2" class="card-panel-num"/>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
            <div class="card-panel" @click="handleSetLineChartData('purchases')">
              <div class="card-panel-icon-wrapper icon-money">
                <i class="fa fa-pie-chart" style="font-size: 50px"></i>
              </div>
              <div class="card-panel-description">
                <div class="card-panel-text">
                  占用存储空间
                </div>
                <d2-count-up :start="0" :end="countData.dataSizeCount" :duration="2" class="card-panel-num"/>
                GB
              </div>
            </div>
          </el-col>
        </el-row>
        <div>
          <el-select v-model="selectProject" @change="getDataIncrement" placeholder="请选择项目"
                     style="width: 500px;margin-bottom: 20px">
            <el-option
              v-for="item in projectList"
              :key="item.value"
              :label="item.name"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div>
          <div id="storeGraph" style="width: 100%;height:300px;"></div>
        </div>

        <div class="chart-panel">
          <el-row :gutter="40" class="panel-group">
            <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
              <div id="projectStoreTopGraph" style="width: 100%;height: 300px"></div>
            </el-col>
            <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
              <div id="tableStoreTopGraph" style="width: 100%;height: 300px"></div>
            </el-col>
            <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
              <div id="tableTopGraph" style="width: 100%;height: 300px"></div>
            </el-col>

          </el-row>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'meta-index',
  data () {
    return {
      xAxisStoreData: ['2021-07-25', '2021-07-26', '2021-07-27', '2021-07-28', '2021-07-29', '2021-07-30'], // 存储趋势图 x轴
      storeData: ['40', '80', '50', '120', '70', '1000'], // 存储趋势图数据
      projects: [{
        label: '全部项目',
        value: '全部项目'
      }],
      selectProject: '',
      opt: {
        index: 0
      },
      projectTopColor: ['#FC619D', '#FF904D', '#48BFE3'],
      countData: {
        projectCount: 0,
        tableCount: 0,
        dataSizeCount: 0
      },
      projectList: []
    }
  },
  computed: {},
  created () {

  },
  mounted () {
    this.getIndexData()
    this.getProjectList()
    this.getDataIncrement()
  },
  methods: {
    handleSetLineChartData (type) {
      this.$emit('handleSetLineChartData', type)
    },
    hexToRgba (hex, opacity) {
      let rgbaColor = ''
      const reg = /^#[\da-f]{6}$/i
      if (reg.test(hex)) {
        rgbaColor = `rgba(${parseInt('0x' + hex.slice(1, 3))},${parseInt('0x' + hex.slice(3, 5))},${parseInt(
          '0x' + hex.slice(5, 7)
        )},${opacity})`
      }
      return rgbaColor
    },
    initEcharts (id, option) {
      const chartDom = document.getElementById(id)
      const myChart = echarts.init(chartDom)
      myChart.setOption(option, true)
    },
    storeGraphOption () {
      return {
        title: {
          text: '数据日增趋势图',
          textStyle: {
            fontSize: '16px'
          },
          top: 0
        },
        backgroundColor: '#fff',
        tooltip: {
          trigger: 'axis'
          // trigger: 'yAxis',
        },
        color: ['#3082FF'], // 线条的颜色
        grid: {
          left: '2%',
          right: '2%',
          top: '10%',
          bottom: '13%',
          containLabel: true
        },
        xAxis: [
          {
            show: true,
            type: 'category',
            splitLine: {
              show: false
            },
            data: this.xAxisStoreData,
            axisTick: {
              show: false
            },
            axisLine: {
              lineStyle: { // x 轴的颜色
                color: '#E6EAF3'
              }
            },
            axisLabel: { // x轴名称的颜色
              color: '#4B525E'
            },
            boundaryGap: true
          }
        ],
        yAxis: [
          {
            type: 'value',
            // splitLine: {
            //   show: true
            // },
            axisLabel: { // Y轴 名称的颜色
              color: '#4B525E'
            },
            axisLine: {
              lineStyle: { // Y 轴 颜色
                color: '#E6EAF3'
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            }
          }
        ],
        series: [{
          name: '数据日增趋势图',
          type: 'line',
          symbolSize: 8,
          symbol: 'circle',
          lineStyle: {
            normal: {
              color: '#3082FF', // 线条颜色
              width: 2,
              shadowBlur: 3,
              shadowColor: this.hexToRgba('#3082FF', 0.5),
              shadowOffsetY: 8
            }
          },
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(
                0,
                0,
                0,
                1,
                [
                  {
                    offset: 0,
                    color: this.hexToRgba('#3082FF', 0.3)
                  },
                  {
                    offset: 1,
                    color: this.hexToRgba('#3082FF', 0)
                  }
                ],
                false
              ),
              shadowColor: this.hexToRgba('#3082FF', 0.1),
              shadowBlur: 10
            }
          },
          smooth: true,
          data: this.storeData
        }]
      }
    },
    graphOption (option) {
      return {
        title: {
          text: option.title,
          textStyle: {
            fontSize: '16px'
          },
          top: 0
        },
        backgroundColor: '#fff',
        tooltip: {
          trigger: 'axis',
          show: false,
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        legend: {
          show: false
        },
        grid: {
          left: '3%',
          right: '10%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [{
          splitLine: {
            show: false
          },
          type: 'value',
          show: false
        }],
        yAxis: [{
          splitLine: {
            show: false
          },
          axisLine: { // y轴
            show: false
          },
          type: 'category',
          axisTick: {
            show: false
          },
          inverse: true,
          data: option.yAxisData,
          axisLabel: {
            color: option.yLabelColor,
            fontSize: 14
          }
        }],
        series: [{
          name: '标准化',
          type: 'bar',
          barWidth: 12, // 柱子宽度
          label: {
            show: true,
            position: 'right', // 位置
            color: '#666',
            fontSize: 14,
            distance: 15, // 距离
            formatter: option.formatter // 这里是数据展示的时候显示的数据
          }, // 柱子上方的数值
          itemStyle: {
            barBorderRadius: [0, 20, 20, 0], // 圆角（左上、右上、右下、左下）
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
              offset: 0,
              color: option.itemStyleColor
            }, {
              offset: 1,
              color: option.itemStyleShadowColor
            }], false) // 渐变
          },
          data: option.data
        }]
      }
    },
    indexInit () {
      // 数据日增趋势图
      this.$nextTick(() => {
        const projectTopName = this.countData.projectSizeTop.map(item => item.name)
        const projectTopData = this.countData.projectSizeTop.map(item => item.value)
        // 项目占有存储
        this.initEcharts('projectStoreTopGraph', this.graphOption({
          title: '项目占有存储TOP', // 标题
          yAxisData: projectTopName, // y轴label
          formatter: '{c}GB', // 格式化输出
          itemStyleColor: '#3082FF', // 颜色#3082FF
          itemStyleShadowColor: '#8EC9FF', // 渐变色
          yLabelColor: '#3082FF',
          data: projectTopData // 数据data
        }))
        const tableTopName = this.countData.tableSizeTop.map(item => item.name)
        const tableTopData = this.countData.tableSizeTop.map(item => item.value)
        this.initEcharts('tableStoreTopGraph', this.graphOption({
          title: '表占有存储TOP', // 标题
          yAxisData: tableTopName, // y轴label
          formatter: '{c}GB', // 格式化输出
          itemStyleColor: '#FF904D', // 颜色#3082FF
          itemStyleShadowColor: '#FFD6A5', // 渐变色
          yLabelColor: '#3082FF',
          data: tableTopData // 数据data
        }))
        const searchTopName = this.countData.searchCountTop.map(item => item.label)
        const searchTopData = this.countData.searchCountTop.map(item => item.value)
        this.initEcharts('tableTopGraph', this.graphOption({
          title: '热门查询表', // 标题
          yAxisData: searchTopName, // y轴label
          formatter: '{c}次', // 格式化输出
          itemStyleColor: '#f4516c', // 颜色#3082FF
          itemStyleShadowColor: '#F494A4', // 渐变色
          yLabelColor: '#3082FF',
          data: searchTopData // 数据data
        }))
      })
    },
    getIndexData () {
      this.$get('/datacenter/metadata/index').then(res => {
        if (res.code === 1) {
          this.countData = res.data
          this.indexInit()
        }
      })
    },
    getProjectList () {
      this.$get('/dictionary/selectList/boshi_project').then(res => {
        if (res.code === 1) {
          this.projectList = res.data
        }
      })
    },
    getDataIncrement () {
      this.$get('/datacenter/metadata/dataIncrement', {
        projectId: this.selectProject
      }).then(res => {
        this.xAxisStoreData = res.data.map(item => item.name)
        this.storeData = res.data.map(item => item.value)
        const storeOption = this.storeGraphOption()
        this.initEcharts('storeGraph', storeOption)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .panel-group {
    .card-panel-col {
      margin-bottom: 20px;
    }

    .card-panel {
      height: 108px;
      cursor: pointer;
      font-size: 12px;
      position: relative;
      overflow: hidden;
      color: #666;
      background: #fff;
      box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
      border-color: rgba(0, 0, 0, .05);

      &:hover {
        .card-panel-icon-wrapper {
          color: #fff;
        }

        .icon-people {
          background: #40c9c6;
        }

        .icon-message {
          background: #36a3f7;
        }

        .icon-money {
          background: #f4516c;
        }

        .icon-shopping {
          background: #34bfa3
        }
      }

      .icon-people {
        color: #40c9c6;
      }

      .icon-message {
        color: #36a3f7;
      }

      .icon-money {
        color: #f4516c;
      }

      .icon-shopping {
        color: #34bfa3
      }

      .card-panel-icon-wrapper {
        float: left;
        margin: 14px 0 0 14px;
        padding: 16px;
        transition: all 0.38s ease-out;
        border-radius: 6px;
      }

      .card-panel-icon {
        float: left;
        font-size: 48px;
      }

      .card-panel-description {
        float: right;
        font-weight: bold;
        margin: 26px;
        margin-left: 0px;

        .card-panel-text {
          line-height: 18px;
          color: rgba(0, 0, 0, 0.45);
          font-size: 16px;
          margin-bottom: 12px;
        }

        .card-panel-num {
          font-size: 20px;
        }
      }
    }
  }

  @media (max-width: 550px) {
    .card-panel-description {
      display: none;
    }
    .card-panel-icon-wrapper {
      float: none !important;
      width: 100%;
      height: 100%;
      margin: 0 !important;

      .svg-icon {
        display: block;
        margin: 14px auto !important;
        float: none !important;
      }
    }
  }

  .chart-panel {
    padding-top: 20px;
  }
</style>
