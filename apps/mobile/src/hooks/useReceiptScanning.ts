import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { customInstance } from "../api/custom-instance";

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

      const formData = new FormData();
      const filename = imageUri.split("/").pop() || `receipt_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("file", {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      const { data: response } = await customInstance<{ data: any; status: number; headers: Headers }>("/receipts/process", {
        method: 'POST',
        body: formData,
      });

      if (!response) {
        throw new Error("No data received from server");
      }

      return response as ProcessedReceiptData;
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
