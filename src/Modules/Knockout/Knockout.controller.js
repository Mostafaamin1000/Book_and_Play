import { Tournament } from "../../../DB/Models/tournament.schema.js";
import { TournamentMatch } from "../../../DB/Models/TournamentMatch.schema.js";
import { catchError } from "../../middlewares/catchError.js";
import { AppError } from "../../utils/appError.js";


const generateFirstRound =catchError( async (tournamentId, time) => {
   const tournament = await Tournament.findById(tournamentId).populate('teams');

  if (!tournament) throw new AppError('Tournament not found', 404);

  if (String(tournament.createdBy) !== String(userId)) {
    throw new AppError('You are not authorized to modify this tournament', 403)}

  const teams = tournament.teams;

  if (![4, 8, 16].includes(teams.length)) {
    throw new AppError('Number of teams must be 4, 8, or 16', 400)}

  const roundMap = {
    4: 'semifinal',
    8: 'quarterfinal',
    16: 'round_16'}
  const firstRound = roundMap[teams.length];

  const shuffledTeams = teams.sort(() => Math.random() - 0.5);
  const matches = [];
  for (let i = 0; i < shuffledTeams.length; i += 2) {
    const teamA = shuffledTeams[i];
    const teamB = shuffledTeams[i + 1];
    matches.push({
      tournament: tournament._id,
      round: firstRound,
      fieldId: tournament.field_ids[0], // ممكن تطور التوزيع لاحقًا
      date: tournament.start_date,
      time: {
        start: time.start,
        end: time.end},
      teamA: teamA._id,
      teamB: teamB._id
    })}

  const createdMatches = await TournamentMatch.insertMany(matches);
  return createdMatches;
})

const startTournament = catchError(async (req, res, next) => {
  const { tournamentId } = req.params;
  const { time } = req.body;

  const matches = await generateFirstRound(tournamentId, time, req.user._id);

  res.status(200).json({
    message: 'First round created successfully',
    matches
  });
});

//! for owner to update match result
const updateMatchResult = catchError(async (req, res, next) => {
  const { matchId } = req.params;
  const { scoreA, scoreB, winnerId } = req.body;

  const match = await TournamentMatch.findById(matchId);
  if (!match) return next(new AppError('Match not found', 404));

  const tournament = await Tournament.findById(match.tournament);
  if (!tournament) return next(new AppError('Tournament not found', 404));

  const isOwner = tournament.createdBy.equals(req.user._id);
  if (!isOwner) {
    return next(new AppError('You are not authorized to update this match result', 403))}

  if (tournament.is_private && req.user.institution !== tournament.institution) {
    return next(new AppError('You are not allowed to edit this private tournament', 403))}
  match.score.teamA = scoreA;
  match.score.teamB = scoreB;
  match.winner = winnerId;
  match.status = 'played';

  await match.save();

  if (match.round === 'final') {
    tournament.winner = winnerId;
    tournament.status = 'finished';
    await tournament.save()  }

  res.status(200).json({
    message: 'Match result updated successfully',
    match
  });
});
const roundProgression = {
  round_16: 'quarterfinal',
  quarterfinal: 'semifinal',
  semifinal: 'final'
};

const generateNextRound = async (tournamentId, currentRound, time) => {
  const matches = await TournamentMatch.find({
    tournament: tournamentId,
    round: currentRound,
    status: 'played'
  });

  const allPlayed = matches.length > 0 && matches.every(match => match.winner);
  if (!allPlayed) throw new AppError("Not all matches are completed", 400);

  const nextRound = roundProgression[currentRound];
  if (!nextRound) throw new AppError("Tournament is already completed", 400);

  const winners = matches.map(m => m.winner).sort(() => Math.random() - 0.5);

  const nextMatches = [];

  for (let i = 0; i < winners.length; i += 2) {
    nextMatches.push({
      tournament: tournamentId,
      round: nextRound,
      fieldId: matches[0].fieldId, 
      date: new Date(), 
      time: {
        start: time.start,
        end: time.end
      },
      teamA: winners[i],
      teamB: winners[i + 1]
    });
  }

  const createdMatches = await TournamentMatch.insertMany(nextMatches);
  return createdMatches;
};

const advanceTournamentRound = catchError(async (req, res, next) => {
  const { tournamentId } = req.params;
  const { currentRound, time } = req.body;

  const newMatches = await generateNextRound(tournamentId, currentRound, time);

  res.status(200).json({
    message: `Next round (${newMatches[0]?.round}) generated`,
    matches: newMatches
  });
});

const getWinnersOfRound = catchError(async (req, res, next) => {
  const { tournamentId } = req.params;
  const { round } = req.query;

  if (!round) return next(new AppError("Round is required", 400));

  const matches = await TournamentMatch.find({
    tournament: tournamentId,
    round,
    status: 'played'
  }).populate('winner', 'name logo');

  const winners = matches
    .filter(match => match.winner)
    .map(match => match.winner);

  res.status(200).json({
    message: `Winners of ${round}`,
    winners
  });
});


 const getPlayedMatchesWithWinners = catchError(async (req, res, next) => {
  const { tournamentId } = req.params;

  const matches = await TournamentMatch.find({
    tournament: tournamentId,
    status: 'played'
  })
    .populate('teamA', 'name logo')
    .populate('teamB', 'name logo')
    .populate('winner', 'name logo');

  res.status(200).json({
    message: "Played matches with winners",
    matches
  });
});

const getTournamentMatchesByRound = catchError(async (req, res, next) => {
  const { tournamentId } = req.params;

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) return next(new AppError('Tournament not found', 404));

  const matches = await TournamentMatch.find({ tournament: tournamentId })
    .populate('teamA', 'name logo')
    .populate('teamB', 'name logo')
    .populate('winner', 'name logo')
    .sort({ date: 1 });

  const grouped = {
    round_of_16: [],
    quarterfinal: [],
    semifinal: [],
    final: []
  };

  for (const match of matches) {
    if (match.round === 'round_of_16') grouped.round_of_16.push(match);
    else if (match.round === 'quarterfinal') grouped.quarterfinal.push(match);
    else if (match.round === 'semifinal') grouped.semifinal.push(match);
    else if (match.round === 'final') grouped.final.push(match);
  }

  res.status(200).json({
    tournamentId,
    status: tournament.status,
    rounds: grouped
  });
});


export { 
    startTournament,
    updateMatchResult,
    advanceTournamentRound,
    getWinnersOfRound ,
    getPlayedMatchesWithWinners,
    getTournamentMatchesByRound
}