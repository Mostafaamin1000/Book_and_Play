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
        enum: ['player','owner', 'admin'],
        default: 'player'
    }
}, {
    timestamps: true
});

schema.pre('save', async function () {
    this.password = await bcrypt.hash(this.password, 10);
})
schema.index({ location: '2dsphere' });
export const User = model('User', schema);