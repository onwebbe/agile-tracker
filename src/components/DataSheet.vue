/*
  author: onwebbe (tai)
*/

<template>
  <div class="dataSheet" style="">
    <el-header class="dataSheetSummary">
      <div class='title'>
        Summary of {{groupName}}<br>
        <span class='subtitle'>Day {{day}} - {{date}}</span>
      </div>
      <!-- <div class='content'>
        <el-row>
          <el-col :span="8"><div class="grid-content bg-purple-dark pointContent">10 Point</div></el-col>
          <el-col :span="8"><div class="grid-content bg-purple-dark blockContent">2 Block</div></el-col>
          <el-col :span="8"><div class="grid-content bg-purple-dark followContent">3 Follow</div></el-col>
        </el-row>
      </div> -->
    </el-header>
    <el-main class="tabContainer">
      <div class="dataSheetCardContainer" style="display:none;">
        <el-card class="box-card" :body-style="{padding: '0px', height: '40px'}">
          <el-row class="dataSheetCardRow">
            <el-col :span="10" class="leftPart" :style="{background: effortData.color}">{{effortData.label}}
            </el-col>
            <el-col :span="14" class="rightPart">
              <span :style="{color: effortData.color}" class="rateValue">{{effortData.value}}</span>
              <span :style="{color: effortData.color}" class="rateIcon">%</span>
            </el-col>
          </el-row>
        </el-card>
      </div>      
      <el-tabs name="pointTab" type="border-card" class="dataSheetTabs" v-model="dataSheetTabs">
        <el-tab-pane :label="pointLabel" class="dataSheetTabItem">
          <point-status></point-status>
        </el-tab-pane>
        <el-tab-pane name="blockTab" :label="blockLabel" class="dataSheetTabItem">
          <issue-component type='block'></issue-component>
        </el-tab-pane>
        <el-tab-pane name="followupTab" :label="followupLabel" class="dataSheetTabItem">
          <issue-component type='followup'></issue-component>
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </div>
</template>

<script>
import PointStatus from '@/components/PointStatusInfoComponent';
import IssuesInfoComponent from '@/components/IssueInfoComponent';
import AddDialogContent from '@/components/AddPointDialogComponent';
import SprintDialogContent from '@/components/SprintSelectComponent';
export default {
  name: 'DataSheet',
  data () {
    return {
      dialogDisplay: false,
      displayData: {
        currentTab: 'points'
      },
      day: 0,
      date: '',
      groupName: '',
      pointLabel: 'Points',
      blockLabel: 'Blockers',
      followupLabel: 'Follows',
      dataSheetTabs: '',
      effortData: {
        label: 'Effort Offset Ratio',
        value: 0,
        color: '#409EFF'
      }
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
    getDaySummary: function (day, group, todayObj, previousObj, type, allGroups, summary) {
      if (todayObj == null) {
        return;
      }
      this.day = day;
      this.date = todayObj.date;

      var calGroups = [group];
      if (group === '') {
        this.groupName = 'All Groups';
        calGroups = [];
        for (let i = 0; i < allGroups.length; i++) {
          calGroups.push(allGroups[i].groupname);
        }
      } else {
        this.groupName = group;
      }
      var blockCount = 0;
      var followupCount = 0;
      var allPoints = 0;
      for (let i = 0; i < calGroups.length; i++) {
        var currentGroup = calGroups[i];
        if (todayObj['groups'][currentGroup] === null || todayObj['groups'][currentGroup] === undefined) {
          continue;
        }
        var blockers = todayObj['groups'][currentGroup]['blocker'];
        if (blockers != null) {
          for (let i = 0; i < blockers.length; i++) {
            let blockItem = blockers[i];
            if (blockItem.status !== summary['constances']['storyIssueResovledStatus']) {
              blockCount++;
            }
          }
        }
        this.blockLabel = 'Blocks (' + blockCount + ')';

        var followups = todayObj['groups'][currentGroup]['followup'];
        if (followups != null) {
          for (let i = 0; i < followups.length; i++) {
            let followupItem = followups[i];
            if (followupItem.status !== summary['constances']['storyIssueResovledStatus']) {
              followupCount++;
            }
          }
        }
        this.followupLabel = 'Follows (' + followupCount + ')';

        var pointCount = todayObj['groups'][currentGroup]['currentPoint'];
        allPoints += pointCount;
        this.pointLabel = 'Points (' + allPoints + ')';

        this.effortData.value = summary.effortOffsetRatio;
      }
    },
    changeTab: function () {
      this.dataSheetTabs = 'blockTab';
    }
  },
  created: function () {
    if (this.$root.eventHub) {
      this.$root.eventHub.$on('getDaySummary', this.getDaySummary);
    }
    if (this.$root.eventHub) {
      this.$root.eventHub.$on('changeTab', this.changeTab);
    }
  },
  mounted: function () {
    var layerHeight = $('.breakDownLayerContainer').height();
    if (layerHeight > 100) {
      var datasheetHeight = layerHeight - 90;
      $('.dataSheet').height(datasheetHeight);
    }
  },
  computed: {
    effortOffsetValue () {
      return this.effortData.value;
    }
  },
  components: {
    'point-status': PointStatus,
    'issue-component': IssuesInfoComponent,
    'add-point-dialog': AddDialogContent,
    'sprint-select-dialog': SprintDialogContent
  },
  watch: {
    effortOffsetValue: function (value) {
      if (value >= 25) {
        this.effortData.color = '#F56C6C';
      } else if (value >= 15) {
        this.effortData.color = '#E6A23C';
      } else {
        this.effortData.color = '#409EFF';
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
@import '../css/globalDefine';
.dataSheet {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.dataSheet .dataSheetSummary .content{
  padding-top: 5px;
}
.dataSheet .dataSheetSummary .title {
  font-size: 1.2rem;
}
.dataSheet .dataSheetSummary .title .subtitle {
  font-size: 1rem;
}
.dataSheet .pointContent {
  color: @blueColor;
}
.dataSheet .blockContent {
  color: @dangerColor;
}
.dataSheet .followContent {
  color: @warningColor;
}
.dataSheet .successContent {
  color: @successColor;
}
.dataSheet .tabContainer {
  height: calc( 100% - 18px) ;
  padding-top: 5px;
  padding-bottom: 5px;
}
.dataSheet .dataSheetTabs {
}
.dataSheet .dataSheetTabs .el-tabs__nav {
  width: 100%;
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
}
.dataSheet .dataSheetTabs .el-tabs__nav .el-tabs__item {
  flex-grow: 1;
  flex: flex-grow;
}
.dataSheet .dataSheetTabs .el-tabs__nav .el-tabs__item:nth-child(1) {
  color: @blueColor;
}
.dataSheet .dataSheetTabs .el-tabs__nav .el-tabs__item:nth-child(2) {
  color: @dangerColor;
}
.dataSheet .dataSheetTabs .el-tabs__nav .el-tabs__item:nth-child(3) {
  color: @warningColor;
}
.dataSheet .el-tabs__content{
  padding-left: 0px;
  padding-right: 0px;
}
.dataSheetCardContainer {
  margin: 0 0 8px 0;
}
.dataSheetCardRow {
  height: 100%;
  line-height: 40px;
  font-size: 14px;
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
}
.dataSheetCardRow .leftPart {
  color: white;
}
.dataSheetCardRow .rightPart {
  height: 100%;
}
.dataSheetCardRow .rateValue {
  font-size: 1.25rem;
  font-Weight: bold;
}
.dataSheetCardRow .rateIcon {
  margin: 4px 0px;
}
</style>
