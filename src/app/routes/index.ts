import { Router } from "express";
import { userRoutes } from "../modules/user/user.routes";
import { authRoutes } from "../modules/auth/auth.routes";
import { WalletRoutes } from "../modules/wallet/wallet.routes";
import { transactionRoutes } from "../modules/transaction/transaction.routes";
import { StatsRoutes } from "../modules/stats/stats.routes";

export const router = Router();

const moduleRoutes = [
    {
        path : "/user",
        route : userRoutes,
    },
    {
      path:"/auth",
      route : authRoutes,
    },
    {
      path:"/wallet",
      route:WalletRoutes
    },
    {
      path:"/transaction",
      route: transactionRoutes
    },
    {
      path:"/stats",
      route: StatsRoutes
    }
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
})