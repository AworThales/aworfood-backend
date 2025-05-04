import foodModel from "../models/foodModel.js"
import ErrorHandler from "../utils/errorHandler.js"
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js"
import EndpointSieves from "../utils/endpointSieves.js"
import orderModel from "../models/orderModel.js"
import { delete_file, upload_file } from "../utils/cloudinary.js"


// Creating new food  > admin route /api/v1/admin/food
export const getFoods = catchAsyncErrors(async (req, res) => {
    const resPerPage = 8;
    const endpointSieves = new EndpointSieves(foodModel, req.query).search().filters();

    let foods = await endpointSieves.query;
    let filteredFoodsCount = foods.length;

    endpointSieves.pagination(resPerPage)
    foods = await endpointSieves.query.clone()

    res.status(200).json({
        resPerPage,
        filteredFoodsCount,
       foods,
    });
})

// Creating new food  > admin route /api/v1/admin/food
export const createNewFood = catchAsyncErrors(async (req, res, next) => {
  try {
    // Attach user ID (assuming req.user is populated by auth middleware)
    req.body.user = req.user._id;

    const food = await foodModel.create(req.body);

    res.status(201).json({
      success: true,
      food,
    });
  } catch (error) {
    // Forward error to global error handler
    next(error);
  }
});


// getting single 
// success: true, datails  > admin route /api/v1/food/:id
export const getFoodDetails = catchAsyncErrors(async (req, res, next) => {
    try {
     const food = await foodModel.findById(req?.params?.id).populate("reviews.user")
    if(!food){
        return next( new ErrorHandler("Food not found", 404))
    }
    res.status(200).json({food})
    } catch (error) {
      next(error);
    }
 })

 
// Get foods - ADMIN   =>  /api/v1/admin/foods
export const getAdminFoods = catchAsyncErrors(async (req, res, next) => {
  const foods = await foodModel.find();

  res.status(200).json({
    foods,
  });
});


 // Update food details - Admin route: /api/v1/food/:id
export const updateFood = catchAsyncErrors(async (req, res, next) => {
  try {
    const food = await foodModel.findById(req.params.id);

    if (!food) {
      return next(new ErrorHandler("Food not found", 404));
    }

    // Pass the update fields from req.body
    const updatedFood = await foodModel.findByIdAndUpdate(
      req.params.id,
      req.body,            
      { new: true, runValidators: true } 
    );

    res.status(200).json({
      success: true,
      message: "Food item updated successfully",
      food: updatedFood,
    });
  } catch (error) {
    next(error);
  }
});


// Upload food images   =>  /api/v1/admin/foods/:id/upload_images
export const uploadFoodImages = catchAsyncErrors(async (req, res) => {
  let food = await foodModel.findById(req?.params?.id);

  if (!food) {
    return next(new ErrorHandler("Food not found", 404));
  }

  const uploader = async (image) => upload_file(image, "aworfood/foods");

  const urls = await Promise.all((req?.body?.images).map(uploader));

  food?.images?.push(...urls);
  await food?.save();

  res.status(200).json({
    food,
  });
});

// Delete food image   =>  /api/v1/admin/foods/:id/delete_image
export const deleteFoodImage = catchAsyncErrors(async (req, res) => {
  let food = await foodModel.findById(req?.params?.id);

  if (!food) {
    return next(new ErrorHandler("Food not foun", 404));
  }

  const isDeleted = await delete_file(req.body.imgId);

  if (isDeleted) {
    food.images = food?.images?.filter(
      (img) => img.public_id !== req.body.imgId
    );

    await food?.save();
  }

  res.status(200).json({
    food,
  });
});


 // delete food  > admin route /api/v1/food/:id
 export const deleteFood = catchAsyncErrors(async (req, res) => {
  const food = await foodModel.findById(req?.params?.id);

  if (!food) {
    return next(new ErrorHandler("Food not found", 404));
  }

  // Deleting image associated with food
  for (let i = 0; i < food?.images?.length; i++) {
    await delete_file(food?.images[i].public_id);
  }

  await food.deleteOne();

  res.status(200).json({
    message: "Food Item Deleted Successfully!",
  });
});

 // Create/Update food review   =>  /api/v1/reviews
export const createNewFoodReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, foodId } = req.body;
  
    const review = {
      user: req?.user?._id,
      rating: Number(rating),
      comment,
    };
  
    const food = await foodModel.findById(foodId);
  
    if (!food) {
      return next(new ErrorHandler("Food not found", 404));
    }

    // check if is reviewed
    const isReviewed = food?.reviews?.find(
      (r) => r.user.toString() === req?.user?._id.toString()
    );

      // check if already reviewed then update
    if (isReviewed) {
      food.reviews.forEach((review) => {
        if (review?.user?.toString() === req?.user?._id.toString()) {
          review.comment = comment;
          review.rating = rating;
        }
      });
    // otherwise create new review
    } else {
      food.reviews.push(review);
      food.numOfReviews = food.reviews.length;
    }
  
    food.ratings =
      food.reviews.reduce((acc, item) => item.rating + acc, 0) /
      food.reviews.length;
  
    await food.save({ validateBeforeSave: false });
  
    res.status(200).json({
      success: true,
    });
});

// Get food reviews   =>  /api/v1/reviews
export const getFoodReviews = catchAsyncErrors(async (req, res, next) => {
    const food = await foodModel.findById(req.query.id).populate("reviews.user");
  
    if (!food) {
      return next(new ErrorHandler("food not found", 404));
    }
  
    res.status(200).json({
      reviews: food.reviews,
    });
});

// Delete food review   =>  /api/v1/admin/reviews
export const deleteFoodReview = catchAsyncErrors(async (req, res, next) => {
    let food = await foodModel.findById(req.query.foodId);
  
    if (!food) {
      return next(new ErrorHandler("Food not found", 404));
    }
  
    const reviews = food?.reviews?.filter(
      (review) => review._id.toString() !== req?.query?.id.toString()
    );
  
    const numOfReviews = reviews.length;
  
    const ratings =
      numOfReviews === 0
        ? 0
        : food.reviews.reduce((acc, item) => item.rating + acc, 0) /
          numOfReviews;
  
    food = await foodModel.findByIdAndUpdate(
      req.query.foodId,
      { reviews, numOfReviews, ratings },
      { new: true }
    );
  
    res.status(200).json({
      success: true,
      food,
    });
  });
  
  // Can user review   =>  /api/v1/can_review
  export const canUserReview = catchAsyncErrors(async (req, res) => {
    const orders = await orderModel.find({
      user: req.user._id,
      "orderItems.food": req.query.foodId,
    });
  
    if (orders.length === 0) {
      return res.status(200).json({ canReview: false });
    }
  
    res.status(200).json({
      canReview: true,
    });
  });
  
  
  
 
