<script setup>
import { useRouter } from "vue-router";
import { clearCurrentUser } from "../utils/auth";

const router = useRouter();

const handleLogout = () => {
  clearCurrentUser();
  router.push("/login");
};
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 h-16 bg-white shadow-md">
    <div class="flex h-full items-center justify-between px-4">
      <h1 class="text-2xl font-bold text-blue-600">CampusX</h1>

      <div class="flex items-center gap-4">
        <button
          @click="handleLogout"
          class="flex items-center rounded-lg px-4 py-2 text-red-600 transition-colors hover:bg-red-50"
        >
          <i class="fa-solid fa-right-from-bracket mr-2"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  </header>
</template>
