<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "../utils/axios";

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
const commenters = ref(new Map()); // Store commenter info
const currentUser = ref({
  user_id: parseInt(localStorage.getItem("user_id")) || null,
});
const isLiked = ref(props.post.likes?.some((like) => like.user_id === currentUser.value?.user_id) || false);

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
    // If we get a duplicate key error, it means the user has already liked the post
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
      // Fetch the commenter info if not already present
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

    <slot name="actions"></slot>
  </article>
</template>
