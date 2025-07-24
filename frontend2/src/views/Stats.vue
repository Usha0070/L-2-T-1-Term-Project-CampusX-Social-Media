<script setup>
import { ref, computed, watch, onMounted } from "vue";
import axios from "../utils/axios";

const loading = ref(false);
const error = ref(null);
const results = ref(null);

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
        values: [
          { value: "5", label: "Top 5" },
          { value: "10", label: "Top 10" },
          { value: "20", label: "Top 20" },
        ],
        default: "10",
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
          { value: "Shaheed Abdur Rab Hall", label: "Shaheed Abdur Rab Hall" },
          { value: "Shaheed Suhrawardy Hall", label: "Shaheed Suhrawardy Hall" },
          { value: "Fazlul Huq Muslim Hall", label: "Fazlul Huq Muslim Hall" },
          { value: "Ahsanullah Hall", label: "Ahsanullah Hall" },
          { value: "Titumir Hall", label: "Titumir Hall" },
          { value: "Chatri Hall", label: "Chatri Hall" },
        ],
        default: "all",
      },
      department: {
        label: "Department",
        values: [
          { value: "all", label: "All Departments" },
          { value: "CSE", label: "CSE" },
          { value: "EEE", label: "EEE" },
          { value: "ME", label: "ME" },
          { value: "CE", label: "CE" },
          { value: "NAME", label: "NAME" },
          { value: "IPE", label: "IPE" },
        ],
        default: "all",
      },
      limit: {
        label: "Number of Users",
        values: [
          { value: "5", label: "Top 5" },
          { value: "10", label: "Top 10" },
          { value: "20", label: "Top 20" },
        ],
        default: "10",
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
        values: [
          { value: "5", label: "Top 5" },
          { value: "10", label: "Top 10" },
          { value: "20", label: "Top 20" },
        ],
        default: "10",
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
      periodValue: {
        label: "Duration",
        type: "number",
        default: "1",
      },
      periodUnit: {
        label: "Unit",
        values: periodUnits,
        default: "month",
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

const fetchStats = async () => {
  try {
    loading.value = true;
    error.value = null;
    results.value = null;

    const params = {
      type: selectedType.value,
      ...selectedOptions.value,
    };

    // Combine period value and unit for the API
    if (params.periodValue && params.periodUnit) {
      params.period = `${params.periodValue} ${params.periodUnit}`;
      delete params.periodValue;
      delete params.periodUnit;
    }

    const response = await axios.get("/api/stats", { params });
    results.value = response.data;
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
              <div v-if="selectedType === 'users_joined'" class="space-y-4">
                <div
                  v-for="stat in results"
                  :key="stat.group_value"
                  class="flex justify-between border-b pb-2"
                >
                  <span class="text-gray-700">{{ stat.group_value }}</span>
                  <span class="font-medium">{{ stat.user_count }} users</span>
                </div>
              </div>

              <!-- Top Posts -->
              <div v-else-if="selectedType === 'top_posts'" class="space-y-4">
                <div v-for="post in results" :key="post.post_id" class="border-b pb-4">
                  <div class="flex justify-between items-start">
                    <span class="font-medium">Post #{{ post.post_id }}</span>
                    <div class="text-sm text-gray-500">Total Score: {{ post.total_score }}</div>
                  </div>
                  <div class="mt-2 text-sm text-gray-600">
                    Likes: {{ post.like_count }} • Comments: {{ post.comment_count }} • Shares:
                    {{ post.share_count }} • Tags: {{ post.tag_count }}
                  </div>
                </div>
              </div>

              <!-- Active Users -->
              <div v-else-if="selectedType === 'active_users'" class="space-y-4">
                <div v-for="user in results" :key="user.user_id" class="border-b pb-4">
                  <div class="flex justify-between items-start">
                    <span class="font-medium">{{ user.first_name }} {{ user.last_name }}</span>
                    <div class="text-sm text-gray-500">Score: {{ user.total_score }}</div>
                  </div>
                  <div class="mt-1 text-sm text-gray-600">{{ user.department }} • {{ user.hall }}</div>
                  <div class="mt-1 text-sm text-gray-600">
                    Posts: {{ user.post_count }} • Likes: {{ user.like_count }} • Comments:
                    {{ user.comment_count }}
                  </div>
                </div>
              </div>

              <!-- Active Groups -->
              <div v-else-if="selectedType === 'active_groups'" class="space-y-4">
                <div v-for="group in results" :key="group.group_id" class="border-b pb-4">
                  <div class="flex justify-between items-start">
                    <span class="font-medium">{{ group.name }}</span>
                    <div class="text-sm text-gray-500">Score: {{ group.total_score }}</div>
                  </div>
                  <div class="mt-2 text-sm text-gray-600">
                    New Members: {{ group.new_members }} • Posts: {{ group.posts }}
                  </div>
                </div>
              </div>

              <!-- Trends -->
              <div v-else-if="selectedType === 'trends'" class="space-y-4">
                <div v-for="trend in results" :key="trend.period" class="flex justify-between border-b pb-2">
                  <span class="text-gray-700">{{ trend.period }}</span>
                  <span class="font-medium">
                    {{
                      trend.post_count !== undefined
                        ? trend.post_count
                        : trend.friendship_count !== undefined
                        ? trend.friendship_count
                        : trend.message_count
                    }}
                  </span>
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
                  <!-- Number input for period value -->
                  <input
                    v-if="option.type === 'number'"
                    v-model="selectedOptions[key]"
                    type="number"
                    min="1"
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
