import { Router } from "express";
import { checkAuth } from "../../utils/checkAuth";
import { Role } from "../user/user.interface";
import { statsController } from "./stats.controller";

const router = Router();
router.get(
    "/user",
    checkAuth(Role.ADMIN),
    statsController.getUserStats
);
router.get(
    "/transaction",
    checkAuth(Role.ADMIN),
    statsController.getTransactionStats
);


export const StatsRoutes = router;