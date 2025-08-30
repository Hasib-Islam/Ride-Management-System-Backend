import { IUserDocument } from '../../app/modules/user/user.interface';

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}
