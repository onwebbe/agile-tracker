<template>
  <div style="background: rgb(84, 92, 100); height: 100%;" class="sidebar">
    <el-progress style="padding: 15px;" :text-inside="true" :stroke-width="16" :percentage="selectedPercentage" status="success"></el-progress>
    <el-tabs tab-position="left" :value="selectedTab" @tab-click="handleSelect" class="maxWidth">
      <el-tab-pane :name="item._id" :key="item._id" v-for="item in planning">
        <span slot="label"><i class="el-icon-edit-outline"></i> {{item.release}}/{{item.sprint}}</span>
      </el-tab-pane>
      <el-tab-pane :name="item._id" :key="item._id" v-for="item in inprogress">
        <span slot="label"><i class="el-icon-menu"></i> {{item.release}}/{{item.sprint}}</span>
      </el-tab-pane>
      <el-tab-pane :name="item._id" :key="item._id" v-for="item in done">
        <span slot="label"><i class="el-icon-check"></i> {{item.release}}/{{item.sprint}}</span>
      </el-tab-pane>
      <el-tab-pane name="configuration" key="configuration">
        <span slot="label"><i class="el-icon-setting"></i> Configuration</span>
      </el-tab-pane>
      <el-tab-pane name="checktools" key="checktools">
        <span slot="label"><i class="el-icon-view"></i> Check Tools</span>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        menuMap: {},
        planning: [],
        inprogress: [],
        done: [],
        selectedTab: 'configuration',
        selectedPercentage: 0
      };
    },
    created: function () {
      this.$root.eventHub.$off('refreshDataRequest', () => {
        this.fetchData();
      });
      this.$root.eventHub.$on('refreshDataRequest', () => {
        this.fetchData();
      });
      this.$root.eventHub.$off('updatePercentage', (data) => {
        this.selectedPercentage = (parseInt(data.percentage, 10) || 100) > 100 ? 0 : parseInt(data.percentage, 10);
      });
      this.$root.eventHub.$on('updatePercentage', (data) => {
        this.selectedPercentage = (parseInt(data.percentage, 10) || 100) > 100 ? 0 : parseInt(data.percentage, 10);
      });
    },
    methods: {
      fetchData () {
        var that = this;
        if (!window.localStorage.getItem('module')) {
          return false;
        }
        this.axios.get('/admin/sprint?limit=8&module=' + window.localStorage.getItem('module')).then((response) => {
          if (response.data.status === 'success') {
            var menu = response.data.resData;
            that.menuMap = that.jsonfy(menu);
            if (window.localStorage.getItem('sprint') && (that.menuMap[window.localStorage.getItem('sprint')])) {
              that.selectedTab = window.localStorage.getItem('sprint');
            } else {
              if (menu[1].length > 0) {
                that.selectedTab = menu[1][0]._id;
              } else if (menu[0].length > 0) {
                that.selectedTab = menu[0][0]._id;
              } else if (menu[2].length > 0) {
                that.selectedTab = menu[2][0]._id;
              } else {
                that.selectedTab = 'configuration';
              }
              window.localStorage.setItem('sprint', (that.selectedTab !== 'configuration' ? that.selectedTab : ''));
            }
            that.updateRouter(that.selectedTab);
          } else {
            that.$message({
              message: response.data.resMsg,
              type: response.data.status
            });
            if (response.data.redirect) {
              window.location.href = response.data.redirect;
            }
          }
        })
        .catch((err) => {
          console.log(err);
          that.$message({
            message: 'Data fetch failed!',
            type: 'error'
          });
        });
      },
      jsonfy (data) {
        var mapRes = {};
        this.inprogress = [];
        this.planning = [];
        this.done = [];
        data.forEach((value, key, arr) => {
          if (value && value.length > 0) {
            value.forEach(function (item, index, list) {
              if (!mapRes[item._id]) {
                mapRes[item._id] = item;
              }
            });
          }
        });
        for (var key in mapRes) {
          if (mapRes[key].status === 'planning') {
            this.planning.push(mapRes[key]);
          }
          if (mapRes[key].status === 'inprogress') {
            this.inprogress.push(mapRes[key]);
          }
          if (mapRes[key].status === 'done') {
            this.done.push(mapRes[key]);
          }
        }
        return mapRes;
      },
      handleSelect (evt) {
        if (evt.$props.name !== 'configuration' && evt.$props.name !== 'checktools') {
          window.localStorage.setItem('sprint', evt.$props.name);
          this.$root.eventHub.$emit('refreshDataRequest', {type: 'changeSprint', current: this.$route.path, target: this.menuMap[evt.$props.name].status === 'planning' ? '/planning' : '/dashboard'});
        }
        this.updateRouter(evt.$props.name);
      },
      updateRouter (_id) {
        if (_id === 'configuration' || _id === 'checktools') {
          this.$router.push('/' + _id + '/' + window.localStorage.getItem('module') + window.localStorage.getItem('sprint'));
        } else {
          if (this.menuMap[_id].status === 'planning') {
            this.$router.push('/planning/' + window.localStorage.getItem('module') + window.localStorage.getItem('sprint'));
          } else {
            this.$router.push('/dashboard/' + window.localStorage.getItem('module') + window.localStorage.getItem('sprint'));
          }
        }
      }
    }
  };
</script>

<style>
  .sidebar .el-tabs__item {
    color: white;
  }
  .sidebar .el-tabs__item.is-active{
    color: #409EFF;
  }
  .maxWidth .el-tabs__item{
    max-width: 165px;
  }
  .maxWidth .el-tabs__item span{
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>