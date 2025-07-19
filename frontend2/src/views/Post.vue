<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "../utils/axios";
import Post from "../components/Post.vue";

const route = useRoute();
const router = useRouter();
const post = ref(null);
const loading = ref(true);
const error = ref(null);

const fetchPost = async () => {
  try {
    loading.value = true;
    error.value = null;

    const postResponse = await axios.get(`/api/posts/${route.params.id}`);
    post.value = postResponse.data[0];
  } catch (err) {
    console.error("Error fetching post:", err);
    error.value = "Failed to load post. Please try again later.";
    if (err.response?.status === 404) {
      error.value = "Post not found.";
      // Optionally redirect back after a delay
      setTimeout(() => router.push("/"), 2000);
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPost();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="error" class="text-center">
      <p class="text-red-500">{{ error }}</p>
      <button @click="router.push('/')" class="mt-4 text-blue-500 hover:text-blue-700">
        Go back to feed
      </button>
    </div>

    <div v-else-if="!post" class="text-center text-gray-500">Post not found</div>

    <div v-else class="max-w-2xl mx-auto">
      <button @click="router.back()" class="mb-4 text-blue-500 hover:text-blue-700 flex items-center gap-2">
        <i class="fa-solid fa-arrow-left"></i>
        Back
      </button>

      <Post :post="post" />
    </div>
  </div>
</template>
