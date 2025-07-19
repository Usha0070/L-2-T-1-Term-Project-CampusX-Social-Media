<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "../utils/axios";
import { getCurrentUserId } from "../utils/auth";
import MarketplacePost from "../components/MarketplacePost.vue";

const MARKETPLACE_GROUP_ID = 4;
const posts = ref([]);
const loading = ref(true);
const error = ref(null);
const currentUserId = ref(getCurrentUserId());

// Filter states
const selectedCategory = ref("all");
const selectedStatus = ref("all");
const selectedCondition = ref("all");
const searchQuery = ref("");

const categories = ref([]);
const priceRange = ref({ min: 0, max: 0 });

const filteredPosts = computed(() => {
  return posts.value.filter((post) => {
    if (!post.marketplace_post) return false;

    // Category filter
    if (selectedCategory.value !== "all" && post.marketplace_post.category !== selectedCategory.value) {
      return false;
    }

    // Status filter
    if (selectedStatus.value !== "all" && post.marketplace_post.status !== selectedStatus.value) {
      return false;
    }

    // Condition filter
    if (
      selectedCondition.value !== "all" &&
      post.marketplace_post.item_condition !== selectedCondition.value
    ) {
      return false;
    }

    // Search query
    if (searchQuery.value) {
      const searchLower = searchQuery.value.toLowerCase();
      return post.content.toLowerCase().includes(searchLower);
    }

    return true;
  });
});

const fetchMarketplacePosts = async () => {
  try {
    loading.value = true;
    const groupPostsRes = await axios.get(`/api/groups/${MARKETPLACE_GROUP_ID}/posts`);

    const acceptedPosts = groupPostsRes.data.filter((post) => post.status === "Accepted");
    const postDetailsPromises = acceptedPosts.map((post) => axios.get(`/api/posts/${post.post_id}`));

    const postResponses = await Promise.all(postDetailsPromises);
    posts.value = postResponses.map((res) => (Array.isArray(res.data) ? res.data[0] : res.data));

    const categorySet = new Set();
    posts.value.forEach((post) => {
      if (post?.marketplace_post?.category) {
        categorySet.add(post.marketplace_post.category);
      }
    });
    categories.value = Array.from(categorySet);
    console.log("categories", categories.value);

    const validPrices = posts.value
      .filter((post) => post.marketplace_post && typeof post.marketplace_post.price === "number")
      .map((post) => post.marketplace_post.price);

    priceRange.value = {
      min: validPrices.length ? Math.min(...validPrices) : 0,
      max: validPrices.length ? Math.max(...validPrices) : 0,
    };
  } catch (err) {
    error.value = err.response?.data?.error || err.message || "Failed to fetch marketplace items";
    console.error("Error fetching marketplace items:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchMarketplacePosts();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl px-4 py-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold">Marketplace</h1>
      <p class="mt-2 text-gray-600">Buy and sell items within the campus community</p>
    </div>

    <!-- Filters -->
    <div class="mb-6 grid gap-4 md:grid-cols-4">
      <!-- Search -->
      <div class="col-span-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search items..."
          class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <!-- Category Filter -->
      <select
        v-model="selectedCategory"
        class="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
      >
        <option value="all">All Categories</option>
        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>

      <!-- Status Filter -->
      <select
        v-model="selectedStatus"
        class="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
      >
        <option value="all">All Status</option>
        <option value="Available">Available</option>
        <option value="Sold">Sold</option>
      </select>

      <!-- Condition Filter -->
      <select
        v-model="selectedCondition"
        class="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
      >
        <option value="all">All Conditions</option>
        <option value="New">New</option>
        <option value="Used">Used</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-12 text-center">
      <div
        class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"
      ></div>
      <p class="mt-4 text-gray-600">Loading marketplace items...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-lg bg-red-50 p-4 text-center text-red-600">
      {{ error }}
      <button @click="fetchMarketplacePosts" class="mt-2 text-sm font-medium text-red-700 hover:text-red-800">
        Try again
      </button>
    </div>

    <!-- Items Grid -->
    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <MarketplacePost v-for="post in filteredPosts" :key="post.post_id" :post="post" />
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !error && filteredPosts.length === 0" class="py-12 text-center">
      <i class="fa-solid fa-store mb-4 text-4xl text-gray-400"></i>
      <h3 class="text-lg font-medium text-gray-900">No items found</h3>
      <p class="mt-1 text-gray-500">Try adjusting your filters or search query</p>
    </div>
  </div>
</template>
