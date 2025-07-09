import React, { useEffect, useState } from "react";
import PostComponent from "../components/PostComponent";

function Newsfeed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);

  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  useEffect(() => {
    async function fetchFeed() {
      try {
        const token = JSON.parse(localStorage.getItem("loggedInUser"))?.token;
        if (!token) {
          setPosts([]);
          return;
        }
        const backendURL = "http://localhost:5000";
        const res = await fetch(`${backendURL}/users/me/feed`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setPosts([]);
          return;
        }
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          setPosts([]);
          return;
        }
        setPosts(prevPosts => (page === 1 ? data : [...prevPosts, ...data]));
      } catch {
        setPosts([]);
      }
    }
    fetchFeed();
  }, [page]);

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "20px auto",
        padding: "0 15px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#333",
      }}
    >
      {/* "What's on your mind?" Box - Always on top */}
      <div
        style={{
          backgroundColor: "#e6f2e6",
          borderRadius: 10,
          padding: 15,
          marginBottom: 20,
          boxShadow: "0 0 8px rgba(0,0,0,0.1)",
          fontWeight: "bold",
          fontSize: 16,
          color: "#2e7d32",
        }}
      >
        What's on your mind?
      </div>

      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "nowrap",
          justifyContent: "center",
        }}
      >
        {/* Left Sidebar: Explore (desktop only) */}
        {!isMobile && (
          <aside
            style={{
              flex: "1 1 220px",
              maxWidth: 260,
              backgroundColor: "#e6f2e6",
              borderRadius: 10,
              padding: 15,
              boxShadow: "0 0 8px rgba(0,0,0,0.1)",
              height: "fit-content",
              position: "sticky",
              top: 20,
              alignSelf: "flex-start",
              minWidth: 200,
            }}
          >
            <h4 style={{ marginBottom: 10 }}>Explore</h4>
            <ul style={{ listStyle: "none", padding: 0, lineHeight: 2 }}>
              <li>📚 Groups</li>
              <li>🎓 Tuition</li>
              <li>🛒 Marketplace</li>
            </ul>
          </aside>
        )}

        {/* Main Feed */}
        <main
          style={{
            flex: "2 1 550px",
            minWidth: 300,
            maxWidth: 650,
          }}
        >
          {posts.length === 0 && (
            <p
              style={{
                textAlign: "center",
                padding: 50,
                backgroundColor: "#e6f2e6",
                borderRadius: 10,
                color: "#555",
              }}
            >
              No posts to show.
            </p>
          )}

          {posts.map((post) => (
            <PostComponent key={post.post_id} post={post} />
          ))}

          {posts.length > 0 && (
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <button
                onClick={() => setPage(page + 1)}
                style={{
                  padding: "10px 30px",
                  fontSize: 16,
                  borderRadius: 25,
                  cursor: "pointer",
                  backgroundColor: "#2e7d32",
                  color: "white",
                  border: "none",
                  boxShadow: "0 3px 6px rgba(46,125,50,0.5)",
                  transition: "background-color 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#256927")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2e7d32")
                }
              >
                Load More
              </button>
            </div>
          )}

          {/* Mobile: Show Explore and Profile sections BELOW feed */}
          {isMobile && (
            <div
              style={{
                marginTop: 30,
                backgroundColor: "#e6f2e6",
                borderRadius: 10,
                padding: 15,
                boxShadow: "0 0 8px rgba(0,0,0,0.1)",
                fontSize: 14,
                color: "#2e7d32",
              }}
            >
              {/* Explore Section */}
              <section style={{ marginBottom: 20 }}>
                <h4 style={{ marginBottom: 10 }}>Explore</h4>
                <ul style={{ listStyle: "none", padding: 0, lineHeight: 2 }}>
                  <li>📚 Groups</li>
                  <li>🎓 Tuition</li>
                  <li>🛒 Marketplace</li>
                </ul>
              </section>

              {/* Profile Section */}
              <section>
                <h4 style={{ marginBottom: 10 }}>Your Profile</h4>
                <ul style={{ listStyle: "none", padding: 0, lineHeight: 2 }}>
                  <li>👤 My Profile</li>
                  <li>👥 Friends</li>
                  <li>⚙️ Settings</li>
                </ul>
              </section>
            </div>
          )}
        </main>

        {/* Right Sidebar: Your Profile (desktop only) */}
        {!isMobile && (
          <aside
            style={{
              flex: "1 1 220px",
              maxWidth: 260,
              backgroundColor: "#e6f2e6",
              borderRadius: 10,
              padding: 15,
              boxShadow: "0 0 8px rgba(0,0,0,0.1)",
              height: "fit-content",
              position: "sticky",
              top: 20,
              alignSelf: "flex-start",
              minWidth: 200,
            }}
          >
            <h4 style={{ marginBottom: 10 }}>Your Profile</h4>
            <ul style={{ listStyle: "none", padding: 0, lineHeight: 2 }}>
              <li>👤 My Profile</li>
              <li>👥 Friends</li>
              <li>⚙️ Settings</li>
            </ul>
          </aside>
        )}
      </div>
    </div>
  );
}

export default Newsfeed;
