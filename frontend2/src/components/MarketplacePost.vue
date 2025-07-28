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
  marketplace: {
    price: "",
    category: "",
    item_condition: "",
    status: "Available",
  },
});

// Media handling
const selectedFiles = ref([]);
const existingMedia = ref([]);
const mediaToDelete = ref([]);

const conditions = ref(["New", "Used"]);

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
    editForm.value.marketplace.price &&
    editForm.value.marketplace.category?.trim() &&
    editForm.value.marketplace.item_condition &&
    !getCharacterCount.value.isAtLimit
  );
});

const goToChat = async () => {
  try {
    const response = await axios.get(`/api/chats/with/${props.post.author_id}`);
    router.push(`/chats/${response.data.chat_id}`);
  } catch (err) {
    console.error("Error starting chat:", err);
  }
};

const openEditModal = () => {
  // Populate edit form with current post data
  editForm.value = {
    content: props.post.content,
    marketplace: {
      price: props.post.marketplace_post.price,
      category: props.post.marketplace_post.category,
      item_condition: props.post.marketplace_post.item_condition,
      status: props.post.marketplace_post.status,
    },
  };

  // Set existing media
  existingMedia.value = props.post.media || [];
  selectedFiles.value = [];
  mediaToDelete.value = [];

  showEditModal.value = true;
  showErrorAlert.value = false;
};

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  selectedFiles.value = [...selectedFiles.value, ...files];
};

const removeSelectedFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

const markMediaForDeletion = (mediaId) => {
  mediaToDelete.value.push(mediaId);
  existingMedia.value = existingMedia.value.filter((media) => media.id !== mediaId);
};

const updatePost = async () => {
  if (!canSubmitEdit.value) return;

  try {
    loading.value.updating = true;
    showErrorAlert.value = false;

    const formData = new FormData();
    formData.append("content", editForm.value.content);
    formData.append("visibility", "public");
    formData.append("market", JSON.stringify(editForm.value.marketplace));

    // Add new media files
    selectedFiles.value.forEach((file) => {
      formData.append("media", file);
    });

    // Fetch and add existing media files
    if (existingMedia.value.length > 0) {
      for (const media of existingMedia.value) {
        try {
          // Fetch the existing media file
          const response = await axios.get(`/meta${media.link}`, {
            responseType: "blob",
          });

          // Create a File object from the blob
          const file = new File([response.data], media.filename || "existing_media", {
            type: response.headers["content-type"] || "image/jpeg",
          });

          formData.append("media", file);
        } catch (fetchError) {
          console.warn(`Failed to fetch existing media ${media.id}:`, fetchError);
          // Continue with other media files even if one fails
        }
      }
    }

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
</script>

<template>
  <div
    class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md flex flex-col"
  >
    <!-- Item Image -->
    <div class="relative pt-[56.25%]">
      <img
        v-if="post.media?.[0]"
        :src="`/meta${post.media[0].link}`"
        :alt="post.content"
        class="absolute top-0 left-0 h-full w-full object-cover"
      />
      <div v-else class="absolute top-0 left-0 flex h-full w-full items-center justify-center bg-gray-200">
        <i class="fa-solid fa-image text-4xl text-gray-400"></i>
      </div>
    </div>

    <!-- Item Details -->
    <div class="flex flex-col flex-grow p-4">
      <!-- Title and Price -->
      <div class="mb-2">
        <div class="flex items-start justify-between mb-1">
          <p class="text-lg font-bold text-blue-600">৳{{ post.marketplace_post.price }}</p>
          <span
            :class="{
              'bg-green-100 text-green-800': post.marketplace_post.status === 'Available',
              'bg-red-100 text-red-800': post.marketplace_post.status === 'Sold',
            }"
            class="inline-block rounded-full px-2 py-1 text-xs font-medium"
          >
            {{ post.marketplace_post.status }}
          </span>
        </div>
        <h3 class="font-medium text-gray-900 line-clamp-2">{{ post.content }}</h3>
        <p class="text-sm text-gray-500">{{ post.marketplace_post.category }}</p>
      </div>

      <!-- Item Info -->
      <div class="flex items-center justify-between text-sm text-gray-500">
        <span>
          <i class="fa-solid fa-tag mr-1"></i>
          {{ post.marketplace_post.item_condition }}
        </span>
        <span>
          <i class="fa-regular fa-clock mr-1"></i>
          {{ new Date(post.created_at).toLocaleDateString() }}
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
        Contact Seller
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
      <div class="absolute inset-0 bg-black/30 backdrop-blur-md" @click="showEditModal = false"></div>

      <div class="relative min-h-screen flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" @click.stop>
          <!-- Modal Header -->
          <div class="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10">
            <h2 class="text-xl font-bold">Edit Marketplace Post</h2>
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
              <label class="block text-sm font-medium text-gray-700 mb-2">Item Description *</label>
              <textarea
                v-model="editForm.content"
                rows="4"
                placeholder="Describe the item..."
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

            <!-- Media Upload/Edit -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Photos</label>

              <!-- Existing Media -->
              <div v-if="existingMedia.length > 0" class="mb-4">
                <p class="text-sm text-gray-600 mb-2">Current Photos:</p>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div v-for="media in existingMedia" :key="media.id" class="relative group">
                    <img
                      :src="`/meta${media.link}`"
                      :alt="media.filename"
                      class="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      @click="markMediaForDeletion(media.id)"
                      class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <i class="fa-solid fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- New Media Upload -->
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  @change="handleFileSelect"
                  multiple
                  accept="image/*"
                  class="hidden"
                  id="media-upload"
                />
                <label for="media-upload" class="flex flex-col items-center justify-center cursor-pointer">
                  <i class="fa-solid fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                  <p class="text-sm text-gray-600">Click to upload photos</p>
                  <p class="text-xs text-gray-500">PNG, JPG up to 10MB each</p>
                </label>
              </div>

              <!-- Selected Files -->
              <div v-if="selectedFiles.length > 0" class="mt-4">
                <p class="text-sm text-gray-600 mb-2">New Photos to Upload:</p>
                <div class="space-y-2">
                  <div
                    v-for="(file, index) in selectedFiles"
                    :key="index"
                    class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div class="flex items-center gap-3">
                      <i class="fa-solid fa-image text-gray-400"></i>
                      <span class="text-sm text-gray-700">{{ file.name }}</span>
                      <span class="text-xs text-gray-500"
                        >({{ (file.size / 1024 / 1024).toFixed(2) }}MB)</span
                      >
                    </div>
                    <button
                      type="button"
                      @click="removeSelectedFile(index)"
                      class="text-red-500 hover:text-red-700 p-1"
                    >
                      <i class="fa-solid fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Price and Category -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Price (BDT) *</label>
                <input
                  v-model="editForm.marketplace.price"
                  type="number"
                  min="0"
                  placeholder="Enter price"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <input
                  v-model="editForm.marketplace.category"
                  type="text"
                  placeholder="e.g., Electronics, Books, Clothing"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <!-- Condition and Status -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
                <select
                  v-model="editForm.marketplace.item_condition"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option v-for="condition in conditions" :key="condition" :value="condition">
                    {{ condition }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  v-model="editForm.marketplace.status"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Available">Available</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="sticky bottom-0 bg-white pt-4 pb-2 -mx-6 px-6 border-t flex justify-between">
              <button
                type="button"
                @click="showDeleteConfirm = true"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <i class="fa-solid fa-trash"></i>
                Delete
              </button>

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
                  Are you sure you want to delete this marketplace post? This action cannot be undone.
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
