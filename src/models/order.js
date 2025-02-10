import { Schema, model, Document, Types } from 'mongoose';

const orderItemSchema = new Schema({
  menuItem: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  riderId: { type: Schema.Types.ObjectId, ref: 'Rider' },
  items: [orderItemSchema],
  totalPrice: { type: Number, required: true },
  availableForPickup: { type: Boolean, default: false },
  orderStatus: { 
    type: String, 
    enum: ['new', 'in-transit', 'delivered'], 
    default: 'new',
  },
  acceptedStatus: { 
    type: String, 
    enum: ['accepted', 'pending', 'declined'], 
    default: 'accepted',
  },
  deliveredStatus: { type: Boolean, default: false },
  pickedUp: { type: Boolean, default: false },
  confirmDeliverdByCustomer: { type: Boolean, default: false },
  deliveryFee: { type: Number, required: true}
}, {
  timestamps: true,
  toJSON: { 
    transform: function (doc, ret) {
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;
    }
  }
});

const Order = model('Order', orderSchema);

export default Order;