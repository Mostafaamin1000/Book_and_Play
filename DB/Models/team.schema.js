import mongoose , { Schema,model } from 'mongoose';

const teamSchema = new Schema({
  name: { type: String, required: true, unique: true  },
  logo: { type: String }, 
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tournament: {
    type: Schema.Types.ObjectId,
    ref: 'Tournament'
  },
}, { timestamps: true });

export const Team = model('Team', teamSchema);
