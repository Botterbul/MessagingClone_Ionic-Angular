import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, switchMap } from 'rxjs/operators';
import { Message } from './message.model';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth/auth.service';

interface MessagesData {
  fromUser: string;
  toUser: string;
  toUserEmail: string;
  message: [];
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private _messages = new BehaviorSubject<Message[]>([]);
  public user_Students: string;
  private newMessageList = [];

  get messages() {
    return this._messages.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) { }

  fetchMessages() {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.get<{[key: string]: MessagesData }>(
          `https://stratos-ad2db.firebaseio.com/messages.json?auth=${token}`
        );
    }),
    map(resData => {
      const messages = [];
      for (const key in resData) {
        if (resData.hasOwnProperty(key)) {
          messages.push(
            new Message(
              key,
              resData[key].fromUser,
              resData[key].toUser,
              resData[key].toUserEmail,
              resData[key].message
            )
          );
        }
      }
      return messages;
    }),
    tap(messages => {
      this._messages.next(messages);
    })
    );
  }

  retrieveUserEmail() {
    return this.authService.userEmail.pipe(
      take(1),
      switchMap(userEmail => {
        this.user_Students = userEmail;
        return this.user_Students = userEmail;
      })
    );
  }

  addMessage(
    messageID: string,
    fromUser: string,
    toUser: string,
    toUserEmail: string,
    message: string,
    documentURL: string,
    sentUser: boolean
  ) {

    let updatedMessage: Message[];
    let fetchedToken: string;
    console.log('Tweede Method');
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.messages;
      }),
      take(1),
      switchMap(messages => {
        if (!messages || messages.length <= 0) {
          return this.fetchMessages();
        } else {
          return of(messages);
        }
      }),
      switchMap(messages => {
        const updatedMessageIndex = messages.findIndex(pl => pl.id === messageID);
        updatedMessage = [...messages];
        const oldMessage = updatedMessage[updatedMessageIndex];
        const newMessageItem = {message: message, documentURL: documentURL, sentUser: sentUser};
        this.newMessageList = oldMessage.message;
        this.newMessageList.push(newMessageItem);
        updatedMessage[updatedMessageIndex] = new Message(
          oldMessage.id,
          fromUser,
          toUser,
          toUserEmail,
          this.newMessageList
        );
        return this.http.put(
          `https://stratos-ad2db.firebaseio.com/messages/${messageID}.json?auth=${fetchedToken}`,
          { ...updatedMessage[updatedMessageIndex], id: null }
        );
      }),
      tap(() => {
        this._messages.next(updatedMessage);
      })
    );
  }

  cancelMessage(messageId: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.delete(
          `https://stratos-ad2db.firebaseio.com/messages/${messageId}.json?auth=${token}`
        );
      }),
      switchMap(() => {
        return this.messages;
      }),
      take(1),
      tap(messages => {
        this._messages.next(messages.filter(b => b.id !== messageId));
      })
    );
  }
}
