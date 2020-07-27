<template>
  <div class="addPointDialogContainer">
    <div class="BISelectContainer">
      <el-dialog
        title="Add Point Dialog"
        :visible.sync="dialogVisible"
        width="30%"
        @close="handleClose"
        class="addPointDialog">
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="grid-content"
        :label-position="labelPosition">
          <el-form-item prop="biSelected" label="BI Number:" class="addPointDialogContent">
            <el-row>
              <el-col :span="15">
              <el-select v-model="ruleForm.biSelected" filterable allow-create placeholder="Please select BI">
                <el-option
                  v-for="item in biList"
                  :key="item.storykey"
                  :label="item.storykey"
                  :value="item.storykey">
                </el-option>
              </el-select>
              </el-col>
              <el-col :span="5">
                <div><a target="_blank" :href='biSelectedURL'>{{ruleForm.biSelected}}</a>&nbsp;</div>
              </el-col>
              <el-col :span="4"><div>{{selectedPointsLabel}}</div></el-col>
            </el-row>
          </el-form-item>
          <el-form-item prop="statusSelected" class="addPointDialogContent" label="BI Change:">
            <el-radio-group v-model="ruleForm.statusSelected">
              <el-radio :label="status.key" border size="medium" v-for="status in statusList" :key="status.key"
              :disabled="status.groupId != group">{{status.label}}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item class="addPointDialogFooter">
            <el-button @click="dialogVisible = false">Cancel</el-button>
            <el-button type="primary" @click="submitForm('ruleForm')">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      biSelectedURL: '',
      selectedBi: {},
      selectedPointsLabel: '',
      biList: [],
      dialogVisible: false,
      statusList: [{
        groupId: 'Dev',
        key: 'Devcomplete',
        label: 'Dev Complete'
      }, {
        groupId: 'QA',
        key: 'Done',
        label: 'Test Complete'
      }],
      labelPosition: 'left',
      ruleForm: {
        biSelected: '',
        statusSelected: ''
      },
      rules: {
        biSelected: [
          { required: true, message: 'please enter story id', trigger: 'change' }
        ],
        statusSelected: [
          { required: true, message: 'please select option', trigger: 'change' }
        ]
      }
    };
  },
  methods: {
    handleClose () {
      this.ruleForm.biSelected = '';
    },
    getSprintFormatDay () {
      var currentDate = new Date();
      var oYear = currentDate.getFullYear();
      var oMonth = currentDate.getMonth() + 1;
      var oDate = currentDate.getDate();
      return oYear + '-' + oMonth + '-' + oDate;
    },
    updateAllStroyList (day, group, todayObj, previousObj, type, allGroups, summary) {
      this.biList = this.summary.storyList;
      this.group = group;
    },
    submitForm (formName) {
      var self = this;
      this.$refs[formName].validate((valid) => {
        if (valid) {
          var newItem = {
            storykey: 'CDP-2222', // self.ruleForm.biSelected,
            storyname: 'test add story', // self.selectedBi.name,
            storypoints: self.selectedBi.points,
            issuetype: 'story',
            summary: 'test add story', // self.selectedBi.summary,
            sprint: '5a54863a5170323f38f3432d', // self.selectedBi.sprint,
            ingoup: self.group,
            changeinsprintday: '2018-01-17', // self.getSprintFormatDay(),
            status: 'Ready for testing' // self.ruleForm.statusSelected
          };
          console.log('newItem:' + newItem);
          this.axios.post('/api/v1/addStory', newItem).then((response) => {
            if (response.data.status === 'success') {
              this.dialogVisible = false;
              this.$emit('newItemAdded', newItem);
            } else {
              self.$message({
                message: response.data.resMsg,
                type: response.data.status
              });
            }
          }).catch((err) => {
            console.log(err);
            self.$message({
              message: '数据保存失败！',
              type: 'error'
            });
          });
          alert('submit!');
          // self.$root.eventHub.$emit('sprintDataChanged', newItem);
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    }
  },
  created: function () {
    if (this.$root.eventHub) {
      this.$root.eventHub.$on('getDaySummary', this.updateAllStroyList);
    }
  },
  mounted: function () {
  },
  computed: {
    biSelected () {
      return this.ruleForm.biSelected;
    }
  },
  watch: {
    biSelected: function (newValue) {
      this.biSelectedURL = 'https://jira.successfactors.com/browse/' + newValue;
      for (var i = 0; i < this.biList.length; i++) {
        if (this.biList[i].storykey === newValue) {
          this.selectedBi = this.biList[i];
          this.selectedPointsLabel = this.selectedBi.points + ' Points';
        }
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.addPointDialogContainer .selections {
  margin-top: 20px;
}
.addPointDialogContainer .addPointDialog .el-dialog {
  min-width: 700px;
}
.addPointDialogContainer .grid-content {
  text-align: left;
}
.addPointDialogContainer .addPointDialogContent {
  margin-bottom: 40px;
}
.addPointDialogFooter {
  text-align: right;
  margin-bottom: 0px;
}
</style>
