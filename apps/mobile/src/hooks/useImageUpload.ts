import { useState } from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { receiptControllerProcessReceipt } from '../api/generated/endpoints/receipt/receipt';

interface UploadProgress {
  loaded: number;
  total: number;
}

export const useImageUpload = () => {
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  const addImage = (uri: string) => {
    setImageUris((prev) => [...prev, uri]);
  };

  const removeImage = (index: number) => {
    setImageUris((prev) => prev.filter((_, i) => i !== index));
  };

  const clearImages = () => {
    setImageUris([]);
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageUris.length === 0) {
      return [];
    }

    try {
      setUploading(true);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < imageUris.length; i++) {
        const uri = imageUris[i];

        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
          throw new Error(`Image file not found: ${uri}`);
        }

        const filename = uri.split('/').pop() || `receipt_${Date.now()}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        setUploadProgress({
          loaded: i + 1,
          total: imageUris.length,
        });

        // React Native FormData accepts { uri, name, type } objects for file uploads.
        // The generated function types file as string, but we pass the RN file object via any.
        const fileObject = {
          uri,
          name: filename,
          type,
        } as any;

        const response = await receiptControllerProcessReceipt({ file: fileObject });

        // Extract URL from response if available
        const data = response.data as any;
        if (data?.url) {
          uploadedUrls.push(data.url);
        }
      }

      return uploadedUrls;
    } catch (error: any) {
      console.error('Error uploading images:', error);
      Alert.alert('Upload Error', error.message || 'Failed to upload receipt images');
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  return {
    imageUris,
    uploading,
    uploadProgress,
    addImage,
    removeImage,
    clearImages,
    uploadImages,
  };
};
