/* eslint-disable @typescript-eslint/no-explicit-any */

declare namespace cv {
  class Mat {
    constructor();
    constructor(rows: number, cols: number, type: number);
    constructor(rows: number, cols: number, type: number, scalar: Scalar);
    rows: number;
    cols: number;
    data: Uint8Array;
    data32S: Int32Array;
    data32F: Float32Array;
    data64F: Float64Array;
    delete(): void;
    size(): Size;
    type(): number;
    channels(): number;
    clone(): Mat;
    roi(rect: Rect): Mat;
    isContinuous(): boolean;
    total(): number;
    ucharAt(row: number, col: number): number;
    floatAt(row: number, col: number): number;
  }

  class MatVector {
    constructor();
    size(): number;
    get(index: number): Mat;
    delete(): void;
  }

  class Point {
    constructor(x: number, y: number);
    x: number;
    y: number;
  }

  class Size {
    constructor(width: number, height: number);
    width: number;
    height: number;
  }

  class Scalar {
    constructor(v0: number, v1?: number, v2?: number, v3?: number);
  }

  class Rect {
    constructor(x: number, y: number, width: number, height: number);
    x: number;
    y: number;
    width: number;
    height: number;
  }

  function matFromImageData(imageData: ImageData): Mat;
  function matFromArray(rows: number, cols: number, type: number, array: number[]): Mat;

  function cvtColor(src: Mat, dst: Mat, code: number): void;
  function GaussianBlur(src: Mat, dst: Mat, ksize: Size, sigmaX: number): void;
  function Canny(src: Mat, dst: Mat, threshold1: number, threshold2: number): void;
  function morphologyEx(src: Mat, dst: Mat, op: number, kernel: Mat): void;
  function getStructuringElement(shape: number, ksize: Size): Mat;
  function dilate(src: Mat, dst: Mat, kernel: Mat): void;

  function findContours(
    image: Mat,
    contours: MatVector,
    hierarchy: Mat,
    mode: number,
    method: number,
  ): void;

  function contourArea(contour: Mat, oriented?: boolean): number;
  function arcLength(curve: Mat, closed: boolean): number;
  function approxPolyDP(curve: Mat, approxCurve: Mat, epsilon: number, closed: boolean): void;

  function getPerspectiveTransform(src: Mat, dst: Mat): Mat;
  function warpPerspective(src: Mat, dst: Mat, M: Mat, dsize: Size): void;

  function Laplacian(src: Mat, dst: Mat, ddepth: number): void;
  function meanStdDev(src: Mat, mean: Mat, stddev: Mat): void;
  function mean(src: Mat): Scalar;

  function imshow(canvasOrId: string | HTMLCanvasElement, mat: Mat): void;

  const CV_8UC1: number;
  const CV_8UC3: number;
  const CV_8UC4: number;
  const CV_32F: number;
  const CV_32FC1: number;
  const CV_32FC2: number;
  const CV_64F: number;

  const COLOR_RGBA2GRAY: number;
  const COLOR_RGBA2RGB: number;
  const COLOR_BGR2GRAY: number;
  const COLOR_RGB2GRAY: number;

  const MORPH_CLOSE: number;
  const MORPH_RECT: number;

  const RETR_EXTERNAL: number;
  const RETR_LIST: number;
  const CHAIN_APPROX_SIMPLE: number;

  const BORDER_DEFAULT: number;
}

interface Window {
  cv: typeof cv;
}
