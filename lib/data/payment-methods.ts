import { createClient } from "@/lib/supabase/server";
import type { PaymentMethodConfig } from "@/lib/types/database";

export async function getActivePaymentMethods(): Promise<PaymentMethodConfig[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("is_active", true)
    .order("method");
  return (data ?? []) as PaymentMethodConfig[];
}

export async function getAllPaymentMethods(): Promise<PaymentMethodConfig[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("payment_methods").select("*").order("method");
  return (data ?? []) as PaymentMethodConfig[];
}
