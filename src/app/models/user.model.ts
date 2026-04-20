import mongoose, { Document } from "mongoose";

type VideoKycStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "not_required"
  | "in_progress";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "user" | "partner" | "admin";
  isEmailVerified?: boolean;
  otp?: string;
  otpExpiresAt?: Date;
  partnerOnBoardingSteps: number;
  mobileNumber?: string;
  partnerStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  videoKycStatus: VideoKycStatus;
  videoKycRoomId?: string;
  videoKycRejectionReason?: string;
  socketId:string | null
  location?:{
    type:"Point",
    coordinates:[number,number]
  }
  isOnline:boolean
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["user", "partner", "admin"],
      required: true,
    },
    isEmailVerified: { type: Boolean, default: false },
    partnerOnBoardingSteps: {
      type: Number,
      min: 0,
      max: 8,
      default: 0,
    },
    mobileNumber: { type: String },
    partnerStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String },
    videoKycStatus: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "not_required",
        "in_progress",
      ],
      default: "not_required",
    },
    videoKycRoomId: { type: String },
    videoKycRejectionReason: { type: String },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    socketId:{type:String, default:null},
    location:{
      type:{
        type:String,
        enum:["Point"]
      },
      coordinates:[Number]
    },
    isOnline:{
      type:Boolean,
      default:false,
      index:true
    }
  },
  {
    timestamps: true,
  }
);
userSchema.index({location:"2dsphere"})
const User =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;