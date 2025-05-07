import { mongoose } from "mongoose";    

export const dbConnection = mongoose.connect('mongodb://localhost:27017/Hagz')
.then(() => {console.log('connected to database');
})
.catch((err) => {console.log(err)});