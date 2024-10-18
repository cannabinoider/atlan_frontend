"use server"
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useEffect } from "react";
import { parseJwt, validate } from "./actions/utils";


const verify = async ()=> {
    const cook = cookies().get('auth')?.value;
    return await validate(cook);
}

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const role = await verify();
  console.log("role", role);
  if((path === "/" || path === "/driver" || path === "/admin" ) && role?.role === "user"){
    return NextResponse.redirect(new URL ("/dashboard", req.nextUrl));
  }
  else if((path === "/" || path === "/driver" || path === "/admin" ) && role?.role === "driver"){
    return NextResponse.redirect(new URL ("/driver/dashboard", req.nextUrl));
  }
  else if((path === "/" || path === "/driver" || path === "/admin" ) && role?.role === "admin"){
    return NextResponse.redirect(new URL ("/admin/dashboard", req.nextUrl));
  }
  else if(role?.role === "user" && (path.startsWith("/driver") || path.startsWith("/admin")) ){
    return NextResponse.redirect(new URL ("/dashboard", req.nextUrl));
  }
  else if(role?.role === "admin" && !path.startsWith("/admin" )){
    
    return NextResponse.redirect(new URL ("/admin/dashboard", req.nextUrl));
  }
  else if(role?.role === "driver" && !path.startsWith("/driver") ){
    return NextResponse.redirect(new URL ("/driver/dashboard", req.nextUrl));
  }
  
  // console.log("signup: ",signUpCookie)
  // console.log("middleware: ", path.startsWith("/getuserdetails"), path)

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/status",
    "/driver/dashboard",
    "/admin",
    "/admin/dashboard",
    "/admin/vehicles",
    "/driver",
    "/driver/dashboard",
    "/driver/status",
    "/admin/analytics",
    "/admin/grids"
  ],
};
