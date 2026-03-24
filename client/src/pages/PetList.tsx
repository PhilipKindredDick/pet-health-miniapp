import { usePets } from "@/hooks/use-pets";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AddPetDialog } from "@/components/AddPetDialog";
import { ArrowRight, Dog } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function PetList() {
  const { data: pets, isLoading } = usePets();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <header className="bg-background pt-12 px-6 sticky top-0 z-10 border-b border-border/50 h-[88px] flex items-end pb-3">
        <div className="flex justify-between items-center w-full">
          <h1 className="text-2xl font-bold font-display">{t("pet.your_pets")}</h1>
          <AddPetDialog />
        </div>
      </header>

      <main className="px-6 py-6 grid gap-4">
        {isLoading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
        ) : pets && pets.length > 0 ? (
          pets.map((pet) => (
            <Link key={pet.id} href={`/pets/${pet.id}`}>
              <Card className="rounded-2xl border-border hover:shadow-lg transition-all cursor-pointer group bg-white dark:bg-card overflow-hidden">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted overflow-hidden shrink-0">
                    {pet.photoUrl ? (
                      <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Dog className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{pet.name}</h3>
                    {pet.passportName && (
                      <p className="text-xs text-muted-foreground/80 italic truncate">{pet.passportName}</p>
                    )}
                    <p className="text-sm text-muted-foreground truncate">{pet.breed || pet.species}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-20">
            <div className="bg-white inline-flex p-4 rounded-full mb-4 shadow-sm">
              <Dog className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg">{t("pet.no_pets")}</h3>
            <p className="text-muted-foreground mb-6">{t("pet.no_pets_desc")}</p>
            <AddPetDialog />
          </div>
        )}
      </main>
    </div>
  );
}
