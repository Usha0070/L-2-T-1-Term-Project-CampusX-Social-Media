<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
    <div class="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
      <h2 class="text-2xl font-bold text-blue-700 mb-6 text-center">CampusX Register</h2>
      <RegisterForm />
      <div class="mt-4 text-center">
        <router-link to="/login" class="text-blue-600 hover:underline"
          >Already have an account? Login</router-link
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import RegisterForm from "../components/RegisterForm.vue";
</script>
