<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const name = ref('John Doe')
const status = ref(true)
const tasks = ref(['Task 1', 'Task 2', 'Task 3'])
const newTask = ref('')

const toggleStatus = () => {
  status.value = !status.value
}

const addTask = () => {
  if (newTask.value.trim() !== '') {
    tasks.value.push(newTask.value)
    newTask.value = ''
  }
}

const deleteTask = (index) => {
  tasks.value.splice(index, 1)
}

onMounted(async () => {
  try {
    const response = await axios.get('/api/todos')
    const data = response.data.slice(0,5)
    tasks.value = data.map((task) => task.title)
  } catch (error) {
    console.log('Error fetching')
  }
})

</script>

<template>
  <h1>Welcome to CampusX</h1>
  <h1>{{ name }}</h1>
  <p v-if="status">User is active</p>
  <p v-else>User is inactive</p>

  <form @submit.prevent="addTask">
    <label>Add Task</label>
    <input type="text" v-model="newTask">
    <button type="submit">Submit</button>
  </form>

  <h3>Tasks:</h3>
  <ul>
    <li v-for="(task, index) in tasks" :key="task">
      <span>
        {{ task }}
      </span>
      <button @click="deleteTask(index)">x</button>
    </li>
  </ul>
  <br />
  <button @click="toggleStatus">Change Status</button>

</template>