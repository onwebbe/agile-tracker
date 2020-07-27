<template>
  <div class="agileTrackerPlanningCard">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>Planning</span>
        <el-button style="float: right; padding: 3px 0" type="text"></el-button>
      </div>
      <el-row class="cardContentRow">
        <el-col :span="10"><div class="grid-content totalTitle">1</div></el-col>
        <el-col :span="14"><div class="grid-content">2</div></el-col>
      </el-row>
      <el-row class="cardContentRow">
        <el-col :span="10"><div class="grid-content daysTitle">1</div></el-col>
        <el-col :span="14"><div class="grid-content">2</div></el-col>
      </el-row>
    </el-card>
  </div>
</template>
<script>
export default {
  props: {
  },
  data () {
    return {
      total: 28,
      days: 20,
      capacity: 20,
      estimate: 15
    };
  },
  methods: {
  },
  created: function () {
  },
  mounted: function () {
  },
  watch: {
  }
};
</script>
<style scoped>
.agileTrackerPlanningCard {
  width: 100%;
}
.cardContentRow {
  height: 50px;
  line-height: 50px;
  align-items: center;
  margin-left: -20px;
  margin-right: -20px;
  border-top: 1px solid #DCDFE6;
}
.cardContentRow:first-child {
  margin-top: -20px;
}
.cardContentRow:last-child {
  margin-bottom: -20px;
}
.totalTitle,
.daysTitle {
  height: 50px;
}
.totalTitle {
  background-color: #409EFF;
}
.daysTitle {
  background-color: #67C23A;
}
</style>
