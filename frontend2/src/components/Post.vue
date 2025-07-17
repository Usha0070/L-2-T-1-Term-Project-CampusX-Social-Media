<script setup>
import { ref, onMounted } from "vue";
import axios from "../utils/axios";

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});

const author = ref(null);
const authorProfile = ref(null);

const handleImageError = (type, path) => {
  console.error(`Failed to load ${type}:`, path);
};

const fetchAuthorInfo = async () => {
  try {
    const [userRes, profileRes] = await Promise.all([
      axios.get(`/api/users/${props.post.author_id}`),
      axios.get(`/api/users/${props.post.author_id}/profile`),
    ]);
    author.value = userRes.data;
    authorProfile.value = profileRes.data;
    console.log("Author Profile:", authorProfile.value);
    console.log("Post Media:", props.post.media);
  } catch (error) {
    console.error("Error fetching author info:", error);
  }
};

onMounted(fetchAuthorInfo);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } else if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return "Just now";
  }
};
</script>

<template>
  <article class="rounded-lg bg-white p-4 shadow">
    <header class="mb-4 flex items-center gap-3">
      <div class="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
        <img
          v-if="authorProfile?.profile_pic"
          :src="`/meta${authorProfile.profile_pic}`"
          :alt="author?.first_name"
          class="h-full w-full object-cover"
          @error="handleImageError('profile picture', `/meta${authorProfile.profile_pic}`)"
        />
      </div>
      <div>
        <h3 class="font-medium">
          {{ author ? `${author.first_name} ${author.last_name}` : "Loading..." }}
          <span v-if="author?.nickname" class="text-sm text-gray-500"> ({{ author.nickname }}) </span>
        </h3>
        <p class="text-sm text-gray-500">{{ formatDate(post.created_at) }}</p>
      </div>
    </header>

    <div class="space-y-3">
      <p v-if="post.content" class="text-gray-800">{{ post.content }}</p>

      <!-- Media Gallery -->
      <div
        v-if="post.media?.length"
        class="mt-3 grid gap-2"
        :class="{
          'grid-cols-2': post.media.length >= 2,
          'grid-cols-1': post.media.length === 1,
        }"
      >
        <div
          v-for="media in post.media"
          :key="media.order_index"
          class="relative aspect-square overflow-hidden rounded-lg"
        >
          <img
            v-if="media.type === 'image'"
            :src="`/meta${media.link}`"
            class="h-full w-full object-cover"
            alt=""
            @error="handleImageError('media', `/meta${media.link}`)"
          />
        </div>
      </div>

      <!-- Shared Post -->
      <div v-if="post.shared_post_id" class="rounded-lg border p-3">
        <p class="text-sm text-gray-500">Shared post content will be implemented later</p>
      </div>
    </div>

    <footer class="mt-4 flex items-center gap-4 border-t pt-3">
      <button class="flex items-center gap-2 text-gray-500 hover:text-blue-600">
        <i class="fa-regular fa-heart" :class="{ 'fa-solid text-blue-600': post.likes?.length }"></i>
        <span>{{ post.likes?.length || 0 }}</span>
      </button>
      <button class="flex items-center gap-2 text-gray-500 hover:text-blue-600">
        <i class="fa-regular fa-comment"></i>
        <span>{{ post.comments?.length || 0 }}</span>
      </button>
      <div v-if="post.tags?.length" class="ml-auto flex items-center gap-1 text-sm text-gray-500">
        <i class="fa-solid fa-user-tag"></i>
        <span>{{ post.tags.length }}</span>
      </div>
    </footer>

    <slot name="actions"></slot>
  </article>
</template>
