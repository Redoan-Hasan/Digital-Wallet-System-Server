import bcrypt from "bcryptjs";
import envVars from "../config/env";
import { User } from "../modules/user/user.model";
import { IUser, Role, Status } from "../modules/user/user.interface";

/* eslint-disable no-console */
export const seedDefaultAdmin = async () => {
  try {
    const isSuperAdminExist = await User.findOne({
      email: envVars.DEFAULT_ADMIN_EMAIL,
    });
    if (isSuperAdminExist) {
      console.log("super admin already exist");
      return;
    }
    const hashedPassword = await bcrypt.hash(
      envVars.DEFAULT_ADMIN_PASSWORD,
      envVars.BCRYPT_SALT_ROUNDS
    );
    const hashedPin = await bcrypt.hash(
      envVars.DEFAULT_ADMIN_PIN,
      envVars.BCRYPT_SALT_ROUNDS
    );
    const payload: IUser = {
      name: "Super Admin",
      email: envVars.DEFAULT_ADMIN_EMAIL,
      password: hashedPassword,
      pin: hashedPin,
      role: Role.ADMIN,
      status: Status.ACTIVE,
    };
    await User.create(payload);
    console.log("default admin seeded");
  } catch (error) {
    console.log(error);
  }
};
