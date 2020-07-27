<template>
  <div class="addPointDialogContainer">
    <div class="BISelectContainer">
      <el-dialog :title="title" :visible.sync="dialogVisible" width="30%" @open="getRootData" @close="handleClose('ruleForm')" class="addPointDialog">
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-position="left" label-width="120px" class="demo-ruleForm">
          <el-form-item label="Issue Number:" prop="issueAdded">
            <el-row>
              <el-col :span="10">
                <el-input v-model="ruleForm.issueAdded" placeholder="Please input issue"></el-input>
              </el-col>
              <el-col :span="10" style="text-align: center">
                <a target="_blank" :href="'https://jira.successfactors.com/browse/'+ruleForm.issueAdded">{{ruleForm.issueAdded}}</a>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="Issue Name:" prop="issueName">
            <el-row>
              <el-col :span="10">
                <el-input v-model="ruleForm.issueName" placeholder="Please input issue name"></el-input>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="BI Number:" prop="biSelected">
            <el-row>
              <el-col :span="10">
                <el-select v-model="ruleForm.biSelected" value-key="_id" filterable clearable allow-create placeholder="Please select BI">
                  <el-option v-for="item in biList" :key="item._id" :label="item.storykey" :value="item">
                  </el-option>
                </el-select>
              </el-col>
              <el-col :span="10">
                <div>
                  <a target="_blank" :href="'https://jira.successfactors.com/browse/'+ruleForm.biSelected.storykey">{{ruleForm.biSelected.storykey}}</a>
                </div>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="Issue Group:" prop="issueGroup">
            <el-row>
              <el-col :span="10">
                <el-select v-model="ruleForm.issueGroup" value-key="_id" filterable allow-create placeholder="Please select group">
                  <el-option v-for="item in groupList" :key="item._id" :label="item.groupname" :value="item">
                  </el-option>
                </el-select>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="Owner:" prop="ownerAdded">
            <el-row>
              <el-col :span="10">
                <el-input v-model="ruleForm.ownerAdded" placeholder="Please input Owner"></el-input>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="Comments:" prop="comments">
            <el-row>
              <el-col :span="18">
                <el-input type="textarea" :rows="4" placeholder="Please input your comments." v-model="ruleForm.comments">
                </el-input>
              </el-col>
            </el-row>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="submitForm('ruleForm')">Confirm</el-button>
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
    'defaultValues': Object,
    'category': String
  },
  data () {
    return {
      ruleForm: {
        issueAdded: '',
        ownerAdded: '',
        biSelected: '',
        issueGroup: '',
        issueName: '',
        comments: ''
      },
      rules: {
        issueAdded: [
          { required: true, message: 'Please input issue', trigger: 'blur' }
        ],
        biSelected: [
          { required: true, message: 'please select BI', trigger: 'change' }
        ],
        ownerAdded: [{
          required: false
        }],
        issueGroup: [
          { required: true, message: 'please select group', trigger: 'change' }
        ],
        issueName: [{
          required: false
        }],
        comments: [{
          required: false
        }]
      },
      biList: [],
      groupList: [],
      dialogVisible: false,
      title: '',

      allGroups: null,
      summary: null,
      sprintid: null
    };
  },
  methods: {
    getRootData: function () {
      // console.log(this.category);
      if (this.category === 'block') {
        this.title = 'Add New Block Issue';
      } else if (this.category === 'followup') {
        this.title = 'Add New Followup Issue';
      }
      this.biList = this.summary.storyList;
      this.groupList = this.allGroups;

      if (this.defaultValues === null) {
        return;
      }
      for (var key in this.defaultValues) {
        if (this.ruleForm[key] !== undefined) {
          this.ruleForm[key] = this.defaultValues[key];
        }
      }
    },
    handleClose: function (formName) {
      this.$refs[formName].resetFields();
    },
    getIssueFormatDay () {
      var currentDate = new Date();
      var oYear = currentDate.getFullYear();
      var oMonth = currentDate.getMonth() + 1;
      var oDate = currentDate.getDate();
      return oYear + '-' + oMonth + '-' + oDate;
    },
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          var sprint = this.sprintid;
          var changeinsprintday = this.summary.summary.length - 1;
          var newIssue = {
            issuekey: this.ruleForm.issueAdded,
            storyid: this.ruleForm.biSelected._id,
            issuename: this.ruleForm.issueName,
            follower: this.ruleForm.ownerAdded,
            issuegroup: this.ruleForm.issueGroup,
            category: this.category,
            sprint: sprint,
            comments: this.ruleForm.comments,
            changeinsprintday: changeinsprintday,
            status: 'Open'
          };
          var self = this;
          this.axios.post('/api/v1/addIssue', newIssue).then(function (response) {
            if (response.data.status === 'success') {
              self.$root.eventHub.$emit('sprintDataChanged', sprint);
              self.dialogVisible = false;
            } else {
              self.$message({
                message: response.data.resMsg,
                type: 'error'
              });
            }
          }).catch(function (error) {
            console.log(error);
            self.$message({
              message: 'Server Error',
              type: 'error'
            });
          });
        } else {
          return false;
        }
      });
    },
    getDayBlockSummary: function (day, clickedGroup, todayData, previousData, type, allGroups, summary, sprintid) {
      this.sprintid = sprintid;
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
    issueAdded: function () {},
    dialogDisplay: function () {
      if (this.dialogDisplay == null) {
        return;
      }
      this.dialogVisible = this.dialogDisplay;
    }
  }
};
</script>
<style>
.addPointDialogContainer .selections {
  /*margin-top: 20px;*/
}

.addPointDialogContainer .addPointDialog .el-dialog {
  min-width: 700px;
}

.addPointDialogContainer .grid-content {
  text-align: left;
  /*margin-bottom: 15px;*/
}

.addPointDialogContainer a {
  text-decoration: none;
}

</style>
