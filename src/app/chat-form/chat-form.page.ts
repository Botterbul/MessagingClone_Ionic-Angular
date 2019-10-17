import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { UserService } from '../user.service';
import { User } from '../user.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from '../message.service';
import { Message } from '../message.model';
import { SimpleCrypto } from 'simple-crypto-js';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import * as RecordRTC from 'recordrtc';
import { DomSanitizer } from '@angular/platform-browser';

export interface Image {
  id: string;
  image: string;
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
  imageUrl = false;
  public user_ID: string;
  friendName: string;
  message: string;
  messagesBetweenUsers = [];
  imageURLLink: string;
  checkMessages = false;
  loadedMessages: Message[];
  decryptedMessages: Message[];
  private messageSub: Subscription;
  relevantMessages: Message[];
  private _secretKey = 'ITRW322';
  myEmail: string;
  checkMyEmail: string;
  simpleCrypto = new SimpleCrypto(this._secretKey);
  url: any;
  newImage: Image = {
    id: this.afs.createId(), image: ''
  };
  loading = false;
  //Lets initiate Record OBJ
  private record;
  //Will use this flag for detect recording
  public recording = false;
  //Url of Blob
  public error;
  iCall = 0;

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private userService: UserService,
    private messageService: MessageService,
    private loadingCtrl: LoadingController,
    private afs: AngularFirestore,
    private storage: AngularFireStorage,
    private iab: InAppBrowser,
    private domSanitizer: DomSanitizer
    ) { }

    sanitize(url: string) {
      return this.domSanitizer.bypassSecurityTrustUrl(url);
    }

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
      this.myEmail = this.relevantUser[0].email;
    });
    this.messageSub = this.messageService.messages.subscribe(messages => {
      this.loadedMessages = messages;
      this.relevantMessages = this.loadedMessages.filter(
        message => (message.fromUser === this.user_ID && message.toUser === this.userID) || (message.fromUser === this.userID && message.toUser === this.user_ID)
      );
      this.messagesBetweenUsers = this.relevantMessages[0].message;
      this.checkMyEmail = this.relevantMessages[0].fromUserEmail;
    });
  }

  initiateRecording() {
    this.recording = true;
    let mediaConstraints = {
      video: false,
      audio: true
    };
    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then(this.successCallback.bind(this), this.errorCallback.bind(this));
  }

  successCallback(stream) {
    var options = {
      mimeType: "audio/wav",
      numberOfAudioChannels: 1
    };
    //Start Actuall Recording
    var StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
    this.record = new StereoAudioRecorder(stream, options);
    this.record.record();
  }

  stopRecording() {
    this.recording = false;
    this.record.stop(this.processRecording.bind(this));
  }

  /**
   * processRecording Do what ever you want with blob
   * @param {any} blob Blog
   */
  processRecording(blob) {
    this.url = URL.createObjectURL(blob);
  }
  /**
   * Process Error.
   */
  errorCallback(error) {
    this.error = 'Can not play audio in your browser';
  }

  uploadImage(event) {
    this.loadingCtrl
              .create({
                message: 'Loading File...'
              })
              .then(loadingEl2 => {
                loadingEl2.present();
                this.loading = true;
                if (event.target.files && event.target.files[0]) {
      let reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      // For Preview Of Image
      reader.onload = (e: any) => { // called once readAsDataURL is completed
        this.url = e.target.result;
        // For Uploading Image To Firebase
        const fileraw = event.target.files[0];
        const filePath = '/Image/' + 'Image' + (Math.floor(1000 + Math.random() * 9000) + 1);
        const result = this.SaveImageRef(filePath, fileraw);
        const ref = result.ref;
        result.task.then(a => {
          ref.getDownloadURL().subscribe(a => {
            this.newImage.image = a;
            this.imageURLLink = a;
            console.log(this.imageURLLink);
            this.loading = false;
            loadingEl2.dismiss();
            this.loadingCtrl
              .create({
                message: 'Sending file...'
              })
              .then(loadingEl => {
                loadingEl.present();
                this.messageService
                  .sendImage(
                  this.relevantMessages[0].id,
                  'Download FILE#*-199',
                  this.imageURLLink,
                  true,
                  this.myEmail
                  )
                  .subscribe(() => {
                  loadingEl.dismiss();
                  this.form.reset();
                  this.url = null;
                  });
                  });
          });
          this.afs.collection('Image').doc(this.newImage.id).set(this.newImage);
        });
      };
    }
  });
}

  ionViewWillEnter() {
    this.isLoading = true;
    this.checkMessages = true;
    this.messageService.fetchMessages().subscribe(() => {
      this.isLoading = false;
      this.refreshMessages();
    });
    this.userService.fetchUsers().subscribe(() => {
      this.isLoading = false;
    });
  }

  downloadFileUrl(url: string) {
    console.log(url);
    const browser = this.iab.create(url, '_blank');
  }

  async refreshMessages() {
    function delay(ms: number) {
      return new Promise( resolve => setTimeout(resolve, ms) );
    }
    while (this.checkMessages) {
      this.messageService.fetchMessages().subscribe(() => {
        });
      //this.messagesBetweenUsers = this.relevantMessages[0].message;
      await delay(1000);
    }
    let i;
    for (i = 0; i < this.loadedMessages.length; i++) {
      let k;
      for (k = 0; k < this.loadedMessages[i].message.length; k++) {
        let decipherText = this.simpleCrypto.decrypt(this.loadedMessages[i].message[k].message);
        this.loadedMessages[i].message[k].message = decipherText;
      }
    }
  }

  getUserID() {
    return this.userService.retrieveUserID().subscribe(() => {
      this.user_ID = this.userService.user_ID;
    });
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
        let plainText = this.form.value.message;
        let cipherText = this.simpleCrypto.encrypt(plainText);
        this.messageService
          .addMessage(
            this.relevantMessages[0].id,
            this.form.value.message,
            cipherText,
            '',
            true,
            this.myEmail
            )
            .subscribe(() => {
            loadingEl.dismiss();
            this.form.reset();
        });
      });
    }
  }

  SaveImageRef(filePath, file) {
    return {
      task: this.storage.upload(filePath, file)
      , ref: this.storage.ref(filePath)
    };
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
