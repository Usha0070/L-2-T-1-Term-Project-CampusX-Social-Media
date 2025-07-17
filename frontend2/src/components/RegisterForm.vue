<template>
  <form @submit.prevent="onSubmit" class="flex flex-col gap-6">
    <!-- Personal Information -->
    <div class="grid grid-cols-3 gap-4">
      <div>
        <label class="block text-gray-700 font-medium">First Name</label>
        <input
          v-model="first_name"
          type="text"
          required
          placeholder="Enter your first name"
          class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div>
        <label class="block text-gray-700 font-medium">Last Name</label>
        <input
          v-model="last_name"
          type="text"
          required
          placeholder="Enter your last name"
          class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div>
        <label class="block text-gray-700 font-medium">Nickname</label>
        <input
          v-model="nickname"
          type="text"
          placeholder="Optional"
          class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
    </div>

    <!-- Academic Information -->
    <div class="grid grid-cols-3 gap-4">
      <div>
        <label class="block text-gray-700 font-medium">Student ID</label>
        <input
          v-model="student_id"
          type="text"
          required
          pattern="[0-9]+"
          placeholder="Enter your student ID"
          class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div>
        <label class="block text-gray-700 font-medium">Batch</label>
        <input
          v-model.number="batch"
          type="number"
          required
          min="1960"
          :max="new Date().getFullYear()"
          placeholder="Enter your batch year"
          class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div>
        <label class="block text-gray-700 font-medium">Department</label>
        <select
          v-model="department"
          required
          class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option disabled value="">Select Department</option>
          <option v-for="d in departments" :key="d" :value="d">{{ d }}</option>
        </select>
      </div>
    </div>

    <!-- Personal Details -->
    <div class="grid grid-cols-3 gap-4">
      <div>
        <label class="block text-gray-700 font-medium">Date of Birth</label>
        <input
          v-model="date_of_birth"
          type="date"
          required
          max="2010-12-31"
          min="1960-01-01"
          class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div>
        <label class="block text-gray-700 font-medium">Gender</label>
        <select
          v-model="gender"
          required
          class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option disabled value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>
      <div>
        <label class="block text-gray-700 font-medium">City</label>
        <select
          v-model="city_name"
          required
          class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option disabled value="">Select City</option>
          <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
        </select>
      </div>
    </div>

    <!-- Contact Information -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-gray-700 font-medium">Email</label>
        <input
          v-model="email"
          type="email"
          required
          placeholder="Enter your email"
          class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div>
        <label class="block text-gray-700 font-medium">Phone</label>
        <input
          v-model="phone"
          type="tel"
          required
          pattern="[0-9]+"
          placeholder="Enter your phone number"
          class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
    </div>

    <!-- Residence Information -->
    <div class="grid grid-cols-3 gap-4">
      <div>
        <label class="block text-gray-700 font-medium">Residence Type</label>
        <select
          v-model="residence_type"
          required
          class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option disabled value="">Select Type</option>
          <option value="Resident">Resident</option>
          <option value="Attached">Attached</option>
        </select>
      </div>
      <div>
        <label class="block text-gray-700 font-medium">Hall</label>
        <select
          v-model="hall"
          required
          class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option disabled value="">Select Hall</option>
          <option v-for="h in halls" :key="h" :value="h">{{ h }}</option>
        </select>
      </div>
      <div>
        <label class="block text-gray-700 font-medium">Room No</label>
        <input
          v-model="room_no"
          type="text"
          placeholder="Optional"
          class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
    </div>

    <!-- Password -->
    <div>
      <label class="block text-gray-700 font-medium">Password</label>
      <div class="relative">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          required
          placeholder="Create a strong password"
          class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          <svg
            v-if="!showPassword"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
            />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
            />
          </svg>
        </button>
      </div>
    </div>
    <button type="submit" class="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
      Register
    </button>
    <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>
  </form>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "../utils/axios";

const first_name = ref("");
const last_name = ref("");
const nickname = ref("");
const student_id = ref("");
const batch = ref("");
const department = ref("");
const email = ref("");
const phone = ref("");
const password = ref("");
const date_of_birth = ref("");
const gender = ref("");
const residence_type = ref("");
const hall = ref("");
const room_no = ref("");
const city_name = ref("");
const error = ref("");
const showPassword = ref(false);
const router = useRouter();

const departments = [
  "CSE",
  "EEE",
  "ME",
  "CE",
  "BME",
  "ChE",
  "MME",
  "IPE",
  "NCE",
  "NAME",
  "WRE",
  "ARC",
  "URP",
];

const halls = ["AUH", "SWH", "SBH", "TH", "RH", "NH", "ShH", "SoH"];

const cities = [
  "Dhaka",
  "Faridpur",
  "Gazipur",
  "Gopalganj",
  "Jamalpur",
  "Kishoreganj",
  "Madaripur",
  "Manikganj",
  "Munshiganj",
  "Mymensingh",
  "Narayanganj",
  "Narsingdi",
  "Netrokona",
  "Rajbari",
  "Shariatpur",
  "Sherpur",
  "Tangail",
  "Bogra",
  "Joypurhat",
  "Naogaon",
  "Natore",
  "Nawabganj",
  "Pabna",
  "Rajshahi",
  "Sirajgonj",
  "Dinajpur",
  "Gaibandha",
  "Kurigram",
  "Lalmonirhat",
  "Nilphamari",
  "Panchagarh",
  "Rangpur",
  "Thakurgaon",
  "Barguna",
  "Barisal",
  "Bhola",
  "Jhalokati",
  "Patuakhali",
  "Pirojpur",
  "Bandarban",
  "Brahmanbaria",
  "Chandpur",
  "Chittagong",
  "Comilla",
  "Cox's Bazar",
  "Feni",
  "Khagrachari",
  "Lakshmipur",
  "Noakhali",
  "Rangamati",
  "Habiganj",
  "Maulvibazar",
  "Sunamganj",
  "Sylhet",
  "Bagerhat",
  "Chuadanga",
  "Jessore",
  "Jhenaidah",
  "Khulna",
  "Kushtia",
  "Magura",
  "Meherpur",
  "Narail",
  "Satkhira",
];

async function onSubmit() {
  error.value = "";
  try {
    const formData = {
      first_name: first_name.value,
      last_name: last_name.value,
      nickname: nickname.value || null,
      student_id: student_id.value,
      batch: Number(batch.value),
      department: department.value,
      email: email.value,
      phone: phone.value,
      password: password.value,
      date_of_birth: date_of_birth.value,
      gender: gender.value,
      residence_type: residence_type.value,
      hall: hall.value,
      room_no: room_no.value || null,
      city_name: city_name.value,
    };

    const res = await axios.post("/api/auth/register", formData);
    localStorage.setItem("user_id", res.data.user_id);
    localStorage.setItem("token", res.data.accessToken);
    router.push("/");
  } catch (err) {
    error.value = err.response?.data?.error || err.message || "Registration failed";
  }
}
</script>
