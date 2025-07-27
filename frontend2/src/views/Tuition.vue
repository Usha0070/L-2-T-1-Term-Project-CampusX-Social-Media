<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "../utils/axios";
import { getCurrentUserId } from "../utils/auth";
import TuitionPost from "../components/TuitionPost.vue";

const TUITION_GROUP_ID = 5;
const posts = ref([]);
const loading = ref({ posts: true, creating: false });
const error = ref(null);
const currentUserId = ref(getCurrentUserId());

// Filter states
const selectedClass = ref("all");
const selectedStatus = ref("all");
const selectedGender = ref("all");
const searchQuery = ref("");

// Available classes and locations
const classes = ref([]);
const locations = ref([]);

// Create post modal state
const showCreatePostModal = ref(false);
const showErrorAlert = ref(false);

// Post form data - Updated to match backend schema
const postForm = ref({
  content: "",
  visibility: "public",
  tuition: {
    class: "",
    subjects: [], // Array of subject names
    remunation: "", // Changed from 'salary' to 'remunation'
    location: "", // Location name (will be converted to location_id in backend)
    preferred_gender: "Any",
    num_students: 1, // Added num_students field
    status: "Available",
  },
});

// Subject management
const newSubject = ref("");
const showAddSubject = ref(false);
const newClassName = ref("");
const newLocationName = ref("");

const predefinedClasses = [];

const filteredPosts = computed(() => {
  return posts.value.filter((post) => {
    if (!post.tuition_post) return false;

    // Class filter
    if (selectedClass.value !== "all" && post.tuition_post.class !== selectedClass.value) {
      return false;
    }

    // Status filter
    if (selectedStatus.value !== "all" && post.tuition_post.status !== selectedStatus.value) {
      return false;
    }

    // Gender filter
    if (selectedGender.value !== "all" && post.tuition_post.preferred_gender !== selectedGender.value) {
      return false;
    }

    // Search query
    if (searchQuery.value) {
      const searchLower = searchQuery.value.toLowerCase();
      const contentMatch = post.content.toLowerCase().includes(searchLower);
      const locationMatch = post.tuition_post.location?.toLowerCase().includes(searchLower);
      const subjectMatch = post.tuition_post.subjects?.some((subject) =>
        subject.toLowerCase().includes(searchLower)
      );
      return contentMatch || locationMatch || subjectMatch;
    }

    return true;
  });
});

const getCharacterCount = computed(() => {
  const count = postForm.value.content?.length || 0;
  const max = 5000;
  return {
    count,
    max,
    isNearLimit: count > max * 0.8,
    isAtLimit: count >= max,
  };
});

const canSubmitPost = computed(() => {
  return (
    postForm.value.content?.trim() &&
    postForm.value.tuition.class &&
    postForm.value.tuition.class !== "__new__" &&
    postForm.value.tuition.subjects.length > 0 &&
    postForm.value.tuition.remunation &&
    postForm.value.tuition.location &&
    postForm.value.tuition.location !== "__new__" &&
    !getCharacterCount.value.isAtLimit
  );
});

const fetchTuitionPosts = async () => {
  try {
    loading.value.posts = true;
    const groupPostsRes = await axios.get(`/api/groups/${TUITION_GROUP_ID}/posts`);

    const acceptedPosts = groupPostsRes.data.filter((post) => post.status === "Accepted");
    const postDetailsPromises = acceptedPosts.map((post) => axios.get(`/api/posts/${post.post_id}`));

    const postResponses = await Promise.all(postDetailsPromises);
    posts.value = postResponses.map((res) => (Array.isArray(res.data) ? res.data[0] : res.data));

    // Extract unique classes and locations
    const classSet = new Set();
    const locationSet = new Set();
    posts.value.forEach((post) => {
      if (post?.tuition_post?.class) {
        classSet.add(post.tuition_post.class);
      }
      if (post?.tuition_post?.location) {
        locationSet.add(post.tuition_post.location);
      }
    });
    classes.value = Array.from(classSet);
    locations.value = Array.from(locationSet);
  } catch (err) {
    error.value = err.response?.data?.error || err.message || "Failed to fetch tuition posts";
    console.error("Error fetching tuition posts:", err);
  } finally {
    loading.value.posts = false;
  }
};

const addSubject = () => {
  if (newSubject.value.trim()) {
    postForm.value.tuition.subjects.push(newSubject.value.trim());
    newSubject.value = "";
    showAddSubject.value = false;
  }
};

const removeSubject = (index) => {
  postForm.value.tuition.subjects.splice(index, 1);
};

const handleNewClass = () => {
  if (newClassName.value.trim()) {
    const className = newClassName.value.trim();
    postForm.value.tuition.class = className;
    if (!classes.value.includes(className)) {
      classes.value.push(className);
    }
    newClassName.value = "";
  }
};

const handleNewLocation = () => {
  if (newLocationName.value.trim()) {
    const locationName = newLocationName.value.trim();
    postForm.value.tuition.location = locationName;
    if (!locations.value.includes(locationName)) {
      locations.value.push(locationName);
    }
    newLocationName.value = "";
  }
};

const resetPostForm = () => {
  postForm.value = {
    content: "",
    visibility: "public",
    tuition: {
      class: "",
      subjects: [],
      remunation: "",
      location: "",
      preferred_gender: "Any",
      num_students: 1,
      status: "Available",
    },
  };
  newSubject.value = "";
  showAddSubject.value = false;
  showErrorAlert.value = false;
  newClassName.value = "";
  newLocationName.value = "";
};

const createTuitionPost = async () => {
  if (!canSubmitPost.value) return;

  try {
    loading.value.creating = true;
    showErrorAlert.value = false;

    if (postForm.value.tuition.preferred_gender === "Any") postForm.value.tuition.preferred_gender = null;

    const formData = new FormData();
    formData.append("content", postForm.value.content);
    formData.append("visibility", postForm.value.visibility);
    formData.append("tuition", JSON.stringify(postForm.value.tuition));

    await axios.post(`/api/groups/${TUITION_GROUP_ID}/posts`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    resetPostForm();
    showCreatePostModal.value = false;
    await fetchTuitionPosts();
  } catch (err) {
    error.value = err.response?.data?.error || "Failed to create tuition post";
    showErrorAlert.value = true;
    console.error("Error creating tuition post:", err);
  } finally {
    loading.value.creating = false;
  }
};

onMounted(async () => {
  await fetchTuitionPosts();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl px-4 py-6">
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Tuition</h1>
        <p class="mt-2 text-gray-600">Find and post tuition opportunities</p>
      </div>

      <!-- Create Post Button -->
      <button
        @click="showCreatePostModal = true"
        class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        <i class="fa-solid fa-plus"></i>
        Post Tuition
      </button>
    </div>

    <!-- Create Tuition Post Modal -->
    <div v-if="showCreatePostModal" class="fixed inset-0 z-50">
      <!-- Backdrop with blur -->
      <div class="absolute inset-0 bg-black/30 backdrop-blur-md" @click="showCreatePostModal = false"></div>

      <!-- Modal -->
      <div class="relative min-h-screen flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" @click.stop>
          <!-- Modal Header -->
          <div class="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10">
            <h2 class="text-xl font-bold">Create Tuition Post</h2>
            <button
              @click="showCreatePostModal = false"
              class="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition-colors"
            >
              <i class="fa-solid fa-times"></i>
            </button>
          </div>

          <!-- Error Alert -->
          <div
            v-if="showErrorAlert && error"
            class="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <i class="fa-solid fa-circle-exclamation text-red-500"></i>
                <p class="text-red-700">{{ error }}</p>
              </div>
              <button
                type="button"
                @click="showErrorAlert = false"
                class="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <i class="fa-solid fa-times"></i>
              </button>
            </div>
          </div>

          <form @submit.prevent="createTuitionPost" class="p-6 space-y-6">
            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tuition Description *</label>
              <textarea
                v-model="postForm.content"
                rows="4"
                placeholder="Describe the tuition opportunity, requirements, and any additional details..."
                class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 resize-none"
                :class="{
                  'border-red-300 focus:border-red-500': getCharacterCount.isAtLimit,
                  'border-yellow-300 focus:border-yellow-500':
                    getCharacterCount.isNearLimit && !getCharacterCount.isAtLimit,
                }"
                maxlength="5000"
                required
              ></textarea>
              <div class="flex justify-end items-center mt-1">
                <div
                  class="text-xs mt-1"
                  :class="{
                    'text-red-500': getCharacterCount.isAtLimit,
                    'text-yellow-600': getCharacterCount.isNearLimit && !getCharacterCount.isAtLimit,
                    'text-gray-500': !getCharacterCount.isNearLimit,
                  }"
                >
                  {{ getCharacterCount.count }}/{{ getCharacterCount.max }}
                </div>
              </div>
            </div>

            <!-- Class and Location -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Class -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Class *</label>
                <div class="space-y-2">
                  <select
                    v-model="postForm.tuition.class"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Class</option>
                    <option
                      v-for="className in [...new Set([...predefinedClasses, ...classes])]"
                      :key="className"
                      :value="className"
                    >
                      {{ className }}
                    </option>
                    <option value="__new__">+ Add New Class</option>
                  </select>

                  <!-- New Class Input -->
                  <input
                    v-if="postForm.tuition.class === '__new__'"
                    v-model="newClassName"
                    type="text"
                    placeholder="Enter class name (e.g., O Level, Admission)"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    @blur="handleNewClass"
                    @keydown.enter="handleNewClass"
                    required
                  />
                </div>
              </div>

              <!-- Location -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <div class="space-y-2">
                  <select
                    v-model="postForm.tuition.location"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Location</option>
                    <option v-for="location in locations" :key="location" :value="location">
                      {{ location }}
                    </option>
                    <option value="__new__">+ Add New Location</option>
                  </select>

                  <!-- New Location Input -->
                  <input
                    v-if="postForm.tuition.location === '__new__'"
                    v-model="newLocationName"
                    type="text"
                    placeholder="Enter location (e.g., Dhanmondi, Gulshan)"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    @blur="handleNewLocation"
                    @keydown.enter="handleNewLocation"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- Subjects -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-700">Subjects *</label>
                <button
                  type="button"
                  @click="showAddSubject = true"
                  class="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <i class="fa-solid fa-plus"></i>
                  Add Subject
                </button>
              </div>

              <!-- Existing Subjects -->
              <div v-if="postForm.tuition.subjects.length > 0" class="mb-3 space-y-2">
                <div
                  v-for="(subject, index) in postForm.tuition.subjects"
                  :key="index"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <p class="font-medium text-sm">{{ subject }}</p>
                  <button
                    type="button"
                    @click="removeSubject(index)"
                    class="text-red-500 hover:text-red-700 p-1"
                  >
                    <i class="fa-solid fa-times"></i>
                  </button>
                </div>
              </div>

              <!-- Add Subject Form -->
              <div v-if="showAddSubject" class="border rounded-lg p-4 bg-gray-50">
                <div class="space-y-3">
                  <input
                    v-model="newSubject"
                    type="text"
                    placeholder="Subject name (e.g., Mathematics, Physics)"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  <div class="flex gap-2">
                    <button
                      type="button"
                      @click="addSubject"
                      :disabled="!newSubject.trim()"
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 text-sm"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      @click="
                        showAddSubject = false;
                        newSubject = '';
                      "
                      class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              <p class="text-xs text-gray-500 mt-1">
                {{
                  postForm.tuition.subjects.length > 0
                    ? `${postForm.tuition.subjects.length} subject(s) added`
                    : "No subjects added yet"
                }}
              </p>
            </div>

            <!-- Remuneration and Number of Students -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Remuneration -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Remuneration (BDT) *</label>
                <input
                  v-model="postForm.tuition.remunation"
                  type="number"
                  min="0"
                  placeholder="Monthly remuneration"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <!-- Number of Students -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Number of Students</label>
                <select
                  v-model="postForm.tuition.num_students"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" :key="num" :value="num">
                    {{ num }} student{{ num > 1 ? "s" : "" }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Preferred Gender -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Preferred Tutor Gender</label>
              <select
                v-model="postForm.tuition.preferred_gender"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Any">Any</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <!-- Form Actions -->
            <div class="sticky bottom-0 bg-white pt-4 pb-2 -mx-6 px-6 border-t flex justify-end gap-3">
              <button
                type="button"
                @click="showCreatePostModal = false"
                class="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="!canSubmitPost || loading.creating"
                class="px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2"
                :class="{
                  'bg-blue-600 hover:bg-blue-700': canSubmitPost && !loading.creating,
                  'bg-gray-300 cursor-not-allowed': !canSubmitPost || loading.creating,
                }"
              >
                <i v-if="loading.creating" class="fa-solid fa-spinner fa-spin"></i>
                <i v-else class="fa-solid fa-plus"></i>
                {{ loading.creating ? "Creating..." : "Post Tuition" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-6 grid gap-4 md:grid-cols-4">
      <!-- Search -->
      <div class="col-span-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by subject, location, or description..."
          class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <!-- Class Filter -->
      <select
        v-model="selectedClass"
        class="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
      >
        <option value="all">All Classes</option>
        <option v-for="className in classes" :key="className" :value="className">
          {{ className }}
        </option>
      </select>

      <!-- Status Filter -->
      <select
        v-model="selectedStatus"
        class="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
      >
        <option value="all">All Status</option>
        <option value="Available">Available</option>
        <option value="Booked">Booked</option>
      </select>

      <!-- Gender Filter -->
      <select
        v-model="selectedGender"
        class="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
      >
        <option value="all">All Genders</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading.posts" class="py-12 text-center">
      <div
        class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"
      ></div>
      <p class="mt-4 text-gray-600">Loading tuition posts...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error && !showErrorAlert" class="rounded-lg bg-red-50 p-4 text-center text-red-600">
      {{ error }}
      <button @click="fetchTuitionPosts" class="mt-2 text-sm font-medium text-red-700 hover:text-red-800">
        Try again
      </button>
    </div>

    <!-- Posts Grid -->
    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <TuitionPost v-for="post in filteredPosts" :key="post.post_id" :post="post" />
    </div>

    <!-- Empty State -->
    <div v-if="!loading.posts && !error && filteredPosts.length === 0" class="py-12 text-center">
      <i class="fa-solid fa-chalkboard-user mb-4 text-4xl text-gray-400"></i>
      <h3 class="text-lg font-medium text-gray-900">No tuition posts found</h3>
      <p class="mt-1 text-gray-500">Try adjusting your filters or search query</p>
    </div>
  </div>
</template>
