/* eslint-disable no-undef */
// Web Worker for OpenCV processing — runs off the main thread.
// Plain JS in public/ to avoid Turbopack bundling issues with `new Worker(new URL(...))`.

/** @type {boolean} */
let ready = false;

importScripts("/opencv/opencv.js");

// Emscripten builds expose `cv` as a thenable Module — wait for WASM init.
Promise.resolve(cv).then(function (module) {
  cv = module;
  ready = true;
  self.postMessage({ type: "ready" });
});

self.onmessage = function (e) {
  var msg = e.data;

  if (!ready) {
    self.postMessage({
      type: "error",
      id: msg.id,
      error: "OpenCV not ready yet",
    });
    return;
  }

  try {
    switch (msg.type) {
      case "analyzeFrame":
        handleAnalyzeFrame(msg);
        break;
      case "perspectiveTransform":
        handlePerspectiveTransform(msg);
        break;
      default:
        self.postMessage({
          type: "error",
          id: msg.id,
          error: "Unknown message type: " + msg.type,
        });
    }
  } catch (err) {
    self.postMessage({
      type: "error",
      id: msg.id,
      error: err.message || String(err),
    });
  }
};

// --- analyzeFrame -----------------------------------------------------------

function handleAnalyzeFrame(msg) {
  var imageData = new ImageData(
    new Uint8ClampedArray(msg.pixels),
    msg.width,
    msg.height,
  );
  var src = cv.matFromImageData(imageData);
  var gray = new cv.Mat();

  try {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    var corners = detectEdgesFromGray(gray, msg.width, msg.height);
    var quality = assessQualityFromGray(gray);

    self.postMessage({
      type: "analyzeFrameResult",
      id: msg.id,
      corners: corners,
      quality: quality,
    });
  } finally {
    src.delete();
    gray.delete();
  }
}

function detectEdgesFromGray(gray, width, height) {
  var blurred = new cv.Mat();
  var edges = new cv.Mat();
  var closed = new cv.Mat();
  var contours = new cv.MatVector();
  var hierarchy = new cv.Mat();
  var ksize = new cv.Size(5, 5);

  try {
    cv.GaussianBlur(gray, blurred, ksize, 0);
    cv.Canny(blurred, edges, 75, 200);

    var kernel = cv.getStructuringElement(cv.MORPH_RECT, ksize);
    cv.morphologyEx(edges, closed, cv.MORPH_CLOSE, kernel);
    kernel.delete();

    cv.findContours(
      closed,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE,
    );

    var frameArea = width * height;
    var bestContour = null;
    var bestArea = 0;

    for (var i = 0; i < contours.size(); i++) {
      var contour = contours.get(i);
      try {
        var area = cv.contourArea(contour);
        if (area < frameArea * 0.1) continue;

        var peri = cv.arcLength(contour, true);
        var approx = new cv.Mat();
        try {
          cv.approxPolyDP(contour, approx, 0.02 * peri, true);
          if (approx.rows !== 4) continue;

          var points = [];
          for (var j = 0; j < 4; j++) {
            points.push({
              x: approx.data32S[j * 2],
              y: approx.data32S[j * 2 + 1],
            });
          }

          if (!validateAngles(points)) continue;

          if (area > bestArea) {
            bestArea = area;
            bestContour = orderCorners(points);
          }
        } finally {
          approx.delete();
        }
      } finally {
        contour.delete();
      }
    }

    return bestContour;
  } finally {
    if (ksize.delete) ksize.delete();
    blurred.delete();
    edges.delete();
    closed.delete();
    contours.delete();
    hierarchy.delete();
  }
}

function validateAngles(points) {
  for (var i = 0; i < 4; i++) {
    var p1 = points[i];
    var p2 = points[(i + 1) % 4];
    var p3 = points[(i + 2) % 4];

    var v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
    var v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

    var dot = v1.x * v2.x + v1.y * v2.y;
    var mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    var mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    if (mag1 === 0 || mag2 === 0) return false;

    var cosAngle = dot / (mag1 * mag2);
    var angle =
      Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI);
    if (angle < 60 || angle > 120) return false;
  }
  return true;
}

function orderCorners(points) {
  var sorted = points.slice();
  var sums = sorted.map(function (p) {
    return p.x + p.y;
  });
  var diffs = sorted.map(function (p) {
    return p.y - p.x;
  });

  var tlIdx = sums.indexOf(Math.min.apply(null, sums));
  var brIdx = sums.indexOf(Math.max.apply(null, sums));
  var trIdx = diffs.indexOf(Math.min.apply(null, diffs));
  var blIdx = diffs.indexOf(Math.max.apply(null, diffs));

  return {
    topLeft: sorted[tlIdx],
    topRight: sorted[trIdx],
    bottomRight: sorted[brIdx],
    bottomLeft: sorted[blIdx],
  };
}

function assessQualityFromGray(gray) {
  var laplacian = new cv.Mat();
  var meanMat = new cv.Mat();
  var stddevMat = new cv.Mat();
  var brightnessMat = new cv.Mat();
  var brightnessStd = new cv.Mat();

  try {
    cv.Laplacian(gray, laplacian, cv.CV_64F);
    cv.meanStdDev(laplacian, meanMat, stddevMat);

    var stddev = stddevMat.data64F[0];
    var blurScore = stddev * stddev;

    cv.meanStdDev(gray, brightnessMat, brightnessStd);
    var brightness = brightnessMat.data64F[0];

    return {
      blurScore: blurScore,
      brightness: brightness,
      isBlurry: blurScore < 100,
      isTooDark: brightness < 60,
      isTooBright: brightness > 210,
    };
  } finally {
    laplacian.delete();
    meanMat.delete();
    stddevMat.delete();
    brightnessMat.delete();
    brightnessStd.delete();
  }
}

// --- perspectiveTransform ---------------------------------------------------

function handlePerspectiveTransform(msg) {
  var imageData = new ImageData(
    new Uint8ClampedArray(msg.pixels),
    msg.width,
    msg.height,
  );
  var corners = msg.corners;
  var outWidth = msg.outWidth;
  var outHeight = msg.outHeight;

  var src = cv.matFromImageData(imageData);
  var dst = new cv.Mat();

  try {
    var srcPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
      corners.topLeft.x,
      corners.topLeft.y,
      corners.topRight.x,
      corners.topRight.y,
      corners.bottomRight.x,
      corners.bottomRight.y,
      corners.bottomLeft.x,
      corners.bottomLeft.y,
    ]);

    var dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
      0,
      0,
      outWidth,
      0,
      outWidth,
      outHeight,
      0,
      outHeight,
    ]);

    var M = cv.getPerspectiveTransform(srcPoints, dstPoints);
    var dstSize = new cv.Size(outWidth, outHeight);

    try {
      cv.warpPerspective(src, dst, M, dstSize);

      // Read pixels directly from Mat (no DOM access in workers)
      var resultPixels = new Uint8ClampedArray(dst.data);
      var buffer = resultPixels.buffer.slice(0);

      self.postMessage(
        {
          type: "perspectiveTransformResult",
          id: msg.id,
          pixels: buffer,
          width: outWidth,
          height: outHeight,
        },
        [buffer],
      );
    } finally {
      if (dstSize.delete) dstSize.delete();
      srcPoints.delete();
      dstPoints.delete();
      M.delete();
    }
  } finally {
    src.delete();
    dst.delete();
  }
}
