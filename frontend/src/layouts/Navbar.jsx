import { Link, useLocation } from "react-router-dom";
import Logout from "../components/Logout";

export default function Navbar() {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const location = useLocation();

  // Hide login/register in navbar only on the front page "/"
  const showAuthLinks = location.pathname !== "/";

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-success-subtle shadow-sm">
      <div className="container">
        <Link
          className="navbar-brand fw-bold text-success"
          to="/"
          style={{ fontSize: "1.5rem" }}
        >
          Campus<span style={{ color: "#155d27" }}>X</span>
        </Link>

        <div className="d-flex ms-auto gap-3">
          {loggedInUser ? (
            <>
              <span className="nav-link text-dark">Hello, {loggedInUser.identifier}</span>
              <Logout />
            </>
          ) : (
            showAuthLinks && (
              <>
                <Link to="/login" className="btn btn-outline-success rounded-pill px-4">
                  Login
                </Link>
                <Link to="/register" className="btn btn-success rounded-pill px-4">
                  Register
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
