import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  }

  return (
    <button className="btn btn-danger ms-3" onClick={handleLogout}>
      Logout
    </button>
  );
}
