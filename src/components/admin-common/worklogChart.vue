
<template>
  <div>
    <el-card class="box-card">
      <div id="worklogChart" style="height:400px;"></div>
    </el-card>
    <el-dialog :title="popupTitle" :visible.sync="showPopup" >
      <el-table :data="tableData" max-height="800" border>
        <el-table-column sortable v-for="item in tableColumns" align="left" :key="item.key" :formatter="item.formatter" :prop="item.key" :label="item.label">
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
  import { Loading } from 'element-ui';
  var echarts = require('echarts/lib/echarts');
  require('echarts');

  export default {
    data () {
      return {
        popupTitle: '',
        showPopup: false,
        tableData: [],
        tableColumns: [],
        remainingColumnsMap: [{
          label: 'Owner',
          key: 'owner'
        }, {
          label: 'Remaining Effort (H)',
          key: 'leftEstimate'
        }, {
          label: 'Ticket Key',
          key: 'key',
          formatter: (row, column, cellValue) => {
            var url = 'https://jira.successfactors.com/browse/' + cellValue;
            return <a href={url} target="_blank">{cellValue}</a>;
          }
        }],
        loggedColumnsMap: [{
          label: 'Owner',
          key: 'owner'
        }, {
          label: 'Logged Effort (H)',
          key: 'loggedEffort'
        }, {
          label: 'Ticket Key',
          key: 'key',
          formatter: (row, column, cellValue) => {
            var url = 'https://jira.successfactors.com/browse/' + cellValue;
            return <a href={url} target="_blank">{cellValue}</a>;
          }
        }, {
          label: 'Date',
          key: 'created',
          formatter: (row, column, cellValue) => {
            return new Date(cellValue).toLocaleString();
          }
        }]
      };
    },
    mounted () {
    },
    methods: {
      createChart: function () {
        if (this.myChart) {
          return;
        }
        var that = this;
        this.myChart = echarts.init(document.getElementById('worklogChart'));
        this.myChart.on('click', function (params) {
          if (params.type === 'click' && params.seriesName === 'Left' && params.seriesType === 'bar') {
            that.popupTitle = 'Remaining Tasks';
            that.tableColumns = that.remainingColumnsMap;
            that.tableData = (params.data.list || []).map((item) => {
              item.leftEstimate = Math.ceil(item.leftEstimate / 3600);
              return item;
            });
            that.showPopup = true;
          }
          if (params.type === 'click' && params.seriesName === 'Logged' && params.seriesType === 'bar') {
            that.popupTitle = 'Effort Logged History';
            that.tableColumns = that.loggedColumnsMap;
            that.tableData = (params.data.list || []).map((item) => {
              item.created = new Date(item.created).valueOf();
              return item;
            });
            that.showPopup = true;
          }
        });
        this.myChart.setOption(
          {
            title: {
              text: 'Effort Track Status'
            },
            tooltip: {
              show: true,
              trigger: 'item'
            },
            legend: {
              data: ['Left', 'Logged']
            },
            toolbox: {
              show: true,
              feature: {
                mark: {show: true},
                magicType: {
                  show: true,
                  type: ['line', 'bar', 'stack', 'tiled'],
                  title: {
                    line: 'line',
                    bar: 'bar',
                    stack: 'stack',
                    tiled: 'tiled'
                  }
                }
              }
            },
            calculable: true,
            yAxis: {
              type: 'value',
              name: 'Hours',
              axisLabel: {
                formatter: '{value}'
              }
            },
            xAxis: {
              type: 'category',
              data: [],
              axisLabel: {
                interval: 0
              }
            },
            series: [
              {
                name: 'Left',
                type: 'bar',
                stack: 'Left',
                data: [],
                itemStyle: {
                  normal: {
                    borderRadius: 5,
                    color: 'rgb(230, 162, 60)',
                    label: {
                      show: true,
                      textStyle: {
                        fontSize: '20',
                        fontFamily: '微软雅黑',
                        fontWeight: 'bold'
                      }
                    }
                  }
                },
                markLine: {
                  data: [
                    {type: 'average', name: 'Average'}
                  ]
                }
              },
              {
                name: 'Logged',
                type: 'bar',
                itemStyle: {
                  normal: {
                    borderRadius: 5,
                    color: 'rgb(64, 158, 255)',
                    label: {
                      show: true,
                      textStyle: {
                        fontSize: '20',
                        fontFamily: '微软雅黑',
                        fontWeight: 'bold'
                      }
                    }
                  }
                },
                data: [],
                markLine: {
                  data: [
                    {type: 'average', name: 'Average'}
                  ]
                }
              }
            ]
          });
      },
      fetchData: function (isRefresh, sprintinfo) {
        this.createChart();
        this.sprintinfo = sprintinfo;
        if (!this.sprintinfo._id) {
          this.setData({
            resData: {
              data: {}
            }
          });
          return false;
        }
        var loading = Loading.service({fullscreen: true,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)',
          text: 'Loading...'});
        var that = this;
        var options = 'refresh=' + (isRefresh || '') + '&sprintid=' + (this.sprintinfo._id || '') + '&start=' + (this.sprintinfo.start || '') + '&end=' + (this.sprintinfo.end || '') + '&module=' + window.localStorage.getItem('module');
        this.axios.get('/admin/dashboard/worklog?' + options)
        .then(function (response) {
          loading.close();
          if (response.data.status === 'success') {
            that.setData(response.data);
            if (isRefresh === 'y') {
              that.$emit('updatepints');
            }
          } else {
            that.$message({
              message: response.data.resMsg,
              type: response.data.status
            });
          }
        })
        .catch(function (err) {
          console.log(err);
          that.$message({
            message: 'Data request failed!',
            type: 'error'
          });
        });
      },
      refresh: function (sprintinfo) {
        this.fetchData('y', sprintinfo);
      },
      setData: function (originalData) {
        var data = originalData.resData ? originalData.resData.data : {};
        var usermap = originalData.usermap || {};
        var xAxis = [];
        var leftArr = [];
        var loggedArr = [];
        for (var key in data) {
          xAxis.push((usermap[key] || key));
          leftArr.push({
            value: data[key].leftEstimate / 3600,
            list: data[key].leftList || []
          });
          loggedArr.push({
            value: data[key].loggedEffort / 3600,
            list: data[key].loggedHistory || []
          });
        }
        this.myChart.setOption({
          xAxis: {
            type: 'category',
            data: xAxis,
            axisLabel: {
              interval: 0
            }
          },
          series: [
            {
              name: 'Left',
              type: 'bar',
              stack: 'Left',
              data: leftArr,
              itemStyle: {
                normal: {
                  borderRadius: 5,
                  color: 'rgb(230, 162, 60)',
                  label: {
                    show: true,
                    textStyle: {
                      fontSize: '20',
                      fontFamily: '微软雅黑',
                      fontWeight: 'bold'
                    }
                  }
                }
              }
            },
            {
              name: 'Logged',
              type: 'bar',
              itemStyle: {
                normal: {
                  borderRadius: 5,
                  color: 'rgb(64, 158, 255)',
                  label: {
                    show: true,
                    textStyle: {
                      fontSize: '20',
                      fontFamily: '微软雅黑',
                      fontWeight: 'bold'
                    }
                  }
                }
              },
              data: loggedArr
            }
          ]
        });
      }
    }
  };
</script>