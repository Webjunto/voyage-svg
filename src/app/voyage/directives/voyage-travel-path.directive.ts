import { Directive, ElementRef, Renderer2 } from '@angular/core';
import { VoyageDestinationDirective } from './voyage-destination.directive';

@Directive({
  selector: '[voyageTravelPath]'
})
export class VoyageTravelPathDirective {
  public get el(): SVGPathElement {
    return this.elRef.nativeElement;
  }

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2
  ) {}

  public setPathDefinition(destinations: VoyageDestinationDirective[]) {
    const definition = destinations.reduce((pathDef, destination, destinationIdx) => {
      if (destinationIdx === 0) {
        pathDef = `M ${destination.point.x} ${destination.point.y} `;
      } else {
        pathDef += `L ${destination.point.x} ${destination.point.y} `;
      }

      this.renderer.setAttribute(this.el, 'd', pathDef);
      destination.pathLengthAtPoint = this.el.getTotalLength();

      return pathDef;
    }, '');
    this.renderer.setAttribute(this.el, 'd', definition);
  }
}
