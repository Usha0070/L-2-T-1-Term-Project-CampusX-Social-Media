import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "../utils/schemas/loginSchema";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export async function callLogin(student_id, password) {
  try {
    console.log("Sending login data:", { student_id, password });
    const response = await axios.post("http://localhost:5000/auth/login", {
      student_id, // number here
      password,
    });
    const { user_id, accessToken } = response.data;
    console.log("Login successful. User ID:", user_id);
    return { user_id, token: accessToken };
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
  }
}

export default function Login() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data) => {
  // Convert student_id string from form input to number
  const student_id = Number(data.student_id);

  if (isNaN(student_id)) {
    alert("Invalid Student ID format. Please enter numbers only.");
    return;
  }

  const password = data.password;

  try {
    const { user_id, token } = await callLogin(student_id, password);
    localStorage.setItem("loggedInUser", JSON.stringify({ user_id, token }));
    alert(`Login Successful!\n\nWelcome User ID: ${user_id}`);
    navigate("/newsfeed");
  } catch (err) {
    alert("Login failed: " + (err.response?.data?.message || err.message));
  }
};



  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh", padding: "1rem" }}
    >
      <div className="col-md-6 col-lg-5 p-4 shadow rounded" style={{ backgroundColor: "#e6f2e6" }}>
        <h2 className="mb-4 text-success text-center fw-bold">Login to CampusX</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <label htmlFor="student_id" className="form-label fw-semibold text-success">
            Student ID
            </label>
            <input
              type="text"
              className={`form-control border-success ${
                errors.student_id ? "is-invalid" : ""
              }`}
            id="student_id"
            {...register("student_id")}
          placeholder="Enter your student ID"
        autoFocus
/>
{errors.student_id && (
  <div className="invalid-feedback">{errors.student_id.message}</div>
)}

          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-semibold text-success">
              Password
            </label>
            <input
              type="password"
              className={`form-control border-success ${errors.password ? "is-invalid" : ""}`}
              id="password"
              {...register("password")}
              placeholder="Enter your password"
            />
            {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
          </div>

          <button type="submit" className="btn btn-success w-100 rounded-pill py-2 fw-semibold">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}