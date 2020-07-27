<template>
  <div>
    <el-container>
      <el-aside width="300px">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-card class="box-card" style="height:273px;">
              <div slot="header" class="clearfix">
                <span class="font"><el-tag>{{sprintinfo.status && sprintinfo.status.toUpperCase()}}</el-tag></span>
                <el-button v-if="sprintinfo.status != 'done'" style="float: right; padding: 3px 0" type="text" @click="refreshData">Refresh</el-button>
              </div>
              <el-form inline label-position="left" class="demo-table-expand">
                <el-form-item label="Release:">
                  <span>{{dashboard.sprintData && dashboard.sprintData.release}}</span>
                </el-form-item>
                <el-form-item label="Sprint:">
                  <span>{{dashboard.sprintData && dashboard.sprintData.sprint}}</span>
                </el-form-item>
                <el-form-item label="Start:">
                  <span>{{dashboard.sprintData && dashboard.sprintData.start}}</span>
                </el-form-item>
                <el-form-item label="End:">
                  <span>{{dashboard.sprintData && dashboard.sprintData.end}}</span>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
        </el-row>
      </el-aside>
      <el-main style="padding: 0 0 0 20px;">
        <el-row :gutter="2">
          <el-col :span="16">
            <inprogressChart ref="inprogressChart"></inprogressChart>
          </el-col>
          <el-col :span="8" ref="burndownChartContainer">
            <inprogressCard :sprintid="burndownSprintid" :chartheight="184" @cardclicked="showBurndown"/>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
    <el-row :gutter="20" class="rowMargin">
      <el-col :span="24">
        <worklog-chart ref="worklogChartRef" @updatepints= "fetchData"></worklog-chart>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="rowMargin">
      <el-col :span="24">
        <line-chart ref="historyChartRef"></line-chart>
      </el-col>
    </el-row>
    <breakdown-layer :layerdisplay="dialogDisplay" :sprintid="burndownSprintid"></breakdown-layer>
  </div>
</template>

<script>
  import numberCard from '../admin-common/numberCard.vue';
  import lineChart from '../admin-common/historyChart.vue';
  import worklogChart from '../admin-common/worklogChart.vue';
  import inprogressChart from '../admin-common/inprogressChart.vue';
  import breakdownLayer from '@/components/admin-breakdownlayer/breakdownLayer';
  import inprogressCard from '@/components/statusCard/ProgressCard';

  export default {
    data () {
      return {
        sprintinfo: '',
        dashboard: {
          sprintData: {},
          pastdays: 0
        },
        dialogDisplay: false,
        burndownSprintid: ''
      };
    },
    beforeRouteUpdate (to, from, next) {
      next(this.fetchData());
    },
    beforeRouteEnter (to, from, next) {
      next(vm => {
        vm.fetchData();
      });
    },
    methods: {
      fetchData () {
        var that = this;
        if (!window.localStorage.getItem('module') || !window.localStorage.getItem('sprint')) {
          return false;
        }
        this.axios.get('/admin/dashboard?module=' + window.localStorage.getItem('module') + '&sprintid=' + window.localStorage.getItem('sprint')).then((response) => {
          if (response.data.status === 'success') {
            var responseData = response.data.resData;
            that.dashboard = responseData;
            that.sprintinfo = responseData.sprintData;
            that.burndownSprintid = that.sprintinfo._id;
            this.$refs.worklogChartRef.fetchData('', this.sprintinfo);
            this.$refs.historyChartRef.fetchData('', this.sprintinfo);
            this.$refs.inprogressChart.setData(response.data.resData);
            this.$root.eventHub.$emit('updatePercentage', {
              percentage: that.sprintinfo.status === 'done' ? 100 : Math.ceil(((response.data.resData.commitedstories.length + response.data.resData.donestories.length) || 0) / ((response.data.resData.inprogresstories.length + response.data.resData.commitedstories.length + response.data.resData.donestories.length) || 1) * 100)
            });
            setTimeout(() => {
              that.$root.eventHub.$emit('getBreakDownChart', this.sprintinfo._id, $(that.$refs.burndownChartContainer.$el).width() - 80);
            });
          } else {
            window.location.href = '/';
          }
        })
        .catch((err) => {
          console.log(err);
          that.$message({
            message: '数据获取失败！',
            type: 'error'
          });
        });
      },
      refreshData: function () {
        this.$refs.worklogChartRef.refresh(this.sprintinfo);
      },
      showBurndown: function () {
        this.dialogDisplay = true;
        var self = this;
        setTimeout(function () {
          self.dialogDisplay = null;
        });
        if (this.$root.eventHub) {
          this.$root.eventHub.$emit('sprintDataChanged', this.burndownSprintid);
        }
      }
    },
    components: {
      'numberCard': numberCard,
      'lineChart': lineChart,
      'worklogChart': worklogChart,
      'inprogressChart': inprogressChart,
      'breakdownLayer': breakdownLayer,
      'inprogressCard': inprogressCard
    }
  };
</script>

<style scoped>
  .rowMargin{
    margin: 0 0 20px 0;
  }

</style>