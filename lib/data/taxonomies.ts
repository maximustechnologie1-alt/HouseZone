import { createClient } from "@/lib/supabase/server";
import type { City, Neighborhood, PropertyCategory } from "@/lib/types/database";

export async function getCities(): Promise<City[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("cities").select("*").eq("active", true).order("name");
  return data ?? [];
}

export async function getNeighborhoods(cityId?: string): Promise<Neighborhood[]> {
  const supabase = await createClient();
  let query = supabase.from("neighborhoods").select("*").eq("active", true).order("name");
  if (cityId) query = query.eq("city_id", cityId);
  const { data } = await query;
  return data ?? [];
}

export async function getCategories(): Promise<PropertyCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("property_categories")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  return data ?? [];
}
