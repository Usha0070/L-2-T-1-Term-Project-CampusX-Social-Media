import { useState } from "react";
import { RegisterSchema } from "../utils/schemas/registerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function Register() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(RegisterSchema),
  });

  const password = watch("password");

  const onSubmit = (data) => {
    alert("Registration Successful!\n\n" + JSON.stringify(data, null, 2));
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
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="row">
            {/* First Name */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">First Name</label>
              <input
                {...register("first_name")}
                className={`form-control border-success ${
                  errors.first_name ? "is-invalid" : ""
                }`}
              />
              {errors.first_name && (
                <div className="invalid-feedback">{errors.first_name.message}</div>
              )}
            </div>

            {/* Last Name */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">Last Name</label>
              <input
                {...register("last_name")}
                className={`form-control border-success ${
                  errors.last_name ? "is-invalid" : ""
                }`}
              />
              {errors.last_name && (
                <div className="invalid-feedback">{errors.last_name.message}</div>
              )}
            </div>

            {/* Nickname (optional) */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">Nickname (optional)</label>
              <input {...register("nickname")} className="form-control border-success" />
            </div>

            {/* Student ID */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">Student ID</label>
              <input
                {...register("student_id")}
                className={`form-control border-success ${
                  errors.student_id ? "is-invalid" : ""
                }`}
              />
              {errors.student_id && (
                <div className="invalid-feedback">{errors.student_id.message}</div>
              )}
            </div>

            {/* Batch */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">Batch</label>
              <input
                type="number"
                {...register("batch")}
                className="form-control border-success"
              />
            </div>

            {/* Department */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">Department</label>
              <select
                {...register("department")}
                className={`form-select border-success ${
                  errors.department ? "is-invalid" : ""
                }`}
              >
                <option value="">Select</option>
                {RegisterSchema.shape.department._def.values.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && (
                <div className="invalid-feedback">{errors.department.message}</div>
              )}
            </div>

            {/* Email */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">Email</label>
              <input
                {...register("email")}
                className={`form-control border-success ${
                  errors.email ? "is-invalid" : ""
                }`}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
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
                className={`form-control border-success ${
                  errors.password ? "is-invalid" : ""
                }`}
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password.message}</div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">Confirm Password</label>
              <input
                type="password"
                className={`form-control border-success ${
                  errors.confirm_password ? "is-invalid" : ""
                }`}
                required
                onChange={(e) => {
                  if (e.target.value !== password) {
                    e.target.setCustomValidity("Passwords do not match");
                  } else {
                    e.target.setCustomValidity("");
                  }
                }}
              />
              {/* No error because confirm password handled by HTML5 validation here */}
            </div>

            {/* Date of Birth */}
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
                  <option key={hall} value={hall}>
                    {hall}
                  </option>
                ))}
              </select>
            </div>

            {/* Room No (optional) */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">Room No (optional)</label>
              <input {...register("room_no")} className="form-control border-success" />
            </div>

            {/* City */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-success">City</label>
              <input {...register("city_name")} className="form-control border-success" />
            </div>
          </div>

          <button type="submit" className="btn btn-success w-100 rounded-pill py-2 fw-semibold">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
