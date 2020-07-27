<template>
  <div class="viewIssuesDialogContainer">
    <div class="viewIssuesContainer">
      <el-dialog :title.sync="dialogTitle" :visible.sync="dialogVisible" width="30%" @open="getRootData" class="addPointDialog">
        <template>
          <el-table
            :data="tableData"
            style="width: 100%" :row-class-name="tableRowClassName">
            <el-table-column
              prop="issuekey"
              label="Issue Key"
              width="180">
            </el-table-column>
             <el-table-column
              prop="category"
              label="Category">
            </el-table-column>
            <el-table-column
              prop="issuegroupStr"
              label="Group"
              width="180">
            </el-table-column>
          </el-table>
        </template>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    'dialogDisplay': {
      type: Boolean,
      default: true
    },
    'userStoryId': String,
    'day': Number,
    'group': String
  },
  data () {
    return {
      groupList: [],
      dialogVisible: false,
      tableData: [],
      dialogTitle: '',

      allGroups: null,
      summary: null
    };
  },
  methods: {
    tableRowClassName: function ({row, rowIndex}) {
      if (row.category === 'block') {
        return 'block';
      } else if (row.category === 'followup') {
        return 'followup';
      }
      return '';
    },
    getRootData: function () {
      this.groupList = this.allGroups;
      var todayItem = this.$root.getDayDataDay(parseInt(this.day), this.summary);
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
            if (blockItem.storyid === this.userStoryId) {
              allIssues.push(blockItem);
            }
          }
        }
        if (followup != null) {
          for (let j = 0; j < followup.length; j++) {
            let followupItem = followup[j];
            if (followupItem.storyid === this.userStoryId) {
              allIssues.push(followupItem);
            }
          }
        }
      }
      for (let i = 0; i < allIssues.length; i++) {
        let issue = allIssues[i];
        let groups = issue.issuegroup;
        let groupStr = '';
        for (let j = 0; j < groups.length; j++) {
          let theG = groups[j];
          groupStr = groupStr + ' ' + theG.groupname;
        }
        issue.issuegroupStr = groupStr;
      }
      this.tableData = allIssues;

      for (let i = 0; i < this.summary.storyList.length; i++) {
        let storyItem = this.summary.storyList[i];
        let storyItemID = storyItem._id;
        if (storyItemID === this.userStoryId) {
          this.dialogTitle = 'View Story Issues for ' + storyItem.storykey;
          break;
        }
      }
    },
    getDayBlockSummary: function (day, clickedGroup, todayData, previousData, type, allGroups, summary) {
      this.summary = summary;
      this.allGroups = allGroups;
    }
  },
  created: function () {
    if (this.$root.eventHub) {
      // console.log(this.$route);
      this.$root.eventHub.$on('getDaySummary', this.getDayBlockSummary);
    }
  },
  mounted: function () {

  },
  watch: {
    dialogDisplay: function () {
      if (this.dialogDisplay == null) {
        return;
      }
      this.dialogVisible = this.dialogDisplay;
    }
  }
};
</script>
<style lang="less">
@import '../css/globalDefine';
.viewIssuesDialogContainer .selections {
  /*margin-top: 20px;*/
}


.viewIssuesContainer a {
  text-decoration: none;
}
#app .viewIssuesDialogContainer .addPointDialog {
  text-align: left;
}
.followup {
  color: @warningColor;
}
.block {
  color: @dangerColor;
}
</style>
