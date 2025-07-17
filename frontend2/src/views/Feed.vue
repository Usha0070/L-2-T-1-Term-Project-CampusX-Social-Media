<script setup>
import { ref, onMounted } from "vue";
import axios from "../utils/axios";
import Post from "../components/Post.vue";

const posts = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchPosts = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await axios.get("/api/users/me/feed");
    posts.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.message || "Failed to load posts";
    console.error("Error fetching posts:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPosts();
});
</script>

<template>
  <div class="container mx-auto max-w-2xl px-4 py-6">
    <!-- Loading state -->
    <div v-if="loading" class="space-y-4">
      <div v-for="n in 3" :key="n" class="rounded-lg bg-white p-4 shadow animate-pulse">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-full bg-gray-200"></div>
          <div class="space-y-2">
            <div class="h-4 w-32 rounded bg-gray-200"></div>
            <div class="h-3 w-24 rounded bg-gray-200"></div>
          </div>
        </div>
        <div class="mt-4 space-y-2">
          <div class="h-4 w-full rounded bg-gray-200"></div>
          <div class="h-4 w-2/3 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="rounded-lg bg-red-50 p-4 text-center text-red-600">
      {{ error }}
      <button @click="fetchPosts" class="mt-2 text-sm font-medium text-red-700 hover:text-red-800">
        Try again
      </button>
    </div>

    <!-- Posts list -->
    <div v-else class="space-y-4">
      <Post v-for="post in posts" :key="post.id" :post="post">
        <template #actions>
          <!-- Additional actions can be added here -->
        </template>
      </Post>

      <!-- Empty state -->
      <div v-if="posts.length === 0" class="rounded-lg bg-gray-50 p-8 text-center">
        <i class="fa-regular fa-newspaper mb-2 text-4xl text-gray-400"></i>
        <h3 class="text-lg font-medium text-gray-700">No posts yet</h3>
        <p class="mt-1 text-gray-500">Posts from your connections will appear here</p>
      </div>
    </div>
  </div>
</template>
