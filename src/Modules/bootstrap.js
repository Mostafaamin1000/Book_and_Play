import authRouter from "./auth/auth.router.js"
import fieldRouter from "./Fields/fields.router.js"
import matchRouter from "./Match/match.router.js"


export const bootstrap =(app)=>{
app.use('/api/auth',authRouter)
app.use('/api/field',fieldRouter)
app.use('/api/match',matchRouter)
}