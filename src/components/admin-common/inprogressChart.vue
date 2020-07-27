
<template>
  <div>
    <el-card class="box-card" style="margin-bottom: 10px;">
      <el-row :gutter="2">
        <el-col :span="22">
          <div id="inprogressChart" style="height:233px;"></div>
        </el-col>
        <el-col :span="8" v-show="false">
         <div id="inprogressPie" style="height:233px;"></div>
        </el-col>
      </el-row>
    </el-card>
    <el-dialog :title="popupTitle" :visible.sync="showPopup" width="80%">
      <el-table :data="tableData" max-height="90%" border>
        <el-table-column sortable align="left" :key="tableColumns[0].key" :formatter="tableColumns[0].formatter" :prop="tableColumns[0].key" :label="tableColumns[0].label" >
        </el-table-column>
        <el-table-column sortable align="left" :key="tableColumns[1].key" :formatter="tableColumns[1].formatter" :prop="tableColumns[1].key" :label="tableColumns[1].label" >
        </el-table-column>
        <el-table-column sortable align="left" :key="tableColumns[2].key" :formatter="tableColumns[2].formatter" :prop="tableColumns[2].key" :label="tableColumns[2].label">
        </el-table-column>
        <el-table-column sortable align="left" :key="tableColumns[3].key" :formatter="tableColumns[3].formatter" :prop="tableColumns[3].key" :label="tableColumns[3].label">
        </el-table-column>
        <el-table-column sortable align="left" :key="tableColumns[4].key" :formatter="tableColumns[4].formatter" :prop="tableColumns[4].key" :label="tableColumns[4].label">
        </el-table-column>
        <el-table-column sortable align="left" :key="tableColumns[5].key" :formatter="tableColumns[5].formatter" :prop="tableColumns[5].key" :label="tableColumns[5].label">
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showPopup = false">Close</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  var echarts = require('echarts/lib/echarts');
  require('echarts');

  export default {
    data () {
      return {
        popupTitle: 'Story List',
        showPopup: false,
        tableData: [],
        tableColumns: [{
          label: 'Updater',
          key: 'updater'
        }, {
          label: 'Key',
          key: 'storykey',
          formatter: (row, column, cellValue) => {
            var url = 'https://jira.successfactors.com/browse/' + cellValue;
            return <a href= {url} target="_blank">{cellValue}</a>;
          }
        }, {
          label: 'Summary',
          key: 'summary'
        }, {
          label: 'Status',
          key: 'status',
          formatter: (row, column, cellValue) => {
            return cellValue === 'initial' ? row.initialstatus : cellValue;
          }
        }, {
          label: 'Points',
          key: 'points'
        }, {
          label: 'Date',
          key: 'jiracreatedat',
          formatter: (row, column, cellValue) => {
            return new Date(cellValue).toLocaleString();
          }
        }]
      };
    },
    methods: {
      createChart: function () {
        var that = this;
        if (!this.myChart) {
          this.myChart = echarts.init(document.getElementById('inprogressChart'));
          this.myChart.on('click', function (params) {
            if (params.type === 'click' && params.seriesType === 'bar') {
              that.tableData = params.data.list || [];
              that.showPopup = true;
            }
          });
          this.myChart.setOption(
            {
              title: {
                text: 'Inprogress Overview'
              },
              tooltip: {
                show: true,
                trigger: 'item'
              },
              legend: {
                show: true,
                right: '10px',
                data: ['Points', 'Count']
              },
              toolbox: {
                show: false,
                feature: {
                  magicType: {show: true, type: ['bar']}
                }
              },
              calculable: true,
              yAxis: {
                type: 'value',
                name: 'Points/Count',
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
                  name: 'Points',
                  type: 'bar',
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
                  data: []
                },
                {
                  name: 'Count',
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
                  data: []
                }
              ]
            });
        }
        if (!this.myPie) {
          this.myPie = echarts.init(document.getElementById('inprogressPie'));
          this.myPie.setOption({
            tooltip: {
              trigger: 'item',
              formatter: '{a}<br/>{b} : {c} ({d}%)'
            },
            legend: {
              orient: 'vertical',
              left: 'center',
              data: ['Passed Days', 'Remaining Days']
            }
          });
        }
      },
      setData: function (originalData) {
        this.createChart();
        var xAxis = ['Open&Inprogress', 'Commited', 'Done', 'Initial Commited'];
        var days = [{
          value: originalData.totaldays - originalData.leftdays,
          name: 'Passed Days'
        }, {
          value: originalData.leftdays,
          name: 'Remaining Days'
        }];
        var pointsArr = [{
          value: originalData.inprogresspoints,
          name: 'Total',
          list: originalData.inprogresstories
        }, {
          value: originalData.commitedpoints,
          name: 'Commited',
          list: originalData.commitedstories
        }, {
          value: originalData.donepoints,
          name: 'Done',
          list: originalData.donestories
        }, {
          value: originalData.initialcommited,
          name: 'Initial Commited',
          list: originalData.initialcommitedstories
        }];
        var countArr = [{
          value: originalData.inprogresstories.length,
          list: originalData.inprogresstories
        }, {
          value: originalData.commitedstories.length,
          list: originalData.commitedstories
        }, {
          value: originalData.donestories.length,
          list: originalData.donestories
        }, {
          value: originalData.initialcommitedstories.length,
          list: originalData.initialcommitedstories
        }];
        this.myPie.setOption({
          series: {
            label: {
              normal: {
                formatter: '{c}d({d}%)'
              }
            },
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: days,
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          },
          color: ['#E6A23C', '#67C23A']
        });
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
              name: 'Points',
              type: 'bar',
              data: pointsArr,
              itemStyle: {
                normal: {
                  borderRadius: 5,
                  color: '#E6A23C',
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
              name: 'Count',
              type: 'bar',
              itemStyle: {
                normal: {
                  borderRadius: 5,
                  color: '#67C23A',
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
              data: countArr
            }
          ]
        });
      }
    }
  };
</script>