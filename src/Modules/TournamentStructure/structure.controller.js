import { Field } from "../../../DB/Models/fields.schema.js";
import { Team } from "../../../DB/Models/team.schema.js"
import { Tournament } from "../../../DB/Models/tournament.schema.js";
import { TournamentMatch } from "../../../DB/Models/TournamentMatch.schema.js";
import { catchError } from "../../middlewares/catchError.js";
import { AppError } from "../../utils/appError.js";



function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

const generateGroupMatches = (teams, groupName) => {
  const matches = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        teamA: teams[i],
        teamB: teams[j],
        group: groupName,
        round: "group",
      });
    }
  }
  return matches;
};

const generateGroupStageMatches = catchError(async (req, res, next) => {
  const { tournamentId } = req.params;

  const tournament = await Tournament.findById(tournamentId).populate("teams");
  if (!tournament) return next(new AppError("Tournament not found", 404));

  const teams = shuffle([...tournament.teams]);

  if (![8, 16].includes(tournament.max_teams) || teams.length !== tournament.max_teams)
    return next(new AppError("Tournament must have exactly 8 or 16 teams to generate matches", 400));

  // تقسيم إلى مجموعتين
  const groupA = teams.slice(0, 4);
  const groupB = teams.slice(4, 8);

  // توليد الماتشات
  const groupAMatches = generateGroupMatches(groupA, "A");
  const groupBMatches = generateGroupMatches(groupB, "B");

  // اختيار ملعب واحد مبدئيًا من الملاعب المتاحة
  const fields = await Field.find({ _id: { $in: tournament.field_ids } });
  if (fields.length === 0) return next(new AppError("No fields assigned to tournament", 400));

  const scheduledMatches = [...groupAMatches, ...groupBMatches].map((match, index) => {
    const field = fields[index % fields.length];
    const matchDate = new Date(tournament.start_date);
    matchDate.setDate(matchDate.getDate() + index); // كل ماتش في يوم مختلف مبدئيًا

    return {
      tournament: tournament._id,
      round: match.round,
      group: match.group,
      teamA: match.teamA,
      teamB: match.teamB,
      fieldId: field._id,
      date: matchDate,
      time: {
        start: "18:00", // مؤقتًا
        end: "19:00"
      },
      status: "scheduled"
    };
  });

  await TournamentMatch.insertMany(scheduledMatches);

  res.status(201).json({ message: "Group stage matches generated", total: scheduledMatches.length });
});

const calculateGroupStandings = async (tournamentId, group) => {
  const matches = await TournamentMatch.find({
    tournament: tournamentId,
    round: "group",
    group,
    status: "completed"
  });

  const standings = {};

  for (const match of matches) {
    const { teamA, teamB, scoreA, scoreB } = match;

    // Initialize teams if not exist
    if (!standings[teamA]) standings[teamA] = { teamId: teamA.toString(), points: 0 };
    if (!standings[teamB]) standings[teamB] = { teamId: teamB.toString(), points: 0 };

    if (scoreA > scoreB) {
      standings[teamA].points += 3;
    } else if (scoreA < scoreB) {
      standings[teamB].points += 3;
    } else {
      standings[teamA].points += 1;
      standings[teamB].points += 1;
    }
  }

  // ترتيب الفرق حسب النقاط
  return Object.values(standings).sort((a, b) => b.points - a.points).slice(0, 2);
};

const generateKnockoutMatches = catchError(async (req, res, next) => {
  const { tournamentId } = req.params;

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) return next(new AppError("Tournament not found", 404));

  // احسب أول وتاني كل مجموعة
  const topGroupA = await calculateGroupStandings(tournamentId, "A");
  const topGroupB = await calculateGroupStandings(tournamentId, "B");

  if (topGroupA.length < 2 || topGroupB.length < 2) {
    return next(new AppError("Not enough results to generate knockout stage", 400));
  }

  const fields = await Field.find({ _id: { $in: tournament.field_ids } });
  if (fields.length === 0) return next(new AppError("No fields assigned to tournament", 400));

  const semiFinals = [
    {
      teamA: topGroupA[0].teamId,
      teamB: topGroupB[1].teamId,
      round: "semifinal"
    },
    {
      teamA: topGroupB[0].teamId,
      teamB: topGroupA[1].teamId,
      round: "semifinal"
    }
  ];

  const matchDate = new Date(tournament.end_date);
  matchDate.setDate(matchDate.getDate() - 2); // قبل النهاية بيومين

  const semiFinalMatches = semiFinals.map((match, i) => ({
    tournament: tournament._id,
    round: match.round,
    teamA: match.teamA,
    teamB: match.teamB,
    fieldId: fields[i % fields.length]._id,
    date: new Date(matchDate.getTime() + i * 60 * 60 * 1000), // ساعة فرق بين الماتشات
    time: {
      start: "18:00",
      end: "19:00"
    },
    status: "scheduled"
  }));

  await TournamentMatch.insertMany(semiFinalMatches);

  res.status(201).json({ message: "Semifinal matches generated", matches: semiFinalMatches });
});

const generateFinalMatch = catchError(async (req, res, next) => {
  const { tournamentId } = req.params;

  const semiFinalMatches = await TournamentMatch.find({
    tournament: tournamentId,
    round: 'semifinal',
    status: 'completed'
  });

  if (semiFinalMatches.length < 2) {
    return next(new AppError("Both semifinals must be completed", 400));
  }

 // نحدد الفايزين من كل ماتش
const winners = semiFinalMatches.map(match => {
  const scoreA = match.score?.teamA ?? 0;
  const scoreB = match.score?.teamB ?? 0;

  if (scoreA > scoreB) return match.teamA;
  else if (scoreB > scoreA) return match.teamB;
  else return null; // ماتش تعادل، محتاج حل
});

  if (winners.includes(null)) {
    return next(new AppError("One or more semifinals ended in a draw. Resolve winner manually.", 400));
  }

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) return next(new AppError("Tournament not found", 404));

  const fields = await Field.find({ _id: { $in: tournament.field_ids } });
  if (!fields.length) return next(new AppError("No fields available for final", 400));

  const finalDate = new Date(tournament.end_date); 

  const finalMatch = await TournamentMatch.create({
    tournament: tournament._id,
    round: 'final',
    teamA: winners[0],
    teamB: winners[1],
    fieldId: fields[0]._id,
    date: finalDate,
    time: {
      start: "19:00",
      end: "20:00"
    },
    status: "scheduled"
  });

  res.status(201).json({ message: "Final match created", match: finalMatch });
});

 const updateMatchScore = catchError(async (req, res, next) => {
  const { matchId } = req.params;
  const { teamAScore, teamBScore } = req.body;

  if (teamAScore == null || teamBScore == null){
    return next(new AppError("Both scores are required", 400));}

  if (teamAScore < 0 || teamBScore < 0){
    return next(new AppError("Scores must be 0 or greater", 400));}

  const match = await TournamentMatch.findById(matchId);
  if (!match) return next(new AppError("Match not found", 404));

  if (match.round === 'final' && match.status === 'played') {
    return next(new AppError("Final match score cannot be changed after being played", 403));
  }

  if (match.status !== 'scheduled') {
    return next(new AppError("Cannot update score of a match that is already played", 400));
  }

  if ((match.round === 'semifinal' || match.round === 'final') && teamAScore === teamBScore) {
    return next(new AppError("Draws are not allowed in knockout rounds", 400));
  }

  match.score = {
    teamA: teamAScore,
    teamB: teamBScore
  };

  if (teamAScore > teamBScore) {
    match.winner = match.teamA;
  } else if (teamBScore > teamAScore) {
    match.winner = match.teamB;
  } else {
    match.winner = null; 
  }
  match.status = "played";
  await match.save();
  res.status(200).json({ message: "Match score updated successfully", match });
});


export { generateGroupStageMatches , generateKnockoutMatches , generateFinalMatch , updateMatchScore };