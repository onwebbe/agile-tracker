<template>
  <div>
    <el-row :gutter="20" type="flex" align="middle">
      <el-col :span="4" >JQL for Stories</el-col>
      <el-col :span="16">
        <el-input
          type="textarea"
          :rows="2"
          placeholder="JQL for stories"
          v-model="jql">
        </el-input>
      </el-col>
      <el-col :span="4">
        <el-button type="primary" @click="fetchData" plain>Check</el-button>
      </el-col>
    </el-row>
    <el-row style="margin: 20px;">
      <el-col :span="2" v-for="item in statistic" :key="item.label" >
        <el-badge :value="item.count" class="item">
          <el-button type="warning" plain size="mini" round>{{item.label}}</el-button>
        </el-badge>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-table
          :data="storyList"
          style="width: 100%">
          <el-table-column
            prop="type"
            align="left"
            label="Type">
          </el-table-column>
          <el-table-column
            prop="key"
            label="Key"
            sortable 
            align="left"
            :formatter="formatter" 
            :filters="filter" 
            :filter-method="filterHandler">
          </el-table-column>
          <el-table-column
            prop="summary"
            width="400"
            align="left"
            label="Summary">
          </el-table-column>
          <el-table-column
            prop="status"
            align="left"
            label="Status">
          </el-table-column>
          <el-table-column
            prop="assignee"
            align="left"
            label="Assignee">
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import { Loading } from 'element-ui';
  export default {
    data () {
      return {
        jql: window.localStorage.getItem('checkJql') || '',
        storyList: [],
        filter: [],
        statistic: []
      };
    },
    methods: {
      fetchData () {
        window.localStorage.setItem('checkJql', this.jql);
        var that = this;
        if (!this.jql) {
          this.$message({
            message: 'Please input jql!',
            type: 'error'
          });
          return false;
        }
        this.statistic = [];
        var loading = Loading.service({fullscreen: true,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)',
          text: 'Loading...'});
        this.axios.post('/admin/tools/checkstory', {
          module: window.localStorage.getItem('module'),
          jql: this.jql
        })
        .then(function (response) {
          if (response.data.status === 'success') {
            that.storyList = response.data.resData.list || [];
            for (var key in response.data.resData.modules) {
              that.filter.push({
                text: key,
                value: key
              });
            }
            var tempModule = response.data.resData.modules;
            for (var module in tempModule) {
              tempModule[module] = (that.storyList.filter((value) => {
                return value.key.indexOf(module) !== -1;
              })).length;
            }
            for (var res in tempModule) {
              that.statistic.push({
                label: res,
                count: tempModule[res]
              });
            };
          } else {
            that.$message({
              message: response.data.resMsg,
              type: response.data.status
            });
          }
          loading.close();
        })
        .catch(function (err) {
          loading.close();
          console.log(err);
          that.$message({
            message: 'Data fetched failed, try again later!',
            type: 'error'
          });
        });
      },
      filterHandler (value, row, column) {
        return row['key'].indexOf(value) !== -1;
      },
      formatter (row, column, cellValue) {
        var url = 'https://jira.successfactors.com/browse/' + cellValue;
        return <a href= {url} target="_blank">{cellValue}</a>;
      }
    }
  };
</script>

<style scoped>
</style>