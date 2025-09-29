import { Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../utils/checkAuth";
import { Role } from "../user/user.interface";

const router  = Router();

router.post("/login", AuthController.credentialsLoging);
router.post("/refresh-token", AuthController.getNewAccessToken);
router.post("/logout", AuthController.logout);
router.post(
  "/reset-password",
  checkAuth(...Object.values(Role)),
  AuthController.resetPassword
);
router.post(
  "/change-password",
  checkAuth(...Object.values(Role)),
  AuthController.changePassword
);
router.post(
  "/change-pin",
  checkAuth(...Object.values(Role)),
  AuthController.changePin
);

export const authRoutes = router;