import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { UserService } from '../user.service';
import { User } from '../user.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.page.html',
  styleUrls: ['./chat-form.page.scss'],
})
export class ChatFormPage implements OnInit {
  userID: string;
  private messagesSub: Subscription;
  isLoading = false;
  private usersSub: Subscription;
  loadedUsers: User[];
  relevantUser: User[];
  relevantFriendUser: User[];
  public user_ID: string;
  friendName: string;
  form: FormGroup;
  message: string;

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private userService: UserService
    ) { }

  ngOnInit() {
    this.form = new FormGroup({
      message: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      })
    });
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('userID')) {
        this.navCtrl.navigateBack('/home');
        return;
      }
      this.userID = paramMap.get('userID');
      this.isLoading = true;
    });
    this.usersSub = this.userService.users.subscribe(users => {
      this.loadedUsers = users;
      this.getUserID();
      this.relevantUser = this.loadedUsers.filter(
        user => user.userId === this.user_ID
      );
      this.relevantFriendUser = this.loadedUsers.filter(
        user => user.userId === this.userID
      );
      this.friendName = this.relevantFriendUser[0].email;
    });
  }

  getUserID() {
    return this.userService.retrieveUserID().subscribe(() => {
      this.user_ID = this.userService.user_ID;
    });
  }

  sendMessage() {

  }

}
