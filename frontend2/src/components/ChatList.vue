<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "../utils/axios";

const chats = ref([]);
const router = useRouter();

const handleImageError = (type, path) => {
  console.error(`Failed to load ${type}:`, path);
};

const fetchUserInfo = async (userId) => {
  try {
    const [userResponse, profileResponse] = await Promise.all([
      axios.get(`/api/users/${userId}`),
      axios.get(`/api/users/${userId}/profile`),
    ]);
    return {
      ...userResponse.data,
      profile: profileResponse.data,
    };
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
};

const fetchChats = async () => {
  try {
    const response = await axios.get("/api/chats");
    const chatsData = response.data;

    // Fetch user info for each chat partner
    const chatsWithUserInfo = await Promise.all(
      chatsData.map(async (chat) => {
        const userInfo = await fetchUserInfo(chat.partner_id);
        return {
          ...chat,
          partner: userInfo,
        };
      })
    );

    chats.value = chatsWithUserInfo;
  } catch (error) {
    console.error("Error fetching chats:", error);
  }
};

const sortedChats = computed(() => {
  return [...chats.value].sort((a, b) => {
    return new Date(b.last_message_at) - new Date(a.last_message_at);
  });
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

const openChat = (chatId) => {
  router.push(`/chats/${chatId}`);
};

onMounted(() => {
  fetchChats();
});
</script>

<template>
  <div class="h-full bg-white p-4">
    <h2 class="mb-4 text-xl font-semibold text-gray-800">Chats</h2>
    <div class="space-y-2">
      <div
        v-for="chat in sortedChats"
        :key="chat.chat_id"
        @click="openChat(chat.chat_id)"
        class="cursor-pointer rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div
              v-if="chat.partner?.profile?.profile_pic"
              class="h-10 w-10 rounded-full bg-cover bg-center bg-no-repeat"
              :style="{ backgroundImage: `url(/meta${chat.partner.profile.profile_pic})` }"
              @error="handleImageError('profile picture', `/meta${chat.partner.profile.profile_pic}`)"
            ></div>
            <div v-else class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <i class="fa-solid fa-user text-blue-500"></i>
            </div>
            <div class="ml-3">
              <p class="font-medium text-gray-800">
                {{
                  chat.partner
                    ? `${chat.partner.first_name} ${chat.partner.last_name}`
                    : `User #${chat.partner_id}`
                }}
                <span v-if="chat.partner?.nickname" class="text-sm text-gray-500">
                  ({{ chat.partner.nickname }})
                </span>
              </p>
              <p class="text-sm text-gray-500">Last message: {{ formatDate(chat.last_message_at) }}</p>
            </div>
          </div>
          <i class="fa-solid fa-chevron-right text-gray-400"></i>
        </div>
      </div>
    </div>
  </div>
</template>
