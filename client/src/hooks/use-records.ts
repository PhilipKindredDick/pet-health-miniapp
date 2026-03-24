import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateRecordRequest, type UpdateRecordRequest } from "@shared/routes";

export function useRecords(petId: number) {
  return useQuery({
    queryKey: [api.records.list.path, petId],
    queryFn: async () => {
      const url = buildUrl(api.records.list.path, { petId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch medical records");
      return api.records.list.responses[200].parse(await res.json());
    },
    enabled: !!petId,
  });
}

export function useCreateRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateRecordRequest) => {
      const res = await fetch(api.records.create.path, {
        method: api.records.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create record");
      return api.records.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.records.list.path, data.petId] });
      // Also invalidate reminders as adding a record might update reminders context
      queryClient.invalidateQueries({ queryKey: [api.reminders.list.path] });
    },
  });
}

export function useUpdateRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateRecordRequest) => {
      const url = buildUrl(api.records.update.path, { id });
      const res = await fetch(url, {
        method: api.records.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update record");
      return api.records.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.records.list.path, data.petId] });
    },
  });
}

export function useDeleteRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, petId }: { id: number; petId: number }) => {
      const url = buildUrl(api.records.delete.path, { id });
      const res = await fetch(url, {
        method: api.records.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete record");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.records.list.path, variables.petId] });
    },
  });
}
