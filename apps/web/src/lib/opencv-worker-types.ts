import type { DetectedCorners, QualityAssessment } from "./receipt-image-processing";

export interface AnalyzeFrameRequest {
  type: "analyzeFrame";
  id: string;
  pixels: ArrayBuffer;
  width: number;
  height: number;
}

export interface PerspectiveTransformRequest {
  type: "perspectiveTransform";
  id: string;
  pixels: ArrayBuffer;
  width: number;
  height: number;
  corners: DetectedCorners;
  outWidth: number;
  outHeight: number;
}

export type WorkerRequest = AnalyzeFrameRequest | PerspectiveTransformRequest;

export interface ReadyResponse {
  type: "ready";
}

export interface AnalyzeFrameResponse {
  type: "analyzeFrameResult";
  id: string;
  corners: DetectedCorners | null;
  quality: QualityAssessment;
}

export interface PerspectiveTransformResponse {
  type: "perspectiveTransformResult";
  id: string;
  pixels: ArrayBuffer;
  width: number;
  height: number;
}

export interface ErrorResponse {
  type: "error";
  id: string;
  error: string;
}

export type WorkerResponse =
  | ReadyResponse
  | AnalyzeFrameResponse
  | PerspectiveTransformResponse
  | ErrorResponse;
