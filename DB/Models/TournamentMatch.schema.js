import mongoose, { Schema, model } from 'mongoose';

const tournamentMatchSchema = new Schema({
  tournament: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
  round: {
    type: String,
    enum: ['round_16', 'quarterfinal', 'semifinal', 'final'],
    required: true
  },
  fieldId: { type: Schema.Types.ObjectId, ref: 'Field', required: true },
  date: { type: Date, required: true },
  time: {
    start: { type: String, required: true },
    end: { type: String, required: true }
  },
  teamA: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  teamB: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  score: {
    teamA: { type: Number, default: null },
    teamB: { type: Number, default: null }
  },
  winner: { type: Schema.Types.ObjectId, ref: 'Team' },
  status: {
    type: String,
    enum: ['scheduled', 'played'],
    default: 'scheduled'
  }
}, { timestamps: true });

export const TournamentMatch = model('TournamentMatch', tournamentMatchSchema);
