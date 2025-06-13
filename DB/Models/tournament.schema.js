import mongoose, { Schema, model } from 'mongoose';

const tournamentSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  max_teams: { type: Number, required: true },
  field_ids: [{ type: Schema.Types.ObjectId, ref: 'Field' }],
  is_private: { type: Boolean, default: false },
  institution: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
  type: {
    type: String,
    enum: ['knockout'], 
    default: 'knockout'
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'finished'],
    default: 'upcoming'
  },
  winner: {
  type: Schema.Types.ObjectId,
  ref: 'Team',
  default: null
}
}, { timestamps: true });

export const Tournament = model('Tournament', tournamentSchema);
