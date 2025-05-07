import authRouter from "./auth/auth.router.js"


export const bootstrap =(app)=>{
app.use('/api/auth',authRouter)
}