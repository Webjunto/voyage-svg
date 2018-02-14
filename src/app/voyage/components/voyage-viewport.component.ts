import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  AfterContentInit,
  OnDestroy,
  ContentChild,
  ContentChildren,
  QueryList,
  HostListener,
  NgZone,
  Input,
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { take } from 'rxjs/operators';

import { VoyageWrapperDirective } from './../directives/voyage-wrapper.directive';
import { VoyageBackgroundDirective } from './../directives/voyage-background.directive';
import { VoyageNavigationService } from './../services/voyage-navigation.service';
import { VoyageDestinationDirective } from './../directives/voyage-destination.directive';
import { VoyageTravelPathDirective } from './../directives/voyage-travel-path.directive';
import { VoyageActivePathDirective } from '../directives/voyage-active-path.directive';
import { linearInterpolation } from './../../shared/utils';

export interface HammerInput {
  deltaX: number;
  deltaY: number;
  center: { x: number; y: number };
  scale: number;
}

@Component({
  selector: 'voyage-viewport',
  template: `
    <div>
      <ng-content>
      </ng-content>
    </div>
  `,
  styles: [`div:first-of-type { height: 100%; width: 100% }`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VoyageViewportComponent implements OnInit, AfterContentInit, OnDestroy {
  @ContentChild(VoyageWrapperDirective)
  private wrapperDirective: VoyageWrapperDirective;

  @ContentChild(VoyageBackgroundDirective)
  private backgroundDirective: VoyageBackgroundDirective;

  @ContentChildren(VoyageDestinationDirective, { descendants: true })
  private destinations: QueryList<VoyageDestinationDirective>;

  @ContentChild(VoyageTravelPathDirective)
  private travelPath: VoyageTravelPathDirective;

  @ContentChild(VoyageActivePathDirective)
  private activePath: VoyageActivePathDirective;

  @Input() private currentProgress: number;

  private destinationChanges: Subscription;
  private lastDeltaX = 0;
  private lastDeltaY = 0;
  private lastScale = 1;
  private isPanning = false;
  private isPinching = false;

  constructor(
    private zone: NgZone,
    private voyageNavigationService: VoyageNavigationService
  ) {}

  public ngOnInit() {
    this.backgroundDirective.clientRect$.pipe(take(1)).subscribe(clientRect => {
      this.voyageNavigationService.init(this.wrapperDirective.el, clientRect);
    });
  }

  public ngAfterContentInit() {
    this.destinationChanges = this.destinations.changes
      .subscribe(destinations => this.definePaths());

    this.definePaths();
  }

  public ngOnDestroy() {
    this.destinationChanges.unsubscribe();
  }

  public definePaths() {
    const destinations = this.destinations.toArray();

    this.travelPath.setPathDefinition(destinations);
    this.activePath.setPathDefinition(destinations, this.currentProgress);
  }

  @HostListener('panstart', ['$event'])
  private onPanStart(evt: HammerInput) {
    this.zone.runOutsideAngular(() => {
      if (!this.isPanning && !this.isPinching) {
        this.lastDeltaX = 0;
        this.lastDeltaY = 0;
      }

      this.isPanning = true;
    });
  }

  @HostListener('panmove', ['$event'])
  private onPanMove(evt: HammerInput) {
    this.zone.runOutsideAngular(() => {
      const x = evt.deltaX - this.lastDeltaX;
      const y = evt.deltaY - this.lastDeltaY;

      this.lastDeltaX = evt.deltaX;
      this.lastDeltaY = evt.deltaY;

      this.voyageNavigationService.moveBy(x, y);
    });
  }

  @HostListener('panend', ['$event'])
  private onPanEnd(evt: HammerInput) {
    this.zone.runOutsideAngular(() => {
      this.isPanning = false;
    });
  }

  @HostListener('pinchstart', ['$event'])
  private onPinchStart(evt: HammerInput) {
    this.zone.runOutsideAngular(() => {
      this.isPinching = true;

      this.lastScale = evt.scale;
    });
  }

  @HostListener('pinchmove', ['$event'])
  private onPinchMove(evt: HammerInput) {
    this.zone.runOutsideAngular(() => {
      const factor = evt.scale / this.lastScale;

      this.lastScale = evt.scale;
      this.lastDeltaX = evt.deltaX;
      this.lastDeltaY = evt.deltaY;

      this.voyageNavigationService.scaleBy(evt.center, factor);
    });
  }

  @HostListener('pinchend', ['$event'])
  private onPinchEnd(evt: HammerInput) {
    this.zone.runOutsideAngular(() => {
      this.isPinching = false;
    });
  }

  @HostListener('wheel', ['$event'])
  private onScroll(evt: WheelEvent) {
    const { clientX: x, clientY: y } = evt;

    if (evt.wheelDelta >= 0) {
      // scroll up | zoom out
      this.voyageNavigationService.scaleBy({ x, y }, 0.95);
    } else if (evt.wheelDelta < 0) {
      // scroll down | zoom in
      this.voyageNavigationService.scaleBy({ x, y }, 1.05);
    }
  }
}
