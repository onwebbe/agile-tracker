<template>
  <div>
    <el-table
      :data="tableData"
      border
      style="width: 100%">
      <el-table-column
        fixed
        prop="storykey"
        label="Key" >
      </el-table-column>
      <el-table-column
        prop="summary"
        label="Summary" >
      </el-table-column>
      <el-table-column
        prop="issuetype"
        label="Type" >
      </el-table-column>
      <el-table-column
        prop="points"
        label="Points" >
      </el-table-column>
      <el-table-column
        prop="initialstatus"
        label="Status" >
      </el-table-column>
      <el-table-column
        label="Groups" >
        <template slot-scope="scope">
          {{scope.row.ingroup.join('/')}}
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="Actions"
        width="150">
        <template slot-scope="scope">
          <el-button @click="handleClick(scope.row, 'edit')" type="text" size="small">Edit</el-button>
          <el-button @click="handleClick(scope.row, 'delete')" type="text" size="small" v-if="false">Delete</el-button>
          <el-button @click="handleClick(scope.row, 'add')" type="text" size="small" v-if="false">add</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
    :title="title"
    :visible.sync="popupVisible"
    width="30%"
    center>
      <span>
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item label="Key">
            <el-input v-model="form.storykey"></el-input>
          </el-form-item>
          <el-form-item label="Summary">
            <el-input v-model="form.summary"></el-input>
          </el-form-item>
          <el-form-item label="Type">
            <el-input v-model="form.issuetype"></el-input>
          </el-form-item>
          <el-form-item label="Points">
            <el-input v-model="form.points"></el-input>
          </el-form-item>
          <el-form-item label="Status">
            <el-input v-model="form.initialstatus"></el-input>
          </el-form-item>
          <el-form-item label="Groups">
            <el-select v-model="form.ingroup" multiple placeholder="Select">
              <el-option
                v-for="item in groupList"
                :key="item._id"
                :label="item.groupname"
                :value="item._id">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="popupVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleEdit">Save</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="Delete Confirm?"
      :visible.sync = "deleteVisible"
      width="30%">
      <span>Are you sure you want to delete?</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleDelete">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        tableData: [],
        popupVisible: false,
        deleteVisible: false,
        form: {},
        title: 'Add Story',
        deleteObjId: '',
        groupList: []
      };
    },
    created: function () {
      this.fetchData();
    },
    watch: {
      '$route': 'fetchData'
    },
    methods: {
      fetchData: function () {
        var that = this;
        var objId = this.$route.params.sprintid;
        this.axios.get('/admin/stories/' + objId + '?module=' + window.localStorage.getItem('module'))
        .then(function (response) {
          if (response.data.status === 'success') {
            that.tableData = response.data.resData;
            that.groupList = response.data.groups;
          } else {
            that.$message({
              message: '数据获取失败！',
              type: 'error'
            });
          }
        })
        .catch(function (err) {
          console.log(err);
          that.$message({
            message: '数据获取失败！',
            type: 'error'
          });
        });
      },

      handleClick: function (data, type) {
        if (type === 'edit') {
          this.title = '添加Story';
          this.form = data;
          this.popupVisible = true;
        } else if (type === 'add') {
          this.title = '编辑Story';
          this.form = {};
          this.popupVisible = true;
        } else if (type === 'delete') {
          this.deleteVisible = true;
          this.deleteObjId = data._id;
        }
      },

      handleEdit: function (data) {
        var that = this;
        if (this.form._id) {
          this.axios.put('/admin/stories?module=' + window.localStorage.getItem('module'), this.form)
          .then(function (response) {
            if (response.data.status === 'success') {
              that.tableData = response.data.resData;
              that.$message({
                message: response.data.resMsg,
                type: response.data.status
              });
              that.popupVisible = false;
            } else {
              that.$message({
                message: response.data.resMsg,
                type: response.data.status
              });
            }
          })
          .catch(function (err) {
            console.log(err);
            that.$message({
              message: 'Data fetch failed!',
              type: 'error'
            });
          });
        } else {
          this.form.sprint = this.$route.params.sprintid;
          this.axios.post('/admin/stories?module=' + window.localStorage.getItem('module'), this.form)
          .then(function (response) {
            if (response.data.status === 'success') {
              that.tableData = response.data.resData;
              that.$message({
                message: response.data.resMsg,
                type: response.data.status
              });
              that.popupVisible = false;
            } else {
              that.$message({
                message: response.data.resMsg,
                type: response.data.status
              });
            }
          })
          .catch(function (err) {
            console.log(err);
            that.$message({
              message: 'Data fetch failed!',
              type: 'error'
            });
          });
        }
      },

      handleDelete: function (data) {
        var that = this;
        this.axios.delete('/admin/stories?objid=' + this.deleteObjId + '&sprintid=' + this.$route.params.sprintid + '&module=' + window.localStorage.getItem('module'))
        .then(function (response) {
          if (response.data.status === 'success') {
            that.tableData = response.data.resData;
            that.$message({
              message: response.data.resMsg,
              type: response.data.status
            });
            that.deleteVisible = false;
          } else {
            that.$message({
              message: response.data.resMsg,
              type: response.data.status
            });
          }
        })
        .catch(function (err) {
          console.log(err);
          that.$message({
            message: 'Data fetch failed!',
            type: 'error'
          });
        });
      }
    }
  };
</script>

<style scoped>


</style>