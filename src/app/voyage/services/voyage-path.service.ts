import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { VoyageNavigationService } from './voyage-navigation.service';
import { VoyageDestinationDirective } from './../directives/voyage-destination.directive';
import { VoyageActivePathDirective } from './../directives/voyage-active-path.directive';

@Injectable()
export class VoyagePathService {
  private currentPosition = new Subject<{point: SVGPoint, lengthAtPoint: number}>();
  public currentPosition$ = this.currentPosition.asObservable();
  public strokeLength = 0;

  private totalLength: number;
  private animationHandle: number;

  constructor() {}

  public animateLength(activePath: VoyageActivePathDirective, destinations: VoyageDestinationDirective[]) {
    this.totalLength = activePath.el.getTotalLength();

    this.stopAnimation();
    this.animationHandle = requestAnimationFrame(() => this.animate(activePath, destinations));
  }

  public stopAnimation() {
    cancelAnimationFrame(this.animationHandle);
  }

  private animate(activePath: VoyageActivePathDirective, destinations: VoyageDestinationDirective[]) {
    this.strokeLength += 4;

    if (this.strokeLength > this.totalLength) {
      this.strokeLength = this.totalLength;
    }

    activePath.setStrokeDasharray(`${this.strokeLength} ${this.totalLength}`);

    const center = activePath.el.getPointAtLength(this.strokeLength);
    this.currentPosition.next({ point: center, lengthAtPoint: this.strokeLength });

    if (this.strokeLength === this.totalLength) {
      return;
    }

    this.animationHandle = requestAnimationFrame(() => this.animate(activePath, destinations));
  }
}
