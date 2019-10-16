import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { UserService } from '../user.service';
import { User } from '../user.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from '../message.service';
import { Message } from '../message.model';

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
  loadedMessages: Message[];
  private messageSub: Subscription;
  relevantMessages: Message[];

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private userService: UserService,
    private messageService: MessageService,
    private loadingCtrl: LoadingController
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
    this.messageSub = this.messageService.messages.subscribe(messages => {
      this.loadedMessages = messages;
      this.relevantMessages = this.loadedMessages.filter(
        message => message.fromUser === this.user_ID || message.fromUser === this.userID
      );
    });
    // Moet dalk hier die if skryf om te wys watter kant is boodskap
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.messageService.fetchMessages().subscribe(() => {
      this.isLoading = false;
    });
    this.userService.fetchUsers().subscribe(() => {
      this.isLoading = false;
    });
  }

  getUserID() {
    return this.userService.retrieveUserID().subscribe(() => {
      this.user_ID = this.userService.user_ID;
    });
  }

  sendMessage() {
    this.loadingCtrl
      .create({
        message: 'Sending message...'
      })
      .then(loadingEl => {
        loadingEl.present();
        this.messageService
          .addMessage(
            this.user_ID,
            this.userID,
            this.form.value.message,
            '',
            true)
            .subscribe(() => {
            loadingEl.dismiss();
            this.form.reset();
        });
      });
  }

  ngOnDestroy() {
    if (this.messageSub) {
      this.messageSub.unsubscribe();
    }
    if (this.usersSub) {
      this.usersSub.unsubscribe();
    }
  }

}
