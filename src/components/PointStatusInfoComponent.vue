/*
  author: onwebbe (tai)
*/
<template>
  <div class="pointInfoContainer">
    <add-block-dialog :dialogDisplay="dialogDisplay" :defaultValues="defaultAddIssueValues" :category="addIssueCategory"></add-block-dialog>
    <view-issues-dialog :dialogDisplay="viewIssueDialogDisplay" :group="group" :userStoryId="currentSelectedUserStoryId" :day="currentSelectedDay"></view-issues-dialog>
    <el-header class="pointStatus" style="height: 40px;">
      <el-row type="flex" class="row-bg" justify="space-around">
        <el-col :span="12">
          <span class="pointInfoTitle">Point Status</span>
        </el-col>
        <el-col :span="6">
        </el-col>
      </el-row>
    </el-header>
    <el-main style="padding: 0;">
      <div class="pointChangedHis">
        <el-row type="flex" class="row-bg" justify="space-around">
          <el-col :span="9">
            <i class="el-icon-caret-bottom successContent"></i>
            <span class="successContent">{{reduceCount}}</span>
          </el-col>
          <el-col :span="9">
            <i class="el-icon-caret-top blockContent"></i>
            <span class="blockContent">{{removedCount}} <span class="minFontSize" v-show="addCount > 0">({{addCount}})</span></span>
          </el-col>
        </el-row>
        <el-row type="flex" class="row-bg" justify="space-around" style="height: 30px;line-height: 30px;">
          <el-col :span="9">
            <span class="pointInfoTitle listItem">Today Points:</span>
          </el-col>
          <el-col :span="9">
            <span class="pointContent">{{currentPoint}} points</span>
          </el-col>
        </el-row>
        <el-row type="flex" class="row-bg" justify="space-around" style="height: 30px;line-height: 30px;">
          <el-col :span="9">
            <span class="pointInfoTitle">Last Day Points:</span>
          </el-col>
          <el-col :span="9">
            <span class="successContent">{{previousPoint}} points</span>
          </el-col>
        </el-row>
      </div>
      <div class="pointChangedItem">
        <el-row type="flex" class="row-bg" justify="space-around">
          <el-col :span="21">
            <span class="pointInfoTitle">Changed Items  ( {{changedItems.length}} )</span>
          </el-col>
        </el-row>
        <el-table :data="changedItems" class="changeItemTab" style="width: 100%" :show-header="false" :row-class-name="tableRowClassName">
          <el-table-column prop="storykey" width="120">
            <template slot-scope="changedItemData">
              <span>
                <a target="_blank" :href="'https://jira.successfactors.com/browse/' + changedItemData.row.storykey"> {{changedItemData.row.storykey}} </a>
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="points" width="50"></el-table-column>
          <el-table-column prop="status" ></el-table-column>
        </el-table>
      </div>
      <div class="workingInProgressItem">
        <el-row type="flex" class="row-bg" justify="space-around">
          <el-col :span="10">
            <span class="pointInfoTitle">Processing Items  ( {{inProgressItems.length}} )</span>
          </el-col>
          <el-col :span="8">
            <span>Show</span>
            <el-switch
              v-model="isShowAllProcessingItem"
              active-color="#13ce66"
              inactive-color="#ff4949">
            </el-switch>
          </el-col>
        </el-row>
        <el-table :data="inProgressItems" class="changeItemTab" style="width: 100%" :show-header="false" v-show="isShowAllProcessingItem">
          <el-table-column width="120">
            <template slot-scope="scope">
              <span>
                <a target="_blank" :href="'https://jira.successfactors.com/browse/' + scope.row.storykey">{{scope.row.storykey}}</a> <span v-if="scope.row.storyIssueCount > 0" class="boldFont"> ({{scope.row.storyIssueCount}}) </span>
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="points" width="50"></el-table-column>
          <el-table-column prop="status">
            <template slot-scope="scope">
              <el-popover
                ref="storyFunction"
                placement="bottom"
                width="200"
                trigger="click"
                popper-class="popoverMinWidth">
                <el-row>
                  <el-button type="text" @click="viewIssues(scope.row)">View issues</el-button>
                </el-row>
                <el-row v-show="isLastDay">
                  <el-button type="text" @click="addIssue('block', scope.row)">Add a block</el-button>
                </el-row>
                <el-row v-show="isLastDay">
                  <el-button type="text" @click="addIssue('followup')">Add a followup</el-button>
                </el-row>
              </el-popover>
              <span v-popover:storyFunction>{{scope.row.status}}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-main>
  </div>
</template>

<script>
import AddDialogContent from '@/components/AddIssueDialog';
import ViewIssuesDialog from '@/components/ViewIssuesDialog';
export default {
  components: {
    'add-block-dialog': AddDialogContent,
    'view-issues-dialog': ViewIssuesDialog
  },
  data () {
    return {
      group: '',
      reduceCount: 0,
      addCount: 0, // story added for the sprint in this day it means the story been added to sprint at this day
      removedCount: 0, // story added for this day it means status changed and story been moved out from the current group
      currentPoint: 0,
      previousPoint: 0,
      changedItems: [],
      inProgressItems: [],
      isShowAllProcessingItem: true,
      dialogDisplay: false,
      defaultAddIssueValues: {},
      addIssueCategory: 'block',
      currentSelectedUserStoryId: '',
      currentSelectedDay: 0,
      viewIssueDialogDisplay: false,
      isLastDay: false,

      allGroups: null,
      summary: null
    };
  },
  created: function () {
    if (this.$root.eventHub) {
      this.$root.eventHub.$on('getDaySummary', this.getDayStorySummary);
    }
  },
  mounted: function () {
  },
  methods: {
    addIssue: function (category, storyItem) {
      this.dialogDisplay = true;
      this.defaultAddIssueValues['biSelected'] = {'storykey': storyItem.storykey, '_id': storyItem._id};
      var groups = this.allGroups;
      var groupObj = null;
      for (var i = 0; i < groups.length; i++) {
        var groupItem = groups[i];
        if (this.group === groupItem.groupname) {
          groupObj = groupItem;
          break;
        }
      }
      if (groupObj !== null) {
        this.defaultAddIssueValues['issueGroup'] = {'groupname': groupObj.groupname, '_id': groupObj._id};
        var self = this;
        setTimeout(function () {
          self.dialogDisplay = null;
        });
        this.addIssueCategory = category;
      }
    },
    viewIssues: function (row) {
      var self = this;
      this.currentSelectedUserStoryId = row._id;
      this.viewIssueDialogDisplay = true;
      setTimeout(function () {
        self.viewIssueDialogDisplay = null;
      });
    },
    tableRowClassName ({row, rowIndex}) {
      if (row.AddStory || row.RemovedRedStory) {
        return 'blockContent';
      } else {
        return 'successContent';
      }
    },
    getDayStorySummary (day, group, todayObj, previousObj, type, allGroups, summary) {
      this.summary = summary;
      this.allGroups = allGroups;
      if ((summary.summary.length - 1) === day) {
        this.isLastDay = true;
      } else {
        this.isLastDay = false;
      }
      this.currentSelectedDay = day;
      this.group = group;
      let calGroups = [group];
      if (group === '') {
        calGroups = [];
        for (var i = 0; i < allGroups.length; i++) {
          calGroups.push(allGroups[i].groupname);
        }
      }

      let allPoint = 0;
      let allPrevPoint = 0;
      let allRedCount = 0;
      let allAddCount = 0;
      for (let i = 0; i < calGroups.length; i++) {
        var currentGroup = calGroups[i];
        let currentData = todayObj['groups'][currentGroup];
        let previousData = previousObj['groups'][currentGroup];
        allRedCount += currentData['points']['red'];
        // allAddCount += currentData['points']['add'];
        allPoint += currentData.currentPoint;
        allPrevPoint += previousData.currentPoint;
        allAddCount += this._getNewlyAddedPoints(todayObj.storyList, currentGroup);
      }
      /* if (allAddCount > 0) {
        allRedCount = allRedCount + allAddCount;
      } */
      this.reduceCount = allRedCount;
      this.addCount = allAddCount;
      this.currentPoint = allPoint;
      this.previousPoint = allPrevPoint;

      // this.changedItems = todayObj.storyList;
      this.getChangedItems(day, calGroups, todayObj);
      this.getInProgressItems(todayObj, calGroups);
    },
    _getNewlyAddedPoints (storyList, group) {
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
    _searchStoryInList: function (storyList, story) {
      for (let i = 0; i < storyList.length; i++) {
        let st = storyList[i];
        if (st._id === story._id) {
          return st;
        }
      }
      return null;
    },
    _getTodayRemovedFromRedStory: function (todayObj, previousObj, day) {
      let todaySumm = this.$root.getDayDataDay(day, this.summary);
      let todayStoryList = todaySumm.storyList;
      var removedList = [];
      var todayRedStoryList = todayObj.points.redStorys;
      var previousRedStoryList = previousObj.points.redStorys;
      let removedStoryListPoint = 0;
      for (let i = 0; i < previousRedStoryList.length; i++) {
        let prevStory = previousRedStoryList[i];
        if (!this._searchStoryInList(todayRedStoryList, prevStory)) {
          let todayRemovedStory = this._searchStoryInList(todayStoryList, prevStory);
          if (!this._searchStoryInList(removedList, todayRemovedStory)) {
            todayRemovedStory.RemovedRedStory = true;
            removedStoryListPoint += todayRemovedStory.points;
            removedList.push(todayRemovedStory);
          }
        }
      }
      // if the story status changed and current reduce story do not have this, then it is only the added story not the reduce story
      // require to delete the point from reduce count
      this.reduceCount = this.reduceCount - removedStoryListPoint;
      this.removedCount = removedStoryListPoint;
      return removedList;
    },
    prepareDataForGroupWorkingStatus: function () {
      var groups = this.allGroups;
      var groupWorkingStatusMap = {};
      for (let i = 0; i < groups.length; i++) {
        let groupItem = groups[i];
        let groupName = groupItem.groupname;
        let groupWorkingStatus = groupItem.groupworkingstatus;
        if (groupWorkingStatusMap[groupName] === undefined) {
          groupWorkingStatusMap[groupName] = {};
        }
        for (let j = 0; j < groupWorkingStatus.length; j++) {
          let groupWorkingStatusText = groupWorkingStatus[j];
          groupWorkingStatusMap[groupName][groupWorkingStatusText] = true;
        }
      }
      return groupWorkingStatusMap;
    },
    getInProgressItems: function (todayObj, group) {
      var inProgressItems = [];
      for (let i = 0; i < group.length; i++) {
        var currentGroup = group[i];
        var todayUserStory = todayObj.storyList;
        var groupWorkingAvailability = this.prepareDataForGroupWorkingStatus();
        for (let i = 0; i < todayUserStory.length; i++) {
          let userStoryItem = JSON.parse(JSON.stringify(todayUserStory[i]));
          let status = userStoryItem.status;
          let storyKey = userStoryItem.storykey;
          let storyID = userStoryItem._id;
          let storyIssueCount = this._getIssueCount(todayObj, storyID, group).length;
          if (groupWorkingAvailability[currentGroup] != null && groupWorkingAvailability[currentGroup][status] !== undefined) {
            userStoryItem.displayStoryKey = storyKey + ' (' + storyIssueCount + ')';
            userStoryItem.storyIssueCount = storyIssueCount;
            inProgressItems.push(userStoryItem);
          }
        }
      }
      this.inProgressItems = inProgressItems;
    },
    _getIssueCount: function (todayItem, storyID, group) {
      this.groupList = this.allGroups;
      var allIssues = [];
      var calGroups = [this.group];
      if (this.group === '') {
        let allGroups = this.allGroups;
        calGroups = [];
        for (let i = 0; i < allGroups.length; i++) {
          calGroups.push(allGroups[i].groupname);
        }
      }

      for (let i = 0; i < calGroups.length; i++) {
        var usingGroup = calGroups[i];
        let groupData = todayItem.groups[usingGroup];
        if (groupData == null) {
          return;
        }
        let blocker = groupData.blocker;
        let followup = groupData.followup;
        if (blocker != null) {
          for (let j = 0; j < blocker.length; j++) {
            let blockItem = blocker[j];
            if (blockItem.storyid === storyID) {
              allIssues.push(blockItem);
            }
          }
        }
        if (followup != null) {
          for (let j = 0; j < followup.length; j++) {
            let followupItem = followup[j];
            if (followupItem.storyid === storyID) {
              allIssues.push(followupItem);
            }
          }
        }
      }
      return allIssues;
    },
    _isStoryInList: function (storyList, story) {
      for (let i = 0; i < storyList.length; i++) {
        var st = storyList[i];
        if (st._id === story._id) {
          return true;
        }
      }
      return false;
    },
    getChangedItems: function (day, group, todayObj) {
      var changedItems = [];
      var storyList = todayObj.storyList;
      let previousData = todayObj;
      if (day > 0) {
        previousData = this.$root.getDayDataDay(day - 1, this.summary);
      }
      for (let i = 0; i < group.length; i++) {
        var currentGroup = group[i];
        var todayRedItems = todayObj.groups[currentGroup].points.redStorys;
        var previousDay = day;
        if (day > 0) {
          previousDay = day - 1;
        } else {}
        var previousDayObj = this.$root.getDayDataDay(previousDay, this.summary);
        var previousRedItems = previousDayObj.groups[currentGroup].points.redStorys;
        // get reduced changed item
        for (let i = 0; i < todayRedItems.length; i++) {
          let todayItem = JSON.parse(JSON.stringify(todayRedItems[i]));
          todayItem.isRed = true;
          let todayItemID = todayItem._id;
          if (previousRedItems.length === 0) {
            changedItems.push(todayItem);
          } else {
            let found = false;
            for (let j = 0; j < previousRedItems.length; j++) {
              let previousItem = previousRedItems[j];
              let previousItemId = previousItem._id;
              if (todayItemID === previousItemId) {
                found = true;
                break;
              }
            }
            if (!found) {
              changedItems.push(todayItem);
            }
          }
        }
        var addedItems = [];
        // get added changed item
        for (let i = 0; i < storyList.length; i++) {
          var story = storyList[i];
          var isAdd = story.AddStory;
          var ingroup = story.ingroup;
          for (let j = 0; j < ingroup.length; j++) {
            let groupObj = ingroup[j];
            let groupname = groupObj.groupname;
            if (groupname === currentGroup && isAdd === true && !this._isStoryInList(addedItems, story)) {
              addedItems.push(story);
              break;
            }
          }
        }
        changedItems = changedItems.concat(addedItems);

        // add removed from yesterday reduced user story
        let previousDayData = previousData.groups[currentGroup];
        let todayDayObj = todayObj.groups[currentGroup];
        let removedStoryList = this._getTodayRemovedFromRedStory(todayDayObj, previousDayData, day);
        for (let i = 0; i < removedStoryList.length; i++) {
          let removedStoryItem = removedStoryList[i];
          if (removedStoryList.length > 0 && !this._isStoryInList(changedItems, removedStoryItem)) {
            changedItems.push(removedStoryItem);
          }
        }
      }
      this.changedItems = changedItems;
      /* var previousDay = day;
      if (day > 0) {
        previousDay = day - 1;
      } else {}
      var previousDayObj = this.$root.getDayDataDay(previousDay);

      var todayUserStory = todayObj.storyList;
      var previousUserStory = previousDayObj.storyList;
      var added = [];
      var changed = [];
      for (let i = 0; i < todayUserStory.length; i++) {
        let todayItem = todayUserStory[i];
        let todayid = todayItem._id;
        let isfound = false;
        let todayGroups = todayItem.ingroup;
        for (let j = 0; j < previousUserStory.length; j++) {
          let prevItem = previousUserStory[j];
          let previd = prevItem._id;
          if (todayid === previd) {
            isfound = true;
            break;
          }
        }
        let isProperGroup = false;
        for (let k = 0; k < todayGroups.length; k++) {
          var groupItem = todayGroups[k];
          var groupname = groupItem.groupname;
          if (groupname === group) {
            isProperGroup = true;
          }
        }
        if (!isfound && isProperGroup) {
          added.push(todayItem);
        }
      }
      for (let i = 0; i < previousUserStory.length; i++) {
        let prevItem = previousUserStory[i];
        let previd = prevItem._id;
        let prevstatus = prevItem.status;
        let isfound = false;
        for (let j = 0; j < todayUserStory.length; j++) {
          let todayItem = todayUserStory[j];
          let todayid = todayItem._id;
          let todaystatus = todayItem.status;
          if (todayid === previd && prevstatus !== todaystatus) {
            isfound = true;
            break;
          }
        }
        if (isfound) {
          changed.push(prevItem);
        }
      }
      this.changedItems = added.concat(changed); */
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
@import '../css/globalDefine';
.workingInProgressItem .el-table td {
  text-align: left;
  padding-left: 10px;
}
.changeItemTab {
  border-bottom: 1px solid @borderColor;
}
header.pointStatus {
  line-height: 25px;
  padding: 0;
}
.pointStatus i{
  font-size: 24px;
}
.pointChangedHis i {
  font-size:35px; 
  vertical-align:top;
}
.pointStatus,
.pointChangedHis,
.pointChangedItem,
.workingInProgressItem {
  line-height: 40px;
  border-bottom: 1px solid @borderColor;
}
.pointChangedItem,
.workingInProgressItem {
  border: none;
}
.pointInfoTitle {
  font-size: 0.9rem;
  font-weight: 600;
  text-align: left;
}
.popoverMinWidth {
  min-width: 80px;
  padding: 6px;
  text-align: center;
}

.popoverMinWidth .el-button--text {
  color: #606266;
}
.minFontSize {
  font-size: 0.8rem;
}
.boldFont {
  font-weight: bold; 
}
</style>
