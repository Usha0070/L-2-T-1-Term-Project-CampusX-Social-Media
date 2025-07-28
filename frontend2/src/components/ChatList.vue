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
  <div class="bg-white rounded-xl shadow-sm border border-gray-100">
    <!-- Header -->
    <div class="px-6 py-5 border-b border-gray-100">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <i class="fa-solid fa-comments text-blue-600"></i>
        </div>
        <h2 class="text-xl font-semibold text-gray-900">Messages</h2>
      </div>
    </div>

    <!-- Chat List -->
    <div class="divide-y divide-gray-50">
      <div
        v-for="chat in sortedChats"
        :key="chat.chat_id"
        @click="openChat(chat.chat_id)"
        class="group cursor-pointer px-6 py-4 hover:bg-gray-50 transition-all duration-200 active:bg-gray-100"
      >
        <div class="flex items-center gap-4">
          <!-- Profile Picture -->
          <div class="relative flex-shrink-0">
            <div
              v-if="chat.partner?.profile?.profile_pic"
              class="w-12 h-12 rounded-full bg-cover bg-center bg-no-repeat ring-2 ring-gray-100"
              :style="{ backgroundImage: `url(/meta${chat.partner.profile.profile_pic})` }"
              @error="handleImageError('profile picture', `/meta${chat.partner.profile.profile_pic}`)"
            ></div>
            <div
              v-else
              class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center ring-2 ring-gray-100"
            >
              <i class="fa-solid fa-user text-white text-lg"></i>
            </div>
            <!-- Online indicator (placeholder for future) -->
            <div
              class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"
            ></div>
          </div>

          <!-- Chat Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <h3 class="font-medium text-gray-900 truncate">
                {{
                  chat.partner
                    ? `${chat.partner.first_name} ${chat.partner.last_name}`
                    : `User #${chat.partner_id}`
                }}
                <span v-if="chat.partner?.nickname" class="text-sm font-normal text-gray-500 ml-1">
                  ({{ chat.partner.nickname }})
                </span>
              </h3>
              <span class="text-xs text-gray-500 flex-shrink-0 ml-2">
                {{ formatDate(chat.last_message_at) }}
              </span>
            </div>
            <p class="text-sm text-gray-600 truncate">Start a conversation</p>
          </div>

          <!-- Arrow Icon -->
          <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <i class="fa-solid fa-chevron-right text-gray-400 text-sm"></i>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="sortedChats.length === 0" class="px-6 py-16 text-center">
        <div class="max-w-sm mx-auto">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fa-regular fa-comments text-2xl text-gray-400"></i>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
          <p class="text-gray-500 text-sm leading-relaxed">
            Start chatting by visiting someone's profile or responding to a marketplace listing
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
