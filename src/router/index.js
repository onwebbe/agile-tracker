import Vue from 'vue';
import Router from 'vue-router';

import Home from '@/components/admin-home/home';
import Login from '@/components/login/login';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Story from '@/components/admin-story/story';
import Dashboard from '@/components/admin-dashboard/dashboard';
import Planning from '@/components/admin-planning/planning';
import Configuration from '@/components/admin-configuration/config';
import CheckTools from '@/components/admin-check/checkTools';
import locale from 'element-ui/lib/locale/lang/en';
Vue.use(ElementUI, {locale});
Vue.use(Router);
Vue.use(ElementUI);

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/index'
    },
    {
      path: '/index',
      name: 'home',
      component: Home,
      children: [
        {
          path: '/dashboard/:pageid',
          component: Dashboard
        },
        {
          path: '/planning/:pageid',
          component: Planning
        },
        {
          path: '/story/:sprintid',
          component: Story
        },
        {
          path: '/configuration/:pageid',
          component: Configuration
        },
        {
          path: '/checktools/:pageid',
          component: CheckTools
        }
      ],
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/login',
      name: 'login',
      component: Login
    }
  ]
});
