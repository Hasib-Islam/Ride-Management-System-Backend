import { Router } from 'express';
import { UploadController } from './upload.controller';
import { AuthMiddleware } from '../../middlewares/auth';
import upload from '../../middlewares/upload';

const router = Router();

router.post(
  '/profile-picture',
  AuthMiddleware.authenticate,
  upload.single('image'),
  UploadController.uploadProfilePicture
);

export const UploadRoutes = router;
