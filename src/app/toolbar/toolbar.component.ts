import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from '../authentication.service';

export interface nav_item {
  name: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit{

  activeLink: any = '';
  showFiller = false;
  navsAdmin: nav_item[] = [
    {
      name: 'Most Frequent',
      path: '/most-frequent',
      icon: 'leaderboard'
    },
    {
      name: 'Search',
      path: '/search',
      icon: 'search'
    },
    {
      name: 'Billing',
      path: '/billing',
      icon: 'description'
    },
    {
      name: 'Pricing',
      path: '/pricing',
      icon: 'sell'
    },
    {
      name: 'User Management',
      path: '/user-management',
      icon: 'people'
    },
  ];
  navsDefault: nav_item[] = [
    {
      name: 'Most Frequent',
      path: '/most-frequent',
      icon: 'leaderboard'
    },
    {
      name: 'Search',
      path: '/search',
      icon: 'search'
    },
    {
      name: 'Billing',
      path: '/billing',
      icon: 'description'
    },
  ]

  session!: string | null;

  navs: nav_item[] = []

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.session = sessionStorage.getItem("session")
    let path = sessionStorage.getItem("path") ?? '';

    if(this.session == 'admin')
      this.navs = this.navsAdmin
    else if (this.session == 'default')
      this.navs = this.navsDefault

    this.activeLink = this.navs.filter(obj => obj.path.includes(path))[0];
  }

  moveMenu(nav: any, event: any): void {
    event.preventDefault();
    sessionStorage.setItem('path', nav.path);
    this.router.navigateByUrl('/' + this.session + nav.path);
    this.activeLink = nav;
    this.authenticationService.post_checkAuth()
    .subscribe(
      (response => {
        console.log("here" + response);
      }),
      (error => {
        console.log(error);
      })
    );
  };

  logout(){
    sessionStorage.clear();
    localStorage.clear();
    this.router.navigateByUrl('/');
  }
}
