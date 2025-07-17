<script setup>
defineProps({
  post: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <article class="rounded-lg bg-white p-4 shadow">
    <!-- Placeholder structure for the post component -->
    <header class="mb-4 flex items-center gap-3">
      <div class="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
        <!-- Will be replaced with actual profile picture -->
        <img :src="post.author?.profile_pic" alt="" class="h-full w-full object-cover" />
      </div>
      <div>
        <h3 class="font-medium">{{ post.author?.name || "User" }}</h3>
        <p class="text-sm text-gray-500">{{ new Date(post.created_at).toLocaleDateString() }}</p>
      </div>
    </header>

    <div class="space-y-3">
      <p class="text-gray-800">{{ post.content }}</p>

      <!-- Will handle media in the future -->
      <div v-if="post.media?.length" class="mt-3">
        <div class="rounded-lg bg-gray-100 p-2 text-sm text-gray-500">
          Media attachments will be displayed here
        </div>
      </div>
    </div>

    <footer class="mt-4 flex items-center gap-4 border-t pt-3">
      <button class="flex items-center gap-2 text-gray-500 hover:text-blue-600">
        <i class="fa-regular fa-heart"></i>
        <span>{{ post.likes || 0 }}</span>
      </button>
      <button class="flex items-center gap-2 text-gray-500 hover:text-blue-600">
        <i class="fa-regular fa-comment"></i>
        <span>{{ post.comments?.length || 0 }}</span>
      </button>
    </footer>

    <slot name="actions"></slot>
  </article>
</template>
