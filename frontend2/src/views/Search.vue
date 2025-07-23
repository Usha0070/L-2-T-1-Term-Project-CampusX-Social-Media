<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "../utils/axios";
import Post from "../components/Post.vue";
import GroupCard from "../components/GroupCard.vue";

const router = useRouter();
const searchQuery = ref("");
const selectedFilters = ref(["users", "groups", "posts"]);
const results = ref({
  users: [],
  groups: [],
  posts: [],
});
const loading = ref(false);
const error = ref(null);
const limit = ref(10);
const userProfiles = ref(new Map()); // Store user profiles

const hasResults = computed(() => {
  return Object.values(results.value).some((arr) => arr.length > 0);
});

const fetchUserProfiles = async (users) => {
  try {
    const profilePromises = users.map((user) =>
      axios
        .get(`/api/users/${user.user_id}/profile`)
        .then((response) => {
          userProfiles.value.set(user.user_id, response.data);
        })
        .catch((err) => {
          console.error(`Failed to fetch profile for user ${user.user_id}:`, err);
        })
    );
    await Promise.all(profilePromises);
  } catch (err) {
    console.error("Error fetching user profiles:", err);
  }
};

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    results.value = { users: [], groups: [], posts: [] };
    userProfiles.value.clear();
    return;
  }

  try {
    loading.value = true;
    error.value = null;

    const response = await axios.get("/api/search", {
      params: {
        q: searchQuery.value.trim(),
        limit: limit.value,
        filters: selectedFilters.value.join(","),
      },
    });

    results.value = response.data;

    // Fetch profiles for users if users are in the results
    if (results.value.users?.length > 0) {
      await fetchUserProfiles(results.value.users);
    }
  } catch (err) {
    console.error("Search error:", err);
    error.value = err.response?.data?.message || "Failed to perform search";
  } finally {
    loading.value = false;
  }
};

const toggleFilter = (filter) => {
  const index = selectedFilters.value.indexOf(filter);
  if (index === -1) {
    selectedFilters.value.push(filter);
  } else if (selectedFilters.value.length > 1) {
    selectedFilters.value.splice(index, 1);
  }
};

const goToProfile = (userId) => {
  router.push(`/profile/${userId}`);
};

const goToGroup = (groupId) => {
  router.push(`/groups/${groupId}`);
};

let searchTimeout;
watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(performSearch, 300);
});

watch(selectedFilters, performSearch);
</script>

<template>
  <div class="container mx-auto max-w-5xl px-4 py-6">
    <!-- Search Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold">Search</h1>
      <p class="mt-2 text-gray-600">Search for users, groups, and posts</p>
    </div>

    <!-- Search Input and Filters -->
    <div class="mb-6 space-y-4">
      <div class="relative">
        <i class="fa-solid fa-search absolute left-4 top-3.5 text-gray-400"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search..."
          class="w-full rounded-lg border border-gray-300 pl-12 pr-4 py-3 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div class="flex gap-2">
        <button
          v-for="filter in ['users', 'groups', 'posts']"
          :key="filter"
          @click="toggleFilter(filter)"
          class="rounded-full px-4 py-2 text-sm font-medium transition-colors"
          :class="
            selectedFilters.includes(filter)
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          "
        >
          <i
            :class="{
              'fa-solid fa-users': filter === 'users',
              'fa-solid fa-user-group': filter === 'groups',
              'fa-solid fa-newspaper': filter === 'posts',
            }"
            class="mr-2"
          ></i>
          {{ filter.charAt(0).toUpperCase() + filter.slice(1) }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-12 text-center">
      <div
        class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"
      ></div>
      <p class="mt-4 text-gray-600">Searching...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-lg bg-red-50 p-4 text-center text-red-600">
      {{ error }}
      <button @click="performSearch" class="mt-2 text-sm font-medium text-red-700 hover:text-red-800">
        Try again
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="searchQuery && !hasResults" class="py-12 text-center">
      <i class="fa-solid fa-search text-4xl text-gray-400 mb-4"></i>
      <h3 class="text-lg font-medium text-gray-700">No results found</h3>
      <p class="mt-1 text-gray-500">Try different keywords or filters</p>
    </div>

    <!-- Results -->
    <div v-else-if="searchQuery" class="space-y-8">
      <!-- Users Results -->
      <div v-if="selectedFilters.includes('users') && results.users.length > 0" class="space-y-4">
        <h2 class="text-xl font-semibold">Users</h2>
        <div class="space-y-2">
          <div
            v-for="user in results.users"
            :key="user.user_id"
            @click="goToProfile(user.user_id)"
            class="flex items-center gap-4 rounded-lg bg-white p-4 shadow hover:shadow-md transition-shadow cursor-pointer"
          >
            <div class="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
              <img
                v-if="userProfiles.get(user.user_id)?.profile_pic"
                :src="`/meta${userProfiles.get(user.user_id).profile_pic}`"
                :alt="user.first_name"
                class="h-full w-full object-cover"
              />
              <i
                v-else
                class="fa-solid fa-user text-gray-400 text-2xl flex items-center justify-center h-full"
              ></i>
            </div>
            <div>
              <h3 class="font-medium">{{ user.first_name }} {{ user.last_name }}</h3>
              <p class="text-sm text-gray-600">{{ user.department }} {{ user.batch }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Groups Results -->
      <div v-if="selectedFilters.includes('groups') && results.groups.length > 0" class="space-y-4">
        <h2 class="text-xl font-semibold">Groups</h2>
        <div class="space-y-2">
          <GroupCard
            v-for="group in results.groups"
            :key="group.group_id"
            :group="group"
            @click="goToGroup(group.group_id)"
          />
        </div>
      </div>

      <!-- Posts Results -->
      <div v-if="selectedFilters.includes('posts') && results.posts.length > 0" class="space-y-4">
        <h2 class="text-xl font-semibold">Posts</h2>
        <Post v-for="post in results.posts" :key="post.post_id" :post="post" />
      </div>
    </div>
  </div>
</template>
