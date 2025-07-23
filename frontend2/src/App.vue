<script setup>
import { RouterView, useRoute } from "vue-router";
import Sidebar from "./components/Sidebar.vue";
import Topbar from "./components/Topbar.vue";
import { KeepAlive } from "vue";

const route = useRoute();
const isAuthPage = () => ["/login", "/register"].includes(route.path);
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <Topbar v-if="!isAuthPage()" />
    <Sidebar v-if="!isAuthPage()" />
    <main :class="{ 'pl-64 pt-16': !isAuthPage(), 'pt-0': isAuthPage() }">
      <RouterView v-slot="{ Component }">
        <KeepAlive :include="['Search']">
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </main>
  </div>
</template>
