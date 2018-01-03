/*
  author: onwebbe (tai)
*/
<template>
  <div class="mainPage">
    test
    <div class="chart">
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import VUEChart from '@/chartjs/VUEChart.js';

export default {
  name: 'ChartMainPage',
  data () {
    return {
    }
  },
  created: function () {
  },
  mounted: function () {
    let chart = new VUEChart('.chart', 1000, 500);
    chart.addGroup('null', {color: 'green'});
    chart.addPoint(0, 10, 'null');
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
