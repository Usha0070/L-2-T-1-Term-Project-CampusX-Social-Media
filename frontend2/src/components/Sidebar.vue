<script setup>
import { ref, onMounted, computed } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import axios from "../utils/axios";
import { getCurrentUserToken } from "../utils/auth";

const route = useRoute();
const isAdmin = ref(false);

const baseMenuItems = [
  { name: "Feed", path: "/", icon: "fa-solid fa-house" },
  { name: "Profile", path: "/profile", icon: "fa-solid fa-user" },
  { name: "Search", path: "/search", icon: "fa-solid fa-magnifying-glass" },
  { name: "Notifications", path: "/notifications", icon: "fa-solid fa-bell" },
  { name: "Groups", path: "/groups", icon: "fa-solid fa-users" },
  { name: "Marketplace", path: "/marketplace", icon: "fa-solid fa-shop" },
  { name: "Tuition", path: "/tuition", icon: "fa-solid fa-book" },
  { name: "Chats", path: "/chats", icon: "fa-solid fa-message" },
];

const adminMenuItem = { name: "Stats", path: "/stats", icon: "fa-solid fa-chart-line" };

const menuItems = computed(() => {
  if (isAdmin.value) {
    return [...baseMenuItems, adminMenuItem];
  }
  return baseMenuItems;
});

const checkAdminStatus = async () => {
  // Only check admin status if user is logged in
  const token = getCurrentUserToken();
  if (!token) return;

  try {
    const response = await axios.get("/api/users/isAdmin");
    isAdmin.value = response.data.isAdmin;
  } catch (err) {
    console.error("Error checking admin status:", err);
    isAdmin.value = false;
  }
};

onMounted(() => {
  checkAdminStatus();
});
</script>

<template>
  <aside
    class="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg border-r border-blue-100"
  >
    <nav class="mt-4 space-y-1 px-3">
      <RouterLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center rounded-lg px-4 py-3 text-gray-600 transition-colors hover:bg-blue-50"
        :class="{ 'bg-blue-50 text-blue-600 font-medium': route.path === item.path }"
      >
        <i :class="item.icon" class="mr-3 w-5"></i>
        <span>{{ item.name }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>
