<template>
  <div>
    <el-tabs type="card" v-model="activeTab">
      <el-tab-pane key="checkstories" label="Opened Stories Check" name="checkstories">
        <story-check></story-check>
      </el-tab-pane>
      <el-tab-pane key="checkepics" label="Opened Epics Check" name="checkepics">
        <epic-check></epic-check>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import storyCheck from '@/components/admin-check/storyCheck';
  import epicCheck from '@/components/admin-check/epicCheck';
  export default {
    data () {
      return {
        activeTab: 'checkstories'
      };
    },
    components: {
      'storyCheck': storyCheck,
      'epicCheck': epicCheck
    }
  };
</script>

<style scoped>
</style>