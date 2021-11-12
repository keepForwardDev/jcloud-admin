<template>
  <d2-container>
    <div class="card-panel">
      <div class="wrapper" v-for="item in tableData" :key="item.id">
        <div class="container">
          <div class="top">
              <img :src="'/admin/root/svg/' + item.type + '-logo.svg'">
          </div>
          <div class="bottom">
            <div class="left">
              <div class="details">
                <h3>{{item.name}}</h3>
              </div>
              <div class="editBtn" @click="editItem(item)"><i class="el-icon-edit"></i></div>
              <el-popconfirm
                icon="el-icon-info"
                icon-color="red"
                title="是否确定删除？"
                @confirm="deleteDatabase(item)"
              >
                <div class="deleteBtn" slot="reference"><i class="el-icon-delete"></i></div>
              </el-popconfirm>
            </div>
          </div>
        </div>
        <div class="inside">
          <div class="icon"><i class="material-icons">info</i></div>
          <div class="contents">
            <table>
              <tr>
                <th>链接</th>
                <th><span :title="item.url">{{item.url? item.url.substring(0, 20) + '...' : item.url}}</span></th>
              </tr>
              <tr>
                <th>用户名</th>
                <th>{{item.username}}</th>
              </tr>
              <tr>
                <th>密码</th>
                <th>***</th>
              </tr>
              <tr>
                <th>说明</th>
                <th>{{item.remark}}</th>
              </tr>
            </table>
          </div>
        </div>
      </div>
      <div class="item-add" @click="addDatabase">
        <i class="el-icon-plus avatar-uploader-icon"></i>
      </div>
    </div>

    <el-dialog
      :destroy-on-close="true"
      title="提示"
      :visible.sync="dialogVisible"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form ref="form" :rules="rules" :model="formData" label-width="120px">
        <el-form-item label="配置名称" prop="name">
          <el-input v-model="formData.name"></el-input>
        </el-form-item>
        <el-form-item label="数据库类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择数据库类型" clearable>
            <el-option value="database">database</el-option>
            <el-option value="elasticsearch">elasticsearch</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="URL" prop="url">
          <el-input v-model="formData.url"></el-input>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="formData.username"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input placeholder="请输入密码" v-model="formData.password">
            <template slot="append">
              <el-button type="primary" @click="testConnection">测试连接</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveForm">立即创建</el-button>
          <el-button @click="dialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

  </d2-container>
</template>
<script>
/**
 *name 数据源配置
 *@params formData-要提交的表单
 *@params rules-验证的字段
 */
export default {
  name: 'database-setting',
  data () {
    return {
      formData: {
        id: '',
        type: '', // 类型
        url: '', // 地址
        username: '', // 用户名
        password: '', // 密码
        name: '',
        remark: '' // 备注
      },
      tableData: [],
      dialogVisible: false,
      rules: {
        name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择数据库类型', trigger: 'change' }],
        url: [{ required: true, message: '请输入URL', trigger: 'blur' }]
      }
    }
  },

  mounted () {
    this.getList()
  },
  methods: {
    deleteDatabase (item) {
      this.$get('/datacenter/metadata/dataSourceDelete/' + item.id).then(res => {
        if (res.code === 1) {
          this.getList()
          this.$message.success(res.msg)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    editItem (item) {
      this.formData = item
      this.dialogVisible = true
    },
    addDatabase () {
      this.formData = {
        id: '',
        type: '', // 类型
        url: '', // 地址
        username: '', // 用户名
        password: '', // 密码
        name: '',
        remark: '' // 备注
      }
      this.dialogVisible = true
    },
    saveForm () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$post('/datacenter/metadata/dataSourceSave', this.formData).then(res => {
            if (res.code === 1) {
              this.$message.success(res.msg)
              this.getList()
              this.dialogVisible = false
            }
          })
        }
      })
    },
    getList () {
      this.$get('/datacenter/metadata/dataSourcePageList', {
        pagseSize: 100,
        currentPage: 1
      }).then(res => {
        if (res.code === 1) {
          this.tableData = res.data.list
        }
      })
    },
    testConnection () {
      this.$refs.form.validate((valid) => {
        this.$post('/datacenter/metadata/testConnection', this.formData).then(res => {
          if (res.code === 1 && res.data) {
            this.$message.success('连接成功！')
          } else {
            this.$message.error('连接失败，请检查配置！')
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>

  .item-add {
    width: 300px;
    height: 300px;
    background: white;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    i {
      font-size: 50px;
      color: #8c939d;
      width: 300px;
      height: 300px;
      line-height: 300px;
      text-align: center;
    }
    &:hover {
      box-shadow: 0 0 8px 0 rgb(232 237 250 / 60%), 0 2px 4px 0 rgb(232 237 250 / 50%);
      border-color: #409eff
    }
  }

  .card-panel {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .wrapper{
    width: 300px;
    height: 300px;
    background: white;
    position: relative;
    overflow: hidden;
    border-radius: 10px 10px 10px 10px;
    box-shadow: 0;
    transform: scale(0.95);
    transition: box-shadow 0.5s, transform 0.5s;
    &:hover{
      transform: scale(1);
      box-shadow: 5px 20px 30px rgba(0,0,0,0.2);
    }

    .container{
      width:100%;
      height:100%;
      .top, img {
        height: 70%;
        width:100%;
        -webkit-background-size: 100%;
        -moz-background-size: 100%;
        -o-background-size: 100%;
        background-size: 100%;
        i {
          color: #f4516c;
          font-size: 50px;
        }
      }
      .bottom{
        width: 200%;
        height: 30%;
        transition: transform 0.5s;
        &.clicked{
          transform: translateX(-50%);
        }
        h1{
          margin:0;
          padding:0;
        }
        p{
          margin:0;
          padding:0;
        }
        .left{
          height:100%;
          width: 50%;
          background: #f4f4f4;
          position:relative;
          float:left;
          .details{
            padding: 10px;
            float: left;
            width: calc(60% - 40px);
          }
          .deleteBtn,.editBtn{
            float:right;
            width: calc(20% - 2px);
            height:100%;
            background: #f1f1f1;
            transition: background 0.5s;
            border-left:solid thin rgba(0,0,0,0.1);
            cursor: pointer;
            i{
              font-size:30px;
              line-height: 70px;
              padding: 15px;
              color: #254053;
              transition: transform 0.5s;
            }
            &:hover{
              background: #A6CDDE;
            }
            &:hover i{
              transform: translateY(5px);
              color:#00394B;
            }
          }
        }
        .right{
          width: 50%;
          background: #A6CDDE;
          color: white;
          float:right;
          height:200%;
          overflow: hidden;
          .details{
            padding: 20px;
            float: right;
            width: calc(70% - 40px);
          }
          .done{
            width: calc(30% - 2px);
            float:left;
            transition: transform 0.5s;
            border-right:solid thin rgba(255,255,255,0.3);
            height:50%;
            i{
              font-size:30px;
              padding:30px;
              color: white;
            }
          }
          .remove{
            width: calc(30% - 1px);
            clear: both;
            border-right:solid thin rgba(255,255,255,0.3);
            height:50%;
            background: #BC3B59;
            transition: transform 0.5s, background 0.5s;
            &:hover{
              background: #9B2847;
            }
            &:hover i{
              transform: translateY(5px);
            }
            i{
              transition: transform 0.5s;
              font-size:30px;
              padding:30px;
              color: white;
            }
          }
          &:hover{
            .remove, .done{
              transform: translateY(-100%);
            }
          }
        }
      }
    }

    .inside{
      z-index:9;
      background: #92879B;
      width:140px;
      height:140px;
      position: absolute;
      top: -70px;
      right: -70px;
      border-radius: 0px 0px 200px 200px;
      transition: all 0.5s, border-radius 2s, top 1s;
      overflow: hidden;
      .icon{
        position:absolute;
        right:85px;
        top:85px;
        color:white;
        opacity: 1;
      }
      &:hover{
        width:100%;
        right:0;
        top:0;
        border-radius: 0;
        height:80%;
        .icon{
          opacity: 0;
          right:15px;
          top:15px;
        }
        .contents{
          opacity: 1;
          transform: scale(1);
          transform: translateY(0);
        }
      }
      .contents{
        padding: 5%;
        opacity: 0;
        transform: scale(0.5);
        transform: translateY(-200%);
        transition: opacity 0.2s, transform 0.8s;
        table{
          text-align:left;
          width:100%;
        }
        h1, p, table{
          color: white;
        }
        p{
          font-size:13px;
        }
      }
    }
  }
</style>
