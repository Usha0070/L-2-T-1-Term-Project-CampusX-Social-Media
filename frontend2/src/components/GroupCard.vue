<template>
  <div
    class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer"
    @click="$emit('click')"
  >
    <div class="flex items-center gap-4">
      <img
        :src="group.profile_pic ? `/meta${group.profile_pic}` : '/meta/media/default_group_photo.png'"
        class="w-12 h-12 rounded-full object-cover"
        alt="Group profile"
      />
      <div class="flex-grow">
        <h3 class="font-semibold">{{ group.name }}</h3>
        <p class="text-gray-600 text-sm line-clamp-1">{{ group.description }}</p>
      </div>
      <button
        v-if="!isMember"
        @click.stop="$emit('join')"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
      >
        Join
      </button>
      <span v-else class="text-sm text-green-600 font-medium">Member</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  group: {
    type: Object,
    required: true,
  },
  isMember: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["join", "click"]);
</script>
