import {
  Component,
  ChangeDetectionStrategy,
  OnChanges,
  OnInit,
  AfterContentInit,
  OnDestroy,
  ContentChild,
  ContentChildren,
  QueryList,
  HostListener,
  NgZone,
  Input,
  SimpleChanges,
} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { take, takeUntil } from 'rxjs/operators';

import { VoyageNavigationService } from './../services/voyage-navigation.service';
import { VoyagePathService } from './../services/voyage-path.service';
import { VoyageWrapperDirective } from './../directives/voyage-wrapper.directive';
import { VoyageBackgroundDirective } from './../directives/voyage-background.directive';
import { VoyageDestinationDirective } from './../directives/voyage-destination.directive';
import { VoyageTravelPathDirective } from './../directives/voyage-travel-path.directive';
import { VoyageActivePathDirective } from '../directives/voyage-active-path.directive';
import { linearInterpolation } from './../../shared/utils';
import { VoyageVoyagerDirective } from '../directives/voyage-voyager.directive';

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
export class VoyageViewportComponent implements OnChanges, OnInit, AfterContentInit, OnDestroy {
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

  @ContentChild(VoyageVoyagerDirective)
  private voyager: VoyageVoyagerDirective;

  @Input() private currentProgress: number;
  @Input() private maxBounds: {x: number; y: number};

  private destroy = new Subject<never>();
  private destroy$ = this.destroy.asObservable();
  private lastDeltaX = 0;
  private lastDeltaY = 0;
  private lastScale = 1;
  private isPanning = false;
  private isPinching = false;

  constructor(
    private zone: NgZone,
    private voyageNavigationService: VoyageNavigationService,
    private voyagePathService: VoyagePathService
  ) {}

  public ngOnChanges(changes: SimpleChanges) {
    const {
      currentProgress: progressChange,
      bounds: boundsChange,
    } = changes;

    if (progressChange && !progressChange.firstChange) {
      this.definePaths();
    }

    if (boundsChange && !boundsChange.firstChange && boundsChange.currentValue) {
      this.voyageNavigationService.setMaxBounds(boundsChange.currentValue);
    }
  }

  public ngOnInit() {
    this.backgroundDirective.clientRect$.pipe(take(1)).subscribe(clientRect => {
      this.voyageNavigationService.init(this.wrapperDirective.el, clientRect);

      this.definePaths();

      if (this.maxBounds) {
        this.voyageNavigationService.setMaxBounds(this.maxBounds);
      }
    });
  }

  public ngAfterContentInit() {
    this.destinations.changes
      .pipe(takeUntil(this.destroy$))
      .subscribe(destinations => this.definePaths());

    this.voyagePathService.currentPosition$
      .pipe(takeUntil(this.destroy$))
      .subscribe(currentPosition => {
        const { x, y } = currentPosition.point;

        this.voyageNavigationService.centerTo(x, y);
        this.voyager.setPosition(x, y);
      });
  }

  public ngOnDestroy() {
    this.voyagePathService.stopAnimation();
    this.destroy.next();
  }

  public definePaths() {
    const destinations = this.destinations.toArray();

    this.travelPath.setPathDefinition(destinations);
    this.activePath.setPathDefinition(destinations, this.currentProgress);
    this.voyagePathService.animateLength(this.activePath, destinations);
  }

  @HostListener('window:resize')
  private onResize() {
    this.voyageNavigationService.moveBy(0, 0);
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
