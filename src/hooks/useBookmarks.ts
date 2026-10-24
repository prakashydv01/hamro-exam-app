import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getBookmarks, addBookmark, removeBookmark } from '@/api/bookmarks';
import { QUERY_KEYS } from '@/constants/config';

export function useBookmarks() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.bookmarks,
    queryFn: getBookmarks,
  });

  const add = useMutation({
    mutationFn: addBookmark,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookmarks }),
  });

  const remove = useMutation({
    mutationFn: removeBookmark,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookmarks }),
  });

  return { ...query, addBookmark: add.mutate, removeBookmark: remove.mutate };
}
