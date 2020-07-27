/*
  author: onwebbe (tai)
*/

<template>
  <div class="breakdownLayer">
    <transition name="scale">
      <div class="breakDownLayerContainer" v-show="isDisplay">
        <break-down-main></break-down-main>
        <div class="el-icon-close breakDownLayerClose" @click="closeLayer"></div>
      </div>
    </transition>
    <div style="width: 100%;height: 100%;position: fixed;top: 0px;left: 0px;z-index: 10;background-color: rgba(0,0,0,0.5);" v-if="isDisplay" @click="closeLayer">
    </div>
  </div>
</template>

<script>
import BreakDownMainPage from '../MainPage';

export default {
  components: {
    'break-down-main': BreakDownMainPage
  },
  props: {
    'sprintid': {
      type: String,
      default: '5aa771aa565aac21dbe670d1'
    },
    'layerdisplay': {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      isDisplay: false,
      allGroups: null,
      summary: null
    };
  },
  methods: {
    closeLayer () {
      this.isDisplay = false;
    },
    fetchData (inSprintId) {
      var self = this;
      if (inSprintId === this.sprintid) {
      // if (true) {
        var sprintid = this.sprintid;
        this.axios.get('/api/v1/getGroups?sprintid=' + sprintid).then(function (groupsData) {
          self.allGroups = groupsData.data.resData;
          self.axios.get('/api/v1/summary?sprintid=' + sprintid).then(function (summarydata) {
            self.summary = summarydata.data.resData;
            if (self.$root.eventHub) {
              self.$root.eventHub.$emit('sprintChanged', summarydata.data, self.allGroups, self.sprintid);
            }
          });
        });
      }
    }
  },
  created: function () {
    var self = this;
    if (this.$root.eventHub) {
      this.$root.eventHub.$on('sprintDataChanged', function (sprintid) {
        self.fetchData(sprintid);
        self.$root.eventHub.$emit('getBreakDownChart', sprintid);
      });
    }
  },
  mounted: function () {
  },
  watch: {
    layerdisplay: function () {
      if (!this.isDisplay) {
        this.isDisplay = this.layerdisplay;
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.breakDownLayerContainer {
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: white;
  z-index: 100;
  left: 0px;
  top: 0px;
  transform: scale(0.95);
  box-shadow: 5px 5px 20px #333;
  border-radius: 5px;
}
.breakDownLayerClose {
  width: 30px;
  height: 30px;
  position: fixed;
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
  color: #909399;
}
.breakDownLayerClose:hover {
  color: #409EFF;
  cursor: pointer;
}
@keyframes scale-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(0.95);
    opacity: 1;
  }
}
.scale-enter-active {
  animation: scale-in .3s;
}
.scale-leave-active {
  animation: scale-in .3s reverse;
}
.scale-enter, .scale-leave-to
/* .slide-fade-leave-active for below version 2.1.8 */ {
  transform: scale(0);
  opacity: 0;
}

</style>
