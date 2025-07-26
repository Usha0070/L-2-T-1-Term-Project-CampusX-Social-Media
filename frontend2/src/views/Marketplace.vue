<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "../utils/axios";
import { getCurrentUserId } from "../utils/auth";
import MarketplacePost from "../components/MarketplacePost.vue";

const MARKETPLACE_GROUP_ID = 4;
const posts = ref([]);
const loading = ref({ posts: true, creating: false });
const error = ref(null);
const currentUserId = ref(getCurrentUserId());

// Filter states
const selectedCategory = ref("all");
const selectedStatus = ref("all");
const selectedCondition = ref("all");
const searchQuery = ref("");

const categories = ref([]);
const priceRange = ref({ min: 0, max: 0 });

// Create post modal state
const showCreatePostModal = ref(false);
const showErrorAlert = ref(false);
const postMediaFiles = ref([]);
const postMediaPreviews = ref([]);

// Post form data
const postForm = ref({
  content: "",
  visibility: "public",
  media_contexts: [],
  marketplace: {
    category: "",
    price: "",
    item_condition: "New",
    status: "Available",
  },
});

const newCategoryName = ref("");

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

const getCharacterCount = computed(() => {
  const count = postForm.value.content?.length || 0;
  const max = 5000;
  return {
    count,
    max,
    isNearLimit: count > max * 0.8,
    isAtLimit: count >= max,
  };
});

const canSubmitPost = computed(() => {
  return (
    postForm.value.content?.trim() &&
    postForm.value.marketplace.category &&
    postForm.value.marketplace.category !== "__new__" &&
    postForm.value.marketplace.price &&
    postMediaFiles.value.length > 0 &&
    !getCharacterCount.value.isAtLimit
  );
});

const fetchMarketplacePosts = async () => {
  try {
    loading.value.posts = true;
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
    loading.value.posts = false;
  }
};

const handlePostMediaUpload = (event) => {
  const files = Array.from(event.target.files);
  const remainingSlots = 10 - postMediaFiles.value.length;
  const filesToAdd = files.slice(0, remainingSlots);

  filesToAdd.forEach((file) => {
    postMediaFiles.value.push(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      postMediaPreviews.value.push({
        url: e.target.result,
        name: file.name,
        type: file.type.startsWith("image/") ? "image" : "video",
      });
    };
    reader.readAsDataURL(file);

    postForm.value.media_contexts.push("");
  });

  event.target.value = "";
};

const removePostMedia = (index) => {
  postMediaFiles.value.splice(index, 1);
  postMediaPreviews.value.splice(index, 1);
  postForm.value.media_contexts.splice(index, 1);
};

const handleNewCategory = () => {
  if (newCategoryName.value.trim()) {
    const categoryName = newCategoryName.value.trim();
    postForm.value.marketplace.category = categoryName;
    // Add to categories list if not already present
    if (!categories.value.includes(categoryName)) {
      categories.value.push(categoryName);
    }
    newCategoryName.value = "";
  }
};

const resetPostForm = () => {
  postForm.value = {
    content: "",
    visibility: "public",
    media_contexts: [],
    marketplace: {
      category: "",
      price: "",
      item_condition: "New",
      status: "Available",
    },
  };
  postMediaFiles.value = [];
  postMediaPreviews.value = [];
  showErrorAlert.value = false;
  newCategoryName.value = "";
};

const createMarketplacePost = async () => {
  if (!canSubmitPost.value) return;

  try {
    loading.value.creating = true;
    showErrorAlert.value = false;

    const formData = new FormData();
    formData.append("content", postForm.value.content);
    formData.append("visibility", postForm.value.visibility);
    formData.append("market", JSON.stringify(postForm.value.marketplace));

    // Add media files
    postMediaFiles.value.forEach((file) => {
      formData.append("media", file);
    });

    // Add media contexts
    postForm.value.media_contexts.forEach((context, index) => {
      formData.append(`media_contexts[${index}]`, context);
    });

    await axios.post(`/api/groups/${MARKETPLACE_GROUP_ID}/posts`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    resetPostForm();
    showCreatePostModal.value = false;
    await fetchMarketplacePosts();
  } catch (err) {
    error.value = err.response?.data?.error || "Failed to create marketplace post";
    showErrorAlert.value = true;
    console.error("Error creating marketplace post:", err);
  } finally {
    loading.value.creating = false;
  }
};

onMounted(async () => {
  await fetchMarketplacePosts();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl px-4 py-6">
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Marketplace</h1>
        <p class="mt-2 text-gray-600">Buy and sell items within the campus community</p>
      </div>

      <!-- Create Post Button -->
      <button
        @click="showCreatePostModal = true"
        class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        <i class="fa-solid fa-plus"></i>
        Sell Item
      </button>
    </div>

    <!-- Create Marketplace Post Modal -->
    <div v-if="showCreatePostModal" class="fixed inset-0 z-50">
      <!-- Backdrop with blur -->
      <div class="absolute inset-0 bg-black/30 backdrop-blur-md" @click="showCreatePostModal = false"></div>

      <!-- Modal -->
      <div class="relative min-h-screen flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" @click.stop>
          <!-- Modal Header -->
          <div class="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10">
            <h2 class="text-xl font-bold">Create Marketplace Listing</h2>
            <button
              @click="showCreatePostModal = false"
              class="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition-colors"
            >
              <i class="fa-solid fa-times"></i>
            </button>
          </div>

          <!-- Error Alert -->
          <div
            v-if="showErrorAlert && error"
            class="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <i class="fa-solid fa-circle-exclamation text-red-500"></i>
                <p class="text-red-700">{{ error }}</p>
              </div>
              <button
                type="button"
                @click="showErrorAlert = false"
                class="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <i class="fa-solid fa-times"></i>
              </button>
            </div>
          </div>

          <form @submit.prevent="createMarketplacePost" class="p-6 space-y-6">
            <!-- Item Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Item Description *</label>
              <textarea
                v-model="postForm.content"
                rows="4"
                placeholder="Describe your item in detail..."
                class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 resize-none"
                :class="{
                  'border-red-300 focus:border-red-500': getCharacterCount.isAtLimit,
                  'border-yellow-300 focus:border-yellow-500':
                    getCharacterCount.isNearLimit && !getCharacterCount.isAtLimit,
                }"
                maxlength="5000"
                required
              ></textarea>
              <div class="flex justify-end items-center mt-1">
                <div
                  class="text-xs mt-1"
                  :class="{
                    'text-red-500': getCharacterCount.isAtLimit,
                    'text-yellow-600': getCharacterCount.isNearLimit && !getCharacterCount.isAtLimit,
                    'text-gray-500': !getCharacterCount.isNearLimit,
                  }"
                >
                  {{ getCharacterCount.count }}/{{ getCharacterCount.max }}
                </div>
              </div>
            </div>

            <!-- Marketplace Details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Category -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <div class="space-y-2">
                  <select
                    v-model="postForm.marketplace.category"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    <option v-for="category in categories" :key="category" :value="category">
                      {{ category }}
                    </option>
                    <option value="__new__">+ Add New Category</option>
                  </select>

                  <!-- New Category Input -->
                  <input
                    v-if="postForm.marketplace.category === '__new__'"
                    v-model="newCategoryName"
                    type="text"
                    placeholder="Enter new category name"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    @blur="handleNewCategory"
                    @keydown.enter="handleNewCategory"
                    required
                  />
                </div>
              </div>

              <!-- Price -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Price (BDT) *</label>
                <input
                  v-model="postForm.marketplace.price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <!-- Condition -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
                <select
                  v-model="postForm.marketplace.item_condition"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="New">New</option>
                  <option value="Used">Used</option>
                </select>
              </div>
            </div>

            <!-- Media Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <i class="fa-solid fa-images mr-1"></i>
                Item Photos * ({{ postMediaFiles.length }}/10)
                <span class="text-xs text-gray-500 ml-2">At least one photo is required</span>
              </label>
              <div class="space-y-4">
                <!-- Upload Button -->
                <div class="flex items-center justify-center w-full">
                  <label
                    class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors"
                    :class="{
                      'border-gray-300 bg-gray-50 hover:bg-gray-100': postMediaFiles.length < 10,
                      'border-gray-200 bg-gray-100 cursor-not-allowed': postMediaFiles.length >= 10,
                    }"
                  >
                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                      <i
                        class="text-3xl mb-2"
                        :class="{
                          'fa-solid fa-cloud-upload-alt text-gray-400': postMediaFiles.length < 10,
                          'fa-solid fa-ban text-gray-300': postMediaFiles.length >= 10,
                        }"
                      ></i>
                      <p
                        class="text-sm"
                        :class="postMediaFiles.length >= 10 ? 'text-gray-400' : 'text-gray-500'"
                      >
                        <span class="font-semibold">
                          {{ postMediaFiles.length >= 10 ? "Maximum files reached" : "Click to upload" }}
                        </span>
                        {{ postMediaFiles.length < 10 ? " or drag and drop" : "" }}
                      </p>
                      <p class="text-xs text-gray-500" v-if="postMediaFiles.length < 10">
                        Images or videos ({{ 10 - postMediaFiles.length }} remaining)
                      </p>
                    </div>
                    <input
                      type="file"
                      class="hidden"
                      multiple
                      accept="image/*,video/*"
                      @change="handlePostMediaUpload"
                      :disabled="postMediaFiles.length >= 10"
                    />
                  </label>
                </div>

                <!-- Media Previews -->
                <div v-if="postMediaPreviews.length > 0" class="grid grid-cols-2 gap-4">
                  <div v-for="(preview, index) in postMediaPreviews" :key="index" class="relative group">
                    <!-- Image Preview -->
                    <img
                      v-if="preview.type === 'image'"
                      :src="preview.url"
                      :alt="preview.name"
                      class="w-full h-32 object-cover rounded-lg"
                    />
                    <!-- Video Preview -->
                    <video
                      v-else
                      :src="preview.url"
                      class="w-full h-32 object-cover rounded-lg"
                      controls
                      preload="metadata"
                    ></video>

                    <!-- Remove Button -->
                    <button
                      type="button"
                      @click="removePostMedia(index)"
                      class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                    >
                      <i class="fa-solid fa-times text-xs"></i>
                    </button>

                    <!-- File Info -->
                    <div class="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {{ preview.name.length > 15 ? preview.name.substring(0, 15) + "..." : preview.name }}
                    </div>

                    <!-- Media Context -->
                    <input
                      v-model="postForm.media_contexts[index]"
                      type="text"
                      placeholder="Add a caption..."
                      class="absolute bottom-0 left-0 right-0 bg-black/50 text-white placeholder-gray-300 px-2 py-1 text-xs rounded-b-lg border-none focus:outline-none focus:bg-black/70 transition-colors"
                      maxlength="200"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="sticky bottom-0 bg-white pt-4 pb-2 -mx-6 px-6 border-t flex justify-end gap-3">
              <button
                type="button"
                @click="showCreatePostModal = false"
                class="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="!canSubmitPost || loading.creating"
                class="px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2"
                :class="{
                  'bg-blue-600 hover:bg-blue-700': canSubmitPost && !loading.creating,
                  'bg-gray-300 cursor-not-allowed': !canSubmitPost || loading.creating,
                }"
              >
                <i v-if="loading.creating" class="fa-solid fa-spinner fa-spin"></i>
                <i v-else class="fa-solid fa-plus"></i>
                {{ loading.creating ? "Creating..." : "List Item" }}
                <span v-if="postMediaFiles.length > 0" class="text-xs">
                  ({{ postMediaFiles.length }} photos)
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
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
    <div v-if="loading.posts" class="py-12 text-center">
      <div
        class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"
      ></div>
      <p class="mt-4 text-gray-600">Loading marketplace items...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error && !showErrorAlert" class="rounded-lg bg-red-50 p-4 text-center text-red-600">
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
    <div v-if="!loading.posts && !error && filteredPosts.length === 0" class="py-12 text-center">
      <i class="fa-solid fa-store mb-4 text-4xl text-gray-400"></i>
      <h3 class="text-lg font-medium text-gray-900">No items found</h3>
      <p class="mt-1 text-gray-500">Try adjusting your filters or search query</p>
    </div>
  </div>
</template>
