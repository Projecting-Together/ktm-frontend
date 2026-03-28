"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Star, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  isCover: boolean;
}

interface Props {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
}

export function Step6Images({ images, onImagesChange }: Props) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages: UploadedImage[] = acceptedFiles.map((file, i) => ({
      id: `${Date.now()}-${i}`,
      file,
      preview: URL.createObjectURL(file),
      isCover: images.length === 0 && i === 0,
    }));
    onImagesChange([...images, ...newImages]);
  }, [images, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 20,
    maxSize: 10 * 1024 * 1024,
  });

  const removeImage = (id: string) => {
    const updated = images.filter((img) => img.id !== id);
    if (updated.length > 0 && !updated.some((img) => img.isCover)) {
      updated[0].isCover = true;
    }
    onImagesChange(updated);
  };

  const setCover = (id: string) => {
    onImagesChange(images.map((img) => ({ ...img, isCover: img.id === id })));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Add photos</h2>
        <p className="text-muted-foreground mt-1">Listings with 5+ quality photos get 3x more inquiries.</p>
      </div>

      {/* Drop zone */}
      <div {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all",
          isDragActive ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 hover:bg-muted/30"
        )}>
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="font-semibold">Drop photos here or click to upload</p>
        <p className="text-sm text-muted-foreground mt-1">JPG, PNG, WebP · Max 10MB per image · Up to 20 photos</p>
      </div>

      {/* Validation hints */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
        {[
          { icon: "✅", text: "Min 3 images required" },
          { icon: "⭐", text: "First image = cover photo" },
          { icon: "📐", text: "Landscape works best" },
          { icon: "💡", text: "Good lighting = more views" },
        ].map((tip) => (
          <div key={tip.text} className="flex items-center gap-1.5 rounded-lg bg-muted p-2">
            <span>{tip.icon}</span><span className="text-muted-foreground">{tip.text}</span>
          </div>
        ))}
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-3">{images.length} photo{images.length !== 1 ? "s" : ""} uploaded</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((img) => (
              <div key={img.id} className={cn("group relative aspect-square overflow-hidden rounded-xl border-2 transition-all",
                img.isCover ? "border-accent" : "border-border")}>
                <img src={img.preview} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
                {img.isCover && (
                  <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">
                    <Star className="h-3 w-3 fill-white" /> Cover
                  </div>
                )}
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!img.isCover && (
                    <button type="button" onClick={() => setCover(img.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-amber-500 hover:bg-white">
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button type="button" onClick={() => removeImage(img.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-destructive hover:bg-white">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length < 3 && images.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          ⚠️ Please upload at least {3 - images.length} more photo{3 - images.length !== 1 ? "s" : ""} to meet the minimum requirement.
        </div>
      )}
    </div>
  );
}
