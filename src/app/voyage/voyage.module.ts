import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VoyageNavigationService } from './services/voyage-navigation.service';
import { VoyagePathService } from './services/voyage-path.service';
import { VoyageViewportComponent } from './components/voyage-viewport.component';
import { VoyageWrapperDirective } from './directives/voyage-wrapper.directive';
import { VoyageBackgroundDirective } from './directives/voyage-background.directive';
import { VoyageDestinationDirective } from './directives/voyage-destination.directive';
import { VoyageTravelPathDirective } from './directives/voyage-travel-path.directive';
import { VoyageActivePathDirective } from './directives/voyage-active-path.directive';
import { VoyageVoyagerDirective } from './directives/voyage-voyager.directive';

import 'hammerjs';

@NgModule({
  imports: [CommonModule],
  declarations: [
    VoyageViewportComponent,
    VoyageWrapperDirective,
    VoyageBackgroundDirective,
    VoyageDestinationDirective,
    VoyageTravelPathDirective,
    VoyageActivePathDirective,
    VoyageVoyagerDirective,
  ],
  exports: [
    VoyageViewportComponent,
    VoyageWrapperDirective,
    VoyageBackgroundDirective,
    VoyageDestinationDirective,
    VoyageTravelPathDirective,
    VoyageActivePathDirective,
    VoyageVoyagerDirective,
  ],
  providers: [VoyageNavigationService, VoyagePathService]
})
export class VoyageModule {}
