import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'
import AboutUs from '../AboutUs.vue'
import Checkout from '../Checkout.vue'
import Club from '../Club.vue'
import ClubApplication from '../ClubApplication.vue'
import SeatPicker from '../SeatPicker.vue'

export default createRouter({
  history: createWebHistory(),
  scrollBehavior(to) {
    return to.hash ? { el: to.hash, behavior: 'smooth' } : { top: 0 }
  },
  routes: [
    { path: '/', component: App, name: 'movies', meta: { activeNav: 'movies' } },
    {
      path: '/buy-tickets',
      component: App,
      name: 'buy-tickets',
      meta: { activeNav: 'tickets', pageComponent: SeatPicker, pageProps: 'booking' }
    },
    {
      path: '/about_us',
      component: App,
      name: 'about-us',
      meta: { activeNav: 'about', pageComponent: AboutUs }
    },
    {
      path: '/club',
      component: App,
      name: 'club',
      meta: { activeNav: 'club', pageComponent: Club }
    },
    {
      path: '/club/register',
      component: App,
      name: 'club-register',
      meta: { activeNav: 'club', pageComponent: ClubApplication }
    },
    { path: '/checkout', component: Checkout },
    { path: '/seatpicker', redirect: '/buy-tickets' },
    { path: '/about-us', redirect: '/about_us' },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})
