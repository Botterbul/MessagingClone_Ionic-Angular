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
  relevantChatMessages: User[];
  relevantMessages: Message[];
  oneMessage: Message[];
  messageObject: Message[];
  public onlineOffline: boolean = navigator.onLine;

  constructor(
    private router: Router,
    private userService: UserService,
    private messageService: MessageService,
    private loadingCtrl: LoadingController
  ) {
    this.loadedUsers = JSON.parse(localStorage.getItem("loadedUsers"));
    this.loadedMessages = JSON.parse(localStorage.getItem("loadedMessages"));
  }

  ngOnInit() {
    if (this.onlineOffline) {
      console.log('online');
      this.usersSub = this.userService.users.subscribe(users => {
        this.loadedUsers = users;
        this.getUserID();
        this.relevantUser = this.loadedUsers.filter(
          user => user.userId === this.user_ID
        );
        localStorage.setItem("loadedUsers", JSON.stringify(this.loadedUsers));
      });
      this.messageSub = this.messageService.messages.subscribe(messages => {
        this.loadedMessages = messages;
        this.relevantMessages = this.loadedMessages.filter(
          message => message.fromUser === this.user_ID || message.toUser === this.user_ID
        );
        localStorage.setItem("loadedMessages", JSON.stringify(this.loadedMessages));
      });
    }
    else {
      this.loadedUsers = JSON.parse(localStorage.getItem("loadedUsers"));
      this.getUserID();
      this.relevantUser = this.loadedUsers.filter(
        user => user.userId === this.user_ID
      );
      this.loadedMessages = JSON.parse(localStorage.getItem("loadedMessages"));
      this.relevantMessages = this.loadedMessages.filter(
        message => message.fromUser === this.user_ID || message.toUser === this.user_ID
      );
      console.log('offline');
      console.log(this.loadedMessages);
    }
  }

  onClickChat(userID: string) {
    this.router.navigate(['/', 'chat-form', userID]);
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
    if (this.onlineOffline) {
      this.isLoading = true;
      this.messageService.fetchMessages().subscribe(() => {
        this.isLoading = false;
        if(this.relevantMessages.length >= 1) {
          this.messageObject = this.relevantMessages[0].message[0].message;
        }
      });
      this.userService.fetchUsers().subscribe(() => {
        this.isLoading = false;
      });
    } else {
      this.loadedUsers = JSON.parse(localStorage.getItem("loadedUsers"));
      this.loadedMessages = JSON.parse(localStorage.getItem("loadedMessages"));
    }
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
