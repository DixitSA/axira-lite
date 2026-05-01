"use client";

import { useRef, useState, useTransition } from "react";
import { uploadJobPhoto } from "@/lib/actions/media";
import { showToast } from "@/components/ui/toast";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";

interface PhotoUploaderProps {
  jobId: number;
}

export default function PhotoUploader({ jobId }: PhotoUploaderProps) {
  const [isPending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      showToast("Please select an image file", "error");
      return;
    }

    // In a real app, you'd check file size here too (e.g., < 5MB)
    if (selected.size > 5 * 1024 * 1024) {
      showToast("Image must be less than 5MB", "error");
      return;
    }

    setFile(selected);
    const objectUrl = URL.createObjectURL(selected);
    setPreviewUrl(objectUrl);
  };

  const handleUpload = () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("jobId", jobId.toString());
    if (caption) formData.append("caption", caption);

    startTransition(async () => {
      try {
        const result = await uploadJobPhoto(formData);
        if (result.success) {
          showToast("Photo uploaded successfully");
          setFile(null);
          setPreviewUrl(null);
          setCaption("");
          if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
          showToast(result.error || "Failed to upload photo", "error");
        }
      } catch (error) {
        showToast("An unexpected error occurred", "error");
      }
    });
  };

  const clearSelection = () => {
    setFile(null);
    setPreviewUrl(null);
    setCaption("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Add Field Photo</h3>
      </div>

      {!previewUrl ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors group"
        >
          <div className="p-3 bg-gray-50 rounded-full group-hover:bg-blue-100 transition-colors mb-3">
            <Camera className="text-gray-400 group-hover:text-blue-600 transition-colors" size={24} />
          </div>
          <p className="text-sm font-medium text-gray-700">Click to upload or capture photo</p>
          <p className="text-xs text-gray-400 mt-1">JPEG, PNG up to 5MB</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            {/* Using standard img for object URL since next/image doesn't love them without strict config */}
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="object-cover w-full h-full"
            />
            <button 
              onClick={clearSelection}
              disabled={isPending}
              className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-md hover:bg-black/70 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          
          <div>
            <input 
              type="text" 
              placeholder="Add a caption (optional)..." 
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={isPending}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button 
              onClick={clearSelection}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
              {isPending ? "Uploading..." : "Upload Photo"}
            </button>
          </div>
        </div>
      )}

      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
      />
    </div>
  );
}
