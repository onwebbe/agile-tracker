
<template>
  <div>
    <el-card class="box-card">
      <div id="mainChart" style="height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
  var echarts = require('echarts/lib/echarts');
  require('echarts');
  require('echarts/lib/component/title');
  require('echarts/lib/chart/line');

  export default {
    mounted () {
    },
    methods: {
      createChart: function () {
        if (this.myChart) {
          return;
        }
        this.myChart = echarts.init(document.getElementById('mainChart'));
        this.myChart.setOption(
          {
            title: {
              text: 'Sprint History Review'
            },
            tooltip: {
              trigger: 'axis'
            },
            legend: {
              data: ['Planned', 'Commited', 'Done'],
              show: true,
              left: 'center'
            },
            toolbox: {
              show: true,
              feature: {
                magicType: {
                  type: ['line', 'bar'],
                  title: {
                    line: 'line',
                    bar: 'bar'
                  }
                }
              }
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: []
            },
            yAxis: {
              type: 'value',
              name: 'Points',
              axisLabel: {
                formatter: '{value}'
              }
            },
            series: [
              {
                name: 'Planned',
                type: 'line',
                data: [],
                itemStyle: {
                  normal: {
                    color: '#67C23A'
                  }
                }
              },
              {
                name: 'Done',
                type: 'line',
                data: []
              }
            ]
          });
      },
      fetchData () {
        this.createChart();
        var that = this;
        this.axios.get('/admin/dashboard/sprintHistoryPoints?module=' + window.localStorage.getItem('module')).then((response) => {
          if (response.data.status === 'success') {
            var responseData = response.data.resData;
            that.setData(responseData);
          } else {
            that.$message({
              message: response.data.resMsg,
              type: response.data.status
            });
          }
        })
        .catch((err) => {
          console.log(err);
          that.$message({
            message: 'Data error!',
            type: 'error'
          });
        });
      },
      setData: function (data) {
        this.myChart.setOption({
          series: [
            {
              name: 'Planned',
              type: 'line',
              data: data.planned,
              itemStyle: {
                normal: {
                  color: '#E6A23C'
                }
              }
            },
            {
              name: 'Commited',
              type: 'line',
              data: data.commited,
              itemStyle: {
                normal: {
                  color: '#409EFF'
                }
              }
            },
            {
              name: 'Done',
              type: 'line',
              data: data.done,
              itemStyle: {
                normal: {
                  color: '#67C23A'
                }
              },
              markLine: {
                data: [
                  {type: 'average', name: 'Average'}
                ]
              }
            }
          ],
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: data.axis
          }
        });
      }
    }
  };
</script>