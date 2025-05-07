import mongoose,{Schema,model} from 'mongoose';

const schema = new Schema({
    name: String,
    address: String,
    is_paid: Boolean,
    price_per_hour: Number,
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
  });
  schema.index({ location: '2dsphere' });
  export const Field = model('Field', schema);