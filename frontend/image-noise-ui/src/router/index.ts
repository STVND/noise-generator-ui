import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import NoiseGeneratorView from '../views/NoiseGeneratorView.vue'
import PigmentMixer from '../views/PigmentMixer.vue'

const routes = [
    { path: '/', component: HomeView },
    { path: '/noise-generator', component: NoiseGeneratorView },
    { path: '/pigment-mixer', component: PigmentMixer },
    { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})
