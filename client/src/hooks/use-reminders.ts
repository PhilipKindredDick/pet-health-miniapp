import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { CreateReminderRequest, UpdateReminderRequest } from "@shared/schema";

export function useReminders(petId?: number) {
  return useQuery({
    queryKey: [api.reminders.list.path, petId],
    queryFn: async () => {
      let url = api.reminders.list.path;
      if (petId) {
        url += `?petId=${petId}`;
      }
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reminders");
      return api.reminders.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateReminderRequest) => {
      const res = await fetch(api.reminders.create.path, {
        method: api.reminders.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create reminder");
      return api.reminders.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reminders.list.path] });
    },
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateReminderRequest) => {
      const url = buildUrl(api.reminders.update.path, { id });
      const res = await fetch(url, {
        method: api.reminders.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update reminder");
      return api.reminders.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reminders.list.path] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.reminders.delete.path, { id });
      const res = await fetch(url, {
        method: api.reminders.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete reminder");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reminders.list.path] });
    },
  });
}
