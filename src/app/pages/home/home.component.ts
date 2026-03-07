import { Component, OnInit } from '@angular/core';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  posts: Post[] = [];
  activeTab = 'discover';
  showNewPostModal = false;
  newPostText = '';
  postLoading = false;
  peopleSearch = '';

  suggestedPeople = [
    { name: 'Alice Johnson', handle: 'alicej', following: false },
    { name: 'Bob Kumar', handle: 'bobkumar', following: false },
    { name: 'Clara Swift', handle: 'claraswift', following: true },
    { name: 'Dev Patel', handle: 'devpatel', following: false },
    { name: 'Eva Chen', handle: 'evachen', following: false },
  ];

  filteredPeople = [...this.suggestedPeople];

  constructor(private postService: PostService) {}

  ngOnInit() {
    this.postService.getPosts().subscribe(posts => this.posts = posts);
  }

  setTab(tab: string) { this.activeTab = tab; }
  openNewPost() { this.showNewPostModal = true; }
  closeNewPost() { this.showNewPostModal = false; }

  filterPeople() {
    const q = this.peopleSearch.toLowerCase();
    this.filteredPeople = this.suggestedPeople.filter(p =>
      p.name.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q)
    );
  }

  submitPost() {
    if (!this.newPostText.trim()) return;
    this.postLoading = true;
    setTimeout(() => {
      this.postService.createPost(this.newPostText).subscribe(post => {
        this.posts.unshift(post);
        this.newPostText = '';
        this.postLoading = false;
        this.closeNewPost();
      });
    }, 400);
  }

  toggleLike(post: Post) {
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
  }

  toggleRepost(post: Post) {
    post.reposted = !post.reposted;
    post.reposts += post.reposted ? 1 : -1;
  }

  formatCount(n: number): string {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n.toString();
  }
}
