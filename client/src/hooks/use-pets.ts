import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreatePetRequest, type UpdatePetRequest } from "@shared/routes";

export function usePets() {
  return useQuery({
    queryKey: [api.pets.list.path],
    queryFn: async () => {
      const res = await fetch(api.pets.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch pets");
      return api.pets.list.responses[200].parse(await res.json());
    },
  });
}

export function usePet(id: number) {
  return useQuery({
    queryKey: [api.pets.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.pets.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch pet details");
      return api.pets.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreatePet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePetRequest) => {
      const res = await fetch(api.pets.create.path, {
        method: api.pets.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.pets.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create pet");
      }
      return api.pets.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.pets.list.path] });
    },
  });
}

export function useUpdatePet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdatePetRequest) => {
      const url = buildUrl(api.pets.update.path, { id });
      const res = await fetch(url, {
        method: api.pets.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update pet");
      return api.pets.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.pets.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.pets.get.path, data.id] });
    },
  });
}

export function useDeletePet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.pets.delete.path, { id });
      const res = await fetch(url, {
        method: api.pets.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete pet");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.pets.list.path] });
    },
  });
}
