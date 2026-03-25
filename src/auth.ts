import NextAuth from "next-auth";
import connectDb from "@/app/lib/db";
import User from "@/app/models/user.model";
import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
export const {handlers, signIn, signOut, auth} = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { type: "email", label: "Email", placeholder: "johndoe@gmail.com" },
            },
            password: {
                type: "password",
                label : "Password",
                placeholder: "*****",
            },
            async authorize(credentials: any){
                if(!credentials.email || !credentials.password){
                    throw Error("missing credentials")
                }
                const email = credentials.email;
                const password = credentials.password;
                await connectDb()
                const user=await User.findOne({email})
                if(!user){
                    throw Error("user not found")
                }
                const isMatch=await bcrypt.compare(password, user.password)
                if(!isMatch){
                    throw Error("invalid credentials")
                }
                return {id: user._id, email: user.email, name: user.name, role: user.role}

            } 
        }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID ,
            clientSecret: process.env.AUTH_GOOGLE_SECRET

        })
    ],
    callbacks:{
        async signIn({user, account}: any){
            if(account.provider === "google"){
                await connectDb();
                let dbUser = await User.findOne({email: user.email})
                if(!dbUser){
                    dbUser = await User.create({
                        name: user.name,
                        email: user.email
                    })
                }
                user.id = dbUser._id.toString()
                user.role = dbUser.role
            }
            return true
        },
     async jwt({token, user}: any){
        if(user){
            token.name = user.name,
        token.id = user.id,
        token.email = user.email,
        token.role = user.role
        }

        return token
     }   ,
        async session({session, token}: any){
            if(session.user){
            session.user.name = token.name,
            session.user.email = token.email as string,
            session.user.id = token.id as string,
            session.user.role = token.role as string
            }
            return session
    }


},
pages:{
    signIn: "/signin",
    error: "/signin"},
session:{
    strategy:"jwt",
    maxAge:10*24*60*60
},
secret: process.env.AUTH_SECRET
})