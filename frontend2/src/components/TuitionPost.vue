<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "../utils/axios";
import { getCurrentUserId } from "../utils/auth";

const router = useRouter();
const currentUserId = getCurrentUserId();

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["postUpdated", "postDeleted"]);

// Edit modal state
const showEditModal = ref(false);
const loading = ref({ updating: false, deleting: false });
const error = ref(null);
const showErrorAlert = ref(false);
const showDeleteConfirm = ref(false);

// Edit form data
const editForm = ref({
  content: "",
  tuition: {
    class: "",
    subjects: [],
    remunation: "",
    location: "",
    preferred_gender: "Any",
    num_students: 1,
    status: "Available",
  },
});

// Subject management for edit form
const newSubject = ref("");
const showAddSubject = ref(false);

const isAuthor = computed(() => {
  return currentUserId && props.post.author_id === currentUserId;
});

const getCharacterCount = computed(() => {
  const count = editForm.value.content?.length || 0;
  const max = 5000;
  return {
    count,
    max,
    isNearLimit: count > max * 0.8,
    isAtLimit: count >= max,
  };
});

const canSubmitEdit = computed(() => {
  return (
    editForm.value.content?.trim() &&
    editForm.value.tuition.class &&
    editForm.value.tuition.subjects.length > 0 &&
    editForm.value.tuition.remunation &&
    editForm.value.tuition.location &&
    !getCharacterCount.value.isAtLimit
  );
});

const goToChat = async () => {
  const response = await axios.get(`/api/chats/with/${props.post.author_id}`);
  router.push(`/chats/${response.data.chat_id}`);
};

const openEditModal = () => {
  // Populate edit form with current post data
  editForm.value = {
    content: props.post.content,
    tuition: {
      class: props.post.tuition_post.class,
      subjects: props.post.tuition_post.subjects.map((s) => (typeof s === "string" ? s : s.name)),
      remunation: props.post.tuition_post.remunation,
      location: props.post.tuition_post.location,
      preferred_gender: props.post.tuition_post.preferred_gender || "Any",
      num_students: props.post.tuition_post.num_students,
      status: props.post.tuition_post.status,
    },
  };
  showEditModal.value = true;
  showErrorAlert.value = false;
};

const addSubject = () => {
  if (newSubject.value.trim()) {
    editForm.value.tuition.subjects.push(newSubject.value.trim());
    newSubject.value = "";
    showAddSubject.value = false;
  }
};

const removeSubject = (index) => {
  editForm.value.tuition.subjects.splice(index, 1);
};

const updatePost = async () => {
  if (!canSubmitEdit.value) return;

  try {
    loading.value.updating = true;
    showErrorAlert.value = false;

    if (editForm.value.tuition.preferred_gender === "Any") editForm.value.tuition.preferred_gender = null;

    const formData = new FormData();
    formData.append("content", editForm.value.content);
    formData.append("visibility", "public");
    formData.append("tuition", JSON.stringify(editForm.value.tuition));

    await axios.put(`/api/posts/${props.post.post_id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    showEditModal.value = false;
    emit("postUpdated");
  } catch (err) {
    error.value = err.response?.data?.error || "Failed to update post";
    showErrorAlert.value = true;
    console.error("Error updating post:", err);
  } finally {
    loading.value.updating = false;
  }
};

const deletePost = async () => {
  try {
    loading.value.deleting = true;
    await axios.delete(`/api/posts/${props.post.post_id}`);
    showEditModal.value = false;
    showDeleteConfirm.value = false;
    emit("postDeleted", props.post.post_id);
  } catch (err) {
    error.value = err.response?.data?.error || "Failed to delete post";
    showErrorAlert.value = true;
    console.error("Error deleting post:", err);
  } finally {
    loading.value.deleting = false;
  }
};

const resetEditForm = () => {
  editForm.value = {
    content: "",
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
};
</script>

<template>
  <div
    class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md flex flex-col"
  >
    <!-- Status Banner -->
    <div
      :class="{
        'bg-green-100 text-green-800': post.tuition_post.status === 'Available',
        'bg-red-100 text-red-800': post.tuition_post.status === 'Booked',
      }"
      class="px-4 py-2 text-sm font-medium"
    >
      {{ post.tuition_post.status }}
    </div>

    <!-- Tuition Details -->
    <div class="flex flex-col flex-grow p-4">
      <!-- Title and Remuneration -->
      <div class="mb-4">
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-medium text-gray-900 line-clamp-2">{{ post.content }}</h3>
        </div>
        <!-- Subject Tags -->
        <div class="flex flex-wrap gap-2">
          <span
            v-for="subject in post.tuition_post.subjects"
            :key="typeof subject === 'string' ? subject : subject.name"
            class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
          >
            {{ typeof subject === "string" ? subject : subject.name }}
          </span>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="space-y-2 text-sm text-gray-600">
        <div class="flex items-center">
          <i class="fa-solid fa-graduation-cap mr-2"></i>
          <span>{{ post.tuition_post.class }}</span>
        </div>
        <div class="flex items-center">
          <i class="fa-solid fa-location-dot mr-2"></i>
          <span>{{ post.tuition_post.location }}</span>
        </div>
        <div class="flex items-center">
          <i class="fa-solid fa-users mr-2"></i>
          <span>{{ post.tuition_post.num_students }} student(s)</span>
        </div>
        <div class="flex items-center">
          <i class="fa-solid fa-venus-mars mr-2"></i>
          <span>Preferred: {{ post.tuition_post.preferred_gender || "Any" }}</span>
        </div>
      </div>

      <!-- Post Info -->
      <div class="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>
          <i class="fa-regular fa-clock mr-1"></i>
          {{ new Date(post.created_at).toLocaleDateString() }}
        </span>
        <span>
          <p class="text-lg font-bold text-blue-600 ml-2">৳{{ post.tuition_post.remunation }}/mo</p>
        </span>
      </div>
    </div>

    <!-- Action Button -->
    <div class="p-4 pt-0">
      <button
        v-if="!isAuthor"
        @click="goToChat"
        class="w-full rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
      >
        Apply Now
      </button>

      <button
        v-else
        @click="openEditModal"
        class="w-full rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
      >
        Edit Post
      </button>
    </div>

    <!-- Edit Post Modal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50">
      <!-- Backdrop with blur -->
      <div class="absolute inset-0 bg-black/30 backdrop-blur-md" @click="showEditModal = false"></div>

      <!-- Modal -->
      <div class="relative min-h-screen flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" @click.stop>
          <!-- Modal Header -->
          <div class="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10">
            <h2 class="text-xl font-bold">Edit Tuition Post</h2>
            <button
              @click="showEditModal = false"
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

          <form @submit.prevent="updatePost" class="p-6 space-y-6">
            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tuition Description *</label>
              <textarea
                v-model="editForm.content"
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
                <input
                  v-model="editForm.tuition.class"
                  type="text"
                  placeholder="e.g., O Level, A Level, Admission"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <!-- Location -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  v-model="editForm.tuition.location"
                  type="text"
                  placeholder="e.g., Dhanmondi, Gulshan"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
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
              <div v-if="editForm.tuition.subjects.length > 0" class="mb-3 space-y-2">
                <div
                  v-for="(subject, index) in editForm.tuition.subjects"
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
                  editForm.tuition.subjects.length > 0
                    ? `${editForm.tuition.subjects.length} subject(s) added`
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
                  v-model="editForm.tuition.remunation"
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
                  v-model="editForm.tuition.num_students"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" :key="num" :value="num">
                    {{ num }} student{{ num > 1 ? "s" : "" }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Preferred Gender and Status -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Preferred Gender -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Preferred Tutor Gender</label>
                <select
                  v-model="editForm.tuition.preferred_gender"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Any">Any</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <!-- Status -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  v-model="editForm.tuition.status"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Available">Available</option>
                  <option value="Booked">Booked</option>
                </select>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="sticky bottom-0 bg-white pt-4 pb-2 -mx-6 px-6 border-t flex justify-between">
              <!-- Delete Button -->
              <button
                type="button"
                @click="showDeleteConfirm = true"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <i class="fa-solid fa-trash"></i>
                Delete
              </button>

              <!-- Save/Cancel Buttons -->
              <div class="flex gap-3">
                <button
                  type="button"
                  @click="showEditModal = false"
                  class="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="!canSubmitEdit || loading.updating"
                  class="px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2"
                  :class="{
                    'bg-blue-600 hover:bg-blue-700': canSubmitEdit && !loading.updating,
                    'bg-gray-300 cursor-not-allowed': !canSubmitEdit || loading.updating,
                  }"
                >
                  <i v-if="loading.updating" class="fa-solid fa-spinner fa-spin"></i>
                  <i v-else class="fa-solid fa-save"></i>
                  {{ loading.updating ? "Updating..." : "Update Post" }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/30 backdrop-blur-md" @click="showDeleteConfirm = false"></div>
      <div class="relative min-h-screen flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md" @click.stop>
          <div class="p-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <i class="fa-solid fa-exclamation-triangle text-red-600 text-xl"></i>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Delete Post</h3>
                <p class="text-gray-600">
                  Are you sure you want to delete this tuition post? This action cannot be undone.
                </p>
              </div>
            </div>
            <div class="flex gap-3 justify-end">
              <button
                @click="showDeleteConfirm = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                @click="deletePost"
                :disabled="loading.deleting"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-300 flex items-center gap-2"
              >
                <i v-if="loading.deleting" class="fa-solid fa-spinner fa-spin"></i>
                <i v-else class="fa-solid fa-trash"></i>
                {{ loading.deleting ? "Deleting..." : "Delete" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
