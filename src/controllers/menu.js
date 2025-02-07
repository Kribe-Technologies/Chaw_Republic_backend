import asyncHandler from '../middlewares/async.js';
import { MenuRepository } from '../repository/menu.js';
import { ErrorResponse } from '../utils/errorResponse.js';
import { AppResponse } from '../utils/appResponse.js';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
export const createMenu = asyncHandler(async (req, res, next) => {
    const { name, description, price, vendorId } = req.body;
    const file = req.file;
    if (!file) {
        throw next(new ErrorResponse('Image is required', 400));
    }
    const result = await cloudinary.v2.uploader.upload(file.path);
    const menu = await MenuRepository.createMenu({
        name,
        description,
        price,
        imageUrl: result.secure_url,
        vendorId
    });
    return AppResponse(res, 201, menu, 'Menu created successfully');

});
export const getMenu = asyncHandler(async (req, res, next) => {
    const menu = await MenuRepository.getMenuById(req.params.id);

    if (!menu) {
        throw next(new ErrorResponse('Menu not found', 404));
    }
    return AppResponse(res, 200, menu, 'Menu retrieved successfully');
});
export const getMenusByVendor = asyncHandler(async (req, res, next) => {
    const menus = await MenuRepository.getMenusByVendor(req.params.vendorId);
    return AppResponse(res, 200, menus, 'Menus retrieved successfully');
});
export const updateMenu = asyncHandler(async (req, res, next) => {
    const { name, description, price } = req.body;
    const file = req.file;
    let updateData = { name, description, price };
    
    if (file) {
        const result = await cloudinary.v2.uploader.upload(file.path);
        updateData.imageUrl = result.secure_url;
    }
    const menu = await MenuRepository.updateMenu(req.params.id, updateData);

    if (!menu) {
        throw next(new ErrorResponse('Menu not found', 404));
    }
    return AppResponse(res, 200, menu, 'Menu updated successfully');
});
export const deleteMenu = asyncHandler(async (req, res, next) => {
    const menu = await MenuRepository.deleteMenu(req.params.id);

    if (!menu) {
        throw next(new ErrorResponse('Menu not found', 404));
    }
    return AppResponse(res, 200, null, 'Menu deleted successfully');
});

