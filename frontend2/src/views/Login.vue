<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
    <div class="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
      <h2 class="text-2xl font-bold text-blue-700 mb-6 text-center">CampusX Login</h2>
      <LoginForm />
      <div class="mt-4 text-center">
        <router-link to="/register" class="text-blue-600 hover:underline"
          >Don't have an account? Register</router-link
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import LoginForm from "../components/LoginForm.vue";
</script>
