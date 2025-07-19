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
    console.log(partner.value);
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
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

onMounted(async () => {
  await Promise.all([fetchPartnerInfo(), fetchMessages()]);
});
</script>

<template>
  <div class="flex h-full flex-col bg-white relative">
    <!-- Fixed header -->
    <div class="border-b border-gray-200 p-4 bg-white">
      <div
        class="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors"
        @click="goToProfile"
      >
        <div
          v-if="partner?.profile?.profile_pic"
          class="h-10 w-10 rounded-full bg-cover bg-center bg-no-repeat"
          :style="{ backgroundImage: `url(/meta${partner.profile.profile_pic})` }"
          @error="handleImageError('profile picture', `/meta${partner.profile.profile_pic}`)"
        ></div>
        <div v-else class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
          <i class="fa-solid fa-user text-blue-500"></i>
        </div>
        <h2 class="text-xl font-semibold text-gray-800">
          {{ partner ? `${partner.first_name} ${partner.last_name}` : "Chat" }}
          <span v-if="partner?.nickname" class="text-sm font-normal text-gray-500">
            ({{ partner.nickname }})
          </span>
        </h2>
      </div>
    </div>

    <!-- Scrollable message container with bottom padding for input box -->
    <div ref="messageContainer" class="flex-1 overflow-y-auto p-4 space-y-4 pb-[80px]">
      <div
        v-for="message in messages"
        :key="message.message_id"
        class="flex items-end gap-2"
        :class="{ 'flex-row-reverse': message.sender_id === currentUserId }"
      >
        <div v-if="message.sender_id !== currentUserId" class="flex-shrink-0">
          <div
            v-if="partner?.profile?.profile_pic"
            class="h-8 w-8 rounded-full bg-cover bg-center bg-no-repeat"
            :style="{ backgroundImage: `url(/meta${partner.profile.profile_pic})` }"
            @error="handleImageError('profile picture', `/meta${partner.profile.profile_pic}`)"
          ></div>
          <div v-else class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <i class="fa-solid fa-user text-blue-500"></i>
          </div>
        </div>
        <div
          class="max-w-[70%] rounded-lg px-4 py-2"
          :class="[
            message.sender_id === currentUserId
              ? 'bg-blue-500 text-white rounded-tr-none'
              : 'bg-gray-100 text-gray-800 rounded-tl-none',
          ]"
        >
          <p>{{ message.content }}</p>
          <p
            class="mt-1 text-xs"
            :class="message.sender_id === currentUserId ? 'text-blue-100' : 'text-gray-500'"
          >
            {{ formatDate(message.sent_at) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Fixed message input at viewport bottom -->
    <div class="fixed bottom-0 left-[16rem] right-0 border-t border-gray-200 bg-white p-4 shadow-lg">
      <form @submit.prevent="sendMessage" class="flex gap-2">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type a message..."
          class="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          class="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 focus:outline-none disabled:opacity-50"
          :disabled="!newMessage.trim()"
        >
          Send
        </button>
      </form>
    </div>
  </div>
</template>
