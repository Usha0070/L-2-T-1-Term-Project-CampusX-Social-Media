import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Navbar from "./layouts/Navbar";
import Login from "./pages/Login";
import RegisterNew from "./pages/RegisterNew";
import Newsfeed from './pages/Newsfeed';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route
            path="/"
            element={
              <div
                className="d-flex flex-column justify-content-center align-items-center text-center"
                style={{ height: "70vh", gap: "1.5rem" }}
              >
                <h1 className="fw-bold text-success" style={{ fontSize: "3rem" }}>
                  CampusX
                </h1>

                <h2 className="text-success fw-semibold">Welcome to CampusX</h2>

                <Link to="/login" className="btn btn-success btn-lg rounded-pill px-5">
                  Login
                </Link>

                <p style={{ marginTop: "1rem" }}>
                  Don't Have an Account?
                </p>

                <Link to="/register" className="btn btn-outline-success btn-lg rounded-pill px-5">
                  Register
                </Link>
              </div>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterNew />} />
          <Route path="/newsfeed" element={<Newsfeed />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
