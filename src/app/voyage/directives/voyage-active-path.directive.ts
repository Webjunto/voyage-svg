import { Directive, ElementRef, Renderer2 } from '@angular/core';

import { VoyageDestinationDirective } from './voyage-destination.directive';
import { linearInterpolation } from './../../shared/utils';

@Directive({
  selector: '[voyageActivePath]'
})
export class VoyageActivePathDirective {
  public get el(): SVGPathElement {
    return this.elRef.nativeElement;
  }

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2
  ) {}

  public setPathDefinition(destinations: VoyageDestinationDirective[], currentProgress: number) {
    const reachedDestinations = destinations.filter(dest => dest.requiredProgress <= currentProgress);

    let definition = reachedDestinations.reduce((pathDef, destination, destinationIdx) => {
      if (destinationIdx === 0) {
        return `M ${destination.point.x} ${destination.point.y} `;
      }

      return pathDef + `L ${destination.point.x} ${destination.point.y} `;
    }, '');

    definition += this.getPartialProgressPoint(destinations, currentProgress);

    this.renderer.setAttribute(this.el, 'd', definition);
  }

  public setStrokeDasharray(val: string) {
    this.renderer.setStyle(this.el, 'stroke-dasharray', val);
  }

  private getPartialProgressPoint(destinations: VoyageDestinationDirective[], currentProgress: number) {
    const nextIdx = destinations.findIndex(dest => dest.requiredProgress > currentProgress);

    if (nextIdx === -1) {
      return '';
    }

    const lastReachedIdx = nextIdx - 1;

    const next = destinations[nextIdx];
    const lastReached = destinations[lastReachedIdx];

    const progressPct = (currentProgress - lastReached.requiredProgress) / (next.requiredProgress - lastReached.requiredProgress);
    const progressPoint = linearInterpolation(lastReached.point, next.point, progressPct);

    return `L ${progressPoint.x} ${progressPoint.y} `;
  }
}
