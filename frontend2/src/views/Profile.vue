<script setup>
import { ref, onMounted, watch, computed } from "vue";
import axios from "../utils/axios";
import Post from "../components/Post.vue";
import { getCurrentUserId } from "../utils/auth";
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps({
  id: {
    type: String,
    default: null,
  },
});

const currentUserId = ref(null);
const isOwnProfile = ref(false);
const user = ref(null);
const profile = ref(null);
const posts = ref([]);

const profileFriends = ref();
const myFriends = ref();

const friendsInfo = ref(new Map());
const loading = ref({
  user: true,
  profile: true,
  posts: true,
  friends: true,
  friendsInfo: true,
  myFriends: true,
});
const error = ref(null);

const relationshipStatus = computed(() => {
  const targetUserId = props.id;

  if (!targetUserId || targetUserId === currentUserId.value) {
    return "self";
  }

  if (myFriends.value?.friends?.some((f) => f.user_id === Number(targetUserId))) {
    return "friend";
  }

  if (myFriends.value?.friend_requests_sent?.some((f) => f.user_id === Number(targetUserId))) {
    return "request_sent";
  }

  if (myFriends.value?.friend_requests_received?.some((f) => f.user_id === Number(targetUserId))) {
    return "request_received";
  }

  return "none";
});

const fetchMyFriends = async () => {
  try {
    loading.value.myFriends = true;
    const response = await axios.get("/api/users/me/friends");
    myFriends.value = response.data;
  } catch (err) {
    console.error("Error fetching my friends:", err);
  } finally {
    loading.value.myFriends = false;
  }
};

const handleFriendAction = async (action) => {
  try {
    const response = await axios.put("/api/users/me/friends", {
      friend_id: Number(props.id),
      type: action,
    });

    if (response.data.success) {
      await Promise.all([fetchMyFriends(), fetchUserData()]);
    }
  } catch (err) {
    error.value = err.response?.data?.error || err.message || "Failed to perform friend action";
    console.error("Error performing friend action:", err);
  }
};

const sendFriendRequest = () => handleFriendAction("req_sent");
const acceptFriendRequest = () => handleFriendAction("req_accept");
const declineFriendRequest = () => handleFriendAction("req_delete");
const unfriend = () => handleFriendAction("unfriend");

const startChat = async () => {
  try {
    const response = await axios.get(`/api/chats/with/${props.id}`);
    if (response.data?.chat_id) {
      router.push(`/chats/${response.data.chat_id}`);
    } else {
      console.error("No chat ID received");
    }
  } catch (error) {
    console.error("Error starting chat:", error);
  }
};

const fetchFriendInfo = async (userId) => {
  try {
    const [userRes, profileRes] = await Promise.all([
      axios.get(`/api/users/${userId}`),
      axios.get(`/api/users/${userId}/profile`),
    ]);

    // Check if the Map still exists before setting data
    if (friendsInfo.value) {
      friendsInfo.value.set(userId, {
        ...userRes.data,
        profile_pic: profileRes.data?.profile_pic,
      });
    }
  } catch (err) {
    console.error(`Error fetching friend info for ${userId}:`, err);
  }
};

const fetchAllFriendsInfo = async () => {
  try {
    loading.value.friendsInfo = true;
    friendsInfo.value = new Map(); // Reset the Map before fetching new data

    const allUserIds = [
      ...profileFriends.value.friends.map((f) => f.user_id),
      ...(profileFriends.value.friend_requests_sent?.map((f) => f.user_id) || []),
      ...(profileFriends.value.friend_requests_received?.map((f) => f.user_id) || []),
    ];

    await Promise.all(allUserIds.map(fetchFriendInfo));
  } catch (err) {
    console.error("Error fetching all friends info:", err);
  } finally {
    loading.value.friendsInfo = false;
  }
};

const fetchUserData = async () => {
  try {
    loading.value = {
      user: true,
      profile: true,
      posts: true,
      friends: true,
      friendsInfo: true,
      myFriends: loading.value.myFriends,
    };

    // Get current user ID on initial load if not already set
    if (!currentUserId.value) {
      currentUserId.value = getCurrentUserId();
    }

    // Check if the provided ID matches current user's ID
    if (props.id && String(currentUserId.value) === props.id) {
      router.replace("/profile"); // Redirect to /profile without ID
      return;
    }

    const userId = props.id || "me";
    isOwnProfile.value = !props.id || userId === "me" || userId === currentUserId.value;

    // Fetch profile data
    const [userRes, profileRes, postsRes] = await Promise.all([
      axios.get(`/api/users/${userId}`),
      axios.get(`/api/users/${userId}/profile`),
      axios.get(`/api/users/${userId}/posts`),
    ]);

    user.value = userRes.data;
    profile.value = profileRes.data;
    posts.value = postsRes.data;

    // If viewing own profile, update both friends lists
    if (isOwnProfile.value) {
      const friendsRes = await axios.get("/api/users/me/friends");
      profileFriends.value = friendsRes.data;
      myFriends.value = friendsRes.data;
      await fetchAllFriendsInfo();
    }

    // If not already loading, fetch current user's friends for relationship status
    if (!loading.value.myFriends) {
      await fetchMyFriends();
    }
  } catch (err) {
    error.value = err.response?.data?.message || "Failed to load profile data";
    console.error("Error fetching profile data:", err);
  } finally {
    loading.value = {
      user: false,
      profile: false,
      posts: false,
      friends: !isOwnProfile.value ? null : false,
      friendsInfo: !isOwnProfile.value ? null : false,
      myFriends: false,
    };
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 30) {
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  } else if (days > 0) {
    return `${days}d ago`;
  } else {
    return "Today";
  }
};

watch(
  () => props.id,
  async () => {
    await fetchUserData();
  }
);

onMounted(async () => {
  await fetchMyFriends();
  await fetchUserData();
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <div class="lg:ml-20">
      <!-- Loading State -->
      <div v-if="Object.values(loading).some(Boolean)" class="space-y-4">
        <div class="h-64 animate-pulse rounded-lg bg-gray-200"></div>
        <div class="h-32 animate-pulse rounded-lg bg-gray-200"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-lg bg-red-50 p-4 text-center text-red-600">
        {{ error }}
        <button @click="fetchUserData" class="mt-2 text-sm font-medium text-red-700 hover:text-red-800">
          Try again
        </button>
      </div>

      <!-- Profile Content -->
      <div v-else class="space-y-6">
        <!-- Cover Photo -->
        <div class="relative h-64 overflow-hidden rounded-lg bg-gray-200">
          <img
            v-if="profile?.cover_photo"
            :src="`/meta${profile.cover_photo}`"
            class="h-full w-full object-cover"
            alt="Cover photo"
          />
        </div>

        <!-- Profile Info -->
        <div class="relative">
          <div class="absolute -top-16 left-8">
            <div class="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
              <img
                v-if="profile?.profile_pic"
                :src="`/meta${profile.profile_pic}`"
                class="h-full w-full object-cover"
                alt="Profile picture"
              />
            </div>
          </div>

          <div class="ml-44 pt-4">
            <div class="flex justify-between items-start">
              <div>
                <h1 class="text-2xl font-bold">
                  {{ user ? `${user.first_name} ${user.last_name}` : "Loading..." }}
                  <span v-if="user?.nickname" class="text-lg font-normal text-gray-500"
                    >({{ user.nickname }})</span
                  >
                </h1>
                <div class="mt-2 flex gap-4 text-gray-600">
                  <div>
                    <i class="fa-solid fa-graduation-cap mr-2"></i>
                    <span>{{ user?.department }} {{ user?.batch }}</span>
                  </div>
                  <div>
                    <i class="fa-solid fa-id-card mr-2"></i>
                    <span>{{ user?.student_id }}</span>
                  </div>
                </div>
                <p v-if="profile?.bio" class="mt-4 text-gray-600">{{ profile.bio }}</p>
              </div>

              <!-- Relationship Actions -->
              <div v-if="!isOwnProfile" class="flex gap-2">
                <!-- Message Button - Always show for other profiles -->
                <button
                  @click="startChat"
                  class="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  <i class="fa-solid fa-message"></i>
                  Message
                </button>

                <!-- Friend -->
                <button
                  v-if="relationshipStatus === 'friend'"
                  @click="unfriend"
                  class="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  <i class="fa-solid fa-user-minus"></i>
                  Unfriend
                </button>

                <!-- Request Sent -->
                <button
                  v-else-if="relationshipStatus === 'request_sent'"
                  disabled
                  class="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-500"
                >
                  <i class="fa-solid fa-clock"></i>
                  Request Sent
                </button>

                <!-- Request Received -->
                <div v-else-if="relationshipStatus === 'request_received'" class="flex gap-2">
                  <button
                    @click="acceptFriendRequest"
                    class="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                  >
                    <i class="fa-solid fa-user-check"></i>
                    Accept
                  </button>
                  <button
                    @click="declineFriendRequest"
                    class="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                  >
                    <i class="fa-solid fa-user-xmark"></i>
                    Decline
                  </button>
                </div>

                <!-- No Relationship -->
                <button
                  v-else
                  @click="sendFriendRequest"
                  class="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                >
                  <i class="fa-solid fa-user-plus"></i>
                  Add Friend
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col lg:flex-row gap-8 relative" :class="{ 'lg:justify-center': !isOwnProfile }">
          <!-- Main Content Area -->
          <div class="w-full lg:w-[768px] flex-none" :class="{ 'lg:w-[900px]': !isOwnProfile }">
            <!-- Posts Section -->
            <div class="space-y-4">
              <h2 class="text-xl font-semibold">Posts</h2>
              <Post v-for="post in posts" :key="post.post_id" :post="post" />
              <div v-if="posts.length === 0" class="rounded-lg bg-gray-50 p-8 text-center">
                <i class="fa-regular fa-newspaper mb-2 text-4xl text-gray-400"></i>
                <h3 class="text-lg font-medium text-gray-700">No posts yet</h3>
                <p class="mt-1 text-gray-500">
                  {{
                    isOwnProfile
                      ? "Share something with your friends!"
                      : "This user hasn't posted anything yet."
                  }}
                </p>
              </div>
            </div>
          </div>

          <!-- Right Sidebar - Only show for own profile -->
          <div v-if="isOwnProfile" class="lg:w-80 flex-shrink-0 lg:absolute lg:right-0">
            <div class="bg-white rounded-lg shadow p-6 sticky top-6">
              <!-- Friends Section -->
              <div class="space-y-6">
                <!-- Friends List -->
                <div>
                  <div class="flex items-center justify-between">
                    <h2 class="text-xl font-semibold">Friends</h2>
                    <span class="text-sm text-gray-500"
                      >{{ profileFriends?.friends?.length || 0 }} friends</span
                    >
                  </div>
                  <div class="mt-4 space-y-4">
                    <div
                      v-for="friend in profileFriends?.friends"
                      :key="friend.user_id"
                      class="flex items-center gap-3"
                    >
                      <router-link
                        :to="`/profile/${friend.user_id}`"
                        class="flex items-center gap-3 flex-grow hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      >
                        <div class="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                          <img
                            v-if="friendsInfo.get(friend.user_id)?.profile_pic"
                            :src="`/meta${friendsInfo.get(friend.user_id).profile_pic}`"
                            :alt="friendsInfo.get(friend.user_id)?.first_name"
                            class="h-full w-full object-cover"
                          />
                        </div>
                        <div class="flex-grow">
                          <p class="font-medium text-gray-900 hover:text-blue-600">
                            {{ friendsInfo.get(friend.user_id)?.first_name }}
                            {{ friendsInfo.get(friend.user_id)?.last_name }}
                          </p>
                          <p class="text-sm text-gray-500">
                            {{ friendsInfo.get(friend.user_id)?.department }}
                            <span class="mx-1">·</span>
                            <span>Friends since {{ formatDate(friend.since) }}</span>
                          </p>
                        </div>
                      </router-link>
                    </div>
                    <div
                      v-if="!profileFriends?.friends?.length"
                      class="rounded-lg bg-gray-50 p-4 text-center"
                    >
                      <p class="text-gray-500">No friends yet</p>
                    </div>
                  </div>
                </div>

                <!-- Friend Requests Sent -->
                <div v-if="profileFriends?.friend_requests_sent?.length">
                  <h3 class="text-lg font-semibold">Sent Requests</h3>
                  <div class="mt-4 space-y-4">
                    <div
                      v-for="request in profileFriends?.friend_requests_sent"
                      :key="request.user_id"
                      class="flex items-center gap-3"
                    >
                      <router-link
                        :to="`/profile/${request.user_id}`"
                        class="flex items-center gap-3 flex-grow hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      >
                        <div class="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                          <img
                            v-if="friendsInfo.get(request.user_id)?.profile_pic"
                            :src="`/meta${friendsInfo.get(request.user_id).profile_pic}`"
                            :alt="friendsInfo.get(request.user_id)?.first_name"
                            class="h-full w-full object-cover"
                          />
                        </div>
                        <div class="flex-grow">
                          <p class="font-medium text-gray-900 hover:text-blue-600">
                            {{ friendsInfo.get(request.user_id)?.first_name }}
                            {{ friendsInfo.get(request.user_id)?.last_name }}
                          </p>
                          <p class="text-sm text-gray-500">
                            {{ friendsInfo.get(request.user_id)?.department }}
                            <span class="mx-1">·</span>
                            <span>Sent {{ formatDate(request.since) }}</span>
                          </p>
                        </div>
                      </router-link>
                    </div>
                  </div>
                </div>

                <!-- Friend Requests Received -->
                <div v-if="profileFriends?.friend_requests_received?.length">
                  <h3 class="text-lg font-semibold">Friend Requests</h3>
                  <div class="mt-4 space-y-4">
                    <div
                      v-for="request in profileFriends?.friend_requests_received"
                      :key="request.user_id"
                      class="flex items-center gap-3"
                    >
                      <router-link
                        :to="`/profile/${request.user_id}`"
                        class="flex items-center gap-3 flex-grow hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      >
                        <div class="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                          <img
                            v-if="friendsInfo.get(request.user_id)?.profile_pic"
                            :src="`/meta${friendsInfo.get(request.user_id).profile_pic}`"
                            :alt="friendsInfo.get(request.user_id)?.first_name"
                            class="h-full w-full object-cover"
                          />
                        </div>
                        <div class="flex-grow">
                          <p class="font-medium text-gray-900 hover:text-blue-600">
                            {{ friendsInfo.get(request.user_id)?.first_name }}
                            {{ friendsInfo.get(request.user_id)?.last_name }}
                          </p>
                          <p class="text-sm text-gray-500">
                            {{ friendsInfo.get(request.user_id)?.department }}
                            <span class="mx-1">·</span>
                            <span>Received {{ formatDate(request.since) }}</span>
                          </p>
                        </div>
                      </router-link>
                      <div class="flex gap-2">
                        <button
                          @click="acceptFriendRequest"
                          class="rounded bg-blue-500 px-3 py-1 text-sm font-medium text-white hover:bg-blue-600"
                        >
                          Accept
                        </button>
                        <button
                          @click="declineFriendRequest"
                          class="rounded bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
