<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import axios from "../utils/axios";
import Post from "../components/Post.vue";

const posts = ref([]);
const loading = ref(true);
const error = ref(null);

// Pagination state
const limit = ref(20);
const offset = ref(0);
const currentPage = ref(1);

const fetchPosts = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await axios.get("/api/users/me/feed", {
      params: {
        limit: limit.value,
        offset: offset.value,
      },
    });
    posts.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.message || "Failed to load posts";
    console.error("Error fetching posts:", err);
  } finally {
    loading.value = false;
  }
};

const nextPage = () => {
  offset.value += limit.value;
  currentPage.value += 1;
  fetchPosts();
};

const prevPage = () => {
  if (offset.value >= limit.value) {
    offset.value -= limit.value;
    currentPage.value -= 1;
    fetchPosts();
  }
};

onMounted(() => {
  fetchPosts();
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- Main Content Area - Centered -->
    <div class="w-full lg:w-[768px] mx-auto">
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
        <Post v-for="post in posts" :key="post.post_id" :post="post">
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

        <!-- Pagination controls -->
        <div class="flex justify-between items-center mt-6" v-if="posts.length > 0">
          <button
            @click="prevPage"
            :disabled="currentPage === 1 || loading"
            class="px-4 py-2 rounded bg-gray-200 text-gray-700 font-medium disabled:opacity-50"
          >
            Previous
          </button>
          <span class="text-gray-600">Page {{ currentPage }}</span>
          <button
            @click="nextPage"
            :disabled="posts.length < limit || loading"
            class="px-4 py-2 rounded bg-gray-200 text-gray-700 font-medium disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
