import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "../utils/schemas/registerSchema";
import { useNavigate } from "react-router-dom";

const allowedCities = [
  "Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Jamalpur", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Mymensingh", "Narayanganj", "Narsingdi", "Netrokona", "Rajbari", "Shariatpur", "Sherpur", "Tangail", "Bogra", "Joypurhat", "Naogaon", "Natore", "Nawabganj", "Pabna", "Rajshahi", "Sirajgonj", "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon", "Barguna", "Barisal", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur", "Bandarban", "Brahmanbaria", "Chandpur", "Chittagong", "Comilla", "Cox''s Bazar", "Feni", "Khagrachari", "Lakshmipur", "Noakhali", "Rangamati", "Habiganj", "Maulvibazar", "Sunamganj", "Sylhet", "Bagerhat", "Chuadanga", "Jessore", "Jhenaidah", "Khulna", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira",
];

export default function RegisterNew() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(RegisterSchema),
  });

  const password = watch("password");

  const onSubmit = async (data) => {
    console.log("✅ onSubmit triggered", data);
    try {
      const response = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Registration successful! Your user ID: " + result.user_id);
        navigate("/login"); // ✅ Redirect to login
      } else {
        alert("Registration failed: " + result.error);
      }
    } catch (error) {
      alert("An error occurred: " + error.message);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh", padding: "1rem" }}
    >
      <div
        className="col-md-8 col-lg-7 p-4 shadow rounded"
        style={{ backgroundColor: "#e6f2e6" }}
      >
        <h2 className="mb-4 text-success text-center fw-bold">Register to CampusX</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            {/* First Name */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">First Name</label>
              <input
                {...register("first_name")}
                className={`form-control border-success ${errors.first_name ? "is-invalid" : ""}`}
              />
              {errors.first_name && <div className="invalid-feedback">{errors.first_name.message}</div>}
            </div>

            {/* Last Name */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">Last Name</label>
              <input
                {...register("last_name")}
                className={`form-control border-success ${errors.last_name ? "is-invalid" : ""}`}
              />
              {errors.last_name && <div className="invalid-feedback">{errors.last_name.message}</div>}
            </div>

            {/* Nickname */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">Nickname (optional)</label>
              <input {...register("nickname")} className="form-control border-success" />
            </div>

            {/* Student ID */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">Student ID</label>
              <input
                {...register("student_id")}
                className={`form-control border-success ${errors.student_id ? "is-invalid" : ""}`}
              />
              {errors.student_id && <div className="invalid-feedback">{errors.student_id.message}</div>}
            </div>

            {/* Batch */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">Batch</label>
              <input
                type="number"
                {...register("batch", { valueAsNumber: true })}
                className={`form-control border-success ${errors.batch ? "is-invalid" : ""}`}
              />
              {errors.batch && <div className="invalid-feedback">{errors.batch.message}</div>}
            </div>

            {/* Department */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">Department</label>
              <select
                {...register("department")}
                className={`form-select border-success ${errors.department ? "is-invalid" : ""}`}
              >
                <option value="">Select</option>
                {RegisterSchema.shape.department._def.values.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.department && <div className="invalid-feedback">{errors.department.message}</div>}
            </div>

            {/* Email */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">Email</label>
              <input
                {...register("email")}
                className={`form-control border-success ${errors.email ? "is-invalid" : ""}`}
              />
              {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
            </div>

            {/* Phone */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">Phone</label>
              <input {...register("phone")} className="form-control border-success" />
            </div>

            {/* Password */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">Password</label>
              <input
                type="password"
                {...register("password")}
                className={`form-control border-success ${errors.password ? "is-invalid" : ""}`}
              />
              {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
            </div>

            {/* Confirm Password */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">Confirm Password</label>
              <input
                type="password"
                className="form-control border-success"
                required
                onChange={(e) => {
                  e.target.setCustomValidity(e.target.value !== password ? "Passwords do not match" : "");
                }}
              />
            </div>

            {/* DOB */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">Date of Birth</label>
              <input
                {...register("date_of_birth")}
                className="form-control border-success"
                placeholder="YYYY-MM-DD"
              />
            </div>

            {/* Gender */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">Gender</label>
              <select {...register("gender")} className="form-select border-success">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Residence Type */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">Residence Type</label>
              <select {...register("residence_type")} className="form-select border-success">
                <option value="">Select</option>
                <option value="Resident">Resident</option>
                <option value="Attached">Attached</option>
              </select>
            </div>

            {/* Hall */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">Hall</label>
              <select {...register("hall")} className="form-select border-success">
                <option value="">Select</option>
                {RegisterSchema.shape.hall._def.values.map((hall) => (
                  <option key={hall} value={hall}>{hall}</option>
                ))}
              </select>
            </div>

            {/* Room No */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">Room No (optional)</label>
              <input {...register("room_no")} className="form-control border-success" />
            </div>

            {/* City */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">City</label>
              <select
                {...register("city_name")}
                className={`form-select border-success ${errors.city_name ? "is-invalid" : ""}`}
              >
                <option value="">Select your city</option>
                {allowedCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors.city_name && <div className="invalid-feedback">{errors.city_name.message}</div>}
            </div>
          </div>

          <button type="submit" className="btn btn-success fw-semibold mt-3 w-100">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
