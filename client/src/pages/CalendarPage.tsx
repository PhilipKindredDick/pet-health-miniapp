import { useReminders } from "@/hooks/use-reminders";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, getDay, isBefore, startOfDay } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, CalendarPlus, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddReminderDialog } from "@/components/AddReminderDialog";
import { useUpdateReminder, useDeleteReminder, useCreateReminder } from "@/hooks/use-reminders";
import { useTranslation } from "react-i18next";
import type { Reminder } from "@shared/schema";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: reminders } = useReminders();
  const { mutate: updateReminder } = useUpdateReminder();
  const { mutate: deleteReminder } = useDeleteReminder();
  const { mutate: createReminder } = useCreateReminder();
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === "ru" ? ru : enUS;

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getRemindersForDay = (date: Date) => {
    return reminders?.filter(r => isSameDay(new Date(r.dueDate), date)) || [];
  };

  const handleToggleComplete = (id: number, currentStatus: boolean | null) => {
    updateReminder({ id, isCompleted: !currentStatus });
  };

  // Selected date logic (default to today)
  const [selectedDate, setSelectedDate] = useState(new Date());

  const selectedDayReminders = getRemindersForDay(selectedDate);

  // Week starts on Monday for Russian, Sunday for English
  const weekDays = i18n.language === "ru" 
    ? ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
    : ["S", "M", "T", "W", "T", "F", "S"];

  // Calculate padding for the first day of the month
  const firstDayOfMonth = startOfMonth(currentDate);
  const firstDayWeekday = getDay(firstDayOfMonth); // 0 = Sunday, 1 = Monday, ...
  
  // For Russian (week starts Monday): Mon=0, Tue=1, ... Sun=6
  // For English (week starts Sunday): Sun=0, Mon=1, ... Sat=6
  const paddingDays = i18n.language === "ru"
    ? (firstDayWeekday === 0 ? 6 : firstDayWeekday - 1) // Convert to Monday-start
    : firstDayWeekday;

  // Generate ICS file for phone calendar - use Google Calendar URL as fallback
  const generateICS = (reminder: Reminder) => {
    const dueDate = new Date(reminder.dueDate);
    const endDate = new Date(dueDate.getTime() + 60 * 60 * 1000); // 1 hour event
    
    // Format for Google Calendar URL
    const formatGoogleDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };
    
    // Create Google Calendar add event URL (works in all browsers/webviews)
    const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render');
    googleCalendarUrl.searchParams.set('action', 'TEMPLATE');
    googleCalendarUrl.searchParams.set('text', reminder.title);
    googleCalendarUrl.searchParams.set('dates', `${formatGoogleDate(dueDate)}/${formatGoogleDate(endDate)}`);
    googleCalendarUrl.searchParams.set('details', t("calendar.pet_reminder"));
    
    // Try Telegram openLink first, then fallback to window.open
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.openLink) {
      tg.openLink(googleCalendarUrl.toString());
    } else {
      window.open(googleCalendarUrl.toString(), '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <header className="bg-background pt-12 px-6 sticky top-0 z-10 border-b border-border/50 h-[88px] flex items-end pb-3">
        <h1 className="text-2xl font-bold font-display">{t("calendar.title")}</h1>
      </header>

      <main className="px-6 py-6 space-y-6">
        {/* Calendar Widget */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">
              {format(currentDate, "LLLL yyyy", { locale: dateLocale })}
            </h2>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="w-5 h-5" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {weekDays.map((day, idx) => (
              <div key={idx} className="text-xs font-medium text-muted-foreground">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for padding before first day */}
            {Array.from({ length: paddingDays }).map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}
            {days.map((day, i) => {
              const dayReminders = getRemindersForDay(day);
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              
              return (
                <button
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
                  className={cn(
                    "aspect-square rounded-lg flex flex-col items-center justify-center relative transition-colors",
                    isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    isToday && !isSelected && "text-primary font-bold bg-primary/5"
                  )}
                >
                  <span className="text-sm">{format(day, "d")}</span>
                  {dayReminders.length > 0 && (
                    <span className={cn(
                      "absolute bottom-1 w-1.5 h-1.5 rounded-full",
                      dayReminders.some(r => !r.isCompleted) 
                        ? (isSelected ? "bg-white" : "bg-red-500")
                        : (isSelected ? "bg-white/50" : "bg-green-500")
                    )} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Reminders */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg text-foreground">
              {isSameDay(selectedDate, new Date()) ? t("calendar.today") : format(selectedDate, "EEEE, d MMM", { locale: dateLocale })}
            </h3>
            <AddReminderDialog />
          </div>

          <div className="space-y-3">
            {selectedDayReminders.length > 0 ? (
              selectedDayReminders.map(reminder => (
                <div 
                  key={reminder.id}
                  className={cn(
                    "p-4 rounded-xl border border-border bg-white dark:bg-card transition-all",
                    reminder.isCompleted && "opacity-60 bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleToggleComplete(reminder.id, reminder.isCompleted)}
                      className="shrink-0 transition-colors"
                      data-testid={`button-toggle-reminder-${reminder.id}`}
                    >
                      {reminder.isCompleted 
                        ? <CheckCircle2 className="w-6 h-6 text-green-500" />
                        : <Circle className={cn("w-6 h-6", isBefore(new Date(reminder.dueDate), startOfDay(new Date())) ? "text-red-500" : "text-muted-foreground")} />
                      }
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={cn("font-medium truncate", reminder.isCompleted && "line-through")}>
                        {reminder.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(reminder.dueDate), "HH:mm", { locale: dateLocale })} • {reminder.isRecurring ? `${t("reminder.repeats")} ${t(`reminder.${reminder.recurrenceInterval}`)}` : t("reminder.one_time")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => generateICS(reminder)}
                      className="text-muted-foreground gap-1.5 text-xs"
                      data-testid={`button-export-calendar-${reminder.id}`}
                    >
                      <CalendarPlus className="w-4 h-4" />
                      {t("calendar.add_to_phone")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => createReminder({
                        title: reminder.title,
                        petId: reminder.petId,
                        dueDate: new Date(new Date(reminder.dueDate).getTime() + 7 * 24 * 60 * 60 * 1000),
                        isRecurring: reminder.isRecurring,
                        recurrenceInterval: reminder.recurrenceInterval,
                      })}
                      className="text-muted-foreground gap-1.5 text-xs"
                      data-testid={`button-repeat-reminder-${reminder.id}`}
                    >
                      <RotateCcw className="w-4 h-4" />
                      {t("calendar.repeat")}
                    </Button>
                    <div className="flex-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteReminder(reminder.id)}
                      className="text-muted-foreground hover:text-destructive"
                      data-testid={`button-delete-reminder-${reminder.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground bg-white/50 border border-dashed rounded-xl">
                {t("reminder.no_reminders_day")}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
