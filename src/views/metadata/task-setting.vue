<template>
  <d2-container>
    <div class="search-area">
      <el-form :inline="true" :model="search">
        <el-form-item label="任务名称">
          <el-input v-model="search.name"></el-input>
        </el-form-item>
        <el-form-item label="所属项目">
          <el-select v-model="search.projectDicId" placeholder="请选择所属项目">
            <el-option v-for="item in projectList" :label="item.name" :value="item.value" :key="item.id">{{item.name}}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="btn-area">
      <el-button type="primary" size="medium" @click="showForm">新建任务</el-button>
    </div>
    <div class="table-area">
      <el-table
        :data="tableData"
        v-loading="listLoading"
        style="width: 100%">
        <el-table-column
          type="index"
          width="50">
        </el-table-column>
        <el-table-column
          prop="name"
          label="任务名称">
        </el-table-column>
        <el-table-column
          prop="projectDicIdStr"
          label="所属项目">
        </el-table-column>
        <el-table-column
          prop="dataSourceName"
          label="所属数据源">
        </el-table-column>
<!--        <el-table-column
          prop="inStrategy"
          label="入库策略">
          <template slot-scope="scope">
            <span>
              {{scope.row.inStrategy | inStrategyStr}}
            </span>
          </template>

        </el-table-column>-->
        <el-table-column
          prop="isTask"
          label="是否参与调度">
          <template slot-scope="scope">
            <span>
              {{scope.row.isTask | boolString}}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          prop="remark"
          label="描述">
        </el-table-column>
        <el-table-column
          prop="updateTime"
          label="最近一次执行时间">
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间">
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="editData(scope.row)">配置
            </el-button>
            <el-button
              size="mini"
              type="danger"
              v-if="scope.row.isTask === 1"
              @click="executeNow(scope.row)">立即执行
            </el-button>
            <el-button
              size="mini"
              type="warning"
              v-if="scope.row.isTask === 0"
              @click="enableTask(scope.row)">开启任务
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="el-page">
        <el-pagination
          :current-page="pager.currentPage"
          :page-sizes="pageSizes"
          :page-size="pager.pageSize"
          :layout="pagerSetting"
          :total="pager.totalCount"
          @size-change="handlePageSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

    </div>

    <el-dialog title="任务配置" :visible.sync="dialogFormVisible" fullscreen>
      <el-steps :active="step" simple finish-status="success">
        <el-step title="填写相关信息" icon="el-icon-edit-outline"></el-step>
        <el-step title="选择元数据表" icon="el-icon-scissors"></el-step>
        <el-step title="确认元数据属性" icon="el-icon-check"></el-step>
        <el-step title="建立数据血缘关系" icon="el-icon-check"></el-step>
      </el-steps>
      <transition :name="animationMode" mode="out-in">
        <div  v-if="step == 0">
          <task-info v-on:nextStep="nextStep" v-on:lastStep="lastStep" v-on:closeDialog="closeDialog" :project-list="projectList" :dataSourceList="dataSourceList" :formData="formData"></task-info>
        </div>
      </transition>
      <!-- <transition
        :enter-active-class="transition0"
        leave-active-class="fateOut"
      >
        <div  v-if="step == 0">
          <task-info v-on:nextStep="nextStep" v-on:lastStep="lastStep"></task-info>
        </div>
      </transition> -->
      <transition
        :name="animationMode"
        mode="out-in"
      >
        <div v-if="step == 1">
          <select-grid v-on:nextStep="nextStep" v-on:lastStep="lastStep" :formData="formData"></select-grid>
        </div>
      </transition>
      <transition
        :name="animationMode"
        mode="out-in"
      >
        <div v-if="step == 2">
          <confirm-meta v-on:nextStep="nextStep"  :formData="formData" v-on:lastStep="lastStep"></confirm-meta>
        </div>
      </transition>
      <transition
        :name="animationMode"
        mode="out-in"
      >
        <div v-if="step == 3">
          <table-relation v-on:closeDialog="closeDialog"  v-on:lastStep="lastStep" :dataList="globalData" :formData="formData"></table-relation>
        </div>
      </transition>
    </el-dialog>

  </d2-container>
</template>
<script>
import taskInfo from './components/taskInfo'
import selectGrid from './components/selectGrid'
import confirmMeta from './components/confirmMeta'
import tableRelation from './components/table-relation-panel'
export default {
  name: 'task-setting',
  components: {
    taskInfo,
    selectGrid,
    confirmMeta,
    tableRelation
  },
  data () {
    return {
      animationMode: 'my-slide',
      search: {
        name: '',
        projectDicId: ''
      },
      projectList: [],
      dataSourceList: [],
      formData: {
        id: '',
        name: '',
        projectDicId: '',
        dataSourceInfoId: '',
        inStrategy: 0, // 入库策略
        isTask: 0,
        remark: '',
        includeRegex: [],
        excludeTables: [],
        excludeRegex: [],
        fetchTableName: false,
        includeTables: []
      },
      pager: {
        totalCount: 0,
        pageCount: 1,
        pageSize: 10,
        currentPage: 1
      },
      pageSizes: [10, 20, 40, 60, 100],
      pagerSetting: 'total, sizes, prev, pager, next, jumper',
      tableData: [], // 表格数据
      listLoading: false, // 表格loading动画
      dialogTitle: '',
      newDataTitle: '新建任务', // 新建数据的title
      editDataTitle: '查看任务', // 编辑数据的title
      dialogFormVisible: false, // 弹窗是否展示
      listPath: '/datacenter/metadata/taskInfoPageList', // 列表请求地址
      savePath: '', // 保存地址
      deletePath: '', // 删除地址
      step: 0,
      nextBol: true, // 判断动画方向
      globalData: [], // 存放全局数据，在下一步上一步中，用来记录各个步骤中的数据
    }
  },
  filters: {
    boolString (value) {
      if (value) {
        return '是'
      } else {
        return '否'
      }
    },
    inStrategyStr(value) {
      if (value) {
        return '全量'
      } else {
        return '增量'
      }
    }
  },
  watch: {

  },
  created () {
    this.getList()
    this.getProject()
    this.getDataSource()
  },
  methods: {
    // ==================================== 二、数据请求类 ================================
    // /**
    //  * @param {boolean} flag 判断是否为第1页
    //  */
    getList (flag) {
      this.listLoading = true
      if (flag) {
        this.pager.currentPage = 1
      }
      const params = Object.assign({}, this.search, {
        pageSize: this.pager.pageSize,
        currentPage: this.pager.currentPage
      })
      this.$get(this.listPath, params).then(res => {
        this.listLoading = false
        if (res.code === 1) {
          this.tableData = res.data.list
          this.pager.totalCount = res.data.totalCount
          this.pager.pageCount = res.data.pageCount
          this.pager.pageSize = res.data.pageSize
          this.pager.currentPage = res.data.currentPage
        }
      }).catch(_ => {
        this.listLoading = false
      })
    },
    showForm () {
      this.step = 0
      this.dialogTitle = this.newDataTitle
      this.formData = {
        id: '',
        name: '',
        projectDicId: '',
        dataSourceInfoId: '',
        inStrategy: 0, // 入库策略
        isTask: 0,
        remark: '',
        includeRegex: [],
        excludeRegex: [],
        excludeTables: [],
        includeTables: []
      }
      this.dialogFormVisible = true
    },
    saveForm () {
      this.$refs.form.validate((valid, object) => {
        if (!valid) {
          this.$message({
            message: '请完善相关信息填写！',
            type: 'warning'
          })
        } else {
          this.$post(this.savePath, this.formData).then(res => {
            if (res.code === 1) {
              this.$message.success(res.msg)
            }
          })
          this.dialogFormVisible = false
        }
      })
    },
    editData (row) {
      this.step = 0
      this.dialogTitle = this.editDataTitle
      this.formData = {
        id: row.id,
        name: row.name,
        projectDicId: row.projectDicId,
        dataSourceInfoId: row.dataSourceInfoId,
        inStrategy: row.inStrategy, // 入库策略
        isTask: row.isTask,
        remark: row.remark,
        includeRegex: row.includeRegex,
        excludeTables: row.excludeTables,
        excludeRegex: row.excludeRegex,
        fetchTableName: false,
        includeTables: []
      }
      this.dialogFormVisible = true
    },
    executeNow (row) {
      this.$get('/datacenter/metadata/executeTask', {
        id: row.id
      }).then(res => {
        if (res.code === 1) {
          this.$message.success('成功')
        }
      })
    },

    deleteData (row) {
      this.$confirm('确定删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$get(this.deletePath + '/' + row.id).then(res => {
          if (res.code === 1) {
            this.$message({
              message: '删除成功！',
              type: 'success'
            })
            this.getList(true)
          }
        })
      })
    },
    resetQuery () {
      this.search = {}
      this.getList(true)
    },
    handleCurrentChange (val) {
      this.pager.currentPage = val
      this.getList()
    },
    handlePageSizeChange (val) {
      this.pager.pageSize = val
      this.getList(true)
    },
    /** 模拟数据请求 */
    // ==================================== 三、跳转类 ====================================
    nextStep (val) {
      this.animationMode = 'my-slide'
      // 加入异步是为了让动画名称改变后才执行
      setTimeout(() => {
        this.step = this.step + 1
      })
      if (val) {
        this.globalData = val
      }
      // this['transition' + this.step] = 'animate__animated  animate__fadeInLeft'
    },
    lastStep () {
      this.animationMode = 'my-slide-out'
      // 加入异步是为了让动画名称改变后才执行
      setTimeout(() => {
        this.step = this.step - 1
      })

      // this['transition' + this.step] = 'animate__animated  animate__fadeInRight'
    },
    getProject () {
      this.$get('/dictionary/selectList/boshi_project').then(res => {
        if (res.code === 1) {
          this.projectList = res.data
        }
      })
    },
    closeDialog () {
      this.dialogFormVisible = false
      this.getList(true)
    },
    getDataSource () {
      this.$get('/datacenter/metadata/dataSourcePageList', {
        pagseSize: 100,
        currentPage: 1
      }).then(res => {
        if (res.code === 1) {
          this.dataSourceList = res.data.list
        }
      })
    },
    enableTask(row) {
      this.formData = row
      this.formData.isTask = 1
      this.$postJson('/datacenter/metadata/saveBaseTaskInfo', this.formData).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
          this.getList()
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  .el-page {
    padding-top: 10px;
    padding-bottom: 10px;
    float: right;
  }

  .fateOut {
    opacity: 0;
  }
  .btn-area{
    margin-bottom: 10px;
  }
  .my-slide-enter{
    transform: translateX(80%);
    opacity: 0;
    height: 0;
  }
  .my-slide-leave-to{
    transform: translateX(-80%);
    opacity: 0;
    height: 0;
  }
  .my-slide-enter-active{
    transition:all 0.5s 0.6s;

  }
  .my-slide-leave-active{
    transition:all 0.5s;
  }
  .my-slide-out-enter{
    transform: translateX(-80%);
    opacity: 0;
    height: 0;
  }
  .my-slide-out-leave-to{
    transform: translateX(80%);
    opacity: 0;
    height: 0;
  }
  .my-slide-out-enter-active{
    transition:all 0.5s 0.6s;
  }
  .my-slide-out-leave-active{
    transition:all 0.5s;
  }
</style>
