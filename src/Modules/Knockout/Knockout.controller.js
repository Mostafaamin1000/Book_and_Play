import { Tournament } from "../../../DB/Models/tournament.schema.js";
import { TournamentMatch } from "../../../DB/Models/TournamentMatch.schema.js";
import { catchError } from "../../middlewares/catchError.js";
import { AppError } from "../../utils/appError.js";

const generateOrAdvanceRound = catchError(async (req, res, next) => {
  const { tournamentId } = req.params;
  const { times } = req.body;
  const userId = req.user._id;

  const tournament = await Tournament.findById(tournamentId)
    .populate('teams')
    .populate('field_ids');

  if (!tournament) return next(new AppError('Tournament not found', 404));
  if (String(tournament.createdBy) !== String(userId)) {
    return next(new AppError('Unauthorized', 403));
  }
  if (!tournament.field_ids || tournament.field_ids.length === 0) {
    return next(new AppError('No fields available for this tournament', 400));
  }

  const teams = tournament.teams;
  if (![4, 8, 16].includes(teams.length)) {
    return next(new AppError('Teams must be 4, 8 or 16', 400));
  }

  const allMatches = await TournamentMatch.find({ tournament: tournament._id }).sort({ createdAt: 1 });

  // ✅ لو دي أول راوند نولّد الماتشات ونغير الحالة لـ ongoing
  if (allMatches.length === 0) {
    const numberOfMatches = teams.length / 2;
    if (!Array.isArray(times) || times.length !== numberOfMatches) {
      return next(new AppError(`You must provide ${numberOfMatches} match times`, 400));
    }

    const roundMap = {
      4: 'semifinal',
      8: 'quarterfinal',
      16: 'round_of_16'
    };
    const firstRound = roundMap[teams.length];
    const shuffledTeams = teams.sort(() => Math.random() - 0.5);

    const matches = [];
    for (let i = 0; i < shuffledTeams.length; i += 2) {
      matches.push({
        tournament: tournament._id,
        round: firstRound,
        fieldId: tournament.field_ids[0],
        date: tournament.start_date,
        time: {
          start: times[i / 2].start,
          end: times[i / 2].end
        },
        teamA: shuffledTeams[i]._id,
        teamB: shuffledTeams[i + 1]._id
      });
    }

    // ✅ تحديث الحالة إلى "ongoing"
    tournament.status = 'ongoing';
    await tournament.save();

    const created = await TournamentMatch.insertMany(matches);
    return res.status(200).json({ message: `First round (${firstRound}) generated`, matches: created });
  }

  // ✅ راوند موجود → نولّد اللي بعده
  const roundProgression = {
    round_of_16: 'quarterfinal',
    quarterfinal: 'semifinal',
    semifinal: 'final'
  };

  const lastRound = allMatches[allMatches.length - 1].round;
  const lastRoundMatches = allMatches.filter(m => m.round === lastRound);

  const allPlayed = lastRoundMatches.every(m => m.status === 'played');
  if (!allPlayed) return next(new AppError("Not all matches in current round are completed", 400));

  const nextRound = roundProgression[lastRound];

  // ✅ لو مفيش راوند بعد كده → البطولة خلصت
  if (!nextRound) {
    tournament.status = 'finished';
    await tournament.save();
    return res.status(200).json({ message: "Tournament finished", status: "finished" });
  }

  const winners = lastRoundMatches.map(m => m.winner).sort(() => Math.random() - 0.5);
  if (!Array.isArray(times) || times.length !== winners.length / 2) {
    return next(new AppError(`You must provide ${winners.length / 2} match times`, 400));
  }

  const nextMatches = [];
  for (let i = 0; i < winners.length; i += 2) {
    nextMatches.push({
      tournament: tournament._id,
      round: nextRound,
      fieldId: tournament.field_ids[0],
      date: new Date(),
      time: {
        start: times[i / 2].start,
        end: times[i / 2].end
      },
      teamA: winners[i],
      teamB: winners[i + 1]
    });
  }

  const createdNext = await TournamentMatch.insertMany(nextMatches);
  return res.status(200).json({ message: `Next round (${nextRound}) generated`, matches: createdNext });
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
    generateOrAdvanceRound,
    updateMatchResult,
    getWinnersOfRound ,
    getPlayedMatchesWithWinners,
    getTournamentMatchesByRound
}