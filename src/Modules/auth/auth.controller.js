import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
dotenv.config()
import { catchError } from '../../middlewares/catchError.js'
import { User } from '../../../DB/Models/user.schema.js'
import { AppError } from '../../utils/appError.js'



const signup =catchError( async(req,res,next)=>{    
    let user = new User(req.body)
    await user.save()
    res.status(201).json({message:"User Created .." , user})
})

const signin =catchError( async(req,res,next)=>{
    let user =await User.findOne({email : req.body.email})
    if(!user) return next(new AppError('Email or Password incorrect ..',404))
    let match =await bcrypt.compare(req.body.password , user.password )
    if(!match) return next(new AppError('Email or Password incorrect...',404))
jwt.sign({userId:user._id , name:user.name, role:user.role ,institution: user.institution  }, process.env.SECRET_KEY , (err,token)=>{
    res.status(200).json({message:"Login Successfully  ..", token, user }  )
})})
    

const changeUserPassword = catchError(async (req, res, next) => {
  const { email, oldPassword, newPassword } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) return next(new AppError('Email or Password incorrect ..', 404));
  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) return next(new AppError('Email or Password incorrect...', 404));
  await User.findOneAndUpdate(
    { email },
    { password: newPassword, passwordChangedAt: Date.now() }
  );
  const updatedUser = await User.findOne({ email });
  jwt.sign(
    { userId: updatedUser._id, name: updatedUser.name, role: updatedUser.role },
    process.env.SECRET_KEY,
    (err, token) => {
      res.status(200).json({
        message: "Password changed successfully",
        token,
        user: updatedUser
      });
    }
  );
});


const protectedRouter = catchError(async (req, res, next) => {
  const { token } = req.headers;
  if (!token) return next(new AppError('Token not provided..', 401));

  let userPayload;
  try {
    userPayload = jwt.verify(token, process.env.SECRET_KEY); // 👈 sync version
  } catch (err) {
    return next(new AppError(err.message, 401));
  }

  const user = await User.findById(userPayload.userId);
  if (!user) return next(new AppError('User not found..', 401));

  if (user.passwordChangedAt) {
    const time = parseInt(user.passwordChangedAt.getTime() / 1000);
    if (time > userPayload.iat) {
      return next(new AppError('Invalid token, sign in again..', 401));
    }
  }

req.user = {
    _id: user._id,
    name: user.name,
    role: user.role,
    institution: user.institution 
  };
  next();
});


const allowTo =(...roles)=>{
    return catchError((req,res,next)=>{
if(roles.includes(req.user.role)){
return next()
}
return next(new AppError('you are not authorized to access this endpoint..',401))
    })
}

    export {
        signin,
        signup,
        changeUserPassword,
        protectedRouter,
        allowTo
    }