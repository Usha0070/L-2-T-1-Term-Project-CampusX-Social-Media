import { createRouter, createWebHistory } from "vue-router";

import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Feed from "../views/Feed.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
    meta: { requiresAuth: false },
  },
  {
    path: "/",
    name: "Feed",
    component: Feed,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const hasAuthHeader = !!token;

  if (to.meta.requiresAuth && !hasAuthHeader) {
    next("/login");
  } else if (!to.meta.requiresAuth && hasAuthHeader) {
    next("/");
  } else {
    next();
  }
});

export default router;
