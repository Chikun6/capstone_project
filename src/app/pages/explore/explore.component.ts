import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { UserService, User } from '../../services/user.service';
import { Post } from '../../models/post.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {
  searchQuery = '';
  activeFilter: 'tweets' | 'users' = 'tweets';
  tweetResults: Post[] = [];
  userResults: User[] = [];
  searching = false;

  private searchSubject = new Subject<string>();

  trendingTopics = [
    { rank: 1, title: '#AI', category: 'Technology', posts: '12.4k' },
    { rank: 2, title: '#Angular', category: 'Tech', posts: '8.1k' },
    { rank: 3, title: '#OpenSource', category: 'Dev', posts: '5.6k' },
    { rank: 4, title: '#SpringBoot', category: 'Java', posts: '4.9k' },
    { rank: 5, title: '#WebDev', category: 'Dev', posts: '3.2k' },
    { rank: 6, title: '#Startup', category: 'Business', posts: '2.8k' },
    { rank: 7, title: '#MachineLearning', category: 'AI', posts: '1.9k' },
    { rank: 8, title: '#React', category: 'Frontend', posts: '1.4k' },
  ];

  constructor(
    private postService: PostService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => this.doSearch(query));
  }

  onSearchInput() {
    this.searchSubject.next(this.searchQuery);
  }

  doSearch(query: string) {
    if (!query.trim()) {
      this.tweetResults = [];
      this.userResults = [];
      return;
    }
    this.searching = true;
    if (this.activeFilter === 'tweets') {
      this.postService.searchTweets(query).subscribe(results => {
        this.tweetResults = results;
        this.searching = false;
      });
    } else {
      this.userService.searchUsers(query).subscribe(results => {
        this.userResults = results;
        this.searching = false;
      });
    }
  }

  setFilter(f: 'tweets' | 'users') {
    this.activeFilter = f;
    if (this.searchQuery.trim()) this.doSearch(this.searchQuery);
  }

  searchTrend(tag: string) {
    this.searchQuery = tag;
    this.activeFilter = 'tweets';
    this.doSearch(tag);
  }

  goToUser(username: string) {
    this.router.navigate(['/user', username]);
  }

  goToTweet(post: Post) {
    this.router.navigate(['/tweet', post.id]);
  }

  formatCount(n: number): string {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n?.toString() || '0';
  }
}
