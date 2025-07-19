<script setup>
defineProps({
  post: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div
    class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md flex flex-col"
  >
    <!-- Item Image -->
    <div class="relative pt-[56.25%]">
      <img
        v-if="post.media?.[0]"
        :src="`/meta${post.media[0].link}`"
        :alt="post.content"
        class="absolute top-0 left-0 h-full w-full object-cover"
      />
      <div v-else class="absolute top-0 left-0 flex h-full w-full items-center justify-center bg-gray-200">
        <i class="fa-solid fa-image text-4xl text-gray-400"></i>
      </div>
    </div>

    <!-- Item Details -->
    <div class="flex flex-col flex-grow p-4">
      <!-- Title and Price -->
      <div class="mb-2">
        <div class="flex items-start justify-between mb-1">
          <p class="text-lg font-bold text-blue-600">৳{{ post.marketplace_post.price }}</p>
          <span
            :class="{
              'bg-green-100 text-green-800': post.marketplace_post.status === 'Available',
              'bg-red-100 text-red-800': post.marketplace_post.status === 'Sold',
            }"
            class="inline-block rounded-full px-2 py-1 text-xs font-medium"
          >
            {{ post.marketplace_post.status }}
          </span>
        </div>
        <h3 class="font-medium text-gray-900 line-clamp-2">{{ post.content }}</h3>
        <p class="text-sm text-gray-500">{{ post.marketplace_post.category }}</p>
      </div>

      <!-- Item Info -->
      <div class="flex items-center justify-between text-sm text-gray-500">
        <span>
          <i class="fa-solid fa-tag mr-1"></i>
          {{ post.marketplace_post.item_condition }}
        </span>
        <span>
          <i class="fa-regular fa-clock mr-1"></i>
          {{ new Date(post.created_at).toLocaleDateString() }}
        </span>
      </div>
    </div>

    <!-- Action Button - Fixed at bottom -->
    <div class="p-4 pt-0">
      <button
        class="w-full rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
      >
        Contact Seller
      </button>
    </div>
  </div>
</template>
