import { Router } from "express";
import { userRoutes } from "../modules/user/user.routes";
import { authRoutes } from "../modules/auth/auth.routes";
import { WalletRoutes } from "../modules/wallet/wallet.routes";

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
    }
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
})