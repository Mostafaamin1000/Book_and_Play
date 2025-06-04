import mongoose , { Schema,model } from 'mongoose';

const schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  max_teams: { type: Number, required: true },
  field_ids: [{ type: Schema.Types.ObjectId, ref: 'Field' }],
  is_private: { type: Boolean, default: false },
  institution: { type: String },
  createdBy: { type:Schema.Types.ObjectId, ref: 'User', required: true },
  teams: [{ type:Schema.Types.ObjectId, ref: 'Team' }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'finished'],
    default: 'upcoming'
  }
}, { timestamps: true });

export const Tournament = model('Tournament', schema);