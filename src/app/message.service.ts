import { Injectable } from '@angular/core';
import { BehaviorSubject} from 'rxjs';
import { take, map, tap, switchMap } from 'rxjs/operators';
import { Message } from './message.model';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth/auth.service';

interface MessagesData {
  fromUser: string;
  toUser: string;
  message: string;
  documentURL: string;
  sentUser: boolean;
  receivedUser: boolean;
  readUser: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private _messages = new BehaviorSubject<Message[]>([]);
  public user_Students: string;

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
              resData[key].message,
              resData[key].documentURL,
              resData[key].sentUser,
              resData[key].receivedUser,
              resData[key].readUser
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
    fromUser: string, toUser: string, message: string, documentURL: string, sentUser: boolean
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
          toUser,
          message,
          documentURL,
          sentUser,
          false,
          false
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
