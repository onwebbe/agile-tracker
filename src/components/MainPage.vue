/*
  author: onwebbe (tai)
*/

<template>
  <div class="mainPage">
    <sprint-select-dialog :dialogDisplay="dialogDisplay"></sprint-select-dialog>
    <!-- <div class="toDashboard">     
      <el-button type="success" plain icon="el-icon-edit" @click="openDialog">Change Sprint</el-button>
      <el-button type="primary" plain icon="el-icon-menu" @click="toDashbord">Dashboard</el-button>
      <el-button type="warning" plain icon="el-icon-menu" @click="toggleSummary">Toggle Summary</el-button>
    </div> -->
    <el-container>
      <el-header>
        <h1 class="title" style="">
        Burndown Chart by Story Point ({{module}} - {{sprint}})
        </h1>
      </el-header>
      <el-container>
        <el-main>
          <div class="myChartMain" style="">
          </div>
        </el-main>
        <div style="display:table-cell;vertical-align: middle;padding-top: 40px;">
          <!-- <img :src="isSummaryDisplay?foldIcon:expandIcon" style="width:30px;" @click="folderClicked" class="summaryIcon" v-bind:style="{ isSummaryDisplay: 'right: 0px;'}"> -->
          <div @click="folderClicked" class="summaryIcon el-icon-d-arrow-left" :class="{'summaryDisplay el-icon-d-arrow-right noanimation': isSummaryDisplay}"></div>
        </div>
        <transition name="slide-fade" v-on:after-leave="toggleSummary" v-on:after-enter="toggleSummary">
          <div style="display:table-cell;padding-top: 10px;" v-if="isSummaryDisplay">
            <el-aside width="25%" class="mainPageSummary" style="display:inline-block;">
              <!-- <router-view></router-view> -->
              <datasheet></datasheet>
            </el-aside>
          </div>
        </transition>
      </el-container>
      <el-footer>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import VUEChart from '@/chartjs/VUEChart.js';
import SprintDialogContent from '@/components/SprintSelectComponent';
import DataSheet from './DataSheet';

export default {
  name: 'ChartMainPage',
  data () {
    return {
      dialogDisplay: false,
      chart: null,
      allPoints: [],
      allLines: [],
      allData: null,
      module: '',
      sprint: '',
      cachedResponse: null,
      expandIcon: require('@/images/expand.png'),
      foldIcon: require('@/images/fold.png'),
      isSummaryDisplay: true,
      currentClickedPoint: null,

      allGroups: null,
      sprintid: null
    };
  },
  methods: {
    openDialog: function () {
      this.dialogDisplay = true;
      var self = this;
      setTimeout(function () {
        self.dialogDisplay = null;
      });
    },
    sprintSelected: function (sprintSelected) {
      let sprintName = sprintSelected.release + sprintSelected.sprint;
      this.module = sprintSelected.module;
      this.sprint = sprintName;
    },
    getLatestSummaryData: function () {
      // var allGroups = this.$root.sprintSelected.sprintgroups;
      var allSummaryLength = this.allData.summary.length;
      var latestDay = allSummaryLength - 1;
      var previousDay = latestDay - 1;
      if (previousDay < 0) {
        previousDay = 0;
      }
      if (latestDay >= 0) {
        var todayData = this.getSummaryByDate(latestDay);
        var previousDayData = this.getSummaryByDate(previousDay);
        var clickedGroup = '';
        /* for (var i = 0; i < allGroups.length; i++) {
          var groupItem = allGroups[i];
          clickedGroup = groupItem.groupname;
        } */
        var day = latestDay;
        if (this.$root.eventHub) {
          this.$root.eventHub.$emit('getDaySummary', day, clickedGroup, todayData, previousDayData, null, this.allGroups, this.allData, this.sprintid);
        }
      }
    },
    getSummaryByDate: function (date) {
      var summarys = this.allData.summary;
      var returnSummary = null;
      for (var i = 0; i < summarys.length; i++) {
        var summaryItem = summarys[i];
        var day = summaryItem.day;
        if (day === date) {
          returnSummary = summaryItem;
          break;
        }
      }
      return returnSummary;
    },
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
      this.getLatestSummaryData();
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
    toDashbord: function () {
      window.location.href = '/#/admin/home';
    },
    prepareChart: function (width, height, maxX) {
      var self = this;
      var window75Width = $(window).width() * 0.75;
      if (width == null) {
        width = window75Width - 100;
      }
      if (height == null) {
        height = $(window).height() - 200;
      }
      let chart = new VUEChart('.myChartMain', width, height, maxX);
      chart.addEventListener('pointclicked', function (evt) {
        chart.clearAllClickedPoint();
        self.currentClickedPoint = $(evt.sourceele).attr('pointid');
        let todayData = evt.data.data.extraData.summarydata;
        let day = evt.data.data.extraData.summarydata.day;
        let previousDay = (day === 0 ? 0 : day - 1);
        let previousData = self.getSummaryByDate(previousDay);
        let clickedGroup = evt.data.data.extraData.group;
        let type = evt.data.data.extraData.type;
        let isClicked = evt.data.isClicked;
        if (isClicked) {
          if (self.$root.eventHub) {
            self.$root.eventHub.$emit('getDaySummary', day, clickedGroup, todayData, previousData, type, self.allGroups, self.allData, self.sprintid);
          }
        } else {
          self.getLatestSummaryData();
        }
      });
      chart.addEventListener('chartClicked', function (evt) {
        self.currentClickedPoint = null;
        self.getLatestSummaryData();
      });
      chart.addEventListener('pointhoverenter', function (evt) {
        let constances = evt.data.pointdata.constances;
        let clickedGroup = evt.data.pointdata.group;
        let point = evt.data.point.y;
        var day = evt.data.point.x;
        let x = evt.data.point.positionX;
        let y = evt.data.point.positionY;
        let blocker = evt.data.pointdata.summarydata.groups[clickedGroup]['blocker'];
        let blockerCount = 0;
        if (blocker != null) {
          for (let i = 0; i < blocker.length; i++) {
            let blockerItem = blocker[i];
            if (blockerItem.status !== constances.storyIssueResovledStatus) {
              blockerCount++;
            }
          }
        }

        let followup = evt.data.pointdata.summarydata.groups[clickedGroup]['followup'];
        let followupCount = 0;
        if (followup != null) {
          for (let i = 0; i < followup.length; i++) {
            let followupItem = followup[i];
            if (followupItem.status !== constances.storyIssueResovledStatus) {
              followupCount++;
            }
          }
        }
        let displayContent = '<table><tr><td style="border-right:1px solid black;padding-right:5px;"><div>Day ' + day + ': ' + clickedGroup + '</div><div>Point: ' + point + '</div><div>Blocker: ' + blockerCount + '&nbsp;&nbsp;Followup: ' + followupCount + '</div></td><td style="padding-left:5px;">';
        displayContent += self._getStoryCountByCategory(evt.data.pointdata.summarydata.storyList);
        displayContent += '</td></tr></table>';
        // console.log(displayContent);
        chart.displayPopover(x, y, displayContent);
      });
      chart.addEventListener('pointhoverleave', function (evt) {
        // console.log('hide');
        chart.hidePopover();
      });
      /* chart.addGroup('null', {color: 'green'});
      chart.addPoint(0, 10, 'null');
      chart.renderBar(); */
      this.chart = chart;
    },
    _getStoryCountByCategory: function (storyList) {
      if (storyList == null) {
        return '';
      }
      var createHTML = '<div>';
      var storyStatusMap = {};
      for (var i = 0; i < storyList.length; i++) {
        var story = storyList[i];
        let storyStatus = story.status;
        if (storyStatusMap[storyStatus] == null) {
          storyStatusMap[storyStatus] = 1;
        } else {
          storyStatusMap[storyStatus] += 1;
        }
      }
      for (let storyStatus in storyStatusMap) {
        let count = storyStatusMap[storyStatus];
        createHTML += '<div><span>' + storyStatus + ':  </span><span>' + count + '</span></div>';
      }
      createHTML += '</div>';
      return createHTML;
    },
    resizeChart: function (width, height, maxX) {
      $('.myChartMain').empty();
      this.prepareChart(width, height, maxX);
      this.updateData(this.cachedResponse);
      if (this.currentClickedPoint) {
        var currentClickedEle = $('.myChartMain .chartArea [pointid=' + this.currentClickedPoint + ']');
        currentClickedEle.click();
      }
    },
    toggleSummary: function () {
      var windowWidth = $(window).width();
      var window75Width = windowWidth * 0.75;
      var sprintTotalDayCount = this.cachedResponse.resData.sprintTotalDayCount;
      if (this.isSummaryDisplay === true) {
        // $('.mainPageSummary').show();
        this.resizeChart(window75Width - 100, null, sprintTotalDayCount - 1);
      } else {
        // $('.mainPageSummary').hide();
        this.resizeChart(windowWidth - 100, null, sprintTotalDayCount - 1);
      }
    },
    folderClicked: function () {
      this.isSummaryDisplay = !this.isSummaryDisplay;
    },
    sprintChanged: function (response, allGroups, sprintid) {
      this.sprintid = sprintid;
      this.cachedResponse = response;
      this.allGroups = allGroups;
      this.toggleSummary();
    }
  },
  created: function () {
    if (this.$root.eventHub) {
      this.$root.eventHub.$on('sprintChanged', this.sprintChanged);
      this.$root.eventHub.$on('sprintSelected', this.sprintSelected);
    }
  },
  mounted: function () {
    // this.prepareChart();
  },
  components: {
    'sprint-select-dialog': SprintDialogContent,
    'datasheet': DataSheet
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
  top: 20px;
  width: 100%;
  right: 50px;
  z-index: 10;
}
.chart {
}
.title {
  width: 100%;
  font-weight: bold;
  font-size: 1.3rem;
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
    opacity: 0.8;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 0.8;
  }
}
.summaryIcon {
  /* animation: foldExpand 3s infinite; */
  opacity: 0.8;
  margin-right: 10px;
  animation: foldExpand 3s infinite;
  font-size: 1.5rem;
}
.summaryIcon.noanimation {
  animation: none;
}
.summaryIcon.summaryDisplay {
  margin-right: 0px;
  right: 0px;
}
</style>
<style>
.dataSheet > header {
  padding-left: 5px;
}
.dataSheet > main {
  padding-left: 5px;
}
</style>