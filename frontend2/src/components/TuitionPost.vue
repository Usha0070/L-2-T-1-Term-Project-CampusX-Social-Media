<script setup>
import { useRouter } from "vue-router";
import axios from "../utils/axios";

const router = useRouter();

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});

const goToChat = async () => {
  const response = await axios.get(`/api/chats/with/${props.post.author_id}`);
  router.push(`/chats/${response.data.chat_id}`);
};
</script>

<template>
  <div
    class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md flex flex-col"
  >
    <!-- Status Banner -->
    <div
      :class="{
        'bg-green-100 text-green-800': post.tuition_post.status === 'Available',
        'bg-red-100 text-red-800': post.tuition_post.status === 'Booked',
      }"
      class="px-4 py-2 text-sm font-medium"
    >
      {{ post.tuition_post.status }}
    </div>

    <!-- Tuition Details -->
    <div class="flex flex-col flex-grow p-4">
      <!-- Title and Remuneration -->
      <div class="mb-4">
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-medium text-gray-900 line-clamp-2">{{ post.content }}</h3>
          <p class="text-lg font-bold text-blue-600 ml-2">৳{{ post.tuition_post.remunation }}/mo</p>
        </div>

        <!-- Subject Tags -->
        <div class="flex flex-wrap gap-2">
          <span
            v-for="subject in post.tuition_post.subjects"
            :key="subject.name"
            class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
          >
            {{ subject.name }}
          </span>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="space-y-2 text-sm text-gray-600">
        <div class="flex items-center">
          <i class="fa-solid fa-graduation-cap mr-2"></i>
          <span>{{ post.tuition_post.class }}</span>
        </div>
        <div class="flex items-center">
          <i class="fa-solid fa-location-dot mr-2"></i>
          <span>{{ post.tuition_post.location }}</span>
        </div>
        <div class="flex items-center">
          <i class="fa-solid fa-users mr-2"></i>
          <span>{{ post.tuition_post.num_students }} student(s)</span>
        </div>
        <div class="flex items-center">
          <i class="fa-solid fa-venus-mars mr-2"></i>
          <span>Preferred: {{ post.tuition_post.preferred_gender }}</span>
        </div>
      </div>

      <!-- Post Info -->
      <div class="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>
          <i class="fa-regular fa-clock mr-1"></i>
          {{ new Date(post.created_at).toLocaleDateString() }}
        </span>
        <span>
          <i class="fa-regular fa-heart mr-1"></i>
          {{ post.likes?.length || 0 }} likes
        </span>
      </div>
    </div>

    <!-- Action Button -->
    <div class="p-4 pt-0">
      <button
        @click="goToChat"
        class="w-full rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
      >
        Apply Now
      </button>
    </div>
  </div>
</template>
