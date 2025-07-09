import { Link, useLocation } from "react-router-dom";
import Logout from "../components/Logout";

export default function Navbar() {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const location = useLocation();

  // Hide login/register in navbar only on the front page "/"
  const showAuthLinks = location.pathname !== "/";

  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm"
      style={{ backgroundColor: "#1b4d28" }} // dark green background
    >
      <div className="container d-flex align-items-center">
        {/* Brand */}
        <Link
          className="navbar-brand fw-bold"
          to="/"
          style={{ fontSize: "1.5rem", color: "#a5d6a7" }} // lighter green for brand
        >
          Campus
          <span style={{ color: "#81c784" }}>X</span>
        </Link>

        <div className="d-flex ms-auto align-items-center gap-3">
          {loggedInUser ? (
            <>
              {/* Greeting */}
              <span
                className="nav-link mb-0"
                style={{ color: "#c8e6c9", userSelect: "none" }}
              >
                Hello User {loggedInUser.nickname || loggedInUser.identifier}
              </span>

              {/* Logout button/component */}
              <Logout />
            </>
          ) : (
            showAuthLinks && (
              <>
                <Link
                  to="/login"
                  className="btn btn-outline-light rounded-pill px-4"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-light rounded-pill px-4"
                >
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
