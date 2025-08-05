import { useState } from "react";
import { ObjectUploader } from "./ObjectUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { UploadResult } from "@uppy/core";

interface LogoUploadManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const logoConfigs = [
  { key: "duke-university", name: "Duke University", filename: "duke-university.png" },
  { key: "illinois-tech", name: "Illinois Institute of Technology", filename: "illinois-tech.png" },
  { key: "uc-irvine", name: "University of California, Irvine", filename: "uc-irvine.png" },
  { key: "google", name: "Google", filename: "google.png" },
  { key: "colorado-boulder", name: "University of Colorado Boulder", filename: "colorado-boulder.png" },
];

export function LogoUploadManager({ isOpen, onClose }: LogoUploadManagerProps) {
  const [uploadingLogos, setUploadingLogos] = useState<Set<string>>(new Set());
  const [uploadedLogos, setUploadedLogos] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleGetUploadParameters = async () => {
    const response = await fetch("/api/objects/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = async (logoKey: string, result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    try {
      setUploadingLogos(prev => {
        const newSet = new Set(prev);
        newSet.delete(logoKey);
        return newSet;
      });

      if (result.successful && result.successful.length > 0) {
        const uploadURL = result.successful[0].uploadURL;
        
        // Notify backend about the logo upload
        await apiRequest("/api/logos", "PUT", { logoURL: uploadURL });

        setUploadedLogos(prev => new Set(prev).add(logoKey));
        
        toast({
          title: "Success",
          description: `Logo uploaded successfully!`,
        });
      }
    } catch (error) {
      console.error("Error completing logo upload:", error);
      toast({
        title: "Error",
        description: "Failed to complete logo upload",
        variant: "destructive",
      });
    }
  };

  const startUpload = (logoKey: string) => {
    setUploadingLogos(prev => new Set(prev).add(logoKey));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upload University Logos</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Upload logo images for each university. Recommended: PNG format, square aspect ratio, under 1MB.
          </p>
          
          {logoConfigs.map((config) => (
            <div key={config.key} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium">{config.name}</h3>
                <p className="text-sm text-gray-500">File: {config.filename}</p>
              </div>
              
              <div className="flex items-center gap-2">
                {uploadedLogos.has(config.key) && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Uploaded</span>
                  </div>
                )}
                
                <ObjectUploader
                  maxNumberOfFiles={1}
                  maxFileSize={5242880} // 5MB
                  onGetUploadParameters={handleGetUploadParameters}
                  onComplete={(result) => handleUploadComplete(config.key, result)}
                  buttonClassName={`
                    ${uploadingLogos.has(config.key) ? 'opacity-50 cursor-not-allowed' : ''}
                    ${uploadedLogos.has(config.key) ? 'bg-green-600 hover:bg-green-700' : ''}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {uploadingLogos.has(config.key) 
                      ? "Uploading..." 
                      : uploadedLogos.has(config.key) 
                        ? "Re-upload" 
                        : "Upload Logo"
                    }
                  </div>
                </ObjectUploader>
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t">
            <Button onClick={onClose} className="w-full">
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}