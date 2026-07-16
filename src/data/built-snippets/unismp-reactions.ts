export function useReactions(entityType: EntityType, entityId: string, userId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['reactions', entityType, entityId];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<ReactionSummary[]> => {
      const { data, error } = await supabase
        .from('reactions')
        .select('type, user_id')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);

      if (error) throw error;

      const map = new Map<string, { count: number; reacted: boolean }>();
      for (const row of data ?? []) {
        const existing = map.get(row.type) ?? { count: 0, reacted: false };
        existing.count++;
        if (row.user_id === userId) existing.reacted = true;
        map.set(row.type, existing);
      }
      return [...map].map(([type, v]) => ({ type, ...v }));
    },
  });
}
