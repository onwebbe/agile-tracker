
<template>
  <div>
    <el-card class="box-card">
      <div id="estimationChart" style="height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
  import { Loading } from 'element-ui';
  var echarts = require('echarts/lib/echarts');
  require('echarts');

  export default {
    data () {
      return {
        sprintinfo: {},
        jql: ''
      };
    },
    mounted () {
      var that = this;
      this.myChart = echarts.init(document.getElementById('estimationChart'));
      this.myChart.on('click', function (params) {
        if (that.jql && params.type === 'click' && params.seriesName === 'Estimated' && params.data.name && params.seriesType === 'bar') {
          window.open('https://jira.successfactors.com/issues/?jql=' + 'assignee=' + params.data.name + ' AND ' + that.jql.replace('story', 'Sub-task'));
        }
      });
      this.myChart.setOption(
        {
          title: {
            text: 'Estimation Overview'
          },
          tooltip: {
            show: true,
            trigger: 'item'
          },
          legend: {
            show: true,
            data: ['Capacity', 'Estimated']
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
              name: 'Capacity',
              type: 'bar',
              stack: 'Capacity',
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
              data: [],
              markLine: {
                data: [
                  {type: 'average', name: '平均值'}
                ]
              }
            },
            {
              name: 'Estimated',
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
    methods: {
      fetchData: function (isRefresh, sprintinfo) {
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
        this.axios.get('/admin/planning/estimation?' + options)
        .then(function (response) {
          if (isRefresh === 'y') {
            that.$emit('updatepints');
          }
          loading.close();
          if (response.data.status === 'success') {
            that.setData(response.data);
            that.$root.eventHub.$emit('updatePercentage', {
              percentage: that.computePercentage(response.data)
            });
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
      computePercentage (data) {
        var capacity = 0;
        var estimation = 0;
        for (var cap in data.capacity) {
          capacity += data.capacity[cap];
        }
        if (data.resData && data.resData.data) {
          for (var est in data.resData.data) {
            estimation += data.resData.data[est].leftEstimate;
          }
        }
        return Math.ceil((estimation / 3600 || 0) / (capacity || 1) * 100);
      },
      refresh: function (sprintinfo) {
        this.fetchData('y', sprintinfo);
      },
      setData: function (originalData) {
        var data = (originalData.resData && originalData.resData.data) || {};
        this.jql = originalData.jql;
        var capacity = originalData.capacity || {};
        var usermap = originalData.usermap || {};
        var inummap = originalData.inummap || {};
        var xAxis = [];
        var capacityArr = [];
        var estimatedArr = [];
        for (var key in data) {
          xAxis.push((usermap[key] || key));
          capacityArr.push({
            name: inummap[key],
            value: capacity[key]
          });
          estimatedArr.push({
            name: inummap[key],
            value: data[key].leftEstimate / 3600
          });
        }
        for (var userid in usermap) {
          if (!data[userid]) {
            xAxis.push((usermap[userid] || userid));
            capacityArr.push({
              name: inummap[userid],
              value: capacity[userid]
            });
            estimatedArr.push({
              name: inummap[userid],
              value: 0
            });
          }
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
              name: 'Capacity',
              type: 'bar',
              stack: 'Capacity',
              data: capacityArr,
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
              name: 'Estimated',
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
              data: estimatedArr
            }
          ]
        });
      }
    }
  };
</script>