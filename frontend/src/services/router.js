import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'
import AboutUs from '../AboutUs.vue'
import Club from '../Club.vue'
import ClubApplication from '../ClubApplication.vue'
import Checkout from '../Checkout.vue'
import SeatPicker from '../SeatPicker.vue'

export default createRouter({
  history: createWebHistory(),
  scrollBehavior(to) {
    return to.hash ? { el: to.hash, behavior: 'smooth' } : { top: 0 }
  },
  routes: [
    { path: '/', name: 'home', component: App },
    { path: '/buy-tickets', name: 'buyTickets', component: App, meta: { page: 'buyTickets', view: SeatPicker } },
    { path: '/about_us', name: 'aboutUs', component: App, meta: { page: 'aboutUs', view: AboutUs } },
    { path: '/club', name: 'club', component: App, meta: { page: 'club', view: Club } },
    { path: '/club/register', name: 'clubApplication', component: App, meta: { page: 'clubApplication', view: ClubApplication } },
    { path: '/checkout', name: 'checkout', component: App, meta: { page: 'checkout', view: Checkout } },
    { path: '/seatpicker', redirect: '/buy-tickets' },
    { path: '/about-us', redirect: '/about_us' },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})
