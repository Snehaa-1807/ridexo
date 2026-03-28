import connectDb from "@/app/lib/db";
import User from "@/app/models/user.model";
export async function POST(req: Request) {
try{
    await connectDb()
    const {email,otp}= await req.json()
    if(!email && !otp){
        return Response.json({message: "Email and OTP are required"}, {status: 400})
    }
    let user = await User.findOne({email})
    if(!user){
        return Response.json({message: "User not found"}, {status: 404})
    }
    if(user.isEmailVerified){
        return Response.json({message: "Email is already verified"}, {status: 400})
    }
    if(!user.otpExpiresAt || user.otpExpiresAt < new Date() ){
        return Response.json({message: "otp has expired"}, {status: 400})
    }
    if(!user.otp || user.otp!=otp  ){
        return Response.json({message: "invalid otp"}, {status: 400})
    }
    user.isEmailVerified= true;
    user.otp= undefined;
    user.otpExpiresAt= undefined;
    await user.save();

        return Response.json({message: "email is verified"}, {status: 200})
    
}catch (error: unknown){
    const err = error as Error;
    return Response.json({message: `verify email error ${err.message}`}, {status: 500})
    

}
}


