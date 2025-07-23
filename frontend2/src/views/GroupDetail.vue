<template>
  <div class="container mx-auto max-w-5xl px-4 py-6">
    <!-- Group Header -->
    <div v-if="group" class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div class="relative h-64">
        <img
          :src="group.cover_photo ? `/meta${group.cover_photo}` : '/meta/media/default_group_cover_photo.jpg'"
          class="w-full h-full object-cover"
          alt="Group cover"
        />
        <img
          :src="group.profile_pic ? `/meta${group.profile_pic}` : '/meta/media/default_group_photo.png'"
          class="absolute -bottom-8 left-8 w-24 h-24 rounded-full border-4 border-white object-cover"
          alt="Group profile"
        />
      </div>
      <div class="p-8 pt-12">
        <h1 class="text-3xl font-bold mb-2">{{ group.name }}</h1>
        <p class="text-gray-600 mb-4">{{ group.description }}</p>
        <div class="flex items-center gap-4">
          <span class="text-gray-500">{{ group.member_count || 0 }} members</span>
          <button
            v-if="!isMember"
            @click="joinGroup"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Join Group
          </button>
        </div>
      </div>
    </div>

    <!-- Create Post -->
    <div v-if="isMember" class="bg-white rounded-lg shadow-md p-4 mb-8">
      <textarea
        v-model="newPost.content"
        class="w-full p-4 border rounded-lg mb-4"
        placeholder="Write something to the group..."
        rows="3"
      ></textarea>
      <div class="flex justify-end">
        <button
          @click="createPost"
          :disabled="loading.posts"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Post
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading.posts" class="space-y-4">
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
    <div v-else-if="error.posts" class="rounded-lg bg-red-50 p-4 text-center text-red-600">
      {{ error.posts }}
      <button @click="fetchPosts" class="mt-2 text-sm font-medium text-red-700 hover:text-red-800">
        Try again
      </button>
    </div>

    <!-- Posts list -->
    <div v-else class="space-y-4">
      <Post v-for="post in posts" :key="post.post_id" :post="post" @post-updated="fetchPosts" />

      <!-- Empty state -->
      <div v-if="posts.length === 0" class="rounded-lg bg-gray-50 p-8 text-center">
        <i class="fa-regular fa-newspaper mb-2 text-4xl text-gray-400"></i>
        <h3 class="text-lg font-medium text-gray-700">No posts yet</h3>
        <p class="mt-1 text-gray-500">Be the first one to post in this group</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "../utils/axios";
import Post from "../components/Post.vue";
import { getCurrentUserId } from "../utils/auth";

const route = useRoute();
const group = ref(null);
const posts = ref([]);
const isMember = ref(false);
const loading = ref({
  group: true,
  posts: true,
  membership: true,
});
const error = ref({
  group: null,
  posts: null,
  membership: null,
});

const newPost = ref({
  content: "",
  user_id: getCurrentUserId(),
});

const fetchGroup = async () => {
  try {
    loading.value.group = true;
    error.value.group = null;
    const response = await axios.get(`/api/groups/${route.params.id}`);
    group.value = response.data;
  } catch (err) {
    error.value.group = err.response?.data?.message || "Failed to load group";
    console.error("Error fetching group:", err);
  } finally {
    loading.value.group = false;
  }
};

const fetchPosts = async () => {
  try {
    loading.value.posts = true;
    error.value.posts = null;
    const response = await axios.get(`/api/groups/${route.params.id}/posts`);
    const postPromises = response.data.map((post) =>
      axios.get(`/api/posts/${post.post_id}`).then((res) => res.data[0])
    );
    posts.value = await Promise.all(postPromises);
  } catch (err) {
    error.value.posts = err.response?.data?.message || "Failed to load posts";
    console.error("Error fetching posts:", err);
  } finally {
    loading.value.posts = false;
  }
};

const checkMembership = async () => {
  try {
    loading.value.membership = true;
    error.value.membership = null;
    const response = await axios.get("/api/groups/joined");
    isMember.value = response.data.some((group) => group.group_id === parseInt(route.params.id));
  } catch (err) {
    error.value.membership = err.response?.data?.message || "Failed to check membership";
    console.error("Error checking membership:", err);
  } finally {
    loading.value.membership = false;
  }
};

const joinGroup = async () => {
  try {
    await axios.post(`/api/groups/${route.params.id}/members`, {
      user_id: getCurrentUserId(),
    });
    isMember.value = true;
  } catch (err) {
    console.error("Error joining group:", err);
  }
};

const createPost = async () => {
  if (!newPost.value.content.trim()) return;

  try {
    loading.value.posts = true;
    await axios.post(`/api/groups/${route.params.id}/posts`, newPost.value);
    newPost.value.content = "";
    await fetchPosts();
  } catch (err) {
    error.value.posts = err.response?.data?.message || "Failed to create post";
    console.error("Error creating post:", err);
  } finally {
    loading.value.posts = false;
  }
};

onMounted(() => {
  fetchGroup();
  fetchPosts();
  checkMembership();
});
</script>
