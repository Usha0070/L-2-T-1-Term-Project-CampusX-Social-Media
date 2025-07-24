import { createRouter, createWebHistory } from "vue-router";
import { getCurrentUserToken } from "../utils/auth";
import axios from "../utils/axios";

import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Feed from "../views/Feed.vue";
import Profile from "../views/Profile.vue";
import Marketplace from "../views/Marketplace.vue";
import Tuition from "../views/Tuition.vue";
import Notifications from "../views/Notifications.vue";
import Post from "../views/Post.vue";
import Chats from "../views/Chats.vue";
import ChatDetail from "../views/ChatDetail.vue";
import Groups from "../views/Groups.vue";
import GroupDetail from "../views/GroupDetail.vue";
import Search from "../views/Search.vue";
import Stats from "../views/Stats.vue";

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
    {
      path: "/notifications",
      name: "notifications",
      component: Notifications,
    },
    {
      path: "/search",
      name: "search",
      component: Search,
      meta: {
        requiresAuth: true,
        keepAlive: true,
      },
    },
    {
      path: "/stats",
      name: "stats",
      component: Stats,
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      path: "/post/:id",
      name: "post",
      component: Post,
    },
    {
      path: "/chats",
      name: "chats",
      component: Chats,
      meta: { requiresAuth: true },
    },
    {
      path: "/chats/:id",
      name: "chat-detail",
      component: ChatDetail,
      meta: { requiresAuth: true },
    },
    {
      path: "/groups",
      name: "Groups",
      component: Groups,
      meta: { requiresAuth: true },
    },
    {
      path: "/groups/:id",
      name: "GroupDetail",
      component: GroupDetail,
      meta: { requiresAuth: true },
    },
  ],
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const token = getCurrentUserToken();
  const publicPages = ["/login", "/register"];
  const authRequired = !publicPages.includes(to.path);

  if (authRequired && !token) {
    return next("/login");
  }

  if (!authRequired && token) {
    return next("/");
  }

  // Check admin requirement
  if (to.meta.requiresAdmin) {
    try {
      const response = await axios.get("/api/users/isAdmin");
      if (!response.data.isAdmin) {
        return next("/");
      }
    } catch (err) {
      console.error("Error checking admin status:", err);
      return next("/");
    }
  }

  next();
});

export default router;
