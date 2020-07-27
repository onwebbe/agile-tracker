<style lang="less">
    @import './home.less';
</style>

<template>
  <div class="home">
    <el-container style="height: 100%; border: 1px solid #eee">
      <el-aside style="width: 170px;">
        <sidebar-comp ref="sidebarComp"></sidebar-comp>
      </el-aside>
      <el-container>
        <el-header style="font-size: 12px; background: #e4e4e4; padding: 20px;">
          <header-comp ref="headerComp"></header-comp>          
        </el-header>
        <el-main>
          <router-view ref="sprintPage"></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
  import sidebarComp from '../admin-common/sidebarComp';
  import headerComp from '../admin-common/headerComp';

  export default {
    data () {
      return {};
    },
    components: {
      'sidebarComp': sidebarComp,
      'headerComp': headerComp
    },
    mounted () {
      this.$refs.headerComp.fetchData();
    }
  };
</script>

<style scoped>
  .left-menu{
    height: 100%;
    text-align: left;
  }

  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    min-height: 400px;
    height: 100%;
  }

</style>
