<script setup>
import { ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";

const route = useRoute();
const menuItems = ref([
  { name: "Feed", path: "/", icon: "fa-solid fa-house" },
  { name: "Profile", path: "/profile", icon: "fa-solid fa-user" },
  { name: "Search", path: "/search", icon: "fa-solid fa-magnifying-glass" },
  { name: "Marketplace", path: "/marketplace", icon: "fa-solid fa-shop" },
  { name: "Tuition", path: "/tuition", icon: "fa-solid fa-book" },
]);
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
