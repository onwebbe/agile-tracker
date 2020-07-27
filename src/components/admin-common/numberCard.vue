<template>
  <div>
    <el-card class="box-card" :body-style="{padding: '0px', height: '100px'}">
      <el-row class="cardRow">
        <el-col :span="10" class="leftPart" :style="{background: bkcolor}">
          {{label}}
        </el-col>
        <el-col :span="14">
          <span :style="{color: bkcolor, fontSize: fontSize, fontWeight: fontWeight}">{{value}}</span><span style="color: #b7b7b7; margin: 4px;">{{unit}}</span>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
  export default {
    props: ['label', 'value', 'unit', 'bkcolor'],
    data () {
      return {
        fontSize: '2rem',
        fontWeight: 'bold'
      };
    }
  };
</script>

<style scoped>
  .leftPart{
    color: white;
  },

  .cardRow{
    height: 100%;
    line-height: 100px;
    font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
  }

</style>