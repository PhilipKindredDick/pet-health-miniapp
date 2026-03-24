import { useRef, useState, useCallback } from "react";
import { Camera, X, Crop, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import Cropper, { Area } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

interface PhotoPickerProps {
  currentUrl?: string | null;
  onPhotoUploaded: (url: string) => void;
  onPhotoRemoved?: () => void;
  onUploadingChange?: (uploading: boolean) => void;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

const THUMB_SIZE = 200;

async function getCroppedDataUrl(
  imageSrc: string,
  pixelCrop: Area
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  canvas.width = THUMB_SIZE;
  canvas.height = THUMB_SIZE;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    THUMB_SIZE,
    THUMB_SIZE
  );

  return canvas.toDataURL("image/jpeg", 0.8);
}

export function PhotoPicker({
  currentUrl,
  onPhotoUploaded,
  onPhotoRemoved,
  onUploadingChange,
}: PhotoPickerProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const { toast } = useToast();

  const setUploadState = (state: boolean) => {
    setUploading(state);
    onUploadingChange?.(state);
  };

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropApply = async () => {
    if (!rawImage || !croppedAreaPixels) return;

    setCropDialogOpen(false);
    setUploadState(true);

    try {
      const dataUrl = await getCroppedDataUrl(rawImage, croppedAreaPixels);
      setPreview(dataUrl);
      onPhotoUploaded(dataUrl);
    } catch (err: any) {
      setPreview(currentUrl || null);
      toast({
        title: t("common.error"),
        description: err.message || "Failed to process photo",
        variant: "destructive",
      });
    } finally {
      setUploadState(false);
      setRawImage(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleCropCancel = () => {
    setCropDialogOpen(false);
    setRawImage(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleRemove = () => {
    setPreview(null);
    onPhotoRemoved?.();
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
        data-testid="input-photo-file"
      />

      {preview ? (
        <div className="relative w-24 h-24">
          <img
            src={preview}
            alt="Pet"
            className="w-24 h-24 rounded-xl object-cover border border-border"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center"
            data-testid="button-remove-photo"
          >
            <X className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-2 -right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center"
            data-testid="button-recrop-photo"
          >
            <Crop className="w-3 h-3" />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-24 h-24 rounded-xl flex flex-col gap-1"
          onClick={() => fileRef.current?.click()}
          data-testid="button-pick-photo"
        >
          <Camera className="w-6 h-6 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {t("pet.add_photo")}
          </span>
        </Button>
      )}

      <Dialog open={cropDialogOpen} onOpenChange={(open) => { if (!open) handleCropCancel(); }}>
        <DialogContent className="max-w-sm p-0 overflow-hidden" data-testid="dialog-crop-photo">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle>{t("pet.crop_photo")}</DialogTitle>
          </DialogHeader>

          <div className="relative w-full" style={{ height: "300px" }}>
            {rawImage && (
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>

          <div className="px-4 pb-2 flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-muted-foreground shrink-0" />
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.05}
              onValueChange={([val]) => setZoom(val)}
              className="flex-1"
              data-testid="slider-zoom"
            />
            <ZoomIn className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>

          <DialogFooter className="px-4 pb-4 flex flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCropCancel}
              className="flex-1"
              data-testid="button-crop-cancel"
            >
              {t("pet.crop_cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleCropApply}
              className="flex-1"
              data-testid="button-crop-apply"
            >
              {t("pet.crop_apply")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
