import Menu from '../models/menu';
export class MenuRepository {
    static async createMenu(data) {
        const menu = new Menu(data);
        return await menu.save();
    }
    static async getMenuById(id) {
        return await Menu.findById(id);
    }
    static async getMenusByVendor(vendorId) {
        return await Menu.find({ vendorId });
    }
    static async updateMenu(id, data) {
        return await Menu.findByIdAndUpdate(id, data, { new: true });
}
    static async deleteMenu(id) {
        return await Menu.findByIdAndDelete(id);
    }
}