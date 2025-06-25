import React from 'react';
import Navbar from '../layouts/Navbar';

const dummyPosts = [
  {
    id: 1,
    author: {
      initials: 'AS',
      name: 'ইউশা',
      department: 'CSE',
      batch: 2022,
    },
    timeAgo: '1d ago',
    content: "প্রজেক্টের ফ্রন্টএন্ড অনেকটা করে ফেলেছি। তোমাদের সবার কি অবস্থা??? 🌳💻",
    likes: 115,
    comments: 18,
    shares: 2,
  },
  {
    id: 2,
    author: {
      initials: 'BJ',
      name: 'আবিদ',
      department: 'EEE',
      batch: 2021,
    },
    timeAgo: '3d ago',
    content: "আমার পুরানো বইগুলো বিক্রি করতে চাই। কারো প্রয়োজন হলে আমাকে জানাও। 📚",
    marketplace: {
      price: 800,
      condition: 'Used',
      category: 'Books',
      status: 'Available',
    },
    likes: 8,
    comments: 12,
    shares: 5,
  },
  {
    id: 3,
    author: {
      initials: 'SH',
      name: 'সিয়াম',
      department: 'ME',
      batch: 2020,
    },
    timeAgo: '4h ago',
    content: "আগামীকাল মেকানিক্স এর ভাইভা। সবাই দোয়া কইরো 😓🙏",
    likes: 52,
    comments: 20,
    shares: 0,
  },
  {
    id: 4,
    author: {
      initials: 'MN',
      name: 'মাহি',
      department: 'BBA',
      batch: 2023,
    },
    timeAgo: '2h ago',
    content: "আজ ক্লাসে টিচার এমন একটা জোক করলো, হাসতে হাসতে পেট ব্যাথা 😂📘",
    likes: 143,
    comments: 31,
    shares: 4,
  },
  {
    id: 5,
    author: {
      initials: 'FA',
      name: 'ফারহান',
      department: 'CSE',
      batch: 2022,
    },
    timeAgo: '6d ago',
    content: "React.js এর custom hooks নিয়ে কারো ভালো টিউটোরিয়াল জানা আছে?",
    likes: 34,
    comments: 9,
    shares: 1,
  },
  {
    id: 6,
    author: {
      initials: 'RS',
      name: 'রিমা',
      department: 'ENGLISH',
      batch: 2024,
    },
    timeAgo: '1w ago',
    content: "আমার একটা বাসার সাবলেট লাগবে। বিশ্ববিদ্যালয়ের কাছাকাছি হলে ভালো হয়।",
    likes: 20,
    comments: 11,
    shares: 3,
  },
  {
    id: 7,
    author: {
      initials: 'TR',
      name: 'তাহসিন',
      department: 'CSE',
      batch: 2021,
    },
    timeAgo: '3d ago',
    content: "আজকে github workflow automate করলাম! AI + DevOps rocks 🚀🤖",
    likes: 89,
    comments: 17,
    shares: 6,
  },
  {
    id: 8,
    author: {
      initials: 'NI',
      name: 'নাঈম',
      department: 'EEE',
      batch: 2020,
    },
    timeAgo: '2d ago',
    content: "টিউশন লাগবে। Physics + Math পড়াতে পারি, SSC level.",
    likes: 45,
    comments: 14,
    shares: 2,
  },
  {
    id: 9,
    author: {
      initials: 'ZR',
      name: 'জারা',
      department: 'Architecture',
      batch: 2023,
    },
    timeAgo: '5h ago',
    content: "আজ ফাইনাল প্রেজেন্টেশন জমা দিলাম! সবার দোয়া চাই 💫🏛️",
    likes: 77,
    comments: 25,
    shares: 1,
  },
  {
    id: 10,
    author: {
      initials: 'MS',
      name: 'মাসুদ',
      department: 'Sociology',
      batch: 2019,
    },
    timeAgo: '1mo ago',
    content: "আমার পুরনো ল্যাপটপ বিক্রি করব। RAM 8GB, HDD 500GB, core i5 6th Gen।",
    marketplace: {
      price: 18000,
      condition: 'Good',
      category: 'Electronics',
      status: 'Available',
    },
    likes: 12,
    comments: 5,
    shares: 3,
  },
  {
    id: 11,
    author: {
      initials: 'AH',
      name: 'আফরিন',
      department: 'Pharmacy',
      batch: 2022,
    },
    timeAgo: '2d ago',
    content: "Chemistry Viva নিয়ে টেনশনে আছি 😩 কেউ সাজেশন দাও প্লিজ!",
    likes: 61,
    comments: 22,
    shares: 0,
  },
  {
    id: 12,
    author: {
      initials: 'RM',
      name: 'রিফাত',
      department: 'Law',
      batch: 2021,
    },
    timeAgo: '8h ago',
    content: "কেউ কি constitutional law এর ৩য় চ্যাপ্টারের নোট দিতে পারো?",
    likes: 29,
    comments: 10,
    shares: 1,
  },
];

const Newsfeed = () => {
  return (
    <div
      className="container mt-4"
      style={{ minHeight: '80vh', maxWidth: '900px' }}
    >
      {/* Post input area */}
      <div className="mb-4">
        <div
          className="card p-3 shadow-sm"
          style={{ backgroundColor: '#e6f2e6', borderRadius: '12px' }}
        >
          <input
            type="text"
            placeholder="What's on your mind, John?"
            className="form-control border-0 bg-transparent"
            style={{ fontSize: '1.1rem', outline: 'none' }}
            readOnly
          />
        </div>
      </div>

      {/* Posts */}
      {dummyPosts.map(post => (
        <div
          key={post.id}
          className="card mb-4 shadow-sm"
          style={{ borderRadius: '15px', borderColor: '#198754' }}
        >
          <div className="card-body">
            {/* Author Info */}
            <div className="d-flex align-items-center mb-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                style={{
                  width: 45,
                  height: 45,
                  backgroundColor: '#198754',
                  fontSize: '1.1rem',
                  userSelect: 'none',
                }}
              >
                {post.author.initials}
              </div>
              <div className="ms-3">
                <div className="fw-bold text-success" style={{ fontSize: '1.1rem' }}>
                  {post.author.name}
                </div>
                <div className="text-muted small">
                  {post.author.department} • Batch {post.author.batch} • {post.timeAgo}
                </div>
              </div>
            </div>

            {/* Post Content */}
            <p style={{ fontSize: '1.05rem', lineHeight: 1.5 }}>{post.content}</p>

            {/* Marketplace block */}
            {post.marketplace && (
              <div
                className="p-3 border rounded"
                style={{ backgroundColor: '#d7ebd7', borderColor: '#198754' }}
              >
                <strong>🛒 Marketplace Item</strong>
                <br />
                Price: ৳{post.marketplace.price}
                <br />
                Condition: {post.marketplace.condition}
                <br />
                Category: {post.marketplace.category}
                <br />
                Status: {post.marketplace.status}
              </div>
            )}

            {/* Reactions */}
            <div
              className="d-flex justify-content-between mt-4 text-muted"
              style={{ fontSize: '0.95rem' }}
            >
              <span className="reaction-btn">
                ❤️ {post.likes}
              </span>
              <span className="reaction-btn">
                💬 {post.comments}
              </span>
              <span className="reaction-btn">
                🔁 {post.shares}
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* Hover effect styles */}
      <style>
        {`
          .reaction-btn {
            transition: all 0.3s ease;
            cursor: pointer;
            padding: 2px 6px;
            border-radius: 6px;
          }
          .reaction-btn:hover {
            background-color: #d1e7dd;
            color: #0f5132;
            font-weight: 500;
            scale: 1.05;
          }
        `}
      </style>
    </div>
  );
};

export default Newsfeed;