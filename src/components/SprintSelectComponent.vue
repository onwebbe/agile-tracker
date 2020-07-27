<template>
  <div class="addPointDialogContainer">
    <div class="BISelectContainer">
      <el-dialog
        title="Select Sprint"
        :visible.sync="dialogVisible"
        width="30%"
        :show-close="false"
        :close-on-click-modal="false"
        center>
        <span>
          <el-alert style="margin: -20px 0px 20px 0px" title="The Module are required!" 
        type="warning" v-show="isShowAlert" @close="isShowAlert=false">
          </el-alert>
        </span>
        <span>
          <el-form ref="form" :model="form" label-width="80px">
            <el-form-item label="Module">
              <el-select v-model="form.module" filterable placeholder="Select">
                <el-option 
                  v-for="moduletItem in moduleList"
                  :key="moduletItem._id"
                  :label="moduletItem.key"
                  :value="moduletItem.key">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Sprint">
              <el-select v-model="form.sprint" placeholder="Select" :disabled="selectedSprintList.length==0">
                <el-option 
                  v-for="sprintItem in selectedSprintList"
                  :key="sprintItem.id" 
                  :label="sprintItem.value" 
                  :value="sprintItem.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </span>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click='selectSprint'>Confirm</el-button>
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
    }
  },
  data () {
    return {
      isShowAlert: false,
      sprintList: [],
      moduleList: [],
      sprintSelected: '',
      dialogVisible: false,
      isDisabled: true,
      form: {
        module: [],
        sprint: []
      }
    };
  },
  methods: {
    queryData: function () {
      var self = this;
      this.axios.get('/api/v1/sprints').then(function (data) {
        self.sprintList = data.data.resData;
        self.moduleList = data.data.moduleList;
        if (window.localStorage.module && window.localStorage.sprint) {
          self.sendSprintData();
        }
      });
    },
    sendSprintData: function () {
      var selectedSprint = [];
      for (var i = 0; i < this.sprintList.length; i++) {
        if (this.sprintList[i]._id === this.form.sprint) {
          selectedSprint = this.sprintList[i];
          break;
        }
      }
      if (this.$root.eventHub) {
        this.$root.eventHub.$emit('sprintSelected', selectedSprint);
      };
    },
    selectSprint: function () {
      if (this.form.module && this.form.sprint) {
        this.isShowAlert = false;
        this.dialogVisible = false;
        window.localStorage.module = this.form.module;
        window.localStorage.sprint = this.form.sprint;
        this.$root.module = this.form.module;
        this.$root.sprintid = this.form.sprint;
        this.sendSprintData();
      } else if (this.form.module) {
        window.localStorage.module = this.form.module;
        window.localStorage.sprint = '';
        this.$root.module = this.form.module;
        this.$root.sprintid = '';
        window.location.href = '/#/admin/home';
      } else {
        this.isShowAlert = true;
      }
    }
  },
  created: function () {
    if (!window.localStorage.module || !window.localStorage.sprint) {
      if (window.localStorage.module) {
        this.form.module = window.localStorage.module;
      }
      this.dialogVisible = true;
    } else {
      this.form.module = window.localStorage.module;
      this.form.sprint = window.localStorage.sprint;
    };
    this.queryData();
  },
  mounted: function () {
  },
  computed: {
    selectedSprintList () {
      var arr = [];
      for (var i = 0; i < this.sprintList.length; i++) {
        if (this.sprintList[i].module === this.form.module) {
          arr.push({
            id: this.sprintList[i]._id,
            value: this.sprintList[i].release + ' - ' + this.sprintList[i].sprint
          });
        } else {
          this.form.sprint = '';
        }
      }
      return arr;
    }
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
  margin-bottom: 15px;
}
</style>
