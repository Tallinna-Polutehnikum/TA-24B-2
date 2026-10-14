import { createApp, h } from 'vue';
import PrimeVue from 'primevue/config';
import 'primeicons/primeicons.css';
import { RouterView } from 'vue-router';
import router from './router';

createApp({ render: () => h(RouterView) }).use(PrimeVue).use(router).mount('#app');
