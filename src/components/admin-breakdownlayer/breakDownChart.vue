/*
  author: onwebbe (tai)
*/

<template>
  <div class="chartsummary" style="display: block;position: relative;z-index: 1;">
  </div>
</template>

<script>
import VUEChart from '@/chartjs/VUEChart.js';

export default {
  props: {
    'sprintid': {
      type: String,
      default: true
    },
    'chartwidth': {
      type: Number,
      default: 400
    },
    'chartheight': {
      type: Number,
      default: 200
    }
  },
  name: 'ChartMainPage',
  data () {
    return {
      chart: null,
      allPoints: [],
      allLines: [],
      allData: null,
      allGroups: null,
      summary: null,
      localchartwidth: 0,
      localchartheight: 0
    };
  },
  methods: {
    _isHaveAddStory: function (storyList, group) {
      var totalAddedPoint = 0;
      for (let i = 0; i < storyList.length; i++) {
        var story = storyList[i];
        var isAdd = story.AddStory;
        var point = story.points;
        var ingroup = story.ingroup;
        for (let j = 0; j < ingroup.length; j++) {
          let groupObj = ingroup[j];
          let groupname = groupObj.groupname;
          if (groupname === group && isAdd === true) {
            totalAddedPoint += point;
            break;
          }
        }
      }
      return totalAddedPoint;
    },
    updateData: function (response) {
      this.chart.emptyData();
      this.allData = response.resData;
      var summary = response.resData.summary;
      var constances = response.resData.constances;
      var initialPoints = response.resData.initialPoints;
      var issueResovledStatus = response.resData.constances.storyIssueResovledStatus;
      var dataByGroup = {};
      var groupIndex = 0;
      for (let group in initialPoints) {
        this.addNewGroup(group, groupIndex);
        groupIndex++;
      }
      if (summary.length > 0) {
        let i = 0;
        let summ = summary[i + 1];
        if (summary.length === 1) {
          summ = summary[i];
        }
        let day = summ.day;
        let groups = summ.groups;
        let todayStoryList = summ.storyList;
        for (let groupid in groups) {
          let groupObj = groups[groupid];
          if (dataByGroup[groupid] == null) {
            dataByGroup[groupid] = {};
          }
          dataByGroup[groupid]['day'] = day;
          dataByGroup[groupid]['blocker'] = groupObj['blocker'];
          dataByGroup[groupid]['followup'] = groupObj['followup'];
          dataByGroup[groupid]['point'] = groupObj.points;
          let currentPoint = groupObj.currentPoint;

          let todayAddPoint = this._isHaveAddStory(todayStoryList, groupid);
          let cssstyle = {};
          if (todayAddPoint > 0) {
            cssstyle = {'border': '2px solid black'};
          }
          let addedPoint = this.chart.addPoint(i, currentPoint, groupid, {cssstyle: cssstyle, type: 'all', group: groupid, summarydata: summ, constances: constances});
          this.allPoints.push(addedPoint);
        }
      }
      for (let i = 1; i < summary.length; i++) {
        let summ = summary[i];
        let day = summ.day;
        let todayStoryList = summ.storyList;
        let groups = summ.groups;
        for (let groupid in groups) {
          let groupObj = groups[groupid];
          if (dataByGroup[groupid] == null) {
            dataByGroup[groupid] = {};
          }
          dataByGroup[groupid]['day'] = day;
          dataByGroup[groupid]['blocker'] = groupObj['blocker'];
          dataByGroup[groupid]['followup'] = groupObj['followup'];
          dataByGroup[groupid]['point'] = groupObj.points;
          let currentPoint = groupObj.currentPoint;
          let todayAddPoint = this._isHaveAddStory(todayStoryList, groupid);
          let cssstyle = {};
          if (todayAddPoint > 0) {
            cssstyle = {'border': '2px solid rgba(245, 108, 108, 0.8)'};
          }

          this.allPoints.push(this.chart.addPoint(i, currentPoint, groupid, {cssstyle: cssstyle, type: 'all', group: groupid, summarydata: summ, constances: constances}));
        }
      }
      this.chart.renderBar();
      this.chart.reScaleChart();
      this.chart.reAddAllGroupLine();
      var linesGroup = this.chart.getGroupsData();
      var lines = [];
      for (let group in linesGroup) {
        lines = lines.concat(linesGroup[group].lines);
      }
      for (let i = 0; i < lines.length; i++) {
        var line = lines[i];
        var lineEndPoint = line.endPoint;
        let groups = lineEndPoint.extraData.summarydata.groups;
        var ifLineBlock = false;
        for (let groupid in groups) {
          let groupItem = groups[groupid];
          var groupBlocker = groupItem.blocker;
          if (groupBlocker != null && groupBlocker.length > 0) {
            for (let j = 0; j < groupBlocker.length; j++) {
              var groupBlockerItem = groupBlocker[j];
              if (groupBlockerItem.status !== issueResovledStatus && lineEndPoint.extraData.group === groupid) {
                // console.log('we have block issue at sprint day:' + i);
                ifLineBlock = true;
                break;
              }
            }
          }
        }

        var ifLineFollowup = false;
        for (let groupid in groups) {
          let groupItem = groups[groupid];
          var groupFollowup = groupItem.followup;
          if (groupFollowup != null && groupFollowup.length > 0) {
            for (let j = 0; j < groupFollowup.length; j++) {
              var groupFollowupItem = groupFollowup[j];
              if (groupFollowupItem.status !== issueResovledStatus && lineEndPoint.extraData.group === groupid) {
                // console.log('we have followup issue at sprint day:' + i);
                ifLineFollowup = true;
                break;
              }
            }
          }
        }

        if (ifLineBlock) {
          let left = parseInt(line.ele.css('left')) + 1;
          let top = parseInt(line.ele.css('top')) - 1;
          line.ele.css('left', left + 'px');
          line.ele.css('top', top + 'px');
          line.ele.css('border-top', '2px solid red');
        }
        if (ifLineFollowup) {
          let left = parseInt(line.ele.css('left')) + 1;
          let top = parseInt(line.ele.css('top')) - 1;
          line.ele.css('left', left + 'px');
          line.ele.css('top', top + 'px');
          line.ele.css('border-bottom', '2px solid #F7931E');
        }
      }

      this.chart.reRenderGroupVisible();
      this.chart.reActivePoint();
    },
    addNewGroup: function (groupname, index) {
      var i = 0;
      var selectedColor = null;
      for (var color in VUEChart.colors) {
        if (i === index) {
          selectedColor = VUEChart.colors[color];
          break;
        }
        i++;
      }
      this.chart.addGroup(groupname, {color: selectedColor});
    },
    prepareChart: function (width, height, maxX) {
      var chartWidth = this.localchartwidth;
      if (width) {
        chartWidth = width;
      }
      var chartHeight = this.localchartheight;
      if (height) {
        chartHeight = height;
      }
      let chart = new VUEChart('.chartsummary', chartWidth, chartHeight, maxX, {pointHeight: 5, pointWidth: 5});
      this.chart = chart;
    },
    resizeChart: function (width, height, maxX) {
      $('.chartsummary').empty();
      this.prepareChart(width, height, maxX);
      this.updateData(this.cachedResponse);
      if (this.currentClickedPoint) {
        var currentClickedEle = $('.chartsummary .chartArea [pointid=' + this.currentClickedPoint + ']');
        currentClickedEle.click();
      }
    },
    sprintChanged: function (response, allGroups) {
      this.cachedResponse = response;
      this.allGroups = allGroups;
      var self = this;
      self.toggleSummary();
    },
    fetchData (inSprintId, width, height) {
      if (inSprintId !== undefined && inSprintId !== null && inSprintId !== '' && inSprintId === this.sprintid) {
        if (width) {
          this.localchartwidth = width;
        }
        if (height) {
          this.localchartheight = height;
        }
        var self = this;
        var sprintid = inSprintId;
        this.axios.get('/api/v1/getGroups?sprintid=' + sprintid).then(function (groupsData) {
          self.allGroups = groupsData.data.resData;
          self.axios.get('/api/v1/summary?sprintid=' + sprintid).then(function (summarydata) {
            self.summary = summarydata.data.resData;
            self.sprintChanged(summarydata.data);
          });
        });
      }
    },
    toggleSummary: function (width, height) {
      var chartWidth = this.localchartwidth;
      if (width) {
        chartWidth = width;
      }
      var chartHeight = this.localchartheight;
      if (height) {
        chartHeight = height;
      }
      var sprintTotalDayCount = this.cachedResponse.resData.sprintTotalDayCount;
      this.resizeChart(chartWidth, chartHeight, sprintTotalDayCount - 1);
    }
  },
  created: function () {
    if (this.$root.eventHub) {
      this.$root.eventHub.$on('getBreakDownChart', this.fetchData);
    }
    this.localchartheight = this.chartheight;
    this.localchartwidth = this.chartwidth;
  },
  mounted: function () {
    // this.prepareChart();
  },
  watch: {
    chartheight: function () {
      this.localchartheight = this.chartheight;
    },
    chartwidth: function () {
      this.localchartwidth = this.chartwidth;
    }
  },
  components: {
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
aside {
  min-width: 400px;
}
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.toDashboard {
  text-align: right;
  padding: 0px 20px;
  position: fixed;
  top: 20px;
  width: 100%;
  right: 50px;
  z-index: 10;
}
.chart {
}
.title {
  position: fixed;
  width: 100%;
  font-weight: bold;
}
/* 可以设置不同的进入和离开动画 */
/* 设置持续时间和动画函数 */
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active for below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}

@keyframes foldExpand
{
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
  100% {
    opacity: 1;
  }
}
.summaryIcon {
  /* animation: foldExpand 3s infinite; */
  opacity: 0.8;
}
</style>
