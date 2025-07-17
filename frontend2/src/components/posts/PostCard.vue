<template>
  <div>
    <article class="bg-white rounded-lg shadow">
      <!-- Post Header -->
      <div class="p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium"
            >
              {{ authorInitials }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-medium text-gray-900">{{ authorName }}</h3>
                <span v-if="post.tags?.length" class="text-gray-500">
                  is with
                  <button class="text-blue-600 hover:underline" @click="showTaggedUsers = true">
                    {{ taggedUsersText }}
                  </button>
                </span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <time :datetime="post.created_at">{{ formattedDate }}</time>
                <span>·</span>
                <span class="flex items-center gap-1">
                  <component :is="visibilityIcon" class="w-4 h-4" />
                  {{ post.visibility }}
                </span>
              </div>
            </div>
          </div>

          <!-- Post Menu -->
          <button class="p-2 hover:bg-gray-100 rounded-full transition-colors" @click="showPostMenu = true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Post Content -->
      <div class="px-4 pb-3">
        <p
          class="text-gray-800 whitespace-pre-line"
          :class="{ 'cursor-pointer': isContentTruncated }"
          ref="contentRef"
          @click="isContentTruncated && (showFullContent = true)"
        >
          {{ showFullContent ? post.content : truncatedContent }}
          <button v-if="isContentTruncated && !showFullContent" class="text-gray-500 hover:underline">
            ...See more
          </button>
        </p>
      </div>

      <!-- Post Media -->
      <div v-if="post.media?.length" class="border-y">
        <div
          class="grid"
          :class="{
            'grid-cols-1': post.media.length === 1,
            'grid-cols-2': post.media.length === 2,
            'grid-cols-2 grid-rows-2': post.media.length > 2,
          }"
        >
          <div
            v-for="(media, index) in displayedMedia"
            :key="index"
            class="relative aspect-square cursor-pointer"
            @click="openMediaModal(index)"
          >
            <img
              v-if="media.type === 'image'"
              :src="media.link"
              :alt="media.context || ''"
              class="w-full h-full object-cover"
              :class="{
                'rounded-bl-lg': index === displayedMedia.length - 1 && index % 2 === 0,
                'rounded-br-lg': index === displayedMedia.length - 1 && index % 2 === 1,
              }"
            />
            <div
              v-if="post.media.length > 4 && index === 3"
              class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-2xl font-bold"
            >
              +{{ post.media.length - 4 }} more
            </div>
          </div>
        </div>
      </div>

      <!-- Post Stats -->
      <div class="px-4 py-2 flex items-center justify-between text-sm text-gray-500">
        <div class="flex items-center gap-2">
          <div class="flex -space-x-1">
            <span
              class="inline-block h-6 w-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
            </span>
          </div>
          <button class="hover:underline" @click="showLikesModal = true">
            {{ post.likes?.length || 0 }} likes
          </button>
        </div>
        <button v-if="post.comments?.length" class="hover:underline" @click="showCommentsModal = true">
          {{ post.comments.length }} comments
        </button>
      </div>

      <!-- Post Actions -->
      <div class="px-4 py-2 border-t flex gap-1">
        <button
          class="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          :class="{ 'text-blue-600': hasLiked }"
          @click="toggleLike"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          <span>Like</span>
        </button>
        <button
          class="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          @click="focusComment"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          <span>Comment</span>
        </button>
        <button
          class="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          @click="sharePost"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span>Share</span>
        </button>
      </div>

      <!-- Comment Section -->
      <div class="px-4 py-2 border-t">
        <div class="flex gap-2">
          <div
            class="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-sm"
          >
            {{ currentUserInitials }}
          </div>
          <div class="flex-1 relative">
            <input
              ref="commentInput"
              v-model="newComment"
              @keyup.enter="submitComment"
              type="text"
              placeholder="Write a comment..."
              class="w-full px-3 py-1.5 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              v-if="newComment"
              @click="submitComment"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>

    <!-- Modals -->
    <TransitionRoot appear :show="showFullContent" as="template">
      <Dialog as="div" @close="showFullContent = false" class="relative z-50">
        <TransitionChild
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all"
              >
                <div class="mt-2">
                  <p class="text-gray-800 whitespace-pre-line">{{ post.content }}</p>
                </div>

                <div class="mt-4">
                  <button
                    type="button"
                    class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    @click="showFullContent = false"
                  >
                    Close
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <PostModal v-if="showTaggedUsers" :show="showTaggedUsers" @close="showTaggedUsers = false">
      <template #title>Tagged Users</template>
      <template #content>
        <ul class="divide-y">
          <li v-for="user in post.tags" :key="user.id" class="py-3">
            <div class="flex items-center gap-3">
              <div
                class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium"
              >
                {{ getUserInitials(user.name) }}
              </div>
              <div>
                <h4 class="font-medium text-gray-900">{{ user.name }}</h4>
              </div>
            </div>
          </li>
        </ul>
      </template>
    </PostModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Dialog, DialogPanel, TransitionRoot, TransitionChild } from "@headlessui/vue";
import PostModal from "./PostModal.vue";
import { format } from "date-fns";

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
  currentUser: {
    type: Object,
    required: true,
  },
});

const showFullContent = ref(false);
const showTaggedUsers = ref(false);
const showPostMenu = ref(false);
const showLikesModal = ref(false);
const showCommentsModal = ref(false);
const contentRef = ref(null);
const commentInput = ref(null);
const newComment = ref("");
const isContentTruncated = ref(false);

const authorName = computed(() => props.post.author.name);
const authorInitials = computed(() => getUserInitials(props.post.author.name));
const currentUserInitials = computed(() => getUserInitials(props.currentUser.name));
const formattedDate = computed(() => format(new Date(props.post.created_at), "MMM d, yyyy"));
const taggedUsersText = computed(() => {
  if (!props.post.tags?.length) return "";
  return props.post.tags.length === 1
    ? props.post.tags[0].name
    : `${props.post.tags[0].name} and ${props.post.tags.length - 1} others`;
});

const truncatedContent = computed(() => {
  const maxLength = 300;
  if (props.post.content.length <= maxLength) return props.post.content;
  return props.post.content.slice(0, maxLength) + "...";
});

const displayedMedia = computed(() => {
  return props.post.media?.slice(0, 4) || [];
});

const hasLiked = computed(() => {
  return props.post.likes?.some((like) => like.user_id === props.currentUser.id);
});

const visibilityIcon = computed(() => {
  switch (props.post.visibility) {
    case "public":
      return "svg-public";
    case "friends":
      return "svg-friends";
    case "private":
      return "svg-private";
    default:
      return "svg-public";
  }
});

function getUserInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function toggleLike() {
  // TODO: Implement like toggle
}

function focusComment() {
  commentInput.value?.focus();
}

function submitComment() {
  if (!newComment.value.trim()) return;
  // TODO: Implement comment submission
  newComment.value = "";
}

function sharePost() {
  // TODO: Implement post sharing
}

function openMediaModal(index) {
  // TODO: Implement media modal
}

onMounted(() => {
  if (contentRef.value) {
    isContentTruncated.value = contentRef.value.scrollHeight > contentRef.value.clientHeight;
  }
});
</script>
