import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Feed from "../views/Feed.vue";
import Profile from "../views/Profile.vue";
import { getCurrentUserToken } from "../utils/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: Login,
    },
    {
      path: "/register",
      name: "Register",
      component: Register,
    },
    {
      path: "/",
      name: "Feed",
      component: Feed,
    },
    {
      path: "/profile/:id?",
      name: "Profile",
      component: Profile,
      props: true,
    },
  ],
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const token = getCurrentUserToken();
  const publicPages = ["/login", "/register"];
  const authRequired = !publicPages.includes(to.path);

  if (authRequired && !token) {
    return next("/login");
  }

  if (!authRequired && token) {
    return next("/");
  }

  next();
});

export default router;
