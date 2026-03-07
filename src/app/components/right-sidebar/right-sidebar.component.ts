import { Component } from '@angular/core';

@Component({
  selector: 'app-right-sidebar',
  templateUrl: './right-sidebar.component.html',
  styleUrls: ['./right-sidebar.component.css']
})
export class RightSidebarComponent {
  peopleSearch = '';

  suggestedPeople = [
    { name: 'Alice Johnson', handle: 'alicej', following: false },
    { name: 'Bob Kumar', handle: 'bobkumar', following: false },
    { name: 'Clara Swift', handle: 'claraswift', following: true },
    { name: 'Dev Patel', handle: 'devpatel', following: false },
    { name: 'Eva Chen', handle: 'evachen', following: false },
  ];

  filteredPeople = [...this.suggestedPeople];

  trendingItems = ['F This Movie Fest', 'Six Nations', 'Caturday', 'Arsenal', 'F1 Qualifying'];

  filterPeople() {
    const q = this.peopleSearch.toLowerCase();
    this.filteredPeople = this.suggestedPeople.filter(p =>
      p.name.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q)
    );
  }
}
