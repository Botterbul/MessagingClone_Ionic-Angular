import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from '../user.service';
import { User } from '../user.model';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

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
  private usersSub: Subscription;
  public user_ID: string;

  constructor(
    private userService: UserService,
    private router: Router,
    private loadingCtrl: LoadingController
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

  onDeleteFriend(friendId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    console.log(this.relevantUser[0].id);
    console.log(friendId);
    this.loadingCtrl.create({ message: 'Deleting Friend...' }).then(loadingEl => {
      loadingEl.present();
      this.userService.deleteFriend(this.relevantUser[0].id, friendId).subscribe(() => {
        loadingEl.dismiss();
      });
    });
  }

  onDeleteRequest(friendId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    console.log(this.relevantUser[0].id);
    console.log(friendId);
    this.loadingCtrl.create({ message: 'Declining Invitation...' }).then(loadingEl => {
      loadingEl.present();
      this.userService.deleteFriendInvitation(this.relevantUser[0].id, friendId).subscribe(() => {
        loadingEl.dismiss();
      });
    });
  }

  onAccept(friendId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    console.log(this.relevantUser[0].id);
    console.log(friendId);
    this.loadingCtrl.create({ message: 'Accepting Invitation...' }).then(loadingEl => {
      loadingEl.present();
      this.userService.acceptFriendInvitation(this.relevantUser[0].id, friendId).subscribe(() => {
        loadingEl.dismiss();
      });
    });
  }

  ngOnDestroy() {
    if (this.usersSub) {
      this.usersSub.unsubscribe();
    }
  }

}
