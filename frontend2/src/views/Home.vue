<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Left Sidebar -->
        <div class="hidden lg:block lg:col-span-3 space-y-4">
          <nav class="bg-white shadow rounded-lg p-4">
            <ul class="space-y-2">
              <li>
                <a
                  href="#"
                  class="flex items-center space-x-3 text-gray-700 p-2 rounded-lg font-medium hover:bg-gray-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Profile</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  class="flex items-center space-x-3 text-gray-700 p-2 rounded-lg font-medium hover:bg-gray-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span>Friends</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  class="flex items-center space-x-3 text-gray-700 p-2 rounded-lg font-medium hover:bg-gray-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <span>Marketplace</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  class="flex items-center space-x-3 text-gray-700 p-2 rounded-lg font-medium hover:bg-gray-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <span>Tuitions</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <!-- Main Content -->
        <main class="lg:col-span-6">
          <!-- Create Post Card -->
          <div class="bg-white shadow rounded-lg p-4 mb-4">
            <div class="flex space-x-4">
              <div
                class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium"
              >
                {{ currentUserInitials }}
              </div>
              <button
                @click="showCreatePost = true"
                class="flex-grow bg-gray-100 text-gray-500 rounded-full px-4 text-left hover:bg-gray-200"
              >
                What's on your mind?
              </button>
            </div>
          </div>

          <!-- Feed -->
          <Feed ref="feedRef" />
        </main>

        <!-- Right Sidebar -->
        <aside class="hidden lg:block lg:col-span-3 space-y-4">
          <!-- Contacts -->
          <div class="bg-white shadow rounded-lg p-4">
            <h2 class="font-semibold text-gray-900 mb-4">Friends</h2>
            <ul v-if="friends.length" class="space-y-3">
              <li v-for="friend in friends" :key="friend.user_id" class="flex items-center space-x-3">
                <div class="relative">
                  <div
                    class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium"
                  >
                    {{ getInitials(friend.name) }}
                  </div>
                  <span
                    class="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white"
                    :class="friend.is_online ? 'bg-green-400' : 'bg-gray-300'"
                  ></span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ friend.name }}
                  </p>
                </div>
              </li>
            </ul>
            <div v-else class="text-center text-gray-500 py-4">No friends yet</div>
          </div>
        </aside>
      </div>
    </div>
  </div>

  <!-- Create Post Modal -->
  <PostModal :show="showCreatePost" @close="showCreatePost = false" size="lg">
    <template #title>Create Post</template>
    <template #content>
      <div class="space-y-4">
        <textarea
          v-model="newPost.content"
          rows="4"
          placeholder="What's on your mind?"
          class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        ></textarea>

        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <button class="p-2 hover:bg-gray-100 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>
            <button class="p-2 hover:bg-gray-100 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </button>
          </div>

          <select
            v-model="newPost.visibility"
            class="text-sm border rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="public">Public</option>
            <option value="friends">Friends</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end space-x-3">
        <button @click="showCreatePost = false" class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
          Cancel
        </button>
        <button
          @click="createPost"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!newPost.content.trim()"
        >
          Post
        </button>
      </div>
    </template>
  </PostModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import Feed from "../components/feed/Feed.vue";
import PostModal from "../components/posts/PostModal.vue";

// Types
interface User {
  user_id: number;
  name: string;
  // Add other user properties as needed
}

interface Friend extends User {
  is_online: boolean;
}

// State
const showCreatePost = ref(false);
const newPost = ref({
  content: "",
  visibility: "public" as "public" | "friends" | "private",
});
const currentUser = ref<User | null>(null);
const friends = ref<Friend[]>([]);
const feedRef = ref<InstanceType<typeof Feed> | null>(null);

// Methods
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const loadCurrentUser = async () => {
  try {
    const response = await axios.get("/api/users/me");
    currentUser.value = response.data;
  } catch (error) {
    console.error("Failed to load user:", error);
  }
};

const loadFriends = async () => {
  try {
    const response = await axios.get("/api/users/me/friends");
    friends.value = response.data;
  } catch (error) {
    console.error("Failed to load friends:", error);
  }
};

const createPost = async () => {
  try {
    await axios.post("/api/posts", newPost.value);
    showCreatePost.value = false;
    newPost.value.content = "";
    feedRef.value?.loadFeed();
  } catch (error) {
    console.error("Failed to create post:", error);
  }
};

// Computed
const currentUserInitials = computed(() => (currentUser.value ? getInitials(currentUser.value.name) : ""));

// Lifecycle
onMounted(() => {
  loadCurrentUser();
  loadFriends();
});
</script>
