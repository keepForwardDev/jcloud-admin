<template>
  <div>
    <el-drawer
      title="权限预览"
      :visible.sync="drawerVisible"
      direction="rtl"
      size="30%"
      :before-close="handleDrawerClose">
      <div class="drawer-content">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="菜单" name="0" v-if="tabVisible(0)">
            <el-tree
              default-expand-all
              empty-text="当前暂无数据"
              ref="menuTree"
              show-checkbox
              node-key="id"
              :data="menuTreeList"
            >
             <span class="custom-tree-node" slot-scope="{ data }">
                <span class="tree-title" :title="data.extra">{{ data.label }}</span>
              </span>

            </el-tree>
          </el-tab-pane>
          <el-tab-pane label="API" name="1" v-if="tabVisible(1)">
            <el-table
              :data="apiList"
              v-loading="listLoading"
              style="width: 100%">
              <el-table-column
                prop="apiPath"
                label="请求路径"  show-overflow-tooltip>
              </el-table-column>
              <el-table-column
                prop="apiLimit"
                label="调用次数限制">
                <template slot-scope="scope">
                  <span>{{scope.row.apiLimit | apiLimitFormat}}</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="apiLimitStrategy"
                label="限制策略">
                <template slot-scope="scope">
                  <span>{{scope.row.apiLimitStrategy | apiLimitStrategyFormat}}</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="serviceId"
                label="所属服务">
                <template slot-scope="scope">
                  <span>{{getServiceName(scope.row.serviceId)}}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="自定义" name="2" v-if="tabVisible(2)">
            <el-tree
              default-expand-all
              empty-text="当前暂无数据"
              ref="resourceTree"
              show-checkbox
              node-key="id"
              :data="resourceTreeList"
            >
             <span class="custom-tree-node" slot-scope="{ data }">
                <span class="tree-title" :title="data.extra">{{ data.label }}</span>
              </span>

            </el-tree>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>
  </div>
</template>
<script>
export default {
  name: 'privileges-view',
  data () {
    return {
      drawerVisible: false,
      activeName: '0',
      apiTreeList: [],
      apiList: [],
      listLoading: false
    }
  },
  props: {
    privileges: {
      type: Object,
      default: () => {
        return {
          resourceIds: [],
          apiConfig: [],
          id: '',
          resourceType: 0,
          privilegeType: 0, // 用户
          serviceId: ''
        }
      }
    },
    apiResources: {
      type: Array,
      default: () => {
        return []
      }
    },
    menuTreeList: {
      type: Array,
      default: () => {
        return []
      }
    },
    resourceTreeList: {
      type: Array,
      default: () => {
        return []
      }
    },
    showTab: {
      type: Array,
      default: () => {
        return [0, 1, 2]
      }
    }
  },
  created () {

  },
  filters: {
    apiLimitFormat (val) {
      if (val === 2147483647) {
        return '无限制'
      }
      return val
    },
    apiLimitStrategyFormat (val) {
      if (val) {
        return '每天'
      } else {
        return '次数'
      }
    }
  },
  methods: {
    handleDrawerClose (done) {
      done()
    },
    handleClick (tab, event) {
      this.privileges.resourceType = this.activeName
      this.getPrivileges()
    },
    show () {
      this.privileges.resourceType = this.showTab[0]
      this.activeName = this.showTab[0] + ''
      this.privileges.serviceId = ''
      this.drawerVisible = true
      this.getPrivileges()
    },
    changeService () {
      this.getPrivileges()
    },
    getPrivileges () {
      this.$get('/privilege/getUserAllPrivileges', {
        resourceType: this.privileges.resourceType,
        id: this.privileges.id,
        privilegeType: this.privileges.privilegeType,
        serviceId: this.privileges.serviceId
      }).then(res => {
        let ref
        if (res.code === 1) {
          if (res.data.resourceType === 0) {
            ref = this.$refs.menuTree
          } else if (res.data.resourceType === 1) {
            this.apiTreeList = res.data.apiTree
            this.apiList = res.data.apiConfig
            ref = this.$refs.apiTree
          } else {
            ref = this.$refs.resourceTree
          }
          this.$nextTick(() => {
            res.data.resourceIds.forEach(r => {
              ref.setChecked(r, true, false)
            })
          })
        }
      })
    },
    tabVisible (val) {
      return this.showTab.filter(item => item === val).length > 0
    },
    getServiceName (serviceId) {
      const service = this.apiResources.filter(item => item.location === serviceId)
      if (service.length > 0) {
        return service[0].name
      }
      return serviceId
    }
  }
}
</script>
<style lang="scss" scoped>
  .drawer-content {
    padding-left: 20px;
  }

  .custom-tree-node {
    width: 100%;
    .tree-title {
      width: 70%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: inline-block;
    }
  }
</style>
