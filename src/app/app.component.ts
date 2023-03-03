import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'angular_api_call_simas';

  session: string | null | undefined

  ngOnInit(): void {
    this.session = localStorage.getItem('session');
  }
}
