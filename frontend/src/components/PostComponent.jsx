import React, { useState } from "react";
import PostModal from "../modals/PostModal";

export default function PostComponent({ post }) {
  const [liked, setLiked] = useState(post.liked_by_user);
  const [likeCount, setLikeCount] = useState(Number(post.like_count) || 0);
  const [commentCount, setCommentCount] = useState(Number(post.comment_count) || 0);
  const [showModal, setShowModal] = useState(false);

  const token = JSON.parse(localStorage.getItem("loggedInUser"))?.token;
  const backendURL = "http://localhost:5000";

  const toggleLike = async () => {
    if (!token) return alert("Please login to like posts");

    try {
      const url = `${backendURL}/api/post/${post.post_id}/likes`;
      const method = liked ? "DELETE" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to toggle like:", res.statusText);
        return;
      }

      setLiked(!liked);
      setLikeCount((prev) =>
        liked ? Math.max(Number(prev) - 1, 0) : Number(prev) + 1
      );
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  return (
    <>
      <div
        className="post-card"
        style={{
          cursor: "pointer",
          border: "1px solid #a5d6a7",
          marginBottom: "1.5rem",
          padding: "1.25rem",
          borderRadius: "12px",
          backgroundColor: "#f0fff4",
          boxShadow: "0 2px 8px rgba(164, 214, 167, 0.5)",
          transition: "box-shadow 0.3s ease",
        }}
        onClick={() => setShowModal(true)}
        onMouseEnter={(e) =>
          (e.currentTarget.style.boxShadow = "0 6px 20px rgba(46, 125, 50, 0.4)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.boxShadow = "0 2px 8px rgba(164, 214, 167, 0.5)")
        }
      >
        <h5 style={{ color: "#2e7d32", marginBottom: 10 }}>
          {post.title || "Untitled Post"}
        </h5>
        <p style={{ color: "#4b6f44", lineHeight: 1.5 }}>
          {post.content || "No content available."}
        </p>
        <small style={{ color: "#6b8e23" }}>
          Posted by{" "}
          <strong>{post.author_name || `User ID: ${post.user_id}`}</strong> on{" "}
          {new Date(post.created_at).toLocaleString()}
        </small>

        {/* Media if available */}
        {post.media && post.media.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            {post.media.map((mediaItem, idx) => {
              const mediaUrl = `${backendURL}${mediaItem.link}`;
              if (mediaItem.type.startsWith("image")) {
                return (
                  <img
                    key={idx}
                    src={mediaUrl}
                    alt="Post media"
                    style={{ maxWidth: "100%", borderRadius: 8, marginBottom: 12 }}
                  />
                );
              }
              if (mediaItem.type.startsWith("video")) {
                return (
                  <video
                    key={idx}
                    src={mediaUrl}
                    controls
                    style={{ maxWidth: "100%", borderRadius: 8, marginBottom: 12 }}
                  />
                );
              }
              return null;
            })}
          </div>
        )}

        {/* Like & Comment Info */}
        <div
          style={{
            color: "#5a6d3a",
            fontSize: 14,
            marginTop: "0.75rem",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike();
            }}
            style={{
              cursor: "pointer",
              border: "none",
              background: "none",
              color: liked ? "#2e7d32" : "#7a8b5b",
              fontWeight: liked ? "700" : "400",
              padding: 0,
              fontSize: 15,
            }}
          >
            👍 {likeCount} {liked ? "Liked" : "Like"}
          </button>
          <span
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
            style={{
              cursor: "pointer",
              color: "#4a7c28",
              fontWeight: "600",
              userSelect: "none",
            }}
          >
            💬 {commentCount} Comments
          </span>
        </div>
      </div>

      {showModal && (
        <PostModal
          post={post}
          onClose={() => setShowModal(false)}
          onCommentAdded={() => setCommentCount((prev) => Number(prev) + 1)}
        />
      )}
    </>
  );
}
