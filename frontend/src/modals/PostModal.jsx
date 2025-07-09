import React, { useEffect, useState } from "react";

export default function PostModal({ post, onClose, onCommentAdded }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const token = JSON.parse(localStorage.getItem("loggedInUser"))?.token;
  const backendURL = "http://localhost:5000";

  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch(`${backendURL}/api/comments/${post.post_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch comments");
        const data = await res.json();
        setComments(data);
      } catch (err) {
        console.error("Failed to load comments", err);
      }
    }
    fetchComments();
  }, [post.post_id, token]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`${backendURL}/api/comments/${post.post_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });
      if (!res.ok) throw new Error("Failed to add comment");

      const addedComment = await res.json();
      setComments((prev) => [
        ...prev,
        {
          comment_id: addedComment.comment_id,
          content: newComment,
          nickname: "You",
          created_at: new Date().toISOString(),
        },
      ]);
      setNewComment("");

      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      console.error("Error adding comment", err);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(26, 66, 35, 0.6)", // darker greenish overlay
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        style={{
          background: "#e6f2e6", // very light green background
          padding: 24,
          borderRadius: 12,
          width: "90%",
          maxWidth: 640,
          maxHeight: "90%",
          overflowY: "auto",
          boxShadow: "0 8px 24px rgba(30, 70, 30, 0.3)",
          display: "flex",
          flexDirection: "column",
          border: "1.5px solid #a2d29f", // subtle green border
        }}
      >
        <button
          onClick={onClose}
          style={{
            alignSelf: "flex-end",
            background: "transparent",
            border: "none",
            fontSize: 28,
            cursor: "pointer",
            color: "#2a5d2a",
            fontWeight: "bold",
            lineHeight: 1,
            userSelect: "none",
          }}
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Post Header */}
        <h2 style={{ margin: "0 0 10px", color: "#276627" }}>
          {post.title || "Untitled Post"}
        </h2>

        <p
          style={{
            color: "#375737",
            fontSize: 16,
            lineHeight: 1.5,
            marginBottom: 10,
            whiteSpace: "pre-wrap",
          }}
        >
          {post.content}
        </p>

        <div
          style={{
            fontSize: 13,
            color: "#4a6b4a",
            marginBottom: 20,
            borderBottom: "1px solid #a2d29f",
            paddingBottom: 10,
            fontStyle: "italic",
          }}
        >
          Posted by{" "}
          <strong style={{ color: "#1e4d1e" }}>
            {post.author_name || `User ID: ${post.user_id}`}
          </strong>{" "}
          on {new Date(post.created_at).toLocaleString()}
        </div>

        {/* Comments Section */}
        <h3 style={{ marginBottom: 10, color: "#2e6a2e" }}>Comments</h3>
        <div
          style={{
            flexGrow: 1,
            overflowY: "auto",
            maxHeight: 320,
            paddingRight: 8,
            marginBottom: 20,
            borderRadius: 6,
            border: "1px solid #a2d29f",
            backgroundColor: "#f0f9f0",
          }}
        >
          {comments.length === 0 && (
            <p
              style={{
                padding: 16,
                color: "#799f79",
                fontStyle: "italic",
                textAlign: "center",
              }}
            >
              No comments yet.
            </p>
          )}
          {comments.map((comment) => (
            <div
              key={comment.comment_id}
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #c1e1c1",
                backgroundColor: "#ffffffcc",
                margin: "8px",
                borderRadius: 6,
                boxShadow: "0 1px 3px rgba(0, 70, 0, 0.1)",
              }}
            >
              <strong
                style={{
                  display: "block",
                  marginBottom: 6,
                  color: "#2a5d2a",
                  fontWeight: "600",
                }}
              >
                {comment.nickname || comment.user?.nickname || "Unknown"}
              </strong>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  color: "#375737",
                  whiteSpace: "pre-wrap",
                }}
              >
                {comment.content}
              </p>
              <small
                style={{
                  display: "block",
                  marginTop: 8,
                  fontSize: 11,
                  color: "#6b8f6b",
                }}
              >
                {new Date(comment.created_at).toLocaleString()}
              </small>
            </div>
          ))}
        </div>

        {/* Add Comment Input */}
        <textarea
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          style={{
            width: "100%",
            padding: 12,
            fontSize: 15,
            borderRadius: 6,
            border: "1.5px solid #a2d29f",
            resize: "vertical",
            marginBottom: 14,
            fontFamily: "inherit",
            backgroundColor: "#e9f4e9",
            color: "#2e6a2e",
          }}
        />
        <button
          onClick={handleAddComment}
          disabled={!newComment.trim()}
          style={{
            padding: "10px 16px",
            backgroundColor: newComment.trim() ? "#3b8d3b" : "#a8cca8",
            border: "none",
            color: "white",
            fontWeight: "600",
            borderRadius: 6,
            cursor: newComment.trim() ? "pointer" : "not-allowed",
            transition: "background-color 0.3s ease",
          }}
        >
          Add Comment
        </button>
      </div>
    </div>
  );
}
