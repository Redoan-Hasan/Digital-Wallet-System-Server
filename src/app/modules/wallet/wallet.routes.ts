import { Router } from "express";
import { WalletController } from "./wallet.controller";
import { checkAuth } from "../../utils/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../utils/validateRequest";
import { addMoneyZodSchema, cashInAndOutMoneyZodSchema, sendMoneyZodSchema, withdrawMoneyZodSchema } from "./wallet.zod";

const router = Router();

router.post(
  "/add-money",
  validateRequest(addMoneyZodSchema),
  checkAuth( Role.USER, Role.AGENT),
  WalletController.addMoney
);
router.post(
  "/withdraw-money",
  validateRequest(withdrawMoneyZodSchema),
  checkAuth(Role.USER, Role.AGENT),
  WalletController.withdrawMoney
);
router.post(
  "/cash-in-money",
  validateRequest(cashInAndOutMoneyZodSchema),
  checkAuth(Role.AGENT),
  WalletController.cashInMoney
);
router.post(
  "/cash-out-money",
  validateRequest(cashInAndOutMoneyZodSchema),
  checkAuth(Role.AGENT),
  WalletController.cashOutMoney
);
router.post(
  "/send-money",
  validateRequest(sendMoneyZodSchema),
  checkAuth(Role.USER),
  WalletController.sendMoney
);

export const WalletRoutes = router;
