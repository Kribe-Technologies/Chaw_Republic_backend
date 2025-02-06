import express from 'express';
import { createMenu, getMenu, getMenusByVendor, updateMenu, deleteMenu } from '../controllers/menu.js';
import upload from '../utils/multer.js';

const router = express.Router();

router.post('/', upload.single('image'), createMenu);
router.get('/:id', getMenu);
router.get('/vendor/:vendorId', getMenusByVendor);
router.put('/:id', upload.single('image'), updateMenu);
router.delete('/:id', deleteMenu);

export default router;