import { Schema, model } from  'mongoose';
const menuSchema = new Schema({ 
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true }
}, { 
    timestamps: true
});
const Menu = model('Menu', menuSchema);

export default Menu;