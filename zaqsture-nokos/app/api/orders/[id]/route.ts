import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/user-auth";
import { otpProvider } from "@/lib/providers";

export async function GET(req:Request,ctx:{params:Promise<{id:string}>}) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({error:"Silakan login terlebih dahulu."},{status:401});
    const {id}=await ctx.params;
    const {data:order,error}=await db().from("orders").select("*").eq("id",id).eq("user_id",user.id).single();
    if(error || !order) return NextResponse.json({error:"Pesanan tidak ditemukan."},{status:404});
    const status = await otpProvider("status", {order_id:order.provider_order_id});
    const updates:any = {status:String(status.status || order.status), provider_response:{...(order.provider_response || {}), ...status}};
    const {data:updated,error:updateError}=await db().from("orders").update(updates).eq("id",id).select().single();
    if(updateError) throw updateError;
    return NextResponse.json({order:{id:updated.id,provider_order_id:updated.provider_order_id,service:updated.service,phone_number:updated.phone_number,number:updated.phone_number,status:updated.status,price:updated.price,otp:status.otp_code || status.otp_code_2 || null,full_sms:status.full_sms || null,expires_in:status.expires_in}});
  } catch(e:any) { return NextResponse.json({error:e.message || "Gagal mengecek OTP."},{status:502}); }
}

export async function POST(req:Request,ctx:{params:Promise<{id:string}>}) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({error:"Silakan login terlebih dahulu."},{status:401});
    const {id}=await ctx.params;
    const body=await req.json();
    const {data:order,error}=await db().from("orders").select("*").eq("id",id).eq("user_id",user.id).single();
    if(error || !order) return NextResponse.json({error:"Pesanan tidak ditemukan."},{status:404});
    if(!["cancel","resend"].includes(body.action)) return NextResponse.json({error:"Aksi tidak dikenal."},{status:400});
    const result=await otpProvider(String(body.action),{order_id:Number(order.provider_order_id)},"POST");
    const status=String(result.status || result.new_status || order.status);
    const {data:updated,error:updateError}=await db().from("orders").update({status,provider_response:{...(order.provider_response||{}),...result}}).eq("id",id).select().single();
    if(updateError) throw updateError;
    return NextResponse.json({message:result.message || (body.action==="cancel"?"Pesanan dibatalkan.":"Permintaan OTP ulang dikirim."),order:{id:updated.id,provider_order_id:updated.provider_order_id,service:updated.service,phone_number:updated.phone_number,number:updated.phone_number,status:updated.status,price:updated.price,otp:result.otp_code || null}});
  } catch(e:any) { return NextResponse.json({error:e.message || "Aksi pesanan gagal."},{status:502}); }
}

export async function PATCH(req:Request,ctx:{params:Promise<{id:string}>}){try{if(!await isAdmin())return NextResponse.json({error:"Tidak diizinkan."},{status:401});const {id}=await ctx.params;const body=await req.json();const allowed=["pending","active","completed","cancelled","failed","refunded"];if(!allowed.includes(body.status))return NextResponse.json({error:"Status tidak valid."},{status:400});const {data,error}=await db().from("orders").update({status:body.status,admin_note:String(body.admin_note||"")}).eq("id",id).select().single();if(error)throw error;return NextResponse.json({order:data});}catch(e:any){return NextResponse.json({error:e.message},{status:500});}}