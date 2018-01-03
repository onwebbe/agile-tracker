import Vue from 'vue';
import Router from 'vue-router';
import MainPage from '@/components/MainPage';
import DataSheet from '@/components/DataSheet';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'ChartMainPage',
      component: MainPage,
      children: [
        {
          path: '',
          component: DataSheet
        }
      ]
    }
  ]
});
