import { envVars } from '../config/env';
import { IAuthProvider, IUser, Role } from '../modules/user/user.interface';
import { User } from '../modules/user/user.model';
import bcrypt from 'bcryptjs';

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await User.findOne({
      email: envVars.SUPER_ADMIN_EMAIL,
    });

    if (isSuperAdminExist) {
      console.log('Super admin already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(
      envVars.SUPER_ADMIN_PASSWORD,
      Number(envVars.BCRYPT_SALT_ROUNDS)
    );

    const authProvider: IAuthProvider = {
      provider: 'credentials',
      providerId: envVars.SUPER_ADMIN_EMAIL,
    };

    const payload: IUser = {
      _id: undefined as any,
      name: 'Super Admin',
      role: Role.ADMIN,
      email: envVars.SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      isVerified: true,
      auths: [authProvider],
    };

    const superAdmin = await User.create(payload);
    console.log('Super admin created:', superAdmin);
  } catch (error) {
    console.log('Error seeding super admin:', error);
  }
};
