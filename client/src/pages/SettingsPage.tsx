import { Button } from "@/components/ui/button";
import { useImportData, fetchExportData } from "@/hooks/use-backup";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, Shield, Info, Languages, Send } from "lucide-react";
import { useTelegram } from "@/hooks/use-telegram";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
  const { mutate: importData, isPending: isImporting } = useImportData();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  const handleExport = async () => {
    try {
      const data = await fetchExportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pet_passport_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast({ title: t("settings.export"), description: t("settings.export_success") });
    } catch (e) {
      toast({ title: t("settings.export_fail"), description: t("settings.export_fail_desc"), variant: "destructive" });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        importData(json, {
          onSuccess: () => {
            toast({ title: t("settings.import"), description: t("settings.import_success") });
          },
          onError: () => {
            toast({ title: t("settings.import_fail"), description: t("settings.import_fail_desc"), variant: "destructive" });
          }
        });
      } catch (err) {
        toast({ title: t("settings.error"), description: t("settings.json_parse_fail"), variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <header className="bg-background pt-12 px-6 sticky top-0 z-10 border-b border-border/50 h-[88px] flex items-end pb-3">
        <h1 className="text-2xl font-bold font-display">{t("nav.settings")}</h1>
      </header>

      <main className="px-6 py-6 space-y-6">
        <section className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <Languages className="w-5 h-5 text-primary" />
              {t("settings.language")}
            </h2>
          </div>
          <div className="p-4">
            <Select value={i18n.language} onValueChange={(val) => i18n.changeLanguage(val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("settings.select_language")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ru">Русский</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {t("settings.export")} / {t("settings.import")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{t("settings.backup_desc")}</p>
          </div>
          
          <div className="p-4 space-y-4">
            <Button onClick={handleExport} variant="outline" className="w-full justify-start h-auto py-3 px-4">
              <div className="bg-primary/10 p-2 rounded-lg mr-3">
                <Download className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium">{t("settings.export")}</div>
                <div className="text-xs text-muted-foreground">{t("settings.download_json")}</div>
              </div>
            </Button>

            <div className="relative">
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImport} 
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                disabled={isImporting}
              />
              <Button variant="outline" className="w-full justify-start h-auto py-3 px-4">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <Upload className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{isImporting ? t("settings.importing") : t("settings.import")}</div>
                  <div className="text-xs text-muted-foreground">{t("settings.restore_json")}</div>
                </div>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-500" />
              {t("settings.telegram_title")}
            </h2>
          </div>
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              {t("settings.telegram_desc")}
            </p>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              {t("settings.about")}
            </h2>
          </div>
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              {t("settings.about_version")}
              <br />
              {t("settings.about_desc")}
            </p>
          </div>
        </section>
        
      </main>
    </div>
  );
}
