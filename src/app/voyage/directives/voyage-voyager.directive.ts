import { Directive, ElementRef, Renderer2, OnInit } from '@angular/core';

@Directive({ selector: '[voyageVoyager]' })
export class VoyageVoyagerDirective implements OnInit {
  public get el(): SVGGElement {
    return this.elRef.nativeElement;
  }

  private initialX = 0;
  private initialY = 0;

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2
  ) {}

  public ngOnInit() {
    const { e: x, f: y } = this.el.getCTM();

    this.initialX = x;
    this.initialY = y;
  }

  public setPosition(x, y) {
    const transform = `matrix(1 0 0 1 ${x + this.initialX} ${y + this.initialY})`;
    this.renderer.setAttribute(this.el, 'transform', transform);
  }
}
