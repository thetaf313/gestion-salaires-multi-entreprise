import { Router } from 'express';

import { authController } from '../controllers/auth.controller.js';
import { loginSchema, registerSchema } from '../schemas/auth.schemas.js';
import validateSchema from '../middlewares/validateSchema.js';

const router = Router();

router.post('/login', validateSchema(loginSchema), authController.login);
router.post('/register', validateSchema(registerSchema), authController.register);
router.post('/refresh-token', authController.refreshToken);

router.post('/logout', authController.logout);

export default router;