import { z } from "zod";

const allowedCities = [
  "Dhaka",
  "Faridpur",
  "Gazipur",
  "Gopalganj",
  "Jamalpur",
  "Kishoreganj",
  "Madaripur",
  "Manikganj",
  "Munshiganj",
  "Mymensingh",
  "Narayanganj",
  "Narsingdi",
  "Netrokona",
  "Rajbari",
  "Shariatpur",
  "Sherpur",
  "Tangail",
  "Bogra",
  "Joypurhat",
  "Naogaon",
  "Natore",
  "Nawabganj",
  "Pabna",
  "Rajshahi",
  "Sirajgonj",
  "Dinajpur",
  "Gaibandha",
  "Kurigram",
  "Lalmonirhat",
  "Nilphamari",
  "Panchagarh",
  "Rangpur",
  "Thakurgaon",
  "Barguna",
  "Barisal",
  "Bhola",
  "Jhalokati",
  "Patuakhali",
  "Pirojpur",
  "Bandarban",
  "Brahmanbaria",
  "Chandpur",
  "Chittagong",
  "Comilla",
  "Cox''s Bazar",
  "Feni",
  "Khagrachari",
  "Lakshmipur",
  "Noakhali",
  "Rangamati",
  "Habiganj",
  "Maulvibazar",
  "Sunamganj",
  "Sylhet",
  "Bagerhat",
  "Chuadanga",
  "Jessore",
  "Jhenaidah",
  "Khulna",
  "Kushtia",
  "Magura",
  "Meherpur",
  "Narail",
  "Satkhira",
];

export const RegisterSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  nickname: z.string().optional().nullable(),
  student_id: z.string(),
  batch: z.number(),
  department: z.enum([
    "CSE",
    "EEE",
    "ME",
    "CE",
    "BME",
    "ChE",
    "MME",
    "IPE",
    "NCE",
    "NAME",
    "WRE",
    "ARC",
    "URP",
  ]),
  email: z.string().email(),
  phone: z.string(),
  password: z.string(),
  date_of_birth: z
    .string()
    .regex(
      /^(?:(?:19|20)\d\d)-(?:0[1-9]|1[0-2])-(?:0[1-9]|1\d|2\d|3[01])$/,
      "Must be in YYYY-MM-DD format"
    ),
  gender: z.enum(["Male", "Female"]),
  residence_type: z.enum(["Resident", "Attached"]),
  hall: z.enum(["AUH", "SWH", "SBH", "TH", "RH", "NH", "ShH", "SoH", "KNIH"]),
  room_no: z.string().optional(),

  city_name: z.enum(allowedCities, {
    errorMap: () => ({ message: "Please select a valid city from the list" }),
  }),
});


export const LoginSchema = z.object({
  student_id: z.number(),
  password: z.string(),
});


export const UserSchema = RegisterSchema.extend({ password: RegisterSchema.shape.password.optional() });

export const ProfileSchema = z.object({
  bio: z.string(),
  about: z.string(),
});

export const FriendSchema = z.object({
  type: z.enum(["req_sent", "req_accept", "req_delete", "unfriend"]),
  friend_id: z.number(),
});

export const FollowSchema = z.object({
  type: z.enum(["add", "delete"]),
  followed_id: z.number(),
});

export const BlockSchema = z.object({
  type: z.enum(["add", "delete"]),
  blocked_id: z.number(),
});

const MarketSchema = z.object({
  category: z.string().optional(),
  price: z.coerce.number(),
  status: z.enum(["Available", "Sold"]),
  item_condition: z.enum(["New", "Used"]),
});

const TuitionSchema = z.object({
  class: z.string(),
  num_students: z.coerce.number(),
  location: z.string(),
  remunation: z.coerce.number(),
  status: z.enum(["Available", "Booked"]),
  preferred_gender: z.enum(["Male", "Female"]).optional(),
  subjects: z.array(z.string()),
});

export const PostSchema = z.object({
  content: z.string().max(5000).optional(),
  visibility: z.enum(["public", "private", "friends"]),
  shared_post_id: z.union([z.string(), z.number()]).transform(Number).optional().nullable(),
  media_contexts: z.array(z.string()).optional(),
  tagged_user_ids: z.array(z.coerce.number()).optional(),
  market: z.preprocess((val) => JSON.parse(val), MarketSchema).optional(),
  tuition: z.preprocess((val) => JSON.parse(val), TuitionSchema).optional(),
  // media: [media]
});

export const CommentSchema = z.object({
  content: z.string(),
  parent_comment_id: z.coerce.number().optional(),
});

export const GroupSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  is_public: z.coerce.boolean().optional(),
});

export const ModSchema = z.object({
  user_id: z.number(),
});

export const GroupPostSchema = z.object({
  post_id: z.number(),
});

export const GroupPostSchema2 = z.object({
  status: z.enum(["Pending", "Accepted"]),
});

export const ChatSchema = z.object({
  user2_id: z.number(),
});

export const MessageSchema = z.object({
  content: z.string(),
  is_read: z.boolean().optional(),
});
