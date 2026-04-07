import mongoose, {Document} from "mongoose";
import { number } from "motion";
interface IUser extends Document{
    name: string;
    email: string;
    password?: string;
    role:"user" | "partner" | "admin"
    isEmailVerified?: boolean;
    otp?: string;
    otpExpiresAt?: Date;
    partnerOnBoardingSteps:number;
    mobileNumber?:string;
    partnerStatus: "pending" | "approved" | "rejected";
    craetedAt: Date;
    updatedAt: Date;
}
const userSchema = new mongoose.Schema<IUser>({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String,} ,
    role: {type: String, enum: ["user", "partner", "admin"]
},
isEmailVerified: {type: Boolean, default: false},
partnerOnBoardingSteps:{
    type:Number,
    min:0,
    max:8,
default:0
},
mobileNumber:{type: String},
partnerStatus:{type: String,enum: ["pending", "approved", "rejected"], default: "pending"},
otp:{type: String},
otpExpiresAt:{type: Date},
}, {
    timestamps: true
})
const User = mongoose.models.User || mongoose.model("User", userSchema)
export default User;