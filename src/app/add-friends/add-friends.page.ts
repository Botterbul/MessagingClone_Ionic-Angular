import { Component, OnInit } from '@angular/core';
import { LoadingController, AlertController } from '@ionic/angular';
import { UserService } from '../user.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { User } from '../user.model';
import { take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-add-friends',
  templateUrl: './add-friends.page.html',
  styleUrls: ['./add-friends.page.scss'],
})
export class AddFriendsPage implements OnInit {
  form: FormGroup;
  email: string;
  private usersSub: Subscription;
  users: User[];
  relevantUser: User[];
  listedUsers: User[];
  userToBeAdded: User[];
  isLoading = false;

  constructor(
    private loadingCtrl: LoadingController,
    private userService: UserService,
    private alertCtrl: AlertController,
    private usersService: UserService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      })
    });
    this.usersSub = this.usersService.users.subscribe(users => {
      this.users = users;
      this.relevantUser = [];
      this.listedUsers = [];
      this.onFilterUpdate();
      console.log(this.users);
    });
    console.log(this.users);
  }

  onFilterUpdate() {
    this.relevantUser = [];
    this.listedUsers = [];
    this.authService.userId.pipe(take(1)).subscribe(userId => {
      this.relevantUser = this.users.filter(
        user => user.userId === userId
      );
      this.listedUsers = this.relevantUser;
    });
  }

  addFriend() {
    this.userToBeAdded = [];
    this.userToBeAdded = this.users.filter(
      user => user.email === this.form.value.email
    );
    if (this.userToBeAdded.length <= 0 || !this.userToBeAdded || this.userToBeAdded[0].userId === this.relevantUser[0].userId) {
      this.alertCtrl.create({
        header: 'Send Invite Error',
        message: 'There is no such user using the app! Invite him to create an account first!',
        buttons: ['OK']
      }).then(loadingELNuut => {
        loadingELNuut.present();
        return;
      });
    } else {
      this.loadingCtrl
      .create({
        message: 'Adding friend...'
      })
      .then(loadingEl => {
        loadingEl.present();
        this.userService
          .addFriend(
            this.userToBeAdded[0].id,
            this.relevantUser[0].email,
            this.relevantUser[0].userId
          )
          // tslint:disable-next-line: align
          .subscribe(() => {
            loadingEl.dismiss();
            this.alertCtrl.create({
              header: 'Send Invite',
              message: 'The invite was sent to the user. Please wait for the user to accept your invitation to be a friend',
              buttons: ['OK']
            }).then(loadingELNuut => {
              loadingELNuut.present();
            });
            this.form.reset();
          });
      });
    }
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.userService.fetchUsers().subscribe(() => {
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    if (this.usersSub) {
      this.usersSub.unsubscribe();
    }
  }

}
