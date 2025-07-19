import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Feed from "../views/Feed.vue";
import Profile from "../views/Profile.vue";
import { getCurrentUserToken } from "../utils/auth";
import Marketplace from "../views/Marketplace.vue";
import Tuition from "../views/Tuition.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: Login,
    },
    {
      path: "/register",
      name: "register",
      component: Register,
    },
    {
      path: "/",
      name: "feed",
      component: Feed,
    },
    {
      path: "/profile/:id?",
      name: "profile",
      component: Profile,
      props: true,
    },
    {
      path: "/marketplace",
      name: "marketplace",
      component: Marketplace,
    },
    {
      path: "/tuition",
      name: "tuition",
      component: Tuition,
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
