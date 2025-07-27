<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "../utils/axios";
import { getCurrentUserId } from "../utils/auth";

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});

const author = ref(null);
const authorProfile = ref(null);
const likesCount = ref(props.post.likes?.length || 0);
const showComments = ref(false);
const newComment = ref("");
const comments = ref(props.post.comments || []);
const commentLoading = ref(false);
const likeLoading = ref(false);
const commenters = ref(new Map());
const currentUser = ref({
  user_id: getCurrentUserId() || null,
});
const isLiked = ref(props.post.likes?.some((like) => like.user_id === currentUser.value?.user_id) || false);

// Edit post states - matching profile modal pattern
const showEditModal = ref(false);
const showErrorAlert = ref(false);
const editLoading = ref(false);
const error = ref(null);

const editForm = ref({
  content: "",
  visibility: "public",
  shared_post_id: null,
  tagged_user_ids: [],
  media_contexts: [],
});

// Media handling - matching profile modal pattern
const editMediaFiles = ref([]);
const editMediaPreviews = ref([]);
const mediaToRemove = ref([]);

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
  } catch (error) {
    console.error("Error fetching author info:", error);
  }
};

const fetchCommenterInfo = async (authorId) => {
  try {
    const [userRes, profileRes] = await Promise.all([
      axios.get(`/api/users/${authorId}`),
      axios.get(`/api/users/${authorId}/profile`),
    ]);
    commenters.value.set(authorId, {
      user: userRes.data,
      profile: profileRes.data,
    });
  } catch (error) {
    console.error("Error fetching commenter info:", error);
  }
};

const fetchAllCommentersInfo = async () => {
  const uniqueAuthorIds = [...new Set(comments.value.map((comment) => comment.author_id))];
  await Promise.all(uniqueAuthorIds.map(fetchCommenterInfo));
};

const handleLike = async () => {
  if (likeLoading.value || !currentUser.value) return;
  try {
    likeLoading.value = true;
    if (!isLiked.value) {
      await axios.post(`/api/posts/${props.post.post_id}/likes`);
      likesCount.value++;
      isLiked.value = true;
    } else {
      await axios.delete(`/api/posts/${props.post.post_id}/likes`);
      likesCount.value--;
      isLiked.value = false;
    }
  } catch (error) {
    if (error.response?.data?.message?.includes("duplicate key")) {
      isLiked.value = true;
    } else {
      console.error("Error toggling like:", error);
    }
  } finally {
    likeLoading.value = false;
  }
};

const submitComment = async () => {
  if (!newComment.value.trim() || commentLoading.value || !currentUser.value) return;
  try {
    commentLoading.value = true;
    const response = await axios.post(`/api/posts/${props.post.post_id}/comments`, {
      content: newComment.value.trim(),
    });
    if (response.data.success) {
      const newCommentData = {
        content: newComment.value.trim(),
        created_at: new Date().toISOString(),
        comment_id: response.data.comment_id,
        author_id: currentUser.value.user_id,
      };
      comments.value.push(newCommentData);
      if (!commenters.value.has(currentUser.value.user_id)) {
        await fetchCommenterInfo(currentUser.value.user_id);
      }
      newComment.value = "";
    }
  } catch (error) {
    console.error("Error posting comment:", error);
  } finally {
    commentLoading.value = false;
  }
};

const deleteComment = async (commentId) => {
  if (!currentUser.value) return;
  try {
    await axios.delete(`/api/posts/${props.post.post_id}/comments/${commentId}`);
    comments.value = comments.value.filter((c) => c.comment_id !== commentId);
  } catch (error) {
    console.error("Error deleting comment:", error);
  }
};

// Edit modal functions - matching profile modal pattern
const initEditForm = () => {
  if (props.post) {
    editForm.value = {
      content: props.post.content || "",
      visibility: props.post.visibility || "public",
      shared_post_id: props.post.shared_post_id || null,
      tagged_user_ids: props.post.tags?.map((tag) => tag.user_id) || [],
      media_contexts: props.post.media?.map((m) => m.context || "") || [],
    };

    // Reset media states
    editMediaFiles.value = [];
    editMediaPreviews.value = [];
    mediaToRemove.value = [];
    error.value = null;
    showErrorAlert.value = false;
  }
};

const openEditModal = () => {
  initEditForm();
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  showErrorAlert.value = false;

  // Clean up object URLs to prevent memory leaks
  editMediaPreviews.value.forEach((preview) => {
    if (preview.url && preview.url.startsWith("blob:")) {
      URL.revokeObjectURL(preview.url);
    }
  });

  initEditForm();
};

const handleEditMediaUpload = (event) => {
  const files = Array.from(event.target.files);

  // Get current media count (existing - removed + new)
  const currentMediaCount = getRemainingMediaCount() + editMediaFiles.value.length;

  // Check if adding these files would exceed the limit
  if (currentMediaCount + files.length > 10) {
    error.value = "Maximum 10 media files allowed";
    showErrorAlert.value = true;
    return;
  }

  files.forEach((file) => {
    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      error.value = `File ${file.name} is too large. Maximum size is 50MB.`;
      showErrorAlert.value = true;
      return;
    }

    editMediaFiles.value.push(file);
    editForm.value.media_contexts.push("");

    const reader = new FileReader();
    reader.onload = (e) => {
      editMediaPreviews.value.push({
        url: e.target.result,
        type: file.type.startsWith("image/") ? "image" : "video",
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  });

  // Clear the input so the same file can be selected again if needed
  event.target.value = "";
};

const removeEditMedia = (index) => {
  // Clean up object URL
  if (editMediaPreviews.value[index]?.url?.startsWith("blob:")) {
    URL.revokeObjectURL(editMediaPreviews.value[index].url);
  }

  editMediaFiles.value.splice(index, 1);
  editMediaPreviews.value.splice(index, 1);

  // Remove corresponding context
  const existingMediaCount = getRemainingMediaCount();
  editForm.value.media_contexts.splice(existingMediaCount + index, 1);
};

const removeExistingMedia = (mediaId) => {
  if (!mediaToRemove.value.includes(mediaId)) {
    mediaToRemove.value.push(mediaId);
  }
};

const restoreExistingMedia = (mediaId) => {
  const index = mediaToRemove.value.indexOf(mediaId);
  if (index > -1) {
    mediaToRemove.value.splice(index, 1);
  }
};

const getRemainingMediaCount = () => {
  if (!props.post.media?.length) return 0;
  return props.post.media.length - mediaToRemove.value.length;
};

const getRemainingMedia = () => {
  if (!props.post.media?.length) return [];
  return props.post.media.filter((media) => !mediaToRemove.value.includes(media.media_id));
};

const refreshPage = () => {
  window.location.reload();
};

const submitEdit = async () => {
  if (editLoading.value) return;

  try {
    showErrorAlert.value = false;
    editLoading.value = true;

    // Validate required fields
    if (
      !editForm.value.content.trim() &&
      getRemainingMediaCount() === 0 &&
      editMediaFiles.value.length === 0
    ) {
      error.value = "Please add some content or media to your post";
      showErrorAlert.value = true;
      return;
    }

    const formData = new FormData();

    // Add text content
    if (editForm.value.content.trim()) {
      formData.append("content", editForm.value.content.trim());
    }

    formData.append("visibility", editForm.value.visibility);

    // Add shared post ID if exists
    if (editForm.value.shared_post_id) {
      formData.append("shared_post_id", editForm.value.shared_post_id.toString());
    }

    // Get remaining existing media
    const remainingMedia = getRemainingMedia();

    // Convert existing media to files (fetch and re-upload)
    const existingMediaFiles = [];
    for (const media of remainingMedia) {
      try {
        const response = await fetch(`/meta${media.link}`);
        const blob = await response.blob();
        const file = new File([blob], `existing_${media.media_id}`, { type: blob.type });
        existingMediaFiles.push({
          file,
          originalIndex: props.post.media.findIndex((m) => m.media_id === media.media_id),
        });
      } catch (fetchError) {
        console.error(`Failed to fetch existing media ${media.media_id}:`, fetchError);
        error.value = "Failed to process existing media. Please try again.";
        showErrorAlert.value = true;
        return;
      }
    }

    // Add all media files (existing first, then new)
    existingMediaFiles.forEach((mediaFile) => {
      formData.append("media", mediaFile.file);
    });

    editMediaFiles.value.forEach((file) => {
      formData.append("media", file);
    });

    // Prepare media contexts (existing first, then new)
    const allContexts = [];

    // Contexts for existing media
    existingMediaFiles.forEach((mediaFile) => {
      allContexts.push(editForm.value.media_contexts[mediaFile.originalIndex] || "");
    });

    // Contexts for new media
    editMediaFiles.value.forEach((_, index) => {
      const contextIndex = remainingMedia.length + index;
      allContexts.push(editForm.value.media_contexts[contextIndex] || "");
    });

    // Add all contexts to form data
    allContexts.forEach((context, index) => {
      formData.append(`media_contexts[${index}]`, context || "");
    });

    // Add tagged users
    if (editForm.value.tagged_user_ids.length > 0) {
      editForm.value.tagged_user_ids.forEach((userId, index) => {
        formData.append(`tagged_user_ids[${index}]`, userId.toString());
      });
    }

    // Indicate this is an edit operation
    formData.append("is_edit", "true");
    formData.append("existing_media_count", existingMediaFiles.length.toString());
    formData.append("new_media_count", editMediaFiles.value.length.toString());

    // Make the API call
    const response = await axios.put(`/api/posts/${props.post.post_id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Success handling
    if (response.status === 200 || response.data) {
      // Close modal and refresh
      closeEditModal();
      window.location.reload();
    }
  } catch (err) {
    console.error("Error updating post:", err);

    // Handle different types of errors
    if (err.response?.status === 400) {
      error.value = err.response.data?.message || err.response.data?.error || "Invalid post data";
    } else if (err.response?.status === 413) {
      error.value = "File size too large. Please reduce file sizes and try again.";
    } else if (err.response?.status === 401) {
      error.value = "You need to be logged in to update posts";
    } else {
      error.value = err.response?.data?.error || err.message || "Failed to update post";
    }

    showErrorAlert.value = true;
  } finally {
    editLoading.value = false;
  }
};

// Helper function to get character count with proper formatting
const getEditCharacterCount = computed(() => {
  const count = editForm.value.content.length;
  const max = 5000;
  const percentage = (count / max) * 100;

  return {
    count,
    max,
    percentage,
    isNearLimit: percentage > 80,
    isAtLimit: percentage >= 100,
  };
});

// Helper function to check if post can be submitted
const canSubmitEdit = computed(() => {
  const hasContent = editForm.value.content.trim().length > 0;
  const hasRemainingMedia = getRemainingMediaCount() > 0;
  const hasNewMedia = editMediaFiles.value.length > 0;
  const isNotTooLong = editForm.value.content.length <= 5000;

  return (hasContent || hasRemainingMedia || hasNewMedia) && isNotTooLong;
});

const isCurrentUserAuthor = () => {
  return currentUser.value?.user_id === props.post.author_id;
};

onMounted(async () => {
  await Promise.all([fetchAuthorInfo(), fetchAllCommentersInfo()]);
});

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
    <header class="mb-4 flex items-center gap-3 relative">
      <div class="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
        <img
          v-if="authorProfile?.profile_pic"
          :src="`/meta${authorProfile.profile_pic}`"
          :alt="author?.first_name"
          class="h-full w-full object-cover"
          @error="handleImageError('profile picture', `/meta${authorProfile.profile_pic}`)"
        />
      </div>
      <div class="flex-grow">
        <h3 class="font-medium">
          {{ author ? `${author.first_name} ${author.last_name}` : "Loading..." }}
          <span v-if="author?.nickname" class="text-sm text-gray-500"> ({{ author.nickname }}) </span>
        </h3>
        <p class="text-sm text-gray-500">{{ formatDate(post.created_at) }}</p>
      </div>

      <!-- Edit button for post author -->
      <button
        v-if="isCurrentUserAuthor()"
        @click="openEditModal"
        class="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        title="Edit post"
      >
        <i class="fa-solid fa-edit text-sm"></i>
      </button>
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
          <video
            v-else
            :src="`/meta${media.link}`"
            class="h-full w-full object-cover"
            controls
            preload="metadata"
          ></video>
        </div>
      </div>

      <!-- Shared Post -->
      <div v-if="post.shared_post_id" class="rounded-lg border p-3">
        <p class="text-sm text-gray-500">Shared post content will be implemented later</p>
      </div>
    </div>

    <footer class="mt-4 flex items-center gap-4 border-t pt-3">
      <button
        class="flex items-center gap-2 text-gray-500 hover:text-blue-600"
        @click="handleLike"
        :disabled="likeLoading"
      >
        <i
          class="fa-heart"
          :class="[isLiked ? 'fa-solid text-blue-600' : 'fa-regular', likeLoading ? 'opacity-50' : '']"
        ></i>
        <span>{{ likesCount }}</span>
      </button>
      <button
        class="flex items-center gap-2 text-gray-500 hover:text-blue-600"
        @click="showComments = !showComments"
      >
        <i class="fa-regular fa-comment"></i>
        <span>{{ comments.length }}</span>
      </button>
      <div v-if="post.tags?.length" class="ml-auto flex items-center gap-1 text-sm text-gray-500">
        <i class="fa-solid fa-user-tag"></i>
        <span>{{ post.tags.length }}</span>
      </div>
    </footer>

    <!-- Comments Section -->
    <div v-if="showComments" class="mt-4 border-t pt-4">
      <div class="space-y-4">
        <!-- Comment List -->
        <div v-for="comment in comments" :key="comment.comment_id" class="flex gap-3">
          <div class="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
            <img
              v-if="commenters.get(comment.author_id)?.profile?.profile_pic"
              :src="`/meta${commenters.get(comment.author_id).profile.profile_pic}`"
              :alt="commenters.get(comment.author_id)?.user?.first_name"
              class="h-full w-full object-cover"
              @error="
                handleImageError(
                  'profile picture',
                  `/meta${commenters.get(comment.author_id).profile.profile_pic}`
                )
              "
            />
          </div>
          <div class="flex-grow">
            <div class="rounded-lg bg-gray-50 p-3">
              <div class="mb-1">
                <span class="font-medium text-sm">
                  {{
                    commenters.get(comment.author_id)?.user
                      ? `${commenters.get(comment.author_id).user.first_name} ${
                          commenters.get(comment.author_id).user.last_name
                        }`
                      : "Loading..."
                  }}
                </span>
                <span
                  v-if="commenters.get(comment.author_id)?.user?.nickname"
                  class="text-xs text-gray-500 ml-1"
                >
                  ({{ commenters.get(comment.author_id).user.nickname }})
                </span>
              </div>
              <p class="text-sm text-gray-800">{{ comment.content }}</p>
            </div>
            <div class="mt-1 flex items-center gap-4 text-xs text-gray-500">
              <span>{{ formatDate(comment.created_at) }}</span>
              <button
                v-if="comment.author_id === currentUser?.user_id"
                @click="deleteComment(comment.comment_id)"
                class="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- New Comment Form -->
        <form @submit.prevent="submitComment" class="mt-4 flex gap-3">
          <div class="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
            <img
              v-if="commenters.get(currentUser?.user_id)?.profile?.profile_pic"
              :src="`/meta${commenters.get(currentUser?.user_id).profile.profile_pic}`"
              :alt="commenters.get(currentUser?.user_id)?.user?.first_name"
              class="h-full w-full object-cover"
            />
          </div>
          <div class="flex-grow">
            <div class="flex gap-2">
              <input
                v-model="newComment"
                type="text"
                placeholder="Write a comment..."
                class="flex-grow rounded-full border bg-gray-50 px-4 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                :disabled="commentLoading"
              />
              <button
                type="submit"
                class="rounded-full bg-blue-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                :disabled="!newComment.trim() || commentLoading"
              >
                Post
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Post Modal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <!-- Modal -->
      <div class="relative min-h-screen flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" @click.stop>
          <!-- Modal Header -->
          <div class="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10">
            <h2 class="text-xl font-bold">Edit Post</h2>
            <button
              @click="closeEditModal"
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
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="refreshPage"
                  class="text-sm px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors flex items-center gap-1"
                >
                  <i class="fa-solid fa-rotate-right"></i>
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  @click="showErrorAlert = false"
                  class="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <i class="fa-solid fa-times"></i>
                </button>
              </div>
            </div>
            <p class="mt-2 text-sm text-red-600">Try refreshing the page if the problem persists.</p>
          </div>

          <form @submit.prevent="submitEdit" class="p-6 space-y-8">
            <!-- Post Content -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">What's on your mind?</label>
              <textarea
                v-model="editForm.content"
                rows="4"
                placeholder="Share your thoughts..."
                class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 resize-none"
                :class="{
                  'border-red-300 focus:border-red-500': getEditCharacterCount.isAtLimit,
                  'border-yellow-300 focus:border-yellow-500':
                    getEditCharacterCount.isNearLimit && !getEditCharacterCount.isAtLimit,
                }"
                maxlength="5000"
              ></textarea>
              <div class="flex justify-between items-center mt-1">
                <div class="text-xs text-gray-500">Press Ctrl+Enter to save quickly</div>
                <div
                  class="text-xs mt-1"
                  :class="{
                    'text-red-500': getEditCharacterCount.isAtLimit,
                    'text-yellow-600': getEditCharacterCount.isNearLimit && !getEditCharacterCount.isAtLimit,
                    'text-gray-500': !getEditCharacterCount.isNearLimit,
                  }"
                >
                  {{ getEditCharacterCount.count }}/{{ getEditCharacterCount.max }}
                </div>
              </div>
            </div>

            <!-- Visibility -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <i class="fa-solid fa-eye mr-1"></i>
                Visibility
              </label>
              <select
                v-model="editForm.visibility"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="public">Public - Anyone can see</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private - Only you</option>
              </select>
            </div>

            <!-- Current Media Section -->
            <div v-if="props.post.media?.length">
              <div class="flex items-center justify-between mb-3">
                <label class="block text-sm font-medium text-gray-700">
                  <i class="fa-solid fa-images mr-1"></i>
                  Current Media ({{ getRemainingMedia().length }}/{{ props.post.media.length }})
                </label>
              </div>

              <div class="grid grid-cols-2 gap-4" v-if="getRemainingMedia().length > 0">
                <div v-for="media in getRemainingMedia()" :key="media.media_id" class="relative group">
                  <div class="relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200">
                    <img
                      v-if="media.type === 'image'"
                      :src="`/meta${media.link}`"
                      class="w-full h-full object-cover"
                      alt=""
                    />
                    <video
                      v-else
                      :src="`/meta${media.link}`"
                      class="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    ></video>

                    <!-- Remove Button -->
                    <button
                      type="button"
                      @click="removeExistingMedia(media.media_id)"
                      class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                    >
                      <i class="fa-solid fa-times text-xs"></i>
                    </button>

                    <!-- Current Badge -->
                    <div class="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      Current
                    </div>
                  </div>

                  <!-- Media Context -->
                  <input
                    v-model="
                      editForm.media_contexts[
                        props.post.media.findIndex((m) => m.media_id === media.media_id)
                      ]
                    "
                    type="text"
                    placeholder="Add a caption..."
                    class="mt-2 w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    maxlength="200"
                  />
                </div>
              </div>

              <!-- Removed Media Preview -->
              <div v-if="mediaToRemove.length > 0" class="mt-4">
                <label class="block text-sm font-medium text-red-600 mb-3">
                  <i class="fa-solid fa-trash mr-1"></i>
                  Media to be Removed ({{ mediaToRemove.length }})
                </label>
                <div class="grid grid-cols-4 gap-2">
                  <div
                    v-for="media in props.post.media.filter((m) => mediaToRemove.includes(m.media_id))"
                    :key="media.media_id"
                    class="relative group"
                  >
                    <div
                      class="relative aspect-square overflow-hidden rounded-lg border-2 border-red-200 opacity-50"
                    >
                      <img
                        v-if="media.type === 'image'"
                        :src="`/meta${media.link}`"
                        class="w-full h-full object-cover"
                        alt=""
                      />
                      <video
                        v-else
                        :src="`/meta${media.link}`"
                        class="w-full h-full object-cover"
                        preload="metadata"
                      ></video>

                      <!-- Restore Button -->
                      <button
                        type="button"
                        @click="restoreExistingMedia(media.media_id)"
                        class="absolute top-1 right-1 bg-green-500 hover:bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        title="Restore media"
                      >
                        <i class="fa-solid fa-undo"></i>
                      </button>

                      <!-- Removed overlay -->
                      <div class="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <span class="text-red-600 text-xs font-semibold">REMOVED</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- New Media Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <i class="fa-solid fa-plus mr-1"></i>
                Add New Media ({{ editMediaFiles.length }}/{{ 10 - getRemainingMediaCount() }} available)
              </label>
              <div class="space-y-4">
                <!-- Upload Button -->
                <div class="flex items-center justify-center w-full">
                  <label
                    class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors"
                    :class="{
                      'border-gray-300 bg-gray-50 hover:bg-gray-100':
                        getRemainingMediaCount() + editMediaFiles.length < 10,
                      'border-gray-200 bg-gray-100 cursor-not-allowed':
                        getRemainingMediaCount() + editMediaFiles.length >= 10,
                    }"
                  >
                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                      <i
                        class="text-3xl mb-2"
                        :class="{
                          'fa-solid fa-cloud-upload-alt text-gray-400':
                            getRemainingMediaCount() + editMediaFiles.length < 10,
                          'fa-solid fa-ban text-gray-300':
                            getRemainingMediaCount() + editMediaFiles.length >= 10,
                        }"
                      ></i>
                      <p
                        class="text-sm"
                        :class="
                          getRemainingMediaCount() + editMediaFiles.length >= 10
                            ? 'text-gray-400'
                            : 'text-gray-500'
                        "
                      >
                        <span class="font-semibold">
                          {{
                            getRemainingMediaCount() + editMediaFiles.length >= 10
                              ? "Maximum files reached"
                              : "Click to upload"
                          }}
                        </span>
                        {{ getRemainingMediaCount() + editMediaFiles.length < 10 ? " or drag and drop" : "" }}
                      </p>
                      <p
                        class="text-xs text-gray-500"
                        v-if="getRemainingMediaCount() + editMediaFiles.length < 10"
                      >
                        Images or videos ({{ 10 - getRemainingMediaCount() - editMediaFiles.length }}
                        remaining)
                      </p>
                    </div>
                    <input
                      type="file"
                      class="hidden"
                      multiple
                      accept="image/*,video/*"
                      @change="handleEditMediaUpload"
                      :disabled="getRemainingMediaCount() + editMediaFiles.length >= 10"
                    />
                  </label>
                </div>

                <!-- New Media Previews -->
                <div v-if="editMediaPreviews.length > 0" class="grid grid-cols-2 gap-4">
                  <div v-for="(preview, index) in editMediaPreviews" :key="index" class="relative group">
                    <!-- Image Preview -->
                    <div class="relative aspect-square overflow-hidden rounded-lg border-2 border-green-200">
                      <img
                        v-if="preview.type === 'image'"
                        :src="preview.url"
                        :alt="preview.name"
                        class="w-full h-full object-cover"
                      />
                      <!-- Video Preview -->
                      <video
                        v-else
                        :src="preview.url"
                        class="w-full h-full object-cover"
                        controls
                        preload="metadata"
                      ></video>

                      <!-- Remove Button -->
                      <button
                        type="button"
                        @click="removeEditMedia(index)"
                        class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                      >
                        <i class="fa-solid fa-times text-xs"></i>
                      </button>

                      <!-- New Badge -->
                      <div
                        class="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full"
                      >
                        New
                      </div>

                      <!-- File Info -->
                      <div class="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {{ preview.name.length > 15 ? preview.name.substring(0, 15) + "..." : preview.name }}
                      </div>
                    </div>

                    <!-- Media Context -->
                    <input
                      v-model="editForm.media_contexts[getRemainingMediaCount() + index]"
                      type="text"
                      placeholder="Add a caption..."
                      class="mt-2 w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      maxlength="200"
                    />
                  </div>
                </div>
              </div>

              <!-- Media Summary -->
              <div
                v-if="getRemainingMediaCount() > 0 || editMediaFiles.length > 0 || mediaToRemove.length > 0"
                class="mt-3 text-sm text-gray-600"
              >
                <div class="flex items-center gap-4 flex-wrap">
                  <span v-if="getRemainingMediaCount() > 0" class="flex items-center gap-1">
                    <i class="fa-solid fa-image text-blue-500"></i>
                    {{ getRemainingMediaCount() }} current
                  </span>
                  <span v-if="editMediaFiles.length > 0" class="text-green-600 flex items-center gap-1">
                    <i class="fa-solid fa-plus"></i>
                    {{ editMediaFiles.length }} new
                  </span>
                  <span v-if="mediaToRemove.length > 0" class="text-red-600 flex items-center gap-1">
                    <i class="fa-solid fa-minus"></i>
                    {{ mediaToRemove.length }} to remove
                  </span>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="sticky bottom-0 bg-white pt-4 pb-2 -mx-6 px-6 border-t flex justify-end gap-3">
              <button
                type="button"
                @click="closeEditModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="!canSubmitEdit || editLoading"
                class="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2"
                :class="{
                  'bg-blue-600 hover:bg-blue-700': canSubmitEdit && !editLoading,
                  'bg-gray-300 cursor-not-allowed': !canSubmitEdit || editLoading,
                }"
              >
                <i v-if="editLoading" class="fa-solid fa-spinner fa-spin"></i>
                <i v-else class="fa-solid fa-save"></i>
                {{ editLoading ? "Updating..." : "Update Post" }}
                <span v-if="editMediaFiles.length > 0" class="text-xs">
                  (+{{ editMediaFiles.length }} files)
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <slot name="actions"></slot>
  </article>
</template>
