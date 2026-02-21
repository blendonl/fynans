import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { receiptControllerProcessReceipt } from "../api/generated/endpoints/receipt/receipt";

export interface ProcessedReceiptData {
  store: {
    id?: string;
    name: string;
    location: string;
  } | null;
  items: Array<{
    id?: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
  }>;
  recordedAt?: string;
  extractedText: string;
  confidence: number;
  preprocessingApplied?: string[];
  parserUsed?: string;
}

interface UseReceiptScanningReturn {
  processing: boolean;
  scanReceipt: () => Promise<ProcessedReceiptData | null>;
}

export const useReceiptScanning = (): UseReceiptScanningReturn => {
  const [processing, setProcessing] = useState(false);

  const scanReceipt = async (): Promise<ProcessedReceiptData | null> => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Camera permission is required to scan receipts",
        );
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      const imageUri = result.assets[0].uri;
      setProcessing(true);

      const filename = imageUri.split("/").pop() || `receipt_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      // React Native FormData accepts { uri, name, type } objects for file uploads.
      // The generated function types file as string, but we pass the RN file object via any.
      const fileObject = {
        uri: imageUri,
        name: filename,
        type,
      } as any;

      const response = await receiptControllerProcessReceipt({ file: fileObject });

      if (!response.data) {
        throw new Error("No data received from server");
      }

      // The server returns full receipt data; the generated DTO type is narrower
      return response.data as unknown as ProcessedReceiptData;
    } catch (error: any) {
      console.error("Error processing receipt:", error);
      Alert.alert("Error", error.message || "Failed to process receipt");
      return null;
    } finally {
      setProcessing(false);
    }
  };

  return {
    processing,
    scanReceipt,
  };
};
