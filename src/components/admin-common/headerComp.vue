<template>
  <div>
    <el-row>
      <el-col :span="3">
        <el-dropdown @command="changeModule">
          <span class="el-dropdown-link">
            {{currentModule}}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :command="item.key" :key="item.key" divided v-for="item in moduleList">{{item.key}}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
      <el-col :span="2">
        <el-dropdown style="float: right;"  @command="action">
          <span class="el-dropdown-link">
            Action<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="add">Add</el-dropdown-item>
            <el-dropdown-item command="edit" v-if="sprintinfo.status != 'done'">Edit</el-dropdown-item>
            <el-dropdown-item command="proceed">{{sprintinfo.status == 'done'? "Restart": "Proceed"}}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
      <el-col :span="1" :offset="18">
        <el-button type="primary" icon="el-icon-question" @click="navigateToHelp" size="mini" round plain>Help</el-button>
      </el-col>          
    </el-row>
    <el-dialog 
      :title="title" 
      :visible.sync="dialogVisible" 
      width="30%" 
      center>
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="Release">
          <el-input v-model="form.release"></el-input>
        </el-form-item>
        <el-form-item label="Sprint">
          <el-input v-model="form.sprint"></el-input>
        </el-form-item>
        <el-form-item label="Start">
          <el-date-picker 
            value-format="yyyy-MM-dd" 
            v-model="form.start"
            type="date"
            placeholder="select">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="End">
          <el-date-picker 
            value-format="yyyy-MM-dd" 
            v-model="form.end"
            type="date"
            placeholder="select">
          </el-date-picker>
        </el-form-item>
        <!-- <el-form-item label="Work Days">
          <el-select v-model="form.workdays" multiple placeholder="Select">
            <el-option
              v-for="day in avaliableDays"
              :key="day.value"
              :label="day.label"
              :value="day.value">
            </el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="Date">
          Total Day: {{sprintSelectedDaysCount}}<br/>
          <datepicker :dateSelected="selectedDays" :startDate="form.start" :endDate="form.end"></datepicker>
        </el-form-item>
        <el-form-item label="JQL">
          <el-input type="textarea" :rows="2" v-model="form.jql"></el-input>
        </el-form-item>
        <el-form-item label="Status">
          <el-input v-model="form.status" disabled></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="actionExec">Save</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import DatePicker from '@/components/DatePicker';
  import { Loading } from 'element-ui';

  export default {
    data () {
      return {
        sprintinfo: {},
        dialogVisible: false,
        title: 'Add',
        form: {
          workdays: []
        },
        defaultJql: '',
        sprintSelectedDaysCount: 0,
        currentSprint: window.localStorage.getItem('sprint') || '',
        currentModule: window.localStorage.getItem('module') || 'Module',
        moduleList: []
      };
    },
    components: {
      'datepicker': DatePicker
    },
    created: function () {
      if (this.$root.eventHub) {
        this.$root.eventHub.$on('datePickerChanged', this.calendarDateSelected);
      }
    },
    computed: {
      selectedDays: function () {
        var dateArray = [];
        for (var i = 0; i < this.avaliableDays.length; i++) {
          var d = new Date(this.avaliableDays[i].value).getDay();
          if (d !== 0 && d !== 6) {
            dateArray.push(this.avaliableDays[i].value);
          }
        }
        return dateArray;
      },
      avaliableDays: function () {
        var dateArray = [];
        var start = this.form.start || '';
        var end = this.form.end || '';
        var startTime = new Date(start + ' 00:00:00');
        var endTime = new Date(end + ' 00:00:00');
        while ((endTime.getTime() - startTime.getTime()) >= 0) {
          var year = startTime.getFullYear();
          var month = startTime.getMonth() + 1;
          var monthStr = month + '';
          if (month <= 10) {
            monthStr = '0' + month;
          }
          var day = startTime.getDate().toString().length === 1 ? '0' + startTime.getDate() : startTime.getDate();
          dateArray.push({
            'value': year + '-' + monthStr + '-' + day,
            'label': year + '-' + monthStr + '-' + day
          });
          startTime.setTime(startTime.getTime() + 86400000);
        }
        return dateArray;
      }
    },
    methods: {
      fetchData () {
        var that = this;
        this.axios.get('/api/v1/modules')
        .then((response) => {
          if (response.data.status === 'success') {
            that.moduleList = response.data.resData;
            var tempModuleList = [];
            for (var idx = 0; idx < that.moduleList.length; idx++) {
              tempModuleList.push(that.moduleList[idx].key);
            }
            if (that.moduleList.length > 0) {
              if (window.localStorage.getItem('module') && (tempModuleList.indexOf(window.localStorage.getItem('module')) !== -1)) {
                that.currentModule = window.localStorage.getItem('module');
              } else {
                that.currentModule = that.moduleList.length > 0 ? that.moduleList[0].key : 'Module';
                window.localStorage.setItem('module', that.moduleList.length > 0 ? that.moduleList[0].key : 'Module');
              }
              this.$root.eventHub.$emit('refreshDataRequest', {'type': 'changeModule'});
            } else {
              window.localStorage.setItem('module', '');
            }
          } else {
            that.$message({
              message: response.data.resMsg,
              type: response.data.status
            });
          }
        })
        .catch((err) => {
          that.$message({
            message: 'Data fetch failed!',
            type: 'error'
          });
          console.log(err);
        });
      },
      changeModule (val) {
        window.localStorage.setItem('module', val);
        window.localStorage.setItem('sprint', '');
        this.currentModule = val;
        this.$root.eventHub.$emit('refreshDataRequest', {'type': 'changeModule'});
      },
      calendarDateSelected: function (dateArr) {
        this.form.workdays = dateArr;
        this.sprintSelectedDaysCount = this.form.workdays.length;
      },
      action (command) {
        var that = this;
        var loading = '';
        if (command === 'edit') {
          if (window.localStorage.getItem('module') && window.localStorage.getItem('sprint')) {
            loading = Loading.service({fullscreen: true,
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.7)',
              text: 'Loading...'});
            this.axios.get('/admin/sprint?sprintid=' + window.localStorage.getItem('sprint') + '&module=' + window.localStorage.getItem('module'))
            .then((response) => {
              if (response.data.status === 'success') {
                that.form = response.data.resData.sprintinfo;
                that.dialogVisible = true;
                that.title = 'Edit Sprint';
                that.defaultJql = response.data.resData.defaultJql;
              } else {
                that.$message({
                  message: response.data.resMsg,
                  type: response.data.status
                });
              }
              loading.close();
            })
            .catch((err) => {
              loading.close();
              console.log(err);
            });
          } else {
            that.$message({
              message: 'Please select sprint first！',
              type: 'error'
            });
          }
        } else if (command === 'add') {
          this.form = {
            'status': 'planning',
            'jql': this.defaultJql
          };
          this.title = 'Add Sprint';
          this.dialogVisible = true;
        } else if (command === 'proceed') {
          if (window.localStorage.getItem('module') && window.localStorage.getItem('sprint')) {
            loading = Loading.service({fullscreen: true,
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.7)',
              text: 'Loading...'});
            this.axios.put('/admin/sprint/proceed?module=' + window.localStorage.getItem('module') + '&sprintid=' + window.localStorage.getItem('sprint')).then((response) => {
              if (response.data.status === 'success') {
                this.$root.eventHub.$emit('refreshDataRequest', {'type': 'changeSprint'});
              }
              loading.close();
              that.$message({
                message: response.data.resMsg,
                type: response.data.status
              });
            })
            .catch((err) => {
              console.log(err);
              that.$message({
                message: 'Data error!',
                type: 'error'
              });
            });
          } else {
            that.$message({
              message: 'Please select sprint first！',
              type: 'error'
            });
          }
        }
      },
      navigateToHelp () {
        window.open('https://confluence.successfactors.com/display/ENG/Agile+Tracker+Documentation');
      },
      actionExec () {
        var that = this;
        if (this.form._id) {
          this.axios.put('/admin/sprint?module=' + window.localStorage.getItem('module'), this.form).then((response) => {
            that.$message({
              message: response.data.resMsg,
              type: response.data.status
            });
            if (response.data.status === 'success') {
              this.$root.eventHub.$emit('refreshDataRequest', {'type': 'changeSprint'});
              that.dialogVisible = false;
            }
          })
          .catch((err) => {
            console.log(err);
            that.$message({
              message: 'Data error！',
              type: 'error'
            });
          });
        } else {
          this.form.module = window.localStorage.getItem('module');
          this.axios.post('/admin/sprint?module=' + window.localStorage.getItem('module'), this.form).then((response) => {
            that.$message({
              message: response.data.resMsg,
              type: response.data.status
            });
            if (response.data.status === 'success') {
              this.$root.eventHub.$emit('refreshDataRequest', {'type': 'changeSprint'});
              that.dialogVisible = false;
            }
          })
          .catch((err) => {
            console.log(err);
            that.$message({
              message: 'Data fetched failed！',
              type: 'error'
            });
          });
        }
      }
    }
  };
</script>

