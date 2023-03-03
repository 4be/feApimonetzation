import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { SearchComponent } from './search/search.component';
import { MostFrequentComponent } from './most-frequent/most-frequent.component';
import { BillingComponent } from './billing/billing.component';
import { PricingComponent } from './pricing/pricing.component';
import { UserManagementComponent } from './user-management/user-management.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: ToolbarComponent,
    children: [
      { path: 'search', component: SearchComponent },
      { path: 'billing', component: BillingComponent },
      { path: 'most-frequent', component: MostFrequentComponent },
      { path: 'pricing', component: PricingComponent },
      { path: 'user-management', component: UserManagementComponent },
    ]
  },
  { path: 'default', component: ToolbarComponent,
    children: [
      { path: 'search', component: SearchComponent },
      { path: 'billing', component: BillingComponent },
      { path: 'most-frequent', component: MostFrequentComponent },
    ]
  },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
