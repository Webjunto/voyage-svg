
import { clamp } from './utils';

export class VoyageTransformationMatrix {
  private set a(val: number) {
    this.matrix[0] = clamp(val, 1, 3); // TODO: Global config
  }
  private get a(): number {
    return this.matrix[0];
  }

  private set b(val: number) {
    this.matrix[1] = val;
  }
  private get b(): number {
    return this.matrix[1];
  }

  private set c(val: number) {
    this.matrix[2] = val;
  }
  private get c(): number {
    return this.matrix[2];
  }

  private set d(val: number) {
    this.matrix[3] = clamp(val, 1, 3); // TODO: Global config
  }
  private get d(): number {
    return this.matrix[3];
  }

  private set e(val: number) {
    this.matrix[4] = val;
  }
  private get e(): number {
    return this.matrix[4];
  }

  private set f(val: number) {
    this.matrix[5] = val;
  }
  private get f(): number {
    return this.matrix[5];
  }

  private maxX: number;
  private maxY: number;

  constructor(
    private clientRect: ClientRect,
    private matrix = [1, 0, 0, 1, 0, 0]
  ) {}

  public setMaxBounds(x: number, y: number) {
    this.maxX = x;
    this.maxY = y;
  }

  public inverse() {
    const determinent = 1 / (this.a * this.d - this.b * this.c);

    const invertedMatrix = [
      determinent * this.d,
      determinent * -this.b,
      determinent * -this.c,
      determinent * this.a,
      determinent * (this.c * this.f - this.d * this.e),
      determinent * (this.b * this.d - this.a * this.f)
    ];

    return new VoyageTransformationMatrix(this.clientRect, invertedMatrix);
  }

  public setCenter(x: number, y: number) {
    const newX = -x + window.innerWidth / 2;
    const newY = -y + window.innerHeight / 2;

    const e = newX * this.a + newY * this.c;
    const f = newX * this.b + newY * this.d;

    this.e = e;
    this.f = f;

    return this;
  }

  public translate(x: number, y: number): this {
    const e = this.e + x * this.a + y * this.c;
    const f = this.f + x * this.b + y * this.d;

    this.e = e;
    this.f = f;

    return this;
  }

  public transformPoint(x: number, y: number): { x: number; y: number } {
    return {
      x: x * this.a + y * this.c + this.e,
      y: x * this.b + y * this.d + this.f
    };
  }

  public scale(x: number, y: number): this {
    this.a *= x;
    this.b *= x;

    this.c *= y;
    this.d *= y;

    return this;
  }

  public getCTM() {
    // Set max bounds
    this.e = clamp(
      this.e,
      -(this.a * this.clientRect.width - (this.maxX || window.innerWidth)),
      0
    ); // TODO: Global config

    this.f = clamp(
      this.f,
      -(this.d * this.clientRect.height - (this.maxY || window.innerHeight)),
      0
    ); // TODO: Global config

    return this.matrix.join(', ');
  }
}
