const routes = [
  { path: '/', component: window.Components.Home },
  { path: '/access/:token', component: window.Components.Access },
  { path: '/profile', component: window.Components.Profile },
  { path: '*', redirect: '/' }
];

const router = new VueRouter({
  mode: 'history',
  routes
});

const app = new Vue({
  router
}).$mount('#content');