import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

import { VoyageTransformationMatrix } from './../../shared/voyage-transformation-matrix';

@Injectable()
export class VoyageNavigationService {
  private renderer: Renderer2;
  private SVGElement: SVGElement;
  private clientRect: ClientRect;
  private transformationMatrix: VoyageTransformationMatrix;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  init(svgElement: SVGElement, clientRect: ClientRect) {
    this.SVGElement = svgElement;
    this.clientRect = clientRect;

    if (!this.transformationMatrix) {
      this.transformationMatrix = new VoyageTransformationMatrix(clientRect);

      return;
    }

    this.updateSVG();
  }

  setMaxBounds(maxBounds: {x: number; y: number}) {
    this.transformationMatrix.setMaxBounds(maxBounds.x, maxBounds.y);
  }

  moveBy(x: number, y: number) {
    const invertedCTM = this.transformationMatrix.inverse();

    const basePx = invertedCTM.transformPoint(x, y);
    const baseVPTopLeftPx = invertedCTM.transformPoint(0, 0);

    this.transformationMatrix.translate(
      basePx.x - baseVPTopLeftPx.x,
      basePx.y - baseVPTopLeftPx.y
    );

    this.updateSVG();
  }

  scaleBy(center, factor) {
    const basePx = this.transformationMatrix
      .inverse()
      .transformPoint(center.x, center.y);

    this.transformationMatrix
      .translate(basePx.x, basePx.y)
      .scale(factor, factor)
      .translate(-basePx.x, -basePx.y);

    this.updateSVG();
  }

  centerTo(x, y) {
    this.transformationMatrix.setCenter(x, y);

    this.updateSVG();
  }

  private updateSVG() {
    requestAnimationFrame(() => {
      this.renderer.setAttribute(
        this.SVGElement,
        'transform',
        `matrix(${this.transformationMatrix.getCTM()})`
      );
    });
  }
}
