<template>
  <div class="container-component">
    <div class="d2-container-full">
      <div class="d2-container-full__body">
        <el-row :gutter="40" class="panel-group">
          <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
            <div class="card-panel">
              <div class="card-panel-icon-wrapper icon-people">
                <i class="fa fa-user-o" style="font-size: 50px"></i>
              </div>
              <div class="card-panel-description">
                <div class="card-panel-text">
                  用户
                </div>
                <d2-count-up :start="0" :end="countData.userNumber" :duration="2" class="card-panel-num"/>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
            <div class="card-panel">
              <div class="card-panel-icon-wrapper icon-people">
                <i class="fa fa-align-justify" style="font-size: 50px"></i>
              </div>
              <div class="card-panel-description">
                <div class="card-panel-text">
                  应用
                </div>
                <d2-count-up :start="0" :end="countData.clientNumber" :duration="2" class="card-panel-num"/>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
            <div class="card-panel">
              <div class="card-panel-icon-wrapper icon-people">
                <i class="fa fa-list-alt" style="font-size: 50px"></i>
              </div>
              <div class="card-panel-description">
                <div class="card-panel-text">
                  部门
                </div>
                <d2-count-up :start="0" :end="countData.departmentNumber" :duration="2" class="card-panel-num"/>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="40" class="panel-group">
          <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
            <div class="card-panel">
              <div class="card-panel-icon-wrapper icon-message">
                <i class="el-icon-s-grid" style="font-size: 50px"></i>
              </div>
              <div class="card-panel-description">
                <div class="card-panel-text">
                  今日新增用户
                </div>
                <d2-count-up :start="0" :end="countData.currentCreateUser" :duration="2" class="card-panel-num"/>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
            <div class="card-panel">
              <div class="card-panel-icon-wrapper icon-money">
                <i class="fa fa-pie-chart" style="font-size: 50px"></i>
              </div>
              <div class="card-panel-description">
                <div class="card-panel-text">
                  今日API调用次数
                </div>
                <d2-count-up :start="0" :end="countData.currentApiCall" :duration="2" class="card-panel-num"/>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
            <div class="card-panel">
              <div class="card-panel-icon-wrapper icon-message">
                <i class="el-icon-s-grid" style="font-size: 50px"></i>
              </div>
              <div class="card-panel-description">
                <div class="card-panel-text">
                  今日用户登录次数
                </div>
                <d2-count-up :start="0" :end="countData.currentUserLogin" :duration="2" class="card-panel-num"/>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="40" class="panel-group">
          <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
            <div class="card-panel">
              <div class="card-panel-icon-wrapper icon-message">
                <i class="el-icon-s-grid" style="font-size: 50px"></i>
              </div>
              <div class="card-panel-description">
                <div class="card-panel-text">
                  api调用总数
                </div>
                <d2-count-up :start="0" :end="countData.apiCall" :duration="2" class="card-panel-num"/>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'admin-index',
  data () {
    return {
      countData: {
        userNumber: 0,
        apiCall: 0,
        currentApiCall: 0,
        currentUserLogin: 0,
        currentCreateUser: 0,
        clientNumber: 0,
        departmentNumber: 0
      }
    }
  },
  mounted () {
    this.indexStat()
  },
  methods: {
    indexStat () {
      this.$get('/log/index').then(res => {
        if (res.code === 1) {
          this.countData = res.data
        }
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
