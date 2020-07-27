<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>{{configObj.title}}</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="handleClick({}, 'add')">Add {{configObj.name}}</el-button>
      </div>
      <el-table border 
        :data="itemList"
        style="width: 100%" fit>
        <el-table-column v-for="column in configObj.columns" :key="column.domKey"
          :label="column.label"
          :prop="column.key"
         >
        </el-table-column>
        <el-table-column label="Actions" >
          <template slot-scope="scope">
            <el-button-group>
              <el-button
                size="mini"
                @click="handleClick(scope.row, 'edit')" icon="el-icon-edit-outline"></el-button>
              <el-button
                size="mini"
                type="danger"
                @click="handleClick(scope.row, 'delete')" icon="el-icon-delete"></el-button>
            </el-button-group>
          </template>
        </el-table-column>  
      </el-table>
    </el-card>
    <el-dialog
    :title="title"
    :visible.sync="popupVisible"
    width="30%"
    center>
      <span>
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item :label="value.label" v-for="value in configObj.columns" :key="value.domKey">
            <el-input v-model="form[value.key]"></el-input>
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
    props: ['configObj'],
    data () {
      return {
        itemList: [],
        popupVisible: false,
        deleteVisible: false,
        form: {},
        title: 'Add ' + this.configObj.name,
        deleteObjId: ''
      };
    },
    methods: {
      fetchData: function () {
        var that = this;
        var module = window.localStorage.getItem('module');
        if (!module) {
          return false;
        }
        this.axios.get(this.configObj.path + module)
        .then(function (response) {
          if (response.data.status === 'success') {
            that.itemList = response.data.resData;
          } else {
            that.$message({
              message: response.data.resMsg,
              type: 'error'
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
      },

      handleClick: function (data, type) {
        if (type === 'edit') {
          this.title = 'Add ' + this.configObj.name;
          this.form = data;
          this.popupVisible = true;
        } else if (type === 'add') {
          this.title = 'Edit ' + this.configObj.name;
          this.form = {
            'grouppointstatus': []
          };
          this.popupVisible = true;
        } else if (type === 'delete') {
          this.deleteVisible = true;
          this.deleteObjId = data._id;
        }
      },

      handleEdit: function (data) {
        var that = this;
        if (this.form._id) {
          this.axios.put(this.configObj.path + '?module=' + window.localStorage.getItem('module'), this.form)
          .then(function (response) {
            if (response.data.status === 'success') {
              that.itemList = response.data.resData;
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
              message: 'Data fetched failed!',
              type: 'error'
            });
          });
        } else {
          this.form.module = window.localStorage.getItem('module');
          this.axios.post(this.configObj.path + '?module=' + window.localStorage.getItem('module'), this.form)
          .then(function (response) {
            if (response.data.status === 'success') {
              that.itemList = response.data.resData;
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
              message: 'Data fetched failed!',
              type: 'error'
            });
          });
        }
      },

      handleDelete: function (data) {
        var that = this;
        this.axios.delete(this.configObj.path + '?objid=' + this.deleteObjId + '&module=' + window.localStorage.getItem('module'))
        .then(function (response) {
          if (response.data.status === 'success') {
            that.itemList = response.data.resData;
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
            message: 'Data fetched failed!',
            type: 'error'
          });
        });
      }
    }
  };
</script>