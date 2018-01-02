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
import ChartDataSheet from '@/components/DataSheet'
export default {
  name: 'ChartMainPage',
  data () {
    return {
      
    }
  },
  created: function () {
    //let chart = new VUEChart('.chart', 1000,500);
    
  },
  mounted: function() {
    let chart = new VUEChart('.chart', 1000,500);
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
