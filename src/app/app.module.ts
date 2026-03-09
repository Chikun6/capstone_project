import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './pages/landing/landing.component';
import { LoginPageComponent } from './pages/login/login.component';
import { RegisterPageComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { FollowComponent } from './pages/follow/follow.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ExploreComponent } from './pages/explore/explore.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RightSidebarComponent } from './components/right-sidebar/right-sidebar.component';
import { ProfileSetupComponent } from './pages/profile-setup/profile-setup.component';
import { TweetComponent } from './pages/tweet/tweet.component';

// Services are provided in root so no need to list here,
// but this ensures everything is wired up.

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    LoginPageComponent,
    RegisterPageComponent,
    HomeComponent,
    FollowComponent,
    ProfileComponent,
    ExploreComponent,
    SettingsComponent,
    NotificationsComponent,
    UserProfileComponent,
    SidebarComponent,
    RightSidebarComponent,
    ProfileSetupComponent,
    TweetComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
