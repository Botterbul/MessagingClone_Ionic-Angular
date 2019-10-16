import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  public user_Email: string;
  public forgotPasswordText = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.getEmail();
  }

  onLogout() {
    this.authService.logout();
    this.router.navigateByUrl('/auth');
  }

  forgotPassword() {
    this.forgotPasswordText = !this.forgotPasswordText;
  }

  getEmail() {
    return this.userService.retrieveUserEmail().subscribe(() => {
      this.user_Email = this.userService.user_Students;
    });
  }

}
