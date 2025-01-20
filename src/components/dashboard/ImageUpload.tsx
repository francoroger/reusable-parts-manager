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
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('service_order_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('service_order_images')
          .getPublicUrl(filePath);
        
        onImageUpload(publicUrl);
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
      // Clear the input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const file = event.target.files?.[0];
    
    if (file) {
      toast({
        title: "Processando imagem",
        description: "Aguarde enquanto a imagem é processada...",
      });
      
      await handleFileUpload(file);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          if (fileInputRef.current) {
            fileInputRef.current.setAttribute('capture', 'environment');
            fileInputRef.current.click();
            // Remove the capture attribute after clicking to allow regular file selection
            setTimeout(() => {
              if (fileInputRef.current) {
                fileInputRef.current.removeAttribute('capture');
              }
            }, 1000);
          }
        }}
        disabled={isUploading}
      >
        <Camera className="h-4 w-4 mr-2" />
        Câmera
      </Button>
    </div>
  );
};