<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center p-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-600">{{ error }}</p>
      <button @click="loadFeed" class="mt-2 text-red-600 hover:text-red-700 font-medium">Try again</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!posts.length" class="bg-white rounded-lg shadow p-8 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No posts</h3>
      <p class="mt-1 text-sm text-gray-500">
        Your feed is empty. Start by following some people or create a post.
      </p>
    </div>

    <!-- Posts List -->
    <template v-else>
      <PostCard
        v-for="post in posts"
        :key="post.post_id"
        :post="post"
        :current-user="currentUser"
        @refresh="loadFeed"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import PostCard from "../posts/PostCard.vue";

// Types
interface User {
  user_id: number;
  name: string;
  // Add other user properties as needed
}

interface Post {
  post_id: number;
  content: string | null;
  author_id: number;
  created_at: string;
  modified_at: string;
  visibility: "public" | "friends" | "private";
  tags: Array<{ user_id: number }> | null;
  likes: Array<{ user_id: number }> | null;
  comments: Array<any> | null;
  media: Array<any> | null;
  shared_post_id: number | null;
  tuition_post: any | null;
  marketplace_post: any | null;
}

// State
const posts = ref<Post[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const currentUser = ref<User | null>(null);

// Methods
const loadFeed = async () => {
  try {
    loading.value = true;
    error.value = null;

    const [userResponse, feedResponse] = await Promise.all([
      axios.get("/api/users/me"),
      axios.get("/api/users/me/feed"),
    ]);

    currentUser.value = userResponse.data;
    posts.value = feedResponse.data;
  } catch (err) {
    error.value = "Failed to load feed. Please try again.";
    console.error("Feed loading error:", err);
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadFeed();
});
</script>
