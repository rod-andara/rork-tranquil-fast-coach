type SupabaseFast = {
  user_id: string;
  id: string;
  startTime: number;
  endTime: number | null;
  plannedDuration: number;
  completed: boolean;
  plan?: string;
};

export async function supabaseUpsertFast(_fast: SupabaseFast): Promise<void> {
  console.log('[supabase] upsert fast stub', _fast.id);
}
