import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter food name"],
      maxLength: [200, "oos name cannot exceed 200 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please enter food price"],
      maxLength: [5, "Food price cannot exceed 5 digits"],
    },
    description: {
      type: String,
      required: [true, "Please enter food description"],
    },
    // cookTime: { 
    //     type: String, 
    //     required: true
    //  },
    ratings: {
      type: Number,
      default: 0,
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    category: {
      type: String,
      required: [true, "Please enter food category"],
      enum: {
        values: [
          "Salad",
          "Deserts",
          "Soup",
          "Rice",
          "Pizza",
          "Shawama",
          "Noodle",
          "Rolls",
          "Sandwich",
          "Cake",
        ],
        message: "Please select correct category",
      },
    },
    seller: {
      type: String,
      required: [true, "Please enter product seller"],
    },
    stock: {
      type: Number,
      required: [true, "Please enter food stock"],
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Food", foodSchema);
