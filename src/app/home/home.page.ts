import { Component } from '@angular/core';
import { MessageService } from '../message.service';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { Message } from '../message.model';
import { Subscription } from 'rxjs';
import { User } from '../user.model';
import { IonItemSliding, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  isLoading = false;
  private messagesSub: Subscription;
  private usersSub: Subscription;
  loadedMessages: Message[];
  private messageSub: Subscription;
  loadedUsers: User[];
  relevantUser: User[];
  public user_ID: string;
  relevantMessages: Message[];

  constructor(
    private router: Router,
    private userService: UserService,
    private messageService: MessageService,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.usersSub = this.userService.users.subscribe(users => {
      this.loadedUsers = users;
      this.getUserID();
      this.relevantUser = this.loadedUsers.filter(
        user => user.userId === this.user_ID
      );
    });
    this.messageSub = this.messageService.messages.subscribe(messages => {
      this.loadedMessages = messages;
      this.relevantMessages = this.loadedMessages.filter(
        message => message.fromUser === this.user_ID
      );
    });
  }

  onClickChat() {
    this.router.navigate(['/', 'chat-form', this.relevantMessages[0].toUser]);
  }

  onDelete(messageID: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.loadingCtrl.create({ message: 'Deleting Chat...' }).then(loadingEl => {
      loadingEl.present();
      this.messageService.cancelMessage(messageID).subscribe(() => {
        loadingEl.dismiss();
      });
    });
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

  ngOnDestroy() {
    if (this.messageSub) {
      this.messageSub.unsubscribe();
    }
    if (this.usersSub) {
      this.usersSub.unsubscribe();
    }
  }

}
