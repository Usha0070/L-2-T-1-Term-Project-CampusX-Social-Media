-- ENUM types
CREATE TYPE gender_type AS ENUM ('Male', 'Female');
CREATE TYPE residence_type AS ENUM ('Resident', 'Attached');
CREATE TYPE hall_type AS ENUM ('AUH', 'SWH', 'SBH', 'TH', 'RH', 'NH', 'ShH', 'SoH');
CREATE TYPE department_type AS ENUM ('CSE', 'EEE', 'ME', 'CE', 'BME', 'ChE', 'MME', 'IPE', 'NCE', 'NAME', 'WRE', 'ARC', 'URP');
CREATE TYPE media_type AS ENUM ('image', 'video', 'document');
CREATE TYPE marketplace_status AS ENUM ('Available', 'Sold');
CREATE TYPE tuition_status AS ENUM ('Available', 'Booked');
CREATE TYPE group_post_status AS ENUM ('Pending', 'Accepted');
CREATE TYPE friendship_status AS ENUM ('Pending', 'Accepted');
CREATE TYPE item_condition_type AS ENUM ('New', 'Used');
CREATE TYPE post_visibility_type AS ENUM ('public', 'private', 'friends');
CREATE TYPE notification_type AS ENUM('post_like', 'post_comment', 'post_share', 'post_tag', 'friend_req_received', 'friend_req_accepted');

-- CITY
CREATE TABLE city (
    city_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- ADDRESS
CREATE TABLE address (
    address_id SERIAL PRIMARY KEY,
    type residence_type NOT NULL,
    hall hall_type NOT NULL,
    room_no VARCHAR(20),
    city_id INT REFERENCES city(city_id) NOT NULL
);

-- USER
CREATE TABLE "user" (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    nickname VARCHAR(100),
    student_id CHAR(10) UNIQUE NOT NULL,
    batch INT NOT NULL,
    department department_type NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone CHAR(20),
    hashed_password VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender gender_type NOT NULL,
    address_id INT UNIQUE REFERENCES address(address_id) NOT NULL
);

-- MEDIA
CREATE TABLE media (
    media_id SERIAL PRIMARY KEY,
    link VARCHAR(1000) NOT NULL,
    type media_type NOT NULL
);

-- USER_PROFILE
CREATE TABLE user_profile (
    user_id INT PRIMARY KEY REFERENCES "user"(user_id) ON DELETE CASCADE,
    bio VARCHAR(200),
    profile_pic INT UNIQUE REFERENCES media(media_id),
    cover_photo INT UNIQUE REFERENCES media(media_id),
    about VARCHAR(800)
);

-- POST
CREATE TABLE post (
    post_id SERIAL PRIMARY KEY,
    author_id INT REFERENCES "user"(user_id) NOT NULL,
    content VARCHAR(5000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    visibility post_visibility_type,
    shared_post_id INT REFERENCES post(post_id)
);

-- POST_TAG
CREATE TABLE post_tag (
    post_id INT REFERENCES post(post_id),
    user_id INT REFERENCES "user"(user_id),
    PRIMARY KEY (post_id, user_id)
);

-- POST_MEDIA
CREATE TABLE post_media (
    post_id INT REFERENCES post(post_id),
    media_id INT UNIQUE REFERENCES media(media_id),
    context VARCHAR(255),
    order_index INT,
    PRIMARY KEY (post_id, media_id)
);

-- POST_LIKE
CREATE TABLE post_like (
    post_id INT REFERENCES post(post_id),
    user_id INT REFERENCES "user"(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (post_id, user_id)
);

-- POST_COMMENT
CREATE TABLE post_comment (
    comment_id SERIAL PRIMARY KEY,
    post_id INT REFERENCES post(post_id) NOT NULL,
    author_id INT REFERENCES "user"(user_id) NOT NULL,
    content VARCHAR(3000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_at TIMESTAMP,
    parent_comment_id INT REFERENCES post_comment(comment_id)
);

-- MARKETPLACE_POST
CREATE TABLE marketplace_post (
    post_id INT PRIMARY KEY REFERENCES post(post_id) ON DELETE CASCADE,
    category VARCHAR(255),
    price INT,
    status marketplace_status NOT NULL,
    item_condition item_condition_type
);

-- LOCATION
CREATE TABLE location (
    location_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- TUITION_POST
CREATE TABLE tuition_post (
    post_id INT PRIMARY KEY REFERENCES post(post_id) ON DELETE CASCADE,
    class VARCHAR(100),
    num_students INT,
    location_id INT REFERENCES location(location_id),
    remunation INT,
    status tuition_status NOT NULL,
    preferred_gender gender_type
);

-- SUBJECT
CREATE TABLE subject (
    subject_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- TUITION_SUBJECT
CREATE TABLE tuition_subject (
    post_id INT REFERENCES tuition_post(post_id),
    subject_id INT REFERENCES subject(subject_id),
    PRIMARY KEY (post_id, subject_id)
);

-- GROUP
CREATE TABLE "group" (
    group_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    profile_pic INT UNIQUE REFERENCES media(media_id),
    cover_photo INT UNIQUE REFERENCES media(media_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    creator_id INT REFERENCES "user"(user_id) NOT NULL,
    admin_id INT REFERENCES "user"(user_id) NOT NULL,
    is_public BOOLEAN DEFAULT TRUE
);

-- GROUP_MEMBER
CREATE TABLE group_member (
    group_id INT REFERENCES "group"(group_id),
    user_id INT REFERENCES "user"(user_id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (group_id, user_id)
);

-- GROUP_MOD
CREATE TABLE group_mod (
    group_id INT REFERENCES "group"(group_id),
    user_id INT REFERENCES "user"(user_id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (group_id, user_id)
);

-- GROUP_POST
CREATE TABLE group_post (
    post_id INT REFERENCES post(post_id),
    group_id INT REFERENCES "group"(group_id),
    status group_post_status NOT NULL,
    PRIMARY KEY (post_id, group_id)
);

-- FRIENDSHIP
CREATE TABLE friendship (
    user_id INT REFERENCES "user"(user_id),
    friend_id INT REFERENCES "user"(user_id),
    status friendship_status NOT NULL,
    action_user_id INT REFERENCES "user"(user_id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, friend_id),
    CHECK (user_id < friend_id)
);

-- FOLLOW
CREATE TABLE follow (
    follower_id INT REFERENCES "user"(user_id),
    followee_id INT REFERENCES "user"(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (follower_id, followee_id)
);

-- BLOCK
CREATE TABLE block (
    blocker_id INT REFERENCES "user"(user_id),
    blocked_id INT REFERENCES "user"(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (blocker_id, blocked_id)
);

-- CHAT
CREATE TABLE chat (
    chat_id SERIAL PRIMARY KEY,
    user1_id INT REFERENCES "user"(user_id) NOT NULL,
    user2_id INT REFERENCES "user"(user_id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_message_at TIMESTAMP,
    CHECK (user1_id < user2_id)
);

-- MESSAGE
CREATE TABLE message (
    message_id SERIAL PRIMARY KEY,
    chat_id INT REFERENCES chat(chat_id) NOT NULL,
    sender_id INT REFERENCES "user"(user_id) NOT NULL,
    content VARCHAR(4000),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_read BOOLEAN DEFAULT FALSE
);

-- NOTIFICATION
CREATE TABLE notification (
    notification_id SERIAL PRIMARY KEY,
    type notification_type NOT NULL,
    recipient_id INT REFERENCES "user"(user_id) NOT NULL,
    sender_id INT REFERENCES "user"(user_id),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON
);
