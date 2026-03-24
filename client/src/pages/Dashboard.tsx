import { useState } from "react";
import { usePets } from "@/hooks/use-pets";
import { useReminders } from "@/hooks/use-reminders";
import { AddPetDialog } from "@/components/AddPetDialog";
import { Link } from "wouter";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, ArrowRight, Dog, Calendar, Plus } from "lucide-react";
import { AddReminderDialog } from "@/components/AddReminderDialog";
import { useTelegram } from "@/hooks/use-telegram";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: pets, isLoading: isLoadingPets } = usePets();
  const { data: reminders, isLoading: isLoadingReminders } = useReminders();
  const { user: tgUser, isTelegram } = useTelegram();
  const { t } = useTranslation();
  const [petsModalOpen, setPetsModalOpen] = useState(false);
  const [remindersModalOpen, setRemindersModalOpen] = useState(false);

  const upcomingReminders = reminders?.filter(r =>
    !r.isCompleted && new Date(r.dueDate) > new Date()
  ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const userName = tgUser?.first_name || t("dashboard.owner");

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <header className="bg-background pt-12 px-6 border-b border-border/50 sticky top-0 z-10 backdrop-blur-md bg-background/80 h-[88px] flex items-end pb-3">
        <div className="flex justify-between items-center w-full">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground leading-tight">
              {t("dashboard.hello")}, {userName}!
            </h1>
          </div>
          {tgUser?.photo_url ? (
            <img src={tgUser.photo_url} alt={userName} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Dog className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>
      </header>

      <main className="px-6 py-6">
        <section className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setPetsModalOpen(true)}
            className="text-left"
            data-testid="button-total-pets"
          >
            <div className="bg-gradient-to-br from-primary to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform">
              <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                <Dog className="w-6 h-6" />
              </div>
              {isLoadingPets ? (
                <Skeleton className="h-7 w-8 bg-white/30 rounded" />
              ) : (
                <h3 className="font-bold text-lg">{pets?.length || 0}</h3>
              )}
              <p className="text-primary-foreground/80 text-sm">{t("dashboard.total_pets")}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRemindersModalOpen(true)}
            className="text-left"
            data-testid="button-upcoming-reminders"
          >
            <div className="bg-white dark:bg-card rounded-2xl p-5 border border-border shadow-sm active:scale-[0.98] transition-transform">
              <div className="bg-orange-100 dark:bg-orange-900/30 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              {isLoadingReminders ? (
                <Skeleton className="h-7 w-8 rounded" />
              ) : (
                <h3 className="font-bold text-lg text-foreground">{upcomingReminders?.length || 0}</h3>
              )}
              <p className="text-muted-foreground text-sm">{t("dashboard.upcoming_count")}</p>
            </div>
          </button>
        </section>
      </main>

      <Dialog open={petsModalOpen} onOpenChange={setPetsModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md h-[70vh] flex flex-col" data-testid="dialog-my-pets">
          <DialogHeader className="shrink-0">
            <DialogTitle>{t("dashboard.my_pets")}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
            {isLoadingPets ? (
              [1, 2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)
            ) : pets && pets.length > 0 ? (
              pets.map((pet) => (
                <Link key={pet.id} href={`/pets/${pet.id}`} onClick={() => setPetsModalOpen(false)}>
                  <div className="flex items-center gap-4 p-3 rounded-xl border border-border hover-elevate cursor-pointer" data-testid={`card-pet-${pet.id}`}>
                    <div className="w-14 h-14 rounded-full bg-muted overflow-hidden shrink-0">
                      {pet.photoUrl ? (
                        <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Dog className="w-7 h-7" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground">{pet.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{pet.breed || pet.species}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <Dog className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">{t("pet.no_pets")}</p>
              </div>
            )}
            <div className="pt-2">
              <AddPetDialog />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={remindersModalOpen} onOpenChange={setRemindersModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md h-[70vh] flex flex-col" data-testid="dialog-reminders">
          <DialogHeader className="shrink-0">
            <DialogTitle>{t("dashboard.reminders")}</DialogTitle>
          </DialogHeader>
          <div className="shrink-0 pb-2">
            <AddReminderDialog />
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
            {isLoadingReminders ? (
              [1, 2].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)
            ) : upcomingReminders && upcomingReminders.length > 0 ? (
              upcomingReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center gap-4 p-3 rounded-xl border border-border" data-testid={`card-reminder-${reminder.id}`}>
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{reminder.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(reminder.dueDate), "d MMM, HH:mm")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">{t("dashboard.no_reminders")}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
