import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    // Get current user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Upsert user tier to 'pro' to ensure profile exists
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        email: user.email || '',
        tier: 'pro' 
      });

    if (updateError) {
      console.error("Error updating profile tier:", updateError);
      return NextResponse.json({ 
        error: `Database Error: ${updateError.message}. Did you run the SQL migration?` 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Upgraded to Pro OS" }, { status: 200 });
  } catch (error) {
    console.error("Checkout Mock Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
