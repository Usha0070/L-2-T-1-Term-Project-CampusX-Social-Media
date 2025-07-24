<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- Main Content Area - Centered -->
    <div class="w-full lg:w-[768px] mx-auto">
      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-4">My Groups</h2>
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

// IDs to exclude (marketplace and tuition)
const excludeGroupIds = [4, 5];

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

onMounted(async () => {
  await fetchGroups();
});
</script>
