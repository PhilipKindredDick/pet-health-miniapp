import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPetSchema } from "@shared/schema";
import { useCreatePet } from "@/hooks/use-pets";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Plus } from "lucide-react";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { PhotoPicker } from "./PhotoPicker";

const formSchema = insertPetSchema.extend({});

type FormValues = z.infer<typeof formSchema>;

export function AddPetDialog() {
  const [open, setOpen] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const { mutate, isPending } = useCreatePet();
  const { toast } = useToast();
  const { t } = useTranslation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      passportName: "",
      species: "Dog",
      breed: "",
      gender: "unknown",
      birthDate: undefined,
      weight: "",
      chipNumber: "",
      photoUrl: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        toast({ title: t("pet.added"), description: `${data.name} ${t("pet.added_desc")}` });
      },
      onError: (err) => {
        toast({ title: t("common.error"), description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full w-12 h-12 p-0 shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-purple-600 hover:scale-105 transition-transform">
          <Plus className="w-6 h-6 text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("pet.add_new")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="flex justify-center">
              <PhotoPicker
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
                    <Input placeholder="Барсик" {...field} data-testid="input-pet-name" />
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
                    <Input placeholder="Baron von Fluffenstein" {...field} value={field.value || ""} data-testid="input-passport-name" />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value || "unknown"}>
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
                    <Input placeholder="Мейн-кун" {...field} value={field.value || ""} data-testid="input-breed" />
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
              <Button type="submit" disabled={isPending || photoUploading} className="w-full" data-testid="button-submit-pet">
                {isPending ? t("pet.adding") : t("pet.add")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
