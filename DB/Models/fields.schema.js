import mongoose,{Schema,model} from 'mongoose';

const schema = new Schema({
    name: String,
    image: String,
    city: String,
    country: String,
    capacity: Number,
    is_paid: Boolean,
    price_per_hour: Number,
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    location_info : String,
    amenities:[{
      parking: Boolean,
      ball_rent:Boolean,
      toilets: Boolean,
      changing_rooms: Boolean,
      cafeteria:Boolean,
      lighting_quality: Boolean,
      field_quality: Boolean
    }],
    owner: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true}
  });
  
// schema.post('init',function (doc){
// if(doc.image) doc.image = "https://book-and-play.vercel.app/uploads/field/" + doc.image
// })
  schema.index({ location: '2dsphere' });
  export const Field = model('Field', schema);