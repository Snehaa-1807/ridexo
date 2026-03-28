import mongoose from "mongoose";

type vehicleType =
  | "bike"
  | "car"
  | "loading"
  | "truck"
  | "auto";

interface IVehicle {
  owner: mongoose.Types.ObjectId;
  type: vehicleType;
  number: string;
  vehicleModel: string;
  imageUrl?: string;
  baseFare?: number;
  pricePerKM: number;
  waitingCharge?: number;
  status: "approved" | "pending" | "rejected";
  rejectionReason?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new mongoose.Schema<IVehicle>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["bike", "car", "loading", "truck", "auto"],
      required: true,
    },

    number: {
      type: String,
      required: true,
      unique: true,
    },

    vehicleModel: {
      type: String,
      required: true,
    },

    imageUrl: {
      type: String,
    },

    baseFare: {
      type: Number,
    },

    pricePerKM: {
      type: Number,
      required: true,
    },

    waitingCharge: {
      type: Number,
    },

    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true, // ✅ fixed
    },
  },
  { timestamps: true }
);

const Vehicle =
  mongoose.models.Vehicle ||
  mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;