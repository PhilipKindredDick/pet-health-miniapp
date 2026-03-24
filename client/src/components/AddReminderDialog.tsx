import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReminderSchema } from "@shared/schema";
import { useCreateReminder } from "@/hooks/use-reminders";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { BellPlus } from "lucide-react";
import { z } from "zod";
import { usePets } from "@/hooks/use-pets";
import { useTranslation } from "react-i18next";

const formSchema = insertReminderSchema.extend({
  petId: z.coerce.number(),
  dueDate: z.coerce.date(), // Convert string from input to Date object
});

type FormValues = z.infer<typeof formSchema>;

export function AddReminderDialog() {
  const [open, setOpen] = useState(false);
  const { data: pets } = usePets();
  const { mutate, isPending } = useCreateReminder();
  const { toast } = useToast();
  const { t } = useTranslation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      petId: undefined,
      dueDate: new Date(),
      isRecurring: false,
      recurrenceInterval: "monthly",
      isCompleted: false,
    },
  });

  const onSubmit = (data: FormValues) => {
    mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        toast({ title: t("reminder.created"), description: t("reminder.created_desc") });
      },
      onError: (err) => {
        toast({ title: t("common.error"), description: err.message, variant: "destructive" });
      }
    });
  };

  useEffect(() => {
    if (open && pets?.length === 1) {
      form.setValue("petId", pets[0].id);
    }
  }, [open, pets]);

  const isRecurring = form.watch("isRecurring");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BellPlus className="w-4 h-4" />
          {t("reminder.add")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("reminder.new")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("reminder.title")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("reminder.title_placeholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="petId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("reminder.pet")}</FormLabel>
                  <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("reminder.select_pet")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pets?.map((pet) => (
                        <SelectItem key={pet.id} value={pet.id.toString()}>
                          {pet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("reminder.due_date")}</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t("reminder.recurring")}</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {isRecurring && (
              <FormField
                control={form.control}
                name="recurrenceInterval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("reminder.repeat")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "monthly"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("reminder.select_interval")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">{t("reminder.daily")}</SelectItem>
                        <SelectItem value="weekly">{t("reminder.weekly")}</SelectItem>
                        <SelectItem value="monthly">{t("reminder.monthly")}</SelectItem>
                        <SelectItem value="yearly">{t("reminder.yearly")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? t("reminder.creating") : t("reminder.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
