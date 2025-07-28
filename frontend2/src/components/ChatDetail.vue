<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "../utils/axios";
import { getCurrentUserId } from "../utils/auth";

const route = useRoute();
const router = useRouter();
const messages = ref([]);
const newMessage = ref("");
const messageContainer = ref(null);
const currentUserId = getCurrentUserId();
const partner = ref(null);

const goToProfile = () => {
  router.push(`/profile/${partner.value.user_id}`);
};

const fetchPartnerInfo = async () => {
  try {
    const partnerRes = await axios.get(`/api/chats/partner/${route.params.id}`);

    const [userResponse, profileResponse] = await Promise.all([
      axios.get(`/api/users/${partnerRes.data.partner_id}`),
      axios.get(`/api/users/${partnerRes.data.partner_id}/profile`),
    ]);
    partner.value = {
      user_id: partnerRes.data.partner_id,
      ...userResponse.data,
      profile: profileResponse.data,
    };
  } catch (error) {
    console.error("Error fetching partner info:", error);
  }
};

const fetchMessages = async () => {
  try {
    const response = await axios.get(`/api/chats/${route.params.id}`);
    messages.value = response.data;
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  try {
    await axios.post(`/api/chats/${route.params.id}`, {
      content: newMessage.value,
      is_read: false,
    });
    newMessage.value = "";
    await fetchMessages();
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return date.toLocaleDateString();
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

const handleImageError = (type, path) => {
  console.error(`Failed to load ${type}:`, path);
};

const scrollToBottom = () => {
  if (messageContainer.value) {
    messageContainer.value.scrollTo({
      top: messageContainer.value.scrollHeight,
      behavior: "smooth",
    });
  }
};

onMounted(async () => {
  await Promise.all([fetchPartnerInfo(), fetchMessages()]);
});
</script>

<template>
  <div class="flex h-full flex-col bg-gray-50 relative">
    <!-- Enhanced header with better styling -->
    <div class="border-b border-gray-200 bg-white shadow-sm">
      <div class="p-4">
        <div
          class="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-3 -m-3 rounded-xl transition-all duration-200 group"
          @click="goToProfile"
        >
          <!-- Enhanced profile picture with online indicator -->
          <div class="relative flex-shrink-0">
            <div
              v-if="partner?.profile?.profile_pic"
              class="w-12 h-12 rounded-full bg-cover bg-center bg-no-repeat ring-2 ring-gray-100"
              :style="{ backgroundImage: `url(/meta${partner.profile.profile_pic})` }"
              @error="handleImageError('profile picture', `/meta${partner.profile.profile_pic}`)"
            ></div>
            <div
              v-else
              class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center ring-2 ring-gray-100"
            >
              <i class="fa-solid fa-user text-white text-lg"></i>
            </div>
            <!-- Online status indicator -->
            <div
              class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"
            ></div>
          </div>

          <!-- Enhanced user info -->
          <div class="flex-1 min-w-0">
            <h2 class="text-lg font-semibold text-gray-900 truncate">
              {{ partner ? `${partner.first_name} ${partner.last_name}` : "Chat" }}
            </h2>
            <p class="text-sm text-gray-600">
              <span v-if="partner?.nickname" class="font-medium">{{ partner.nickname }}</span>
              <span v-else>Online now</span>
            </p>
          </div>

          <!-- Subtle arrow indicator -->
          <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <i class="fa-solid fa-chevron-right text-gray-400 text-sm"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced message container with better styling -->
    <div ref="messageContainer" class="flex-1 overflow-y-auto p-6 space-y-4 pb-32">
      <div
        v-for="(message, index) in messages"
        :key="message.message_id"
        class="flex items-end gap-3"
        :class="{ 'flex-row-reverse': message.sender_id === currentUserId }"
      >
        <!-- Enhanced avatar for received messages -->
        <div
          v-if="message.sender_id !== currentUserId"
          class="flex-shrink-0"
          :class="{ 'opacity-0': index > 0 && messages[index - 1].sender_id === message.sender_id }"
        >
          <div
            v-if="partner?.profile?.profile_pic"
            class="w-8 h-8 rounded-full bg-cover bg-center bg-no-repeat ring-1 ring-gray-200"
            :style="{ backgroundImage: `url(/meta${partner.profile.profile_pic})` }"
            @error="handleImageError('profile picture', `/meta${partner.profile.profile_pic}`)"
          ></div>
          <div
            v-else
            class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center ring-1 ring-gray-200"
          >
            <i class="fa-solid fa-user text-white text-xs"></i>
          </div>
        </div>

        <!-- Enhanced message bubble -->
        <div
          class="max-w-[75%] group relative"
          :class="[message.sender_id === currentUserId ? 'ml-12' : 'mr-12']"
        >
          <div
            class="rounded-2xl px-4 py-3 shadow-sm"
            :class="[
              message.sender_id === currentUserId
                ? 'bg-blue-500 text-white rounded-br-md'
                : 'bg-white text-gray-800 rounded-bl-md border border-gray-100',
            ]"
          >
            <p class="text-sm leading-relaxed">{{ message.content }}</p>
          </div>

          <!-- Timestamp on hover -->
          <div
            class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -bottom-5"
            :class="message.sender_id === currentUserId ? 'right-0' : 'left-0'"
          >
            <p class="text-xs text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm border">
              {{ formatDate(message.sent_at) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Empty state for no messages -->
      <div v-if="messages.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fa-regular fa-comments text-2xl text-gray-400"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Start the conversation</h3>
        <p class="text-gray-500 text-sm">Send a message to begin chatting</p>
      </div>
    </div>

    <!-- Enhanced fixed input with better styling -->
    <div
      class="fixed bottom-0 left-[16rem] right-0 bg-white border-t border-gray-200 shadow-xl backdrop-blur-sm"
    >
      <div class="p-4">
        <form @submit.prevent="sendMessage" class="flex gap-3 items-end">
          <div class="flex-1 relative">
            <input
              v-model="newMessage"
              type="text"
              placeholder="Type a message..."
              class="w-full rounded-2xl border border-gray-300 px-4 py-3 pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
              maxlength="1000"
            />
            <!-- Character counter for long messages -->
            <div v-if="newMessage.length > 800" class="absolute -top-6 right-2 text-xs text-gray-500">
              {{ newMessage.length }}/1000
            </div>
          </div>

          <!-- Enhanced send button -->
          <button
            type="submit"
            class="flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
            :class="[
              newMessage.trim()
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
            ]"
            :disabled="!newMessage.trim()"
          >
            <i class="fa-solid fa-paper-plane text-sm"></i>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
