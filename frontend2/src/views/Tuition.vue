<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "../utils/axios";
import { getCurrentUserId } from "../utils/auth";
import TuitionPost from "../components/TuitionPost.vue";

const TUITION_GROUP_ID = 5;
const posts = ref([]);
const loading = ref(true);
const error = ref(null);
const currentUserId = ref(getCurrentUserId());

// Filter states
const selectedClass = ref("all");
const selectedStatus = ref("all");
const selectedGender = ref("all");
const searchQuery = ref("");

// Available classes
const classes = ref([]);
const locations = ref([]);

const filteredPosts = computed(() => {
  return posts.value.filter((post) => {
    if (!post.tuition_post) return false;

    // Class filter
    if (selectedClass.value !== "all" && post.tuition_post.class !== selectedClass.value) {
      return false;
    }

    // Status filter
    if (selectedStatus.value !== "all" && post.tuition_post.status !== selectedStatus.value) {
      return false;
    }

    // Gender filter
    if (selectedGender.value !== "all" && post.tuition_post.preferred_gender !== selectedGender.value) {
      return false;
    }

    // Search query
    if (searchQuery.value) {
      const searchLower = searchQuery.value.toLowerCase();
      const contentMatch = post.content.toLowerCase().includes(searchLower);
      const locationMatch = post.tuition_post.location.toLowerCase().includes(searchLower);
      const subjectMatch = post.tuition_post.subjects.some((subject) =>
        subject.name.toLowerCase().includes(searchLower)
      );
      return contentMatch || locationMatch || subjectMatch;
    }

    return true;
  });
});

const fetchTuitionPosts = async () => {
  try {
    loading.value = true;
    const groupPostsRes = await axios.get(`/api/groups/${TUITION_GROUP_ID}/posts`);

    const acceptedPosts = groupPostsRes.data.filter((post) => post.status === "Accepted");
    const postDetailsPromises = acceptedPosts.map((post) => axios.get(`/api/posts/${post.post_id}`));

    const postResponses = await Promise.all(postDetailsPromises);
    posts.value = postResponses.map((res) => (Array.isArray(res.data) ? res.data[0] : res.data));

    // Extract unique classes and locations
    const classSet = new Set();
    const locationSet = new Set();
    posts.value.forEach((post) => {
      if (post?.tuition_post?.class) {
        classSet.add(post.tuition_post.class);
      }
      if (post?.tuition_post?.location) {
        locationSet.add(post.tuition_post.location);
      }
    });
    classes.value = Array.from(classSet);
    locations.value = Array.from(locationSet);
  } catch (err) {
    error.value = err.response?.data?.error || err.message || "Failed to fetch tuition posts";
    console.error("Error fetching tuition posts:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchTuitionPosts();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl px-4 py-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold">Tuition</h1>
      <p class="mt-2 text-gray-600">Find and post tuition opportunities</p>
    </div>

    <!-- Filters -->
    <div class="mb-6 grid gap-4 md:grid-cols-4">
      <!-- Search -->
      <div class="col-span-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by subject, location, or description..."
          class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <!-- Class Filter -->
      <select
        v-model="selectedClass"
        class="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
      >
        <option value="all">All Classes</option>
        <option v-for="className in classes" :key="className" :value="className">
          {{ className }}
        </option>
      </select>

      <!-- Status Filter -->
      <select
        v-model="selectedStatus"
        class="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
      >
        <option value="all">All Status</option>
        <option value="Available">Available</option>
        <option value="Booked">Booked</option>
      </select>

      <!-- Gender Filter -->
      <select
        v-model="selectedGender"
        class="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
      >
        <option value="all">All Genders</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Any">Any</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-12 text-center">
      <div
        class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"
      ></div>
      <p class="mt-4 text-gray-600">Loading tuition posts...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-lg bg-red-50 p-4 text-center text-red-600">
      {{ error }}
      <button @click="fetchTuitionPosts" class="mt-2 text-sm font-medium text-red-700 hover:text-red-800">
        Try again
      </button>
    </div>

    <!-- Posts Grid -->
    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <TuitionPost v-for="post in filteredPosts" :key="post.post_id" :post="post" />
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !error && filteredPosts.length === 0" class="py-12 text-center">
      <i class="fa-solid fa-chalkboard-user mb-4 text-4xl text-gray-400"></i>
      <h3 class="text-lg font-medium text-gray-900">No tuition posts found</h3>
      <p class="mt-1 text-gray-500">Try adjusting your filters or search query</p>
    </div>
  </div>
</template>
