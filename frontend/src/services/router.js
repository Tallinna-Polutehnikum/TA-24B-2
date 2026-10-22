import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'
import Checkout from '../Checkout.vue'

export default createRouter({
  history: createWebHistory(),
  scrollBehavior(to) {
    return to.hash ? { el: to.hash, behavior: 'smooth' } : { top: 0 }
  },
  routes: [
    { path: '/', component: App },
    { path: '/buy-tickets', component: App },
    { path: '/about_us', component: App },
    { path: '/club', component: App },
    { path: '/club/register', component: App },
    { path: '/checkout', component: Checkout },
    { path: '/seatpicker', redirect: '/buy-tickets' },
    { path: '/about-us', redirect: '/about_us' },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})
