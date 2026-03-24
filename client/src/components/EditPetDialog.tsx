import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPetSchema, type Pet } from "@shared/schema";
import { useUpdatePet } from "@/hooks/use-pets";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { PhotoPicker } from "./PhotoPicker";

const formSchema = insertPetSchema.extend({});

type FormValues = z.infer<typeof formSchema>;

export function EditPetDialog({ pet }: { pet: Pet }) {
  const [open, setOpen] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const { mutate, isPending } = useUpdatePet();
  const { toast } = useToast();
  const { t } = useTranslation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: pet.name,
      passportName: pet.passportName || "",
      species: pet.species,
      breed: pet.breed || "",
      gender: pet.gender || "unknown",
      birthDate: pet.birthDate || undefined,
      weight: pet.weight || "",
      chipNumber: pet.chipNumber || "",
      photoUrl: pet.photoUrl || "",
    },
  });

  const onSubmit = (data: FormValues) => {
    mutate({ id: pet.id, ...data }, {
      onSuccess: () => {
        setOpen(false);
        toast({ title: t("pet.updated"), description: `${data.name} ${t("pet.updated_desc")}` });
      },
      onError: (err) => {
        toast({ title: t("common.error"), description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" data-testid="button-edit-pet">
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("pet.edit_profile")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="flex justify-center">
              <PhotoPicker
                currentUrl={pet.photoUrl}
                onPhotoUploaded={(url) => form.setValue("photoUrl", url)}
                onPhotoRemoved={() => form.setValue("photoUrl", "")}
                onUploadingChange={setPhotoUploading}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("pet.name")}</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-pet-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passportName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("pet.passport_name_optional")}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} data-testid="input-passport-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="species"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("pet.species")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-species">
                          <SelectValue placeholder={t("pet.select_species")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Dog">{t("pet.species_dog")}</SelectItem>
                        <SelectItem value="Cat">{t("pet.species_cat")}</SelectItem>
                        <SelectItem value="Bird">{t("pet.species_bird")}</SelectItem>
                        <SelectItem value="Rabbit">{t("pet.species_rabbit")}</SelectItem>
                        <SelectItem value="Other">{t("pet.species_other")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("pet.gender")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "unknown"}>
                      <FormControl>
                        <SelectTrigger data-testid="select-gender">
                          <SelectValue placeholder={t("pet.select_gender")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">{t("pet.gender_male")}</SelectItem>
                        <SelectItem value="Female">{t("pet.gender_female")}</SelectItem>
                        <SelectItem value="unknown">{t("pet.gender_unknown")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="breed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("pet.breed_optional")}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} data-testid="input-breed" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("pet.birthDate")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} data-testid="input-birthdate" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("pet.weight_optional")}</FormLabel>
                    <FormControl>
                      <Input placeholder="5 кг" {...field} value={field.value || ""} data-testid="input-weight" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="chipNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("pet.chip_optional")}</FormLabel>
                  <FormControl>
                    <Input placeholder="123456789" {...field} value={field.value || ""} data-testid="input-chip" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button type="submit" disabled={isPending || photoUploading} className="w-full" data-testid="button-save-pet">
                {isPending ? t("pet.saving") : t("pet.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
