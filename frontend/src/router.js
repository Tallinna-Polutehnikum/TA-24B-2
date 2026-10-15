import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Checkout from './Checkout.vue'
import AboutUs from './AboutUs.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: App },
    { path: '/checkout', component: Checkout},
    { path: '/:pathMatch(.*)*', redirect: '/' },
    { path: '/about-us', component: AboutUs }
  ]
})
