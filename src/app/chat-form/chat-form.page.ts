import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.page.html',
  styleUrls: ['./chat-form.page.scss'],
})
export class ChatFormPage implements OnInit {
  userID: string;
  private messagesSub: Subscription;
  isLoading = false;

  constructor(private router: Router, private navCtrl: NavController, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('userID')) {
        this.navCtrl.navigateBack('/home');
        return;
      }
      this.userID = paramMap.get('userID');
      this.isLoading = true;
    });
  }

}
