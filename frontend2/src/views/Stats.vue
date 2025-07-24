<script setup>
import { ref, computed, watch, onMounted } from "vue";
import axios from "../utils/axios";
import PostSearchCard from "../components/PostSearchCard.vue";
import { useRouter } from "vue-router";
import GroupCard from "../components/GroupCard.vue";

const router = useRouter();
const loading = ref(false);
const error = ref(null);
const results = ref(null);
const postDetails = ref({});
const userProfiles = ref(new Map()); // Add this for user profiles

// Available stat types and their options
const periodUnits = [
  { value: "day", label: "Days" },
  { value: "month", label: "Months" },
  { value: "year", label: "Years" },
];

// Modify statTypes to handle custom period
const statTypes = [
  {
    value: "users_joined",
    label: "Users Joined",
    options: {
      metric: {
        label: "Group By",
        values: [
          { value: "hall", label: "Hall" },
          { value: "department", label: "Department" },
        ],
        default: "hall",
      },
      periodValue: {
        label: "Duration",
        type: "number",
        default: "30",
      },
      periodUnit: {
        label: "Unit",
        values: periodUnits,
        default: "day",
      },
    },
  },
  {
    value: "top_posts",
    label: "Top Posts",
    options: {
      metric: {
        label: "Interaction Type",
        values: [
          { value: "all", label: "All Interactions" },
          { value: "like", label: "Likes" },
          { value: "comment", label: "Comments" },
          { value: "share", label: "Shares" },
          { value: "tag", label: "Tags" },
        ],
        default: "all",
      },
      periodValue: {
        label: "Duration",
        type: "number",
        default: "30",
      },
      periodUnit: {
        label: "Unit",
        values: periodUnits,
        default: "day",
      },
      limit: {
        label: "Number of Posts",
        type: "number",
        default: "10",
        min: 1,
        max: 100,
      },
    },
  },
  {
    value: "active_users",
    label: "Active Users",
    options: {
      metric: {
        label: "Activity Type",
        values: [
          { value: "all", label: "All Activities" },
          { value: "post", label: "Posts" },
          { value: "like", label: "Likes" },
          { value: "comment", label: "Comments" },
        ],
        default: "all",
      },
      periodValue: {
        label: "Duration",
        type: "number",
        default: "30",
      },
      periodUnit: {
        label: "Unit",
        values: periodUnits,
        default: "day",
      },
      hall: {
        label: "Hall",
        values: [
          { value: "all", label: "All Halls" },
          { value: "AUH", label: "Ahsan Ullah Hall" },
          { value: "SWH", label: "Suhrawardy Hall" },
          { value: "SBH", label: "Sher-e Bangla Hall" },
          { value: "TH", label: "Titumir Hall" },
          { value: "RH", label: "Rashid Hall" },
          { value: "NH", label: "Nazrul Islam Hall" },
          { value: "ShH", label: "Shadhinota Hall" },
          { value: "SoH", label: "Sony Hall" },
        ],
        default: "all",
      },
      department: {
        label: "Department",
        values: [
          { value: "all", label: "All Departments" },
          { value: "CSE", label: "Computer Science and Engineering" },
          { value: "EEE", label: "Electrical and Electronic Engineering" },
          { value: "ME", label: "Mechanical Engineering" },
          { value: "CE", label: "Civil Engineering" },
          { value: "BME", label: "Biomedical Engineering" },
          { value: "ChE", label: "Chemical Engineering" },
          { value: "MME", label: "Materials and Metallurgic Engineering" },
          { value: "NCE", label: "Nanomaterials and Ceramic Engineering" },
          { value: "WRE", label: "Water Resources Engineering" },
          { value: "ARC", label: "Architecture" },
          { value: "URP", label: "Urban and Regional Planning" },
          { value: "NAME", label: "Naval Architecture and Marine Engineering" },
          { value: "IPE", label: "Industrial and Production Engineering" },
        ],
        default: "all",
      },
      limit: {
        label: "Number of Users",
        type: "number",
        default: "10",
        min: 1,
        max: 100,
      },
    },
  },
  {
    value: "active_groups",
    label: "Active Groups",
    options: {
      metric: {
        label: "Activity Type",
        values: [
          { value: "all", label: "All Activities" },
          { value: "member", label: "New Members" },
          { value: "post", label: "Posts" },
        ],
        default: "all",
      },
      periodValue: {
        label: "Duration",
        type: "number",
        default: "30",
      },
      periodUnit: {
        label: "Unit",
        values: periodUnits,
        default: "day",
      },
      limit: {
        label: "Number of Groups",
        type: "number",
        default: "10",
        min: 1,
        max: 100,
      },
    },
  },
  {
    value: "trends",
    label: "Trends",
    options: {
      metric: {
        label: "Trend Type",
        values: [
          { value: "post", label: "Posts" },
          { value: "friendship", label: "Friendships" },
          { value: "message", label: "Messages" },
        ],
        default: "post",
      },
      periodUnit: {
        label: "Time Period",
        values: periodUnits,
        default: "day",
      },
    },
  },
  {
    value: "marketplace_stats",
    label: "Marketplace Statistics",
    options: {},
  },
  {
    value: "tuition_stats",
    label: "Tuition Statistics",
    options: {},
  },
];

const selectedType = ref(statTypes[0].value);
const selectedOptions = ref({});

// Initialize default values for the first stat type
const initializeDefaults = (statType) => {
  const options = statTypes.find((t) => t.value === statType)?.options || {};
  selectedOptions.value = Object.entries(options).reduce((acc, [key, option]) => {
    acc[key] = option.default;
    return acc;
  }, {});
};

// Get available options for current stat type
const currentOptions = computed(() => {
  return statTypes.find((t) => t.value === selectedType.value)?.options || {};
});

// Function to fetch post details
const fetchPostDetails = async (postId) => {
  try {
    const response = await axios.get(`/api/posts/${postId}`);
    postDetails.value[postId] = response.data[0];
  } catch (err) {
    console.error(`Error fetching post ${postId}:`, err);
  }
};

// Add function to fetch user profiles
const fetchUserProfiles = async (users) => {
  try {
    const profilePromises = users.map((user) =>
      axios
        .get(`/api/users/${user.user_id}/profile`)
        .then((response) => {
          userProfiles.value.set(user.user_id, response.data);
        })
        .catch((err) => {
          console.error(`Failed to fetch profile for user ${user.user_id}:`, err);
        })
    );
    await Promise.all(profilePromises);
  } catch (err) {
    console.error("Error fetching user profiles:", err);
  }
};

// Modify fetchStats to fetch user profiles when needed
const fetchStats = async () => {
  try {
    loading.value = true;
    error.value = null;
    results.value = null;
    postDetails.value = {};
    userProfiles.value.clear(); // Clear existing profiles

    const params = {
      type: selectedType.value,
      ...selectedOptions.value,
    };

    // Combine period value and unit for the API only for non-trend stats
    if (selectedType.value !== "trends" && params.periodValue && params.periodUnit) {
      params.period = `${params.periodValue} ${params.periodUnit}`;
      delete params.periodValue;
      delete params.periodUnit;
    } else if (selectedType.value === "trends") {
      // For trends, use periodUnit directly as period
      params.period = params.periodUnit;
      delete params.periodUnit;
    }

    const response = await axios.get("/api/stats", { params });
    results.value = response.data;

    // Fetch additional data based on stat type
    if (selectedType.value === "top_posts" && results.value) {
      await Promise.all(results.value.map((post) => fetchPostDetails(post.post_id)));
    } else if (selectedType.value === "active_users" && results.value) {
      await fetchUserProfiles(results.value);
    }
  } catch (err) {
    console.error("Error fetching stats:", err);
    error.value = err.response?.data?.message || "Failed to load statistics";
  } finally {
    loading.value = false;
  }
};

// Watch for changes in selected type and options
watch(selectedType, (newType) => {
  initializeDefaults(newType);
  fetchStats();
});

watch(
  selectedOptions,
  () => {
    fetchStats();
  },
  { deep: true }
);

// Initialize defaults and fetch initial stats
onMounted(() => {
  initializeDefaults(selectedType.value);
  fetchStats();
});

const formatValue = (value) => {
  if (typeof value === "number") return value.toLocaleString();
  return value;
};

// Add helper function to get full labels
const getFullLabel = (type, value) => {
  if (!value) return "";

  const options = statTypes.find((t) => t.value === "active_users")?.options;
  if (!options) return value;

  if (type === "department") {
    return options.department.values.find((v) => v.value === value)?.label || value;
  }
  if (type === "hall") {
    return options.hall.values.find((v) => v.value === value)?.label || value;
  }
  return value;
};

// Add navigation function
const goToProfile = (userId) => {
  router.push(`/profile/${userId}`);
};

// Add navigation function for groups
const goToGroup = (groupId) => {
  router.push(`/groups/${groupId}`);
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <div class="lg:ml-20">
      <h1 class="text-3xl font-bold mb-8">Statistics Dashboard</h1>

      <div class="flex flex-col lg:flex-row gap-8 relative">
        <!-- Main Content Area -->
        <div class="w-full lg:w-[768px] flex-none">
          <!-- Results -->
          <div class="bg-white rounded-lg shadow">
            <!-- Loading State -->
            <div v-if="loading" class="p-8 text-center">
              <div
                class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"
              ></div>
              <p class="mt-4 text-gray-600">Loading statistics...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="p-8 text-center text-red-600">
              {{ error }}
              <button @click="fetchStats" class="mt-2 text-sm font-medium text-red-700 hover:text-red-800">
                Try again
              </button>
            </div>

            <!-- Results Display -->
            <div v-else-if="results" class="p-6">
              <!-- Users Joined -->
              <div v-if="selectedType === 'users_joined'" class="space-y-6">
                <!-- Total Users Summary -->
                <div class="bg-gray-50 rounded-lg p-4 mb-6">
                  <div class="text-2xl font-bold text-blue-600 text-center">
                    {{ results.reduce((sum, stat) => sum + stat.user_count, 0) }}
                  </div>
                  <div class="text-sm text-gray-600 text-center">Total Users</div>
                </div>

                <!-- Individual Stats -->
                <div
                  v-for="stat in results"
                  :key="stat.group_value"
                  class="group hover:bg-gray-50 rounded-lg p-4 transition-all duration-200"
                >
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-gray-700 font-medium">
                      {{ getFullLabel(selectedOptions.metric, stat.group_value) }}
                      <span class="text-gray-500 text-sm ml-1">({{ stat.group_value }})</span>
                    </span>
                    <span class="text-blue-600 font-semibold">{{ stat.user_count }} users</span>
                  </div>
                  <!-- Progress Bar -->
                  <div class="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      class="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-300 group-hover:bg-blue-600"
                      :style="{
                        width: `${(stat.user_count / Math.max(...results.map((r) => r.user_count))) * 100}%`,
                      }"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Top Posts -->
              <div v-else-if="selectedType === 'top_posts'" class="space-y-6">
                <!-- Summary Card -->
                <div class="bg-gray-50 rounded-lg p-4 mb-6">
                  <div class="text-2xl font-bold text-blue-600 text-center">
                    {{ results.length }}
                  </div>
                  <div class="text-sm text-gray-600 text-center">Top Posts</div>
                </div>

                <!-- Posts List -->
                <div v-for="(stat, index) in results" :key="stat.post_id" class="relative">
                  <!-- Rank Badge -->
                  <div
                    class="absolute -left-4 top-4 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-md"
                  >
                    {{ index + 1 }}
                  </div>

                  <!-- Post Card -->
                  <div class="ml-6">
                    <PostSearchCard v-if="postDetails[stat.post_id]" :post="postDetails[stat.post_id]" />
                    <!-- Stats Summary -->
                    <div class="mt-2 ml-4 grid grid-cols-4 gap-4 text-sm">
                      <div class="text-center p-2 rounded bg-blue-50">
                        <div class="font-semibold text-blue-700">{{ stat.like_count }}</div>
                        <div class="text-gray-600">Likes</div>
                      </div>
                      <div class="text-center p-2 rounded bg-green-50">
                        <div class="font-semibold text-green-700">{{ stat.comment_count }}</div>
                        <div class="text-gray-600">Comments</div>
                      </div>
                      <div class="text-center p-2 rounded bg-purple-50">
                        <div class="font-semibold text-purple-700">{{ stat.share_count }}</div>
                        <div class="text-gray-600">Shares</div>
                      </div>
                      <div class="text-center p-2 rounded bg-orange-50">
                        <div class="font-semibold text-orange-700">{{ stat.tag_count }}</div>
                        <div class="text-gray-600">Tags</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Active Users -->
              <div v-else-if="selectedType === 'active_users'" class="space-y-6">
                <!-- Summary Card -->
                <div class="bg-gray-50 rounded-lg p-4 mb-6">
                  <div class="text-2xl font-bold text-blue-600 text-center">
                    {{ results.length }}
                  </div>
                  <div class="text-sm text-gray-600 text-center">Most Active Users</div>
                </div>

                <!-- Users List -->
                <div v-for="(user, index) in results" :key="user.user_id" class="relative">
                  <!-- Rank Badge -->
                  <div
                    class="absolute -left-4 top-6 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-md"
                  >
                    {{ index + 1 }}
                  </div>

                  <!-- User Card -->
                  <div
                    class="ml-6 bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-4 cursor-pointer"
                    @click="goToProfile(user.user_id)"
                  >
                    <div class="flex items-start gap-4">
                      <!-- User Avatar -->
                      <div class="h-16 w-16 overflow-hidden rounded-full bg-gray-200 flex-shrink-0">
                        <img
                          v-if="userProfiles.get(user.user_id)?.profile_pic"
                          :src="`/meta${userProfiles.get(user.user_id).profile_pic}`"
                          :alt="user.first_name"
                          class="h-full w-full object-cover"
                        />
                        <i
                          v-else
                          class="fa-solid fa-user text-gray-400 text-3xl flex items-center justify-center h-full"
                        ></i>
                      </div>

                      <!-- User Info -->
                      <div class="flex-grow">
                        <div class="flex justify-between items-start">
                          <div>
                            <h3 class="font-medium text-lg">{{ user.first_name }} {{ user.last_name }}</h3>
                            <p class="text-sm text-gray-600">{{ user.department }} • {{ user.hall }}</p>
                          </div>
                          <div class="text-right">
                            <div class="text-blue-600 font-semibold">Score: {{ user.total_score }}</div>
                          </div>
                        </div>

                        <!-- Activity Stats Grid -->
                        <div class="grid grid-cols-3 gap-4 mt-4">
                          <div class="text-center p-2 rounded bg-blue-50">
                            <div class="font-semibold text-blue-700">{{ user.post_count }}</div>
                            <div class="text-xs text-gray-600">Posts</div>
                          </div>
                          <div class="text-center p-2 rounded bg-green-50">
                            <div class="font-semibold text-green-700">{{ user.like_count }}</div>
                            <div class="text-xs text-gray-600">Likes</div>
                          </div>
                          <div class="text-center p-2 rounded bg-purple-50">
                            <div class="font-semibold text-purple-700">{{ user.comment_count }}</div>
                            <div class="text-xs text-gray-600">Comments</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Active Groups -->
              <div v-else-if="selectedType === 'active_groups'" class="space-y-6">
                <!-- Summary Card -->
                <div class="bg-gray-50 rounded-lg p-4 mb-6">
                  <div class="text-2xl font-bold text-blue-600 text-center">
                    {{ results.length }}
                  </div>
                  <div class="text-sm text-gray-600 text-center">Most Active Groups</div>
                </div>

                <!-- Groups List -->
                <div v-for="(group, index) in results" :key="group.group_id" class="relative">
                  <!-- Rank Badge -->
                  <div
                    class="absolute -left-4 top-6 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-md"
                  >
                    {{ index + 1 }}
                  </div>

                  <!-- Group Card and Stats -->
                  <div class="ml-6 space-y-2">
                    <GroupCard :group="group" @click="goToGroup(group.group_id)" />

                    <!-- Activity Stats Grid -->
                    <div class="grid grid-cols-3 gap-4 px-4">
                      <div class="text-center p-2 rounded bg-blue-50">
                        <div class="font-semibold text-blue-700">{{ group.posts }}</div>
                        <div class="text-xs text-gray-600">Posts</div>
                      </div>
                      <div class="text-center p-2 rounded bg-green-50">
                        <div class="font-semibold text-green-700">{{ group.new_members }}</div>
                        <div class="text-xs text-gray-600">New Members</div>
                      </div>
                      <div class="text-center p-2 rounded bg-purple-50">
                        <div class="font-semibold text-purple-700">{{ group.total_score }}</div>
                        <div class="text-xs text-gray-600">Activity Score</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Trends -->
              <div v-else-if="selectedType === 'trends'" class="space-y-6">
                <!-- Summary Card -->
                <div class="bg-gray-50 rounded-lg p-4 mb-6">
                  <div class="text-2xl font-bold text-blue-600 text-center">
                    {{
                      results.reduce(
                        (sum, item) =>
                          sum +
                          (selectedOptions.metric === "post"
                            ? item.post_count
                            : selectedOptions.metric === "friendship"
                            ? item.friendship_count
                            : item.message_count),
                        0
                      )
                    }}
                  </div>
                  <div class="text-sm text-gray-600 text-center">
                    Total
                    {{
                      selectedOptions.metric === "post"
                        ? "Posts"
                        : selectedOptions.metric === "friendship"
                        ? "Friendships"
                        : "Messages"
                    }}
                  </div>
                </div>

                <!-- Trend List -->
                <div class="bg-white rounded-lg shadow p-6">
                  <h3 class="text-lg font-semibold mb-6">
                    {{
                      selectedOptions.metric === "post"
                        ? "Posts"
                        : selectedOptions.metric === "friendship"
                        ? "Friendships"
                        : "Messages"
                    }}
                    by {{ selectedOptions.periodUnit }}
                  </h3>

                  <div class="space-y-4">
                    <div v-for="trend in results" :key="trend.period" class="group">
                      <div class="flex justify-between items-center mb-1">
                        <span class="text-sm font-medium text-gray-600">{{ trend.period }}</span>
                        <span class="text-sm font-semibold text-blue-600">
                          {{
                            selectedOptions.metric === "post"
                              ? trend.post_count
                              : selectedOptions.metric === "friendship"
                              ? trend.friendship_count
                              : trend.message_count
                          }}
                        </span>
                      </div>
                      <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          class="h-full bg-blue-500 rounded-full transition-all duration-300 group-hover:bg-blue-600"
                          :style="{
                            width: `${
                              ((selectedOptions.metric === 'post'
                                ? trend.post_count
                                : selectedOptions.metric === 'friendship'
                                ? trend.friendship_count
                                : trend.message_count) /
                                Math.max(
                                  ...results.map((r) =>
                                    selectedOptions.metric === 'post'
                                      ? r.post_count
                                      : selectedOptions.metric === 'friendship'
                                      ? r.friendship_count
                                      : r.message_count
                                  )
                                )) *
                              100
                            }%`,
                          }"
                        ></div>
                      </div>
                    </div>
                  </div>

                  <!-- Average and Max -->
                  <div class="mt-6 pt-4 border-t grid grid-cols-2 gap-4">
                    <div class="text-center p-3 bg-gray-50 rounded-lg">
                      <div class="text-sm text-gray-600">Average</div>
                      <div class="font-semibold text-gray-800">
                        {{
                          Math.round(
                            results.reduce(
                              (sum, item) =>
                                sum +
                                (selectedOptions.metric === "post"
                                  ? item.post_count
                                  : selectedOptions.metric === "friendship"
                                  ? item.friendship_count
                                  : item.message_count),
                              0
                            ) / results.length
                          )
                        }}
                      </div>
                    </div>
                    <div class="text-center p-3 bg-gray-50 rounded-lg">
                      <div class="text-sm text-gray-600">Maximum</div>
                      <div class="font-semibold text-gray-800">
                        {{
                          Math.max(
                            ...results.map((r) =>
                              selectedOptions.metric === "post"
                                ? r.post_count
                                : selectedOptions.metric === "friendship"
                                ? r.friendship_count
                                : r.message_count
                            )
                          )
                        }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Marketplace Stats -->
              <div v-else-if="selectedType === 'marketplace_stats'" class="space-y-6">
                <div class="grid grid-cols-3 gap-4 text-center">
                  <div class="p-4 bg-gray-50 rounded-lg">
                    <div class="text-2xl font-bold text-blue-600">{{ results.summary.total }}</div>
                    <div class="text-sm text-gray-600">Total Items</div>
                  </div>
                  <div class="p-4 bg-gray-50 rounded-lg">
                    <div class="text-2xl font-bold text-green-600">{{ results.summary.available }}</div>
                    <div class="text-sm text-gray-600">Available</div>
                  </div>
                  <div class="p-4 bg-gray-50 rounded-lg">
                    <div class="text-2xl font-bold text-gray-600">{{ results.summary.sold }}</div>
                    <div class="text-sm text-gray-600">Sold</div>
                  </div>
                </div>

                <div>
                  <h3 class="text-lg font-medium mb-3">Items by Category</h3>
                  <div class="space-y-2">
                    <div
                      v-for="cat in results.items_by_category"
                      :key="cat.category"
                      class="flex justify-between"
                    >
                      <span class="text-gray-600">{{ cat.category }}</span>
                      <div class="text-right">
                        <span class="font-medium">{{ cat.count }} items</span>
                        <div class="text-sm text-gray-500">Avg: ৳{{ cat.avg_price }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tuition Stats -->
              <div v-else-if="selectedType === 'tuition_stats'" class="space-y-6">
                <div class="grid grid-cols-3 gap-4 text-center">
                  <div class="p-4 bg-gray-50 rounded-lg">
                    <div class="text-2xl font-bold text-blue-600">{{ results.summary.total }}</div>
                    <div class="text-sm text-gray-600">Total Posts</div>
                  </div>
                  <div class="p-4 bg-gray-50 rounded-lg">
                    <div class="text-2xl font-bold text-green-600">{{ results.summary.available }}</div>
                    <div class="text-sm text-gray-600">Available</div>
                  </div>
                  <div class="p-4 bg-gray-50 rounded-lg">
                    <div class="text-2xl font-bold text-gray-600">{{ results.summary.booked }}</div>
                    <div class="text-sm text-gray-600">Booked</div>
                  </div>
                </div>

                <div class="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 class="text-lg font-medium mb-3">Posts by Class</h3>
                    <div class="space-y-2">
                      <div
                        v-for="cls in results.posts_by_class"
                        :key="cls.class"
                        class="flex justify-between"
                      >
                        <span class="text-gray-600">{{ cls.class }}</span>
                        <div class="text-right">
                          <span class="font-medium">{{ cls.count }} posts</span>
                          <div class="text-sm text-gray-500">Avg: ৳{{ cls.avg_remunation }}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 class="text-lg font-medium mb-3">Posts by Subject</h3>
                    <div class="space-y-2">
                      <div
                        v-for="subj in results.posts_by_subject"
                        :key="subj.subject"
                        class="flex justify-between"
                      >
                        <span class="text-gray-600">{{ subj.subject }}</span>
                        <div class="text-right">
                          <span class="font-medium">{{ subj.count }} posts</span>
                          <div class="text-sm text-gray-500">Avg: ৳{{ subj.avg_remunation }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Sidebar with Filters -->
        <div class="lg:w-80 flex-shrink-0 lg:absolute lg:right-0">
          <div class="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 class="text-lg font-semibold mb-6">Filters</h2>

            <!-- Stat Type Selection -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Statistic Type</label>
              <select
                v-model="selectedType"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option v-for="type in statTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>

            <!-- Dynamic Options -->
            <div class="space-y-4">
              <template v-for="(option, key) in currentOptions" :key="key">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{ option.label }}</label>
                  <!-- Number input for period value or limit -->
                  <input
                    v-if="option.type === 'number'"
                    v-model="selectedOptions[key]"
                    type="number"
                    :min="option.min || 1"
                    :max="option.max || undefined"
                    :placeholder="'Enter ' + option.label.toLowerCase()"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                  <!-- Select input for other options -->
                  <select
                    v-else
                    v-model="selectedOptions[key]"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option v-for="value in option.values" :key="value.value" :value="value.value">
                      {{ value.label }}
                    </option>
                  </select>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
