<template>
  <div class="login">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>Welcome to Agile Tracker</span>
      </div>
      <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px">
        <el-form-item label="Employee Id" prop="username">
          <el-input type="input" v-model="ruleForm.username" auto-complete="off" placeholder="Employee Id"></el-input>
        </el-form-item>
        <el-form-item label="Password" prop="password" v-show="false">
          <el-input type="hidden" v-model="ruleForm.password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')">Submit</el-button>
          <el-button @click="resetForm('ruleForm')" v-show="false">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
  import md5 from 'md5';

  export default {
    data () {
      var validateUsername = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('Please input username'));
        } else {
          if (this.ruleForm.password !== '') {
            this.$refs.ruleForm.validateField('password');
          }
          callback();
        }
      };
      var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('Please input password'));
        } else {
          callback();
        }
      };
      return {
        ruleForm: {
          username: '',
          password: 'admin'
        },
        rules: {
          username: [
            { validator: validateUsername, trigger: 'blur' }
          ],
          password: [
            { validator: validatePass, trigger: 'blur' }
          ]
        }
      };
    },
    methods: {
      submitForm (formName) {
        var that = this;
        this.$refs['ruleForm'].validate((valid) => {
          if (valid) {
            this.axios.get('/admin/login/verify?' + 'username=' + this.ruleForm.username + '&password=' + md5(this.ruleForm.password) + '&module=' + window.localStorage.getItem('module')).then((response) => {
              if (response.data.status === 'success') {
                that.$router.push('/index');
              } else {
                that.$message({
                  message: 'Login failed!',
                  type: 'error'
                });
              }
            }).catch((err) => {
              console.log(err);
              that.$message({
                message: 'Login failed!',
                type: 'error'
              });
            });
          }
        });
      },
      resetForm (formName) {
        this.$refs['ruleForm'].resetFields();
      }
    }
  };
</script>

<style scoped>

  .text {
    font-size: 14px;
  }

  .item {
    margin-bottom: 18px;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }

  .box-card {
    width: 480px;
    position: absolute;
    right: 5rem;
    top: 50%;
  }

  .login{
    background-image: url('https://file.iviewui.com/iview-admin/login_bg.jpg');
    background-size: cover;
    background-position: center;
    width: 100%;
    height: 100%;
  }
</style>