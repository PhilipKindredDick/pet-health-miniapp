import { useRoute } from "wouter";
import { usePet, useDeletePet } from "@/hooks/use-pets";
import { useRecords, useDeleteRecord } from "@/hooks/use-records";
import { AddRecordDialog } from "@/components/AddRecordDialog";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RecordIcon } from "@/components/RecordIcon";
import { format, differenceInYears, differenceInMonths } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ArrowLeft, Trash2, Calendar, Weight, Info, FileDown } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { EditPetDialog } from "@/components/EditPetDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function PetDetails() {
  const [, params] = useRoute("/pets/:id");
  const petId = Number(params?.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === "ru" ? ru : enUS;

  const { data: pet, isLoading: loadingPet } = usePet(petId);
  const { data: records, isLoading: loadingRecords } = useRecords(petId);
  const { mutate: deletePet } = useDeletePet();
  const { mutate: deleteRecord } = useDeleteRecord();

  if (loadingPet) return <div className="p-6 space-y-4"><Skeleton className="h-64 w-full rounded-3xl" /></div>;
  if (!pet) return <div className="p-6 text-center">{t("pet.not_found")}</div>;

  const years = pet.birthDate ? differenceInYears(new Date(), new Date(pet.birthDate)) : 0;
  const age = pet.birthDate 
    ? (i18n.language === "ru" ? `${years} лет` : `${years} yrs`)
    : t("pet.unknown_age");

  const getGenderTranslation = (gender: string | null) => {
    if (!gender) return t("pet.gender_unknown");
    const genderMap: Record<string, string> = {
      "Male": t("pet.gender_male"),
      "Female": t("pet.gender_female"),
      "unknown": t("pet.gender_unknown"),
    };
    return genderMap[gender] || gender;
  };

  const handleDeletePet = () => {
    deletePet(petId, {
      onSuccess: () => {
        toast({ title: t("pet.deleted"), description: t("pet.deleted_desc") });
        setLocation("/");
      }
    });
  };

  const handleGeneratePDF = () => {
    if (!pet || !records) return;

    const doc = new jsPDF();
    const isRussian = i18n.language === "ru";
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    const displayName = pet.passportName ? `${pet.name} (${pet.passportName})` : pet.name;
    doc.text(isRussian ? `Медпаспорт: ${displayName}` : `Medical Passport: ${displayName}`, 14, 20);
    
    // Pet Info
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    if (pet.passportName) {
      doc.text(`${t("pet.passport_name")}: ${pet.passportName}`, 14, 30);
    }
    const infoY = pet.passportName ? 36 : 30;
    doc.text(`${t("pet.species")}: ${pet.species}`, 14, infoY);
    doc.text(`${t("pet.breed")}: ${pet.breed || t("common.na")}`, 14, infoY + 6);
    doc.text(`${t("pet.gender")}: ${pet.gender}`, 14, infoY + 12);
    doc.text(`${t("pet.chip")}: ${pet.chipNumber || t("common.na")}`, 14, infoY + 18);
    doc.text(`${isRussian ? "Дата создания" : "Generated on"}: ${format(new Date(), "yyyy-MM-dd")}`, 14, infoY + 24);

    // Records Table
    const tableBody = records.map(record => [
      format(new Date(record.date), "yyyy-MM-dd"),
      t(`record.type_${record.type}`),
      record.title,
      record.doctor || "-",
      record.notes || "-"
    ]);

    autoTable(doc, {
      startY: 65,
      head: [[t("record.date"), t("record.type"), t("record.title"), t("record.doctor"), t("record.notes")]],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [124, 58, 237] },
    });

    doc.save(`${pet.name}_Medical_Report.pdf`);
    toast({ title: t("pet.pdf_success"), description: t("pet.pdf_downloaded") });
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      {/* Header Image / Info */}
      <div className="bg-white pb-6 rounded-b-[2rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-32 bg-primary/10 -z-10" />
        
        <div className="pt-12 px-6">
          <div className="flex justify-between items-start mb-6">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            
            <div className="flex flex-wrap gap-1">
            <EditPetDialog pet={pet} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-5 h-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("pet.delete_confirm_title")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("pet.delete_confirm_desc")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeletePet} className="bg-destructive hover:bg-destructive/90">{t("common.delete")}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            </div>
          </div>

          <div className="flex items-end gap-6">
            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
              <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden">
                {pet.photoUrl ? (
                  <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Info className="w-10 h-10" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-bold font-display text-foreground">{pet.name}</h1>
              {pet.passportName && (
                <p className="text-sm text-muted-foreground/80 italic">{pet.passportName}</p>
              )}
              <p className="text-muted-foreground">{pet.breed} • {age}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mt-6">
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-6 bg-white/50 p-1 rounded-xl">
            <TabsTrigger value="info" className="rounded-lg">{t("pet.tab_info")}</TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg">{t("pet.tab_history")}</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 animate-fade-in-up">
            <Card>
              <CardContent className="p-6 space-y-4">
                {pet.passportName && (
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("pet.passport_name")}</span>
                    <p className="font-medium text-lg">{pet.passportName}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("pet.gender")}</span>
                    <p className="font-medium text-lg capitalize">{getGenderTranslation(pet.gender)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("pet.weight")}</span>
                    <div className="flex items-center gap-2">
                      <Weight className="w-4 h-4 text-primary" />
                      <p className="font-medium text-lg">{pet.weight || t("common.na")}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("pet.birthDate")}</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <p className="font-medium text-lg">{pet.birthDate ? format(new Date(pet.birthDate), "d MMM yyyy", { locale: dateLocale }) : t("common.na")}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("pet.chip")}</span>
                    <p className="font-mono text-sm bg-muted px-2 py-1 rounded inline-block mt-1">
                      {pet.chipNumber || t("pet.not_chipped")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full gap-2" onClick={handleGeneratePDF}>
              <FileDown className="w-4 h-4" />
              {t("pet.generate_pdf")}
            </Button>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 animate-fade-in-up">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg">{t("pet.timeline")}</h3>
              <AddRecordDialog petId={petId} />
            </div>

            <div className="space-y-4">
              {loadingRecords ? (
                [1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
              ) : records && records.length > 0 ? (
                records.map((record) => (
                  <div key={record.id} className="bg-white p-4 rounded-xl border border-border shadow-sm flex gap-4 relative overflow-hidden group">
                    <button 
                      onClick={() => deleteRecord({ id: record.id, petId })}
                      className="absolute top-2 right-2 p-2 text-gray-300 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                      <RecordIcon type={record.type} className="w-5 h-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start pr-6">
                        <h4 className="font-bold text-foreground truncate">{record.title}</h4>
                        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap bg-muted px-2 py-0.5 rounded-full">
                          {format(new Date(record.date), "d MMM yyyy", { locale: dateLocale })}
                        </span>
                      </div>
                      
                      <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                        {record.doctor && <span className="flex items-center gap-1">👨‍⚕️ {record.doctor}</span>}
                        {record.clinic && <span className="flex items-center gap-1">🏥 {record.clinic}</span>}
                      </div>
                      
                      {record.notes && (
                        <p className="mt-2 text-sm bg-muted/30 p-2 rounded-lg text-muted-foreground/80">
                          {record.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-white/50 rounded-xl border border-dashed">
                  <p className="text-muted-foreground">{t("pet.no_records")}</p>
                </div>
              )}
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
