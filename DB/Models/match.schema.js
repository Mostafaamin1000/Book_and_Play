import mongoose ,{Schema,model} from 'mongoose';

const schema = new Schema({ 
  fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' },
    date: Date,
    time: {
      start: { type: String, required: true }, 
      end: { type: String, required: true }, 
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    max_players: Number,
    current_players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['open', 'full'], default: 'open' },
  },{timestamps:true,
    toJSON:{virtuals:true}
  });


  schema.index({ location: '2dsphere' });
  export const Match = model('Match', schema);