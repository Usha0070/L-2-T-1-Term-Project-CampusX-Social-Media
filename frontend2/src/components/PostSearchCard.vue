<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "../utils/axios";

const router = useRouter();
const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});

const author = ref(null);
const authorProfile = ref(null);
const loading = ref(true);

const fetchAuthorInfo = async () => {
  try {
    const [userRes, profileRes] = await Promise.all([
      axios.get(`/api/users/${props.post.author_id}`),
      axios.get(`/api/users/${props.post.author_id}/profile`),
    ]);
    author.value = userRes.data;
    authorProfile.value = profileRes.data;
  } catch (err) {
    console.error("Error fetching author info:", err);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 30) {
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  } else if (days > 0) {
    return `${days}d ago`;
  } else {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h ago`;
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  }
};

const goToPost = () => {
  router.push(`/post/${props.post.post_id}`);
};

onMounted(() => {
  fetchAuthorInfo();
});
</script>

<template>
  <div
    @click="goToPost"
    class="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-4"
  >
    <!-- Author Info -->
    <div class="flex items-center gap-3 mb-3">
      <div v-if="loading" class="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
      <div v-else class="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
        <img
          v-if="authorProfile?.profile_pic"
          :src="`/meta${authorProfile.profile_pic}`"
          :alt="author?.first_name"
          class="h-full w-full object-cover"
        />
        <i v-else class="fa-solid fa-user text-gray-400 text-xl flex items-center justify-center h-full"></i>
      </div>

      <div class="flex-grow">
        <div v-if="loading" class="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
        <div v-else>
          <p class="font-medium text-gray-900">{{ author?.first_name }} {{ author?.last_name }}</p>
          <p class="text-xs text-gray-500">{{ formatDate(post.created_at) }}</p>
        </div>
      </div>
    </div>

    <!-- Post Content Preview -->
    <p class="text-gray-600 line-clamp-2 mb-2">{{ post.content }}</p>

    <!-- Post Type Indicators -->
    <div class="flex gap-2 text-xs">
      <span v-if="post.tuition_post" class="px-2 py-1 rounded bg-green-100 text-green-700">
        <i class="fa-solid fa-chalkboard-user mr-1"></i>
        Tuition Post
      </span>
      <span v-if="post.marketplace_post" class="px-2 py-1 rounded bg-blue-100 text-blue-700">
        <i class="fa-solid fa-shop mr-1"></i>
        Marketplace
      </span>
      <span v-if="post.media" class="px-2 py-1 rounded bg-purple-100 text-purple-700">
        <i class="fa-solid fa-image mr-1"></i>
        Media
      </span>
      <span class="px-2 py-1 rounded bg-gray-100 text-gray-600">
        <i class="fa-solid fa-heart mr-1"></i>
        {{ post.likes?.length || 0 }}
      </span>
    </div>
  </div>
</template>
