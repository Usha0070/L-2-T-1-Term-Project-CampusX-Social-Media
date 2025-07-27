<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- Main Content Area - Centered -->
    <div class="w-full lg:w-[768px] mx-auto">
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">My Groups</h2>
          <button
            @click="showCreateModal = true"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Create Group
          </button>
        </div>
        <div v-if="myGroups.length" class="space-y-4">
          <GroupCard
            v-for="group in myGroups"
            :key="group.group_id"
            :group="group"
            :is-member="true"
            @click="goToGroup(group.group_id)"
          />
        </div>
        <div v-else class="rounded-lg bg-gray-50 p-8 text-center">
          <p class="text-gray-500">You haven't joined any groups yet.</p>
        </div>
      </div>
      <div>
        <h2 class="text-2xl font-bold mb-4">All Groups</h2>
        <div class="space-y-4">
          <GroupCard
            v-for="group in allGroups"
            :key="group.group_id"
            :group="group"
            :is-member="isGroupMember(group.group_id)"
            @join="joinGroup(group.group_id)"
            @click="goToGroup(group.group_id)"
          />
        </div>
      </div>
    </div>

    <!-- Create Group Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black/30 bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-md"
      @click.self="closeCreateModal"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">Create New Group</h3>
          <button @click="closeCreateModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <form @submit.prevent="createGroup" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"> Group Name * </label>
            <input
              v-model="groupForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter group name"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"> Description </label>
            <textarea
              v-model="groupForm.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your group"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"> Public Group </label>
            <div class="flex items-center">
              <input
                v-model="groupForm.is_public"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label class="ml-2 text-sm text-gray-700"> Make this group public </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> Profile Picture </label>
            <div class="relative">
              <input
                ref="profilePicInput"
                @change="handleFileChange('profile_pic', $event)"
                type="file"
                accept="image/*"
                class="hidden"
              />
              <button
                type="button"
                @click="$refs.profilePicInput.click()"
                class="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
              >
                <div class="flex items-center space-x-3">
                  <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-gray-700">
                      {{
                        groupFiles.profile_pic ? groupFiles.profile_pic.name : "Browse for profile picture"
                      }}
                    </p>
                    <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> Cover Photo </label>
            <div class="relative">
              <input
                ref="coverPhotoInput"
                @change="handleFileChange('cover_photo', $event)"
                type="file"
                accept="image/*"
                class="hidden"
              />
              <button
                type="button"
                @click="$refs.coverPhotoInput.click()"
                class="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
              >
                <div class="flex items-center space-x-3">
                  <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-gray-700">
                      {{ groupFiles.cover_photo ? groupFiles.cover_photo.name : "Browse for cover photo" }}
                    </p>
                    <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closeCreateModal"
              class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isCreating"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isCreating ? "Creating..." : "Create Group" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "../utils/axios";
import GroupCard from "../components/GroupCard.vue";
import { getCurrentUserId } from "../utils/auth";

const router = useRouter();
const groups = ref([]);
const joinedGroupIds = ref([]);
const showCreateModal = ref(false);
const isCreating = ref(false);

// IDs to exclude (marketplace and tuition)
const excludeGroupIds = [4, 5];

// Form data for creating a group
const groupForm = ref({
  name: "",
  description: "",
  is_public: false,
});

const groupFiles = ref({
  profile_pic: null,
  cover_photo: null,
});

// Computed properties to filter groups
const myGroups = computed(() => {
  return groups.value.filter(
    (group) => joinedGroupIds.value.includes(group.group_id) && !excludeGroupIds.includes(group.group_id)
  );
});

const allGroups = computed(() => {
  return groups.value.filter((group) => !excludeGroupIds.includes(group.group_id));
});

const fetchGroups = async () => {
  try {
    const [groupsResponse, joinedResponse] = await Promise.all([
      axios.get("/api/groups"),
      axios.get("/api/groups/joined"),
    ]);
    groups.value = groupsResponse.data;
    joinedGroupIds.value = joinedResponse.data.map((group) => group.group_id);
  } catch (error) {
    console.error("Error fetching groups:", error);
    groups.value = [];
    joinedGroupIds.value = [];
  }
};

const isGroupMember = (groupId) => {
  return joinedGroupIds.value.includes(groupId);
};

const joinGroup = async (groupId) => {
  try {
    await axios.post(`/api/groups/${groupId}/members`, {
      user_id: getCurrentUserId(),
    });
    if (!joinedGroupIds.value.includes(groupId)) {
      joinedGroupIds.value.push(groupId);
    }
  } catch (error) {
    console.error("Error joining group:", error);
  }
};

const goToGroup = (groupId) => {
  router.push(`/groups/${groupId}`);
};

const handleFileChange = (fieldName, event) => {
  const file = event.target.files[0];
  if (file) {
    groupFiles.value[fieldName] = file;
  }
};

const createGroup = async () => {
  if (isCreating.value) return;

  try {
    isCreating.value = true;

    // Create FormData to handle file uploads
    const formData = new FormData();

    // Add text fields
    formData.append("name", groupForm.value.name);
    if (groupForm.value.description) {
      formData.append("description", groupForm.value.description);
    }
    formData.append("is_public", groupForm.value.is_public);

    // Add files if selected
    if (groupFiles.value.profile_pic) {
      formData.append("profile_pic", groupFiles.value.profile_pic);
    }
    if (groupFiles.value.cover_photo) {
      formData.append("cover_photo", groupFiles.value.cover_photo);
    }

    const response = await axios.post("/api/groups", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Refresh the groups list
    await fetchGroups();

    // Navigate to the newly created group
    if (response.data.group_id) {
      router.push(`/groups/${response.data.group_id}`);
    }

    closeCreateModal();
  } catch (error) {
    console.error("Error creating group:", error);
    // You might want to show an error message to the user here
  } finally {
    isCreating.value = false;
  }
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  // Reset form
  groupForm.value = {
    name: "",
    description: "",
    is_public: false,
  };
  groupFiles.value = {
    profile_pic: null,
    cover_photo: null,
  };
};

onMounted(async () => {
  await fetchGroups();
});
</script>
