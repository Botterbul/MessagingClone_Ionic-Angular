import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from '../user.service';
import { User } from '../user.model';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-current-friends',
  templateUrl: './current-friends.page.html',
  styleUrls: ['./current-friends.page.scss'],
})
export class CurrentFriendsPage implements OnInit {
  isLoading = false;
  isLoadingUsers = false;
  loadedUsers: User[];
  relevantUser: User[];
  relevantUserPendingFriends: string[];
  relevantUserFriends: string[];
  relevantFriendUser: User[];
  private usersSub: Subscription;
  public user_ID: string;
  friend: string;

  constructor(
    private userService: UserService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private messageService: MessageService
    ) { }

  ngOnInit() {
    this.usersSub = this.userService.users.subscribe(users => {
      this.loadedUsers = users;
      this.getUserID();
      this.relevantUser = this.loadedUsers.filter(
        user => user.userId === this.user_ID
      );
    });
  }

  ionViewWillEnter() {
    this.isLoadingUsers = true;
    this.userService.fetchUsers().subscribe(() => {
      this.isLoadingUsers = false;
    });
  }

  getUserID() {
    return this.userService.retrieveUserID().subscribe(() => {
      this.user_ID = this.userService.user_ID;
    });
  }

  onDeleteFriend(userID: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.loadingCtrl.create({ message: 'Deleting Friend...' }).then(loadingEl => {
      loadingEl.present();
      this.relevantFriendUser = this.loadedUsers.filter(
        user => user.userId === userID
      );
      this.userService.deleteFriend(this.relevantUser[0].id, userID).subscribe(() => {
        console.log(this.relevantUser[0].id);
        this.userService.deleteFriend(this.relevantFriendUser[0].id, this.relevantUser[0].userId).subscribe(() => {
          loadingEl.dismiss();
        });
      });
    });
  }

  onClickUser(userID: string) {
    this.router.navigate(['/', 'chat-form', userID]);
  }

  onDeleteRequest(userID: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.loadingCtrl.create({ message: 'Declining Invitation...' }).then(loadingEl => {
      loadingEl.present();
      this.userService.deleteFriendInvitation(this.relevantUser[0].id, userID).subscribe(() => {
        loadingEl.dismiss();
      });
    });
  }

  onAccept(userID: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.loadingCtrl.create({ message: 'Accepting Invitation...' }).then(loadingEl => {
      loadingEl.present();
      this.relevantFriendUser = this.loadedUsers.filter(
        user => user.userId === userID
      );
      this.messageService
          .addFirstMessage(
            this.relevantUser[0].userId,
            this.relevantUser[0].email,
            this.relevantFriendUser[0].userId,
            this.relevantFriendUser[0].email
            ).subscribe(() => {
              this.userService.acceptFriendInvitation(
                this.relevantUser[0].id,
                this.relevantUser[0].email,
                this.relevantFriendUser[0].email,
                userID
                ).subscribe(() => {
                  this.userService.acceptFriendInvitation(
                    this.relevantFriendUser[0].id,
                    this.relevantFriendUser[0].email,
                    this.relevantUser[0].email,
                    this.relevantUser[0].userId
                    ).subscribe(() => {
                    loadingEl.dismiss();
                  });
              });
            });
    });
  }

  ngOnDestroy() {
    if (this.usersSub) {
      this.usersSub.unsubscribe();
    }
  }

}
