import { Router } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../utils/validateRequest";
import { createUserZodSchema, updateUserZodSchema } from "./user.zod";
import { checkAuth } from "../../utils/checkAuth";
import { Role } from "./user.interface";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  userController.createUser
);
router.get("/", checkAuth(Role.ADMIN), userController.getAllUsers);
router.get("/me", checkAuth(...Object.values(Role)), userController.getMe);
router.get("/:id", checkAuth(Role.ADMIN), userController.getSingleUser);
router.patch(
  "/:id",
  checkAuth(...Object.values(Role)),
  validateRequest(updateUserZodSchema),
  userController.updateUser
);

export const userRoutes = router;
