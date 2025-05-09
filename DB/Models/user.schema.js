import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    city: {
        type: String,
        required: true
    },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] }, // [lng, lat]
      },
      preferred_distance: Number, // e.g. 500 (meters)
    role: {
        type: String,
        enum: ['player','owner'],
        default: 'player'
    },
    match: [{
        type: Schema.Types.ObjectId,
        ref: 'Match'
    }]
}, {
    timestamps: true
});

schema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); 
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

schema.pre('findOneAndUpdate',function(){
    if(this._update.password)  this._update.password =bcrypt.hashSync(this._update.password , 10)
    })
schema.index({ location: '2dsphere' });
export const User= model('User', schema);