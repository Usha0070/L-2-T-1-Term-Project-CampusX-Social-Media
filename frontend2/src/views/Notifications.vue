<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "../utils/axios";

const router = useRouter();
const notifications = ref([]);
const users = ref(new Map()); // Map to store user information
const loading = ref(true);

const getNotificationText = (type) => {
  switch (type) {
    case "post_like":
      return "liked your post";
    case "post_comment":
      return "commented on your post";
    case "friend_req_received":
      return "sent you a friend request";
    case "friend_req_accepted":
      return "accepted your friend request";
    case "post_share":
      return "shared your post";
    case "post_tag":
      return "tagged you in a post";
    default:
      return "interacted with your content";
  }
};

const formatTimeAgo = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
};

// Group notifications by post and type
const groupedNotifications = computed(() => {
  const groups = new Map();

  notifications.value.forEach((notification) => {
    const { type, metadata, created_at } = notification;

    // Skip grouping for friend requests
    if (type === "friend_req_received" || type === "friend_req_accepted") {
      const key = `friend_${notification.notification_id}`;
      groups.set(key, {
        type,
        created_at,
        notifications: [notification],
        users: [notification.sender_id],
      });
      return;
    }

    // For post-related notifications, group by post_id and type
    const postId = metadata?.post;
    if (!postId) return;

    const key = `${type}_${postId}`;
    if (!groups.has(key)) {
      groups.set(key, {
        type,
        postId,
        created_at,
        notifications: [],
        users: [],
      });
    }

    const group = groups.get(key);
    group.notifications.push(notification);
    if (!group.users.includes(notification.sender_id)) {
      group.users.push(notification.sender_id);
    }

    // Update timestamp to most recent
    if (new Date(notification.created_at) > new Date(group.created_at)) {
      group.created_at = notification.created_at;
    }
  });

  return Array.from(groups.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});

const fetchUserInfo = async (userId) => {
  if (users.value.has(userId)) return;

  try {
    const response = await axios.get(`/api/users/${userId}`);
    users.value.set(userId, response.data);
  } catch (error) {
    console.error("Error fetching user info:", error);
    users.value.set(userId, { first_name: "User", last_name: userId.toString() });
  }
};

const getUserName = (userId) => {
  const user = users.value.get(userId);
  if (!user) return `User ${userId}`;
  return `${user.first_name} ${user.last_name}`;
};

const formatUserList = (userIds) => {
  if (userIds.length === 0) return "";
  if (userIds.length === 1) return getUserName(userIds[0]);
  if (userIds.length === 2) return `${getUserName(userIds[0])} and ${getUserName(userIds[1])}`;
  return `${getUserName(userIds[0])} and ${userIds.length - 1} others`;
};

const handleNotificationClick = (group) => {
  // For friend requests and acceptances, go to user profile
  if (group.type === "friend_req_received" || group.type === "friend_req_accepted") {
    router.push(`/profile/${group.users[0]}`);
    return;
  }

  // For post-related notifications, go to the post
  if (group.postId) {
    router.push(`/post/${group.postId}`);
  }
};

const fetchNotifications = async () => {
  try {
    loading.value = true;
    const response = await axios.get("/api/notifications");
    notifications.value = response.data;

    // Fetch user info for all unique users
    const uniqueUserIds = [...new Set(notifications.value.map((n) => n.sender_id))];
    await Promise.all(uniqueUserIds.map(fetchUserInfo));
  } catch (error) {
    console.error("Error fetching notifications:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchNotifications();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Notifications</h1>
      <button
        @click="fetchNotifications"
        class="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
      >
        <i class="fa-solid fa-rotate-right mr-2"></i>
        Refresh
      </button>
    </div>

    <div v-if="loading" class="flex justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="notifications.length === 0" class="text-center text-gray-500">No notifications yet</div>

    <div v-else class="space-y-4">
      <div
        v-for="group in groupedNotifications"
        :key="group.type + (group.postId || group.notifications[0].notification_id)"
        class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
        :class="{
          'bg-blue-50': group.notifications.some((n) => !n.is_read),
          'hover:bg-gray-50': !group.notifications.some((n) => !n.is_read),
          'hover:bg-blue-100': group.notifications.some((n) => !n.is_read),
        }"
        @click="handleNotificationClick(group)"
      >
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0">
            <i
              :class="{
                'fa-solid fa-heart text-red-500': group.type === 'post_like',
                'fa-solid fa-comment text-blue-500': group.type === 'post_comment',
                'fa-solid fa-user-plus text-green-500':
                  group.type === 'friend_req_received' || group.type === 'friend_req_accepted',
                'fa-solid fa-share text-purple-500': group.type === 'post_share',
                'fa-solid fa-tag text-yellow-500': group.type === 'post_tag',
              }"
              class="text-xl"
            ></i>
          </div>
          <div class="flex-grow">
            <p class="text-gray-800">
              <span class="font-semibold">{{ formatUserList(group.users) }}</span>
              {{ getNotificationText(group.type) }}
              <span v-if="group.postId" class="text-gray-500"> • Click to view post </span>
              <span v-else-if="group.type.includes('friend_req')" class="text-gray-500">
                • Click to view profile
              </span>
            </p>
            <p class="text-sm text-gray-500 mt-1">
              {{ formatTimeAgo(group.created_at) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
