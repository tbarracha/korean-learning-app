// file: src/app/hangul/services/hangul-shape-scoring.service.ts

import { Injectable } from '@angular/core';

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  points: DrawingPoint[];
}

export interface HangulShapeScore {
  score: number;
  feedback: string;
}

export interface HangulShapeScoreInput {
  character: string;
  strokes: DrawingStroke[];
  drawingWidth: number;
  drawingHeight: number;
}

interface CloudPoint {
  x: number;
  y: number;
}

@Injectable({
  providedIn: 'root',
})
export class HangulShapeScoringService {
  private readonly canvasSize = 256;
  private readonly gridSize = 24;
  private readonly alphaThreshold = 24;
  private readonly toleranceCells = 1;
  private readonly userStrokeWidth = 14;

  /**
   * $P usually uses a fixed number of points.
   * 64 is a good mobile-friendly value here.
   */
  private readonly pointCloudSize = 64;

  private readonly targetFont =
    'bold 188px "Noto Sans KR", system-ui, sans-serif';

  score(input: HangulShapeScoreInput): HangulShapeScore {
    const character = input.character.trim();

    if (
      !character ||
      input.strokes.length === 0 ||
      input.drawingWidth <= 0 ||
      input.drawingHeight <= 0
    ) {
      return this.createScore(0);
    }

    const targetGrid = this.createTargetGrid(character);
    const userGrid = this.createUserGrid(input);

    const expandedTargetGrid = this.expandGrid(targetGrid, this.toleranceCells);

    const userCellCount = this.countCells(userGrid);

    if (userCellCount === 0) {
      return this.createScore(0);
    }

    /**
     * Main user-friendly score:
     * "How much of what the learner drew is inside the expected zones?"
     */
    const matchedUserCells = this.countIntersection(userGrid, expandedTargetGrid);
    const precision = matchedUserCells / userCellCount;

    /**
     * $P point-cloud similarity:
     * "Does the whole cloud shape look like the target cloud?"
     */
    const targetCloud = this.gridToCloud(targetGrid);
    const userCloud = this.gridToCloud(userGrid);
    const pointCloudSimilarity = this.pointCloudSimilarity(
      userCloud,
      targetCloud,
    );

    /**
     * Keep precision as the main metric, but use $P as a shape sanity modifier.
     *
     * This means:
     * - a nice partial/correct drawing still feels rewarding
     * - a weird drawing that happens to touch target zones gets reduced
     */
    const shapeModifier = 0.72 + pointCloudSimilarity * 0.28;
    let score = precision * shapeModifier;

    /**
     * Light guardrails only.
     * We do not want to go back to the brutal 1% behavior.
     */
    if (precision < 0.35) {
      score *= 0.7;
    }

    if (pointCloudSimilarity < 0.35) {
      score *= 0.75;
    }

    return this.createScore(score);
  }

  private createTargetGrid(character: string): Uint8Array {
    const canvas = document.createElement('canvas');
    canvas.width = this.canvasSize;
    canvas.height = this.canvasSize;

    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = this.targetFont;
    ctx.fillText(character, this.canvasSize / 2, this.canvasSize / 2 + 10);

    return this.canvasToGrid(canvas);
  }

  private createUserGrid(input: HangulShapeScoreInput): Uint8Array {
    const canvas = document.createElement('canvas');
    canvas.width = this.canvasSize;
    canvas.height = this.canvasSize;

    const ctx = canvas.getContext('2d')!;

    const scaleX = this.canvasSize / input.drawingWidth;
    const scaleY = this.canvasSize / input.drawingHeight;
    const averageScale = (scaleX + scaleY) / 2;

    ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
    ctx.lineWidth = this.userStrokeWidth * averageScale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#000';

    for (const stroke of input.strokes) {
      this.drawStroke(ctx, stroke, scaleX, scaleY);
    }

    return this.canvasToGrid(canvas);
  }

  private drawStroke(
    ctx: CanvasRenderingContext2D,
    stroke: DrawingStroke,
    scaleX: number,
    scaleY: number,
  ): void {
    if (stroke.points.length === 0) {
      return;
    }

    const [firstPoint, ...remainingPoints] = stroke.points;

    ctx.beginPath();
    ctx.arc(
      firstPoint.x * scaleX,
      firstPoint.y * scaleY,
      ctx.lineWidth / 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    if (remainingPoints.length === 0) {
      return;
    }

    let previousPoint = firstPoint;

    ctx.beginPath();
    ctx.moveTo(firstPoint.x * scaleX, firstPoint.y * scaleY);

    for (const currentPoint of remainingPoints) {
      const midPoint = {
        x: (previousPoint.x + currentPoint.x) / 2,
        y: (previousPoint.y + currentPoint.y) / 2,
      };

      ctx.quadraticCurveTo(
        previousPoint.x * scaleX,
        previousPoint.y * scaleY,
        midPoint.x * scaleX,
        midPoint.y * scaleY,
      );

      previousPoint = currentPoint;
    }

    ctx.stroke();
    ctx.closePath();
  }

  private canvasToGrid(canvas: HTMLCanvasElement): Uint8Array {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(
      0,
      0,
      this.canvasSize,
      this.canvasSize,
    );

    const grid = new Uint8Array(this.gridSize * this.gridSize);
    const cellSize = this.canvasSize / this.gridSize;

    for (let y = 0; y < this.canvasSize; y++) {
      for (let x = 0; x < this.canvasSize; x++) {
        const alphaIndex = (y * this.canvasSize + x) * 4 + 3;

        if (imageData.data[alphaIndex] <= this.alphaThreshold) {
          continue;
        }

        const gridX = Math.min(this.gridSize - 1, Math.floor(x / cellSize));
        const gridY = Math.min(this.gridSize - 1, Math.floor(y / cellSize));

        grid[gridY * this.gridSize + gridX] = 1;
      }
    }

    return grid;
  }

  private expandGrid(grid: Uint8Array, radius: number): Uint8Array {
    const expanded = new Uint8Array(grid.length);

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        if (grid[y * this.gridSize + x] !== 1) {
          continue;
        }

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            if (
              nx < 0 ||
              nx >= this.gridSize ||
              ny < 0 ||
              ny >= this.gridSize
            ) {
              continue;
            }

            expanded[ny * this.gridSize + nx] = 1;
          }
        }
      }
    }

    return expanded;
  }

  private gridToCloud(grid: Uint8Array): CloudPoint[] {
    const points: CloudPoint[] = [];

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        if (grid[y * this.gridSize + x] !== 1) {
          continue;
        }

        points.push({
          x: (x + 0.5) / this.gridSize,
          y: (y + 0.5) / this.gridSize,
        });
      }
    }

    return points;
  }

  /**
   * Adapted $P-style point-cloud similarity.
   *
   * $P compares normalized point clouds using a greedy approximation
   * to point assignment. Here we feed it grid-cell centers instead of raw
   * pointer data because your app already decided to score by hidden zones.
   */
  private pointCloudSimilarity(
    candidate: CloudPoint[],
    template: CloudPoint[],
  ): number {
    if (candidate.length === 0 || template.length === 0) {
      return 0;
    }

    const candidateCloud = this.prepareCloud(candidate);
    const templateCloud = this.prepareCloud(template);

    const distance = this.greedyCloudMatch(candidateCloud, templateCloud);

    /**
     * After normalization to a 1x1 square, the max useful distance is roughly
     * the half diagonal.
     */
    const maxDistance = Math.SQRT2 / 2;

    return this.clamp(1 - distance / maxDistance, 0, 1);
  }

  private prepareCloud(points: CloudPoint[]): CloudPoint[] {
    return this.translateToOrigin(
      this.scaleToUnitSquare(this.equalizePointCount(points, this.pointCloudSize)),
    );
  }

  /**
   * Original $P implementations resample path points.
   * For occupied grid cells, there is no true stroke path, so this creates
   * a stable fixed-size cloud by sorting spatially and sampling evenly.
   */
  private equalizePointCount(points: CloudPoint[], count: number): CloudPoint[] {
    if (points.length === 0 || count <= 0) {
      return [];
    }

    if (points.length === count) {
      return [...points];
    }

    const sorted = [...points].sort((a, b) => {
      if (a.y === b.y) {
        return a.x - b.x;
      }

      return a.y - b.y;
    });

    if (sorted.length === 1) {
      return Array.from({ length: count }, () => ({ ...sorted[0] }));
    }

    const result: CloudPoint[] = [];

    for (let i = 0; i < count; i++) {
      const position = (i * (sorted.length - 1)) / Math.max(1, count - 1);
      const leftIndex = Math.floor(position);
      const rightIndex = Math.min(sorted.length - 1, leftIndex + 1);
      const progress = position - leftIndex;

      const left = sorted[leftIndex];
      const right = sorted[rightIndex];

      result.push({
        x: this.lerp(left.x, right.x, progress),
        y: this.lerp(left.y, right.y, progress),
      });
    }

    return result;
  }

  private scaleToUnitSquare(points: CloudPoint[]): CloudPoint[] {
    const box = this.boundingBox(points);
    const scale = Math.max(box.width, box.height);

    if (scale <= 0) {
      return points.map((point) => ({ ...point }));
    }

    return points.map((point) => ({
      x: (point.x - box.minX) / scale,
      y: (point.y - box.minY) / scale,
    }));
  }

  private translateToOrigin(points: CloudPoint[]): CloudPoint[] {
    const centroid = this.centroid(points);

    return points.map((point) => ({
      x: point.x - centroid.x,
      y: point.y - centroid.y,
    }));
  }

  private greedyCloudMatch(points: CloudPoint[], template: CloudPoint[]): number {
    const count = points.length;
    const step = Math.floor(Math.pow(count, 0.5));
    let minDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < count; i += step) {
      minDistance = Math.min(
        minDistance,
        this.cloudDistance(points, template, i),
        this.cloudDistance(template, points, i),
      );
    }

    return minDistance;
  }

  private cloudDistance(
    points: CloudPoint[],
    template: CloudPoint[],
    startIndex: number,
  ): number {
    const count = points.length;
    const matched = new Array<boolean>(count).fill(false);

    let sum = 0;
    let index = startIndex;

    do {
      let bestIndex = -1;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (let i = 0; i < count; i++) {
        if (matched[i]) {
          continue;
        }

        const distance = this.distance(points[index], template[i]);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = i;
        }
      }

      matched[bestIndex] = true;

      const weight =
        1 - ((index - startIndex + count) % count) / count;

      sum += weight * bestDistance;
      index = (index + 1) % count;
    } while (index !== startIndex);

    return sum / count;
  }

  private boundingBox(points: CloudPoint[]): {
    minX: number;
    minY: number;
    width: number;
    height: number;
  } {
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    return {
      minX,
      minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  private centroid(points: CloudPoint[]): CloudPoint {
    let x = 0;
    let y = 0;

    for (const point of points) {
      x += point.x;
      y += point.y;
    }

    return {
      x: x / points.length,
      y: y / points.length,
    };
  }

  private countCells(grid: Uint8Array): number {
    let count = 0;

    for (const cell of grid) {
      if (cell === 1) {
        count++;
      }
    }

    return count;
  }

  private countIntersection(a: Uint8Array, b: Uint8Array): number {
    let count = 0;

    for (let i = 0; i < a.length; i++) {
      if (a[i] === 1 && b[i] === 1) {
        count++;
      }
    }

    return count;
  }

  private distance(a: CloudPoint, b: CloudPoint): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.sqrt(dx * dx + dy * dy);
  }

  private lerp(a: number, b: number, progress: number): number {
    return a + (b - a) * progress;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private createScore(rawScore: number): HangulShapeScore {
    const score = Math.round(this.clamp(rawScore, 0, 1) * 100);

    return {
      score,
      feedback: this.getFeedback(score),
    };
  }

  private getFeedback(score: number): string {
    if (score >= 90) {
      return 'Excellent shape.';
    }

    if (score >= 75) {
      return 'Good shape.';
    }

    if (score >= 55) {
      return 'Close. Most of your drawing is in the right zones.';
    }

    if (score >= 30) {
      return 'Some zones match. Try following the character shape more closely.';
    }

    return 'Try again while following the character zones.';
  }
}