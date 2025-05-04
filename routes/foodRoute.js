import express from "express";
import { canUserReview, createNewFood, createNewFoodReview, deleteFood, deleteFoodImage, deleteFoodReview, getAdminFoods, getFoodDetails, getFoodReviews, getFoods, updateFood, uploadFoodImages } from "../controllers/foodController.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
const foodRouter = express.Router();


foodRouter
    .route("/foods")
    .get(getFoods)

foodRouter.route("/foods/:id").get(getFoodDetails)

foodRouter
    .route("/admin/foods/:id")
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateFood)

foodRouter
    .route("/admin/foods")
    .get( isAuthenticatedUser, authorizeRoles("admin"), getAdminFoods)
    
foodRouter
    .route("/admin/foods/:id/upload_images")
    .put( isAuthenticatedUser, authorizeRoles("admin"), uploadFoodImages)


foodRouter
    .route("/admin/foods/:id/delete_image")
    .put( isAuthenticatedUser, authorizeRoles("admin"), deleteFoodImage)

foodRouter
    .route("/admin/foods/:id")
    .delete( isAuthenticatedUser, authorizeRoles("admin"), deleteFood)

foodRouter
    .route("/admin/foods")
    .post(isAuthenticatedUser, authorizeRoles("admin"), createNewFood)

foodRouter
    .route("/reviews")
    .get(isAuthenticatedUser, getFoodReviews)
    .put(isAuthenticatedUser, createNewFoodReview)

foodRouter
    .route("/admin/reviews")
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteFoodReview)

foodRouter.route("/can_review").get(isAuthenticatedUser, canUserReview)


export default foodRouter;