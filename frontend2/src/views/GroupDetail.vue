<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- Main Content Area - Centered -->
    <div class="w-full lg:w-[768px] mx-auto">
      <!-- Group Header -->
      <div v-if="group" class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div class="relative h-64">
          <img
            :src="
              group.cover_photo ? `/meta${group.cover_photo}` : '/meta/media/default_group_cover_photo.jpg'
            "
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
            <span class="text-gray-500">{{ groupMembers?.length || 0 }} members</span>
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

      <!-- Create Post Section - Enhanced -->
      <div v-if="isMember" class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="flex items-center gap-4">
          <!-- User Profile Picture -->
          <div class="h-12 w-12 overflow-hidden rounded-full bg-gray-200 flex-shrink-0">
            <img
              v-if="userProfile?.profile_pic"
              :src="`/meta${userProfile.profile_pic}`"
              class="h-full w-full object-cover"
              alt="Your profile picture"
            />
            <div v-else class="h-full w-full flex items-center justify-center text-gray-400">
              <i class="fa-solid fa-user text-xl"></i>
            </div>
          </div>

          <!-- Create Post Button -->
          <button
            @click="showCreatePostModal = true"
            class="flex-grow text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors duration-200"
          >
            Share something with {{ group.name }}...
          </button>

          <!-- Quick Action Buttons -->
          <div class="flex gap-2">
            <button
              @click="showCreatePostModal = true"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Create Post"
            >
              <i class="fa-solid fa-pen text-lg"></i>
              <span class="hidden sm:inline">Post</span>
            </button>

            <button
              @click="showCreatePostModal = true"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Add Photos/Videos"
            >
              <i class="fa-solid fa-images text-lg"></i>
              <span class="hidden sm:inline">Media</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Create Post Modal -->
      <div v-if="showCreatePostModal" class="fixed inset-0 z-50">
        <!-- Backdrop with blur -->
        <div class="absolute inset-0 bg-black/30 backdrop-blur-md" @click="showCreatePostModal = false"></div>

        <!-- Modal -->
        <div class="relative min-h-screen flex items-center justify-center p-4">
          <div
            class="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            @click.stop
          >
            <!-- Modal Header -->
            <div class="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10">
              <h2 class="text-xl font-bold">Create Post in {{ group.name }}</h2>
              <button
                @click="showCreatePostModal = false"
                class="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition-colors"
              >
                <i class="fa-solid fa-times"></i>
              </button>
            </div>

            <!-- Error Alert -->
            <div
              v-if="showErrorAlert && error.posts"
              class="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <i class="fa-solid fa-circle-exclamation text-red-500"></i>
                  <p class="text-red-700">{{ error.posts }}</p>
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

            <form @submit.prevent="createPost" class="p-6 space-y-6">
              <!-- Post Content -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">What's on your mind?</label>
                <textarea
                  v-model="postForm.content"
                  rows="4"
                  placeholder="Share your thoughts with the group..."
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  :class="{
                    'border-red-300 focus:border-red-500': getCharacterCount.isAtLimit,
                    'border-yellow-300 focus:border-yellow-500':
                      getCharacterCount.isNearLimit && !getCharacterCount.isAtLimit,
                  }"
                  maxlength="5000"
                ></textarea>
                <div class="flex justify-between items-center mt-1">
                  <div class="text-xs text-gray-500">Press Ctrl+Enter to post quickly</div>
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

              <!-- Media Upload -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="fa-solid fa-images mr-1"></i>
                  Media ({{ postMediaFiles.length }}/10)
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
                  :disabled="!canSubmitPost || loading.posts"
                  class="px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2"
                  :class="{
                    'bg-blue-600 hover:bg-blue-700': canSubmitPost && !loading.posts,
                    'bg-gray-300 cursor-not-allowed': !canSubmitPost || loading.posts,
                  }"
                >
                  <i v-if="loading.posts" class="fa-solid fa-spinner fa-spin"></i>
                  <i v-else class="fa-solid fa-paper-plane"></i>
                  {{ loading.posts ? "Posting..." : "Post" }}
                  <span v-if="postMediaFiles.length > 0" class="text-xs">
                    ({{ postMediaFiles.length }} files)
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading.posts" class="space-y-4">
        <div v-for="n in 3" :key="n" class="rounded-lg bg-white p-6 shadow animate-pulse">
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
      <div v-else-if="error.posts" class="rounded-lg bg-red-50 p-6 text-center text-red-600">
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import axios from "../utils/axios";
import Post from "../components/Post.vue";
import { getCurrentUserId } from "../utils/auth";

const route = useRoute();
const group = ref(null);
const posts = ref([]);
const isMember = ref(false);
const userProfile = ref(null);
const groupMembers = ref([]);
const loading = ref({
  group: true,
  posts: true,
  membership: true,
  members: false,
});
const error = ref({
  group: null,
  posts: null,
  membership: null,
});

// Post creation modal state
const showCreatePostModal = ref(false);
const showErrorAlert = ref(false);
const postMediaFiles = ref([]);
const postMediaPreviews = ref([]);

// Post form data
const postForm = ref({
  content: "",
  visibility: "public",
  media_contexts: [],
  tagged_user_ids: [],
});

// Computed properties
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
    (postForm.value.content?.trim() || postMediaFiles.value.length > 0) && !getCharacterCount.value.isAtLimit
  );
});

// Fetch functions
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

const fetchUserProfile = async () => {
  try {
    const userId = getCurrentUserId();
    const response = await axios.get(`/api/users/${userId}/profile`);
    userProfile.value = response.data;
  } catch (err) {
    console.error("Error fetching user profile:", err);
  }
};

const fetchGroupMembers = async () => {
  try {
    loading.value.members = true;
    const response = await axios.get(`/api/groups/${route.params.id}/members`);
    groupMembers.value = response.data.filter((member) => member.user_id !== getCurrentUserId());
  } catch (err) {
    console.error("Error fetching group members:", err);
  } finally {
    loading.value.members = false;
  }
};

// Post creation functions
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

const resetPostForm = () => {
  postForm.value = {
    content: "",
    visibility: "public",
    media_contexts: [],
    tagged_user_ids: [],
  };
  postMediaFiles.value = [];
  postMediaPreviews.value = [];
  showErrorAlert.value = false;
};

const joinGroup = async () => {
  try {
    await axios.post(`/api/groups/${route.params.id}/members`, {
      user_id: getCurrentUserId(),
    });
    isMember.value = true;
    await fetchGroupMembers();
  } catch (err) {
    console.error("Error joining group:", err);
  }
};

const createPost = async () => {
  if (!canSubmitPost.value) return;

  try {
    loading.value.posts = true;
    showErrorAlert.value = false;

    const formData = new FormData();
    formData.append("content", postForm.value.content);
    formData.append("visibility", postForm.value.visibility);

    // Add media files
    postMediaFiles.value.forEach((file) => {
      formData.append("media", file);
    });

    // Add media contexts
    postForm.value.media_contexts.forEach((context, index) => {
      formData.append(`media_contexts[${index}]`, context);
    });

    await axios.post(`/api/groups/${route.params.id}/posts`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    resetPostForm();
    showCreatePostModal.value = false;
    await fetchPosts();
  } catch (err) {
    error.value.posts = err.response?.data?.error || "Failed to create post";
    showErrorAlert.value = true;
    console.error("Error creating post:", err);
  } finally {
    loading.value.posts = false;
  }
};

onMounted(() => {
  fetchGroup();
  fetchPosts();
  checkMembership();
  fetchUserProfile();
  fetchGroupMembers();
});
</script>
