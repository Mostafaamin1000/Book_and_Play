import authRouter from "./auth/auth.router.js"
import fieldRouter from "./Fields/fields.router.js"
import matchRouter from "./Match/match.router.js"
import teamRouter from "./Team/team.router.js"
import tournamentRouter from "./Tournament/tournament.router.js"
import TournamentStructureRouter from "./TournamentStructure/structure.router.js"


export const bootstrap =(app)=>{
app.use('/api/auth',authRouter)
app.use('/api/field',fieldRouter)
app.use('/api/match',matchRouter)
app.use('/api/tournament',tournamentRouter)
app.use('/api/team',teamRouter)
app.use('/api/structure',TournamentStructureRouter)
}