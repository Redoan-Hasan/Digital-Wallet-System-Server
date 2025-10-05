import { Router } from "express";
import { TransactionController } from "./transaction.controller";
import { checkAuth } from "../../utils/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.get("/get-my-transactions",checkAuth(Role.USER,Role.AGENT), TransactionController.getMyTransactions)
router.get("/get-all-transactions",checkAuth(Role.ADMIN), TransactionController.getAllTransactions)

export const transactionRoutes = router;
