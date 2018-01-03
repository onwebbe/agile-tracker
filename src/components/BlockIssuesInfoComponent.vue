<template>
  <div class="comp1">
    <div>
      comp1
    </div>
    <div>
      comp1
    </div>
    <div>
      comp1
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  created: function () {
  },
  mounted: function () {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.dataSheet {
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
}
.dataSheet > div {
  flex-grow: 1;
  flex: flex-grow;
}
</style>
