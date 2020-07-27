<template>
  <div>
    <el-container>
      <el-aside width="300px">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-card class="box-card rowMargin">
              <div slot="header" class="clearfix">
                <span class="font"><el-tag>{{sprintinfo.status&&sprintinfo.status.toUpperCase()}}</el-tag></span>
                <el-button style="float: right; padding: 3px 0" type="text" @click="refreshData">Refresh</el-button>
              </div>
              <el-form inline label-position="left" class="demo-table-expand">
                <el-form-item label="Release:">
                  <span>{{sprintinfo.release}}</span>
                </el-form-item>
                <el-form-item label="Sprint:">
                  <span>{{sprintinfo.sprint}}</span>
                </el-form-item>
                <el-form-item label="Start:">
                  <span>{{sprintinfo.start}}</span>
                </el-form-item>
                <el-form-item label="End:">
                  <span>{{sprintinfo.end}}</span>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="rowMargin">
          <el-col :span="24">
            <number-card label="Total Points" :value="sprintinfo.totalpoints" unit="points" bkcolor="#409EFF"></number-card>
          </el-col>
        </el-row>          
        <el-row :gutter="20" class="rowMargin">
          <el-col :span="24">
            <number-card label="Total Days" :value="((sprintinfo.workdays && sprintinfo.workdays.length) || 0)" unit="days" bkcolor="#67C23A"></number-card>
          </el-col>
        </el-row>
      </el-aside>
      <el-main style="padding: 0 20px;">
        <el-row :gutter="20" class="rowMargin">
          <el-col :span="24">
            <estimation-chart @updatepints= "fetchData" ref="estimationChartRef"></estimation-chart>
          </el-col>
        </el-row>
      </el-main>
    </el-container>

    <el-row :gutter="20" class="rowMargin">
      <el-col :span="24">
        <history-chart :sprintinfo="sprintinfo" ref="historyChartRef"></history-chart>
      </el-col>
    </el-row>

  </div>
</template>

<script>
  import numberCard from '../admin-common/numberCard.vue';
  import estimationChart from '../admin-common/estimationChart.vue';
  import historyChart from '../admin-common/historyChart.vue';

  export default {
    data () {
      return {
        sprintinfo: ''
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
        this.axios.get('/admin/planning?module=' + window.localStorage.getItem('module') + '&sprintid=' + window.localStorage.getItem('sprint')).then((response) => {
          if (response.data.status === 'success') {
            that.sprintinfo = response.data.resData;
            that.sprintinfo.totalpoints = response.data.totalPoints;
            that.$refs.estimationChartRef.fetchData('', that.sprintinfo);
            that.$refs.historyChartRef.fetchData('', that.sprintinfo);
          } else {
            that.$message({
              message: response.data.resMsg,
              type: response.data.status
            });
          }
        })
        .catch((err) => {
          console.log(err);
          that.$message({
            message: 'Data error!',
            type: 'error'
          });
        });
      },
      refreshData: function () {
        this.$refs.estimationChartRef.refresh(this.sprintinfo);
      }
    },
    components: {
      'numberCard': numberCard,
      'estimationChart': estimationChart,
      'historyChart': historyChart
    }
  };
</script>

<style scoped>
  .rowMargin{
    margin: 0 0 20px 0;
  }

</style>