import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
}

export const ImageUpload = ({ onImageUpload }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (isUploading) return;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError, data } = await supabase.storage
        .from('service_order_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('service_order_images')
          .getPublicUrl(filePath);
        
        // Remove any potential malformed URL parts
        const cleanUrl = publicUrl.replace(':/', '/');
        
        onImageUpload(cleanUrl);
        toast({
          title: "Imagem enviada",
          description: "A imagem foi enviada com sucesso.",
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a imagem.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.target.files?.[0];
    
    if (file) {
      toast({
        title: "Processando imagem",
        description: "Aguarde enquanto a imagem é processada...",
      });
      
      await handleFileUpload(file);
    }
  };

  const handleCameraClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.setAttribute('accept', 'image/*');
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        onClick={(e) => e.stopPropagation()}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (fileInputRef.current) {
            fileInputRef.current.removeAttribute('capture');
            fileInputRef.current.click();
          }
        }}
        disabled={isUploading}
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCameraClick}
        disabled={isUploading}
      >
        <Camera className="h-4 w-4 mr-2" />
        Câmera
      </Button>
    </div>
  );
};