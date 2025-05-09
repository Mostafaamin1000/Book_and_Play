import mongoose ,{Schema,model} from 'mongoose';

const schema = new Schema({ 
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: Date,
    time: {
      start: { type: String, required: true }, 
      end: { type: String, required: true }, 
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' },
    max_players: Number,
    current_players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['open', 'full', 'completed'], default: 'open' },
  });
  schema.index({ location: '2dsphere' });
  export const Match = model('Match', schema);