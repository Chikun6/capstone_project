import { Component } from '@angular/core';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent {
  activeTab = 'all';

  notifications = [
    { type: 'like', user: 'Alice Johnson', handle: 'alicej', text: 'liked your post', time: '2m', post: 'Captured this incredible sunrise...' },
    { type: 'repost', user: 'Bob Kumar', handle: 'bobkumar', text: 'reposted your post', time: '15m', post: 'Big news in AI today...' },
    { type: 'follow', user: 'Clara Swift', handle: 'claraswift', text: 'started following you', time: '1h', post: '' },
    { type: 'like', user: 'Dev Patel', handle: 'devpatel', text: 'liked your post', time: '2h', post: 'Good morning from Haarlem...' },
    { type: 'reply', user: 'Eva Chen', handle: 'evachen', text: 'replied to your post', time: '3h', post: 'Six Nations update: Ireland leading...' },
    { type: 'follow', user: 'Sports Hub', handle: 'sportshub', text: 'started following you', time: '5h', post: '' },
    { type: 'like', user: 'Nature Lens', handle: 'naturephotos', text: 'liked your post', time: '1d', post: 'Captured this incredible sunrise...' },
  ];

  get filtered() {
    if (this.activeTab === 'all') return this.notifications;
    if (this.activeTab === 'mentions') return this.notifications.filter(n => n.type === 'reply');
    return this.notifications;
  }

  icon(type: string) {
    if (type === 'like') return '❤️';
    if (type === 'repost') return '🔁';
    if (type === 'follow') return '👤';
    if (type === 'reply') return '💬';
    return '🔔';
  }
}
