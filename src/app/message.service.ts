import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, switchMap } from 'rxjs/operators';
import { Message } from './message.model';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth/auth.service';

interface MessagesData {
  fromUser: string;
  fromUserEmail: string;
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
              resData[key].fromUserEmail,
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
    message: string,
    encryptedMessage: string,
    documentURL: string,
    sentUser: boolean,
    emailSent: string
  ) {
    let updatedMessage: Message[];
    let fetchedToken: string;
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
        const newMessageItem = {message: message, encryptedMessage: encryptedMessage, documentURL: documentURL, sentUser: sentUser, emailSent: emailSent};
        this.newMessageList = oldMessage.message;
        this.newMessageList.push(newMessageItem);
        updatedMessage[updatedMessageIndex] = new Message(
          oldMessage.id,
          oldMessage.fromUser,
          oldMessage.fromUserEmail,
          oldMessage.toUser,
          oldMessage.toUserEmail,
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

  sendImage(
    messageID: string,
    message: string,
    documentURL: string,
    sentUser: boolean,
    emailSent: string
  ) {
    let updatedMessage: Message[];
    let fetchedToken: string;
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
        const newMessageItem = {message: message, documentURL: documentURL, sentUser: sentUser, emailSent: emailSent};
        this.newMessageList = oldMessage.message;
        this.newMessageList.push(newMessageItem);
        updatedMessage[updatedMessageIndex] = new Message(
          oldMessage.id,
          oldMessage.fromUser,
          oldMessage.fromUserEmail,
          oldMessage.toUser,
          oldMessage.toUserEmail,
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

  addFirstMessage(
    fromUser: string,
    fromUserEmail: string,
    toUser: string,
    toUserEmail: string,
  ) {
    let generatedId: string;
    let fetchedUserId: string;
    let newMessage: Message;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
        if (!fetchedUserId) {
          throw new Error('No user found!');
        }
        newMessage = new Message(
          Math.random().toString(),
          fromUser,
          fromUserEmail,
          toUser,
          toUserEmail,
          []
        );
        return this.http.post<{name: string}>(
          `https://stratos-ad2db.firebaseio.com/messages.json?auth=${token}`,
          {
            ...newMessage,
            id: null
          }
        );
      }), switchMap(resData => {
        generatedId = resData.name;
        return this.messages;
      }),
      take(1),
      tap(messages => {
        newMessage.id = generatedId;
        this._messages.next(messages.concat(newMessage));
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
