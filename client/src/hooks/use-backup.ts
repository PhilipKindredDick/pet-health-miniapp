import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type FullBackup } from "@shared/routes";

export function useImportData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FullBackup) => {
      const res = await fetch(api.backup.import.path, {
        method: api.backup.import.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to import data");
      return api.backup.import.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate everything to show imported data
      queryClient.invalidateQueries();
    },
  });
}

export async function fetchExportData(): Promise<FullBackup> {
  const res = await fetch(api.backup.export.path, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to export data");
  return api.backup.export.responses[200].parse(await res.json());
}
