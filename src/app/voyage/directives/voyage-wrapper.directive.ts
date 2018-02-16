import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[voyageWrapper]'
})
export class VoyageWrapperDirective {
  public get el(): SVGElement {
    return this.elRef.nativeElement;
  }

  constructor(private elRef: ElementRef) {}
}
