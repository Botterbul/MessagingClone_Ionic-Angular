import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { UserService } from '../user.service';
import { User } from '../user.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from '../message.service';
import { Message } from '../message.model';

function base64toBlob(base64Data, contentType) {
  contentType = contentType || '';
  const sliceSize = 1024;
  const byteCharacters = window.atob(base64Data);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.page.html',
  styleUrls: ['./chat-form.page.scss'],
})
export class ChatFormPage implements OnInit {
  userID: string;
  form: FormGroup;
  form2: FormGroup;
  private messagesSub: Subscription;
  isLoading = false;
  private usersSub: Subscription;
  loadedUsers: User[];
  relevantUser: User[];
  relevantFriendUser: User[];
  public user_ID: string;
  friendName: string;
  message: string;
  messagesBetweenUsers: Message[];
  checkMessages = false;
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
    this.form2 = new FormGroup({
      image: new FormControl(null)
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
        message => (message.fromUser === this.user_ID && message.toUser === this.userID) || (message.fromUser === this.userID && message.toUser === this.user_ID)
      );
      this.messagesBetweenUsers = this.relevantMessages[0].message;
    });
    // Moet dalk hier die if skryf om te wys watter kant is boodskap
  }

  onImagePicked(imageData: string | File) {
    let imageFile;
    if (typeof imageData === 'string') {
      try {
        imageFile = base64toBlob(
          imageData.replace('data:image/jpeg;base64,', ''),
          'image/jpeg'
        );
      } catch (error) {
        console.log(error);
        return;
      }
    } else {
      imageFile = imageData;
    }
    this.form.patchValue({ image: imageFile });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.checkMessages = true;
    this.messageService.fetchMessages().subscribe(() => {
      this.isLoading = false;
      //this.refreshMessages();
      //Moet hier net aansit vir messages refresh
    });
    this.userService.fetchUsers().subscribe(() => {
      this.isLoading = false;
    });
  }

  async refreshMessages() {
    function delay(ms: number) {
      return new Promise( resolve => setTimeout(resolve, ms) );
    }
    while (this.checkMessages) {
      this.messageService.fetchMessages().subscribe(() => {
      });
      console.log('Still Checking Messages');
      await delay(1000);
    }
  }

  getUserID() {
    return this.userService.retrieveUserID().subscribe(() => {
      this.user_ID = this.userService.user_ID;
    });
  }

  //onImagePicked(imageData: string) {
  //
  //}

  sendAttachment() {

  }

  sendVoiceNote() {

  }

  sendImage() {

  }

  sendMessage() {
    if (this.form.value.message.length <= 0) {
      return;
    } else {
      this.loadingCtrl
      .create({
        message: 'Sending message...'
      })
      .then(loadingEl => {
        loadingEl.present();
        this.messageService
          .addMessage(
            this.relevantMessages[0].id,
            this.form.value.message,
            '',
            true
            )
            .subscribe(() => {
            loadingEl.dismiss();
            this.form.reset();
        });
      });
    }
  }

  ngOnDestroy() {
    if (this.messageSub) {
      this.messageSub.unsubscribe();
    }
    if (this.usersSub) {
      this.usersSub.unsubscribe();
    }
    this.checkMessages = false;
  }

}
