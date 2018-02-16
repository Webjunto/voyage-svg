import { Directive, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { VoyageViewportComponent } from './../components/voyage-viewport.component';

@Directive({
  selector: '[voyageBackground]'
})
export class VoyageBackgroundDirective implements AfterViewInit {
  public get clientRect$(): Observable<ClientRect> {
    return this.clientRect.asObservable();
  }

  public get el(): SVGImageElement {
    return this.elRef.nativeElement;
  }

  private clientRect: Subject<ClientRect> = new Subject();

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2
  ) {}

  public ngAfterViewInit() {
    // Hack: because Safari doesn't fire load event
    // on svg:image elements apparently
    // Optimally, we'd decorate onLoad with @HostListener('load')
    // which works just fine on Chrome ¯\_(ツ)_/¯
    const img = new Image();
    img.onload = this.onLoad.bind(this, img);
    img.src = this.elRef.nativeElement.getAttribute('xlink:href');
  }

  private onLoad(img: HTMLImageElement) {
    this.renderer.setAttribute(this.el, 'height', img.height.toString());
    this.renderer.setAttribute(this.el, 'width', img.width.toString());

    const clientRect: ClientRect = this.elRef.nativeElement.getBoundingClientRect();
    this.clientRect.next(clientRect);
  }
}
