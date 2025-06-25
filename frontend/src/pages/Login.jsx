import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "../utils/schemas/loginSchema";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(LoginSchema)
  });

  const onSubmit = (data) => {
    const { identifier } = data;
    localStorage.setItem("loggedInUser", JSON.stringify({ identifier }));
    navigate("/newsfeed");
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh", padding: "1rem" }}
    >
      <div
        className="col-md-6 col-lg-5 p-4 shadow rounded"
        style={{ backgroundColor: "#e6f2e6" }}
      >
        <h2 className="mb-4 text-success text-center fw-bold">Login to CampusX</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <label htmlFor="identifier" className="form-label fw-semibold text-success">
              Email or Student ID
            </label>
            <input
              type="text"
              className={`form-control border-success ${
                errors.identifier ? "is-invalid" : ""
              }`}
              id="identifier"
              {...register("identifier")}
              placeholder="Enter your email or student ID"
              autoFocus
            />
            {errors.identifier && (
              <div className="invalid-feedback">{errors.identifier.message}</div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-semibold text-success">
              Password
            </label>
            <input
              type="password"
              className={`form-control border-success ${
                errors.password ? "is-invalid" : ""
              }`}
              id="password"
              {...register("password")}
              placeholder="Enter your password"
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password.message}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-success w-100 rounded-pill py-2 fw-semibold"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
