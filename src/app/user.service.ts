import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth/auth.service';
import { take, tap, switchMap, map } from 'rxjs/operators';
import { User } from './user.model';
import { BehaviorSubject, of } from 'rxjs';
import { MessageService } from './message.service';

interface UserData {
  id: string;
  email: string;
  friends: [];
  friendsPending: [];
  userId: string;
  profilePicture: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public user_Students: string;
  private _users = new BehaviorSubject<User[]>([]);
  private oldFriendsPending = [];
  private oldFriendsList = [];
  private friends = [];
  private friendsPending = [];
  private newFriendsPending = [];
  private newFriendsList = [];
  public user_ID: string;
  private user_Email: string;

  get users() {
    return this._users.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient, private messageService: MessageService) { }

  fetchUsers() {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.get<{ [key: string]: UserData }>(
          `https://stratos-ad2db.firebaseio.com/users.json?auth=${token}`
        );
      }),
      map(resData => {
        const users = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            users.push(
              new User(
                key,
                resData[key].email,
                resData[key].friends,
                resData[key].friendsPending,
                resData[key].userId,
                resData[key].profilePicture
              )
            );
          }
        }
        return users;
      }),
      tap(users => {
        this._users.next(users);
      })
    );
  }

  retrieveUserID() {
    return this.authService.userId.pipe(
      take(1),
      switchMap(userID => {
        return this.user_ID = userID;
      })
    );
  }

  getEmail() {
    return this.messageService.retrieveUserEmail().subscribe(() => {
      this.user_Email = this.messageService.user_Students;
    });
  }

  addUser() {
    this.getEmail();
    let generatedId: string;
    let newUser: User;
    let fetchedUserId: string;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('No user id found!');
        }
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
        newUser = new User(
          Math.random().toString(),
          this.user_Email,
          this.friends,
          this.friendsPending,
          fetchedUserId,
          ''
        );
        return this.http.post<{ name: string }>(
          `https://stratos-ad2db.firebaseio.com/users.json?auth=${token}`,
          { ...newUser, id: null}
        );
      }),
      switchMap(resData => {
        generatedId = resData.name;
        return this.users;
      }),
      take(1),
      tap(users => {
        newUser.id = generatedId;
        this._users.next(users.concat(newUser));
      })
    );
  }

  addFriend(userId: string, newFriendEmail: string, newFriendUserId: string) {
    let updatedUser: User[];
    let fetchedToken: string;
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.users;
      }),
      take(1),
      switchMap(users => {
        if (!users || users.length <= 0) {
          return this.fetchUsers();
        } else {
          return of(users);
        }
      }),
      switchMap(users => {
        const updatedUserIndex = users.findIndex(pl => pl.id === userId);
        updatedUser = [...users];
        const oldUser = updatedUser[updatedUserIndex];
        this.oldFriendsPending = oldUser.friendsPending;
        const newUser = {userID: newFriendUserId, userEmail: newFriendEmail};

        this.oldFriendsPending.push(newUser);
        updatedUser[updatedUserIndex] = new User(
          oldUser.id,
          oldUser.email,
          oldUser.friends,
          this.oldFriendsPending,
          oldUser.userId,
          oldUser.profilePicture
        );
        return this.http.put(
          `https://stratos-ad2db.firebaseio.com/users/${userId}.json?auth=${fetchedToken}`,
          { ...updatedUser[updatedUserIndex], id: null }
        );
      }),
      tap(() => {
        this._users.next(updatedUser);
      })
    );
  }

  acceptFriendInvitation(userId: string, userEmail: string, newFriendEmail: string, newFriendUserID: string) {
    let updatedUser: User[];
    let fetchedToken: string;
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.users;
      }),
      take(1),
      switchMap(users => {
        if (!users || users.length <= 0) {
          return this.fetchUsers();
        } else {
          return of(users);
        }
      }),
      switchMap(users => {
        this.acceptFriendInvitation2(userId, userEmail, newFriendUserID);
        const updatedUserIndex = users.findIndex(pl => pl.id === userId);
        updatedUser = [...users];
        const oldUser = updatedUser[updatedUserIndex];
        this.oldFriendsPending = oldUser.friendsPending;
        this.newFriendsList = oldUser.friends;
        this.newFriendsPending = this.oldFriendsPending.filter(
          user => user.userID !== newFriendUserID
        );
        const newUser = {userEmail: newFriendEmail, userID: newFriendUserID};
        this.newFriendsList.push(newUser);
        updatedUser[updatedUserIndex] = new User(
          oldUser.id,
          oldUser.email,
          this.newFriendsList,
          this.newFriendsPending,
          oldUser.userId,
          oldUser.profilePicture
        );
        return this.http.put(
          `https://stratos-ad2db.firebaseio.com/users/${userId}.json?auth=${fetchedToken}`,
          { ...updatedUser[updatedUserIndex], id: null }
        );
      }),
      tap(() => {
        this._users.next(updatedUser);
      })
    );
  }

  acceptFriendInvitation2(userId: string, userEmailPerson: string, newFriendUserID: string) {
    let updatedUser: User[];
    let fetchedToken: string;
    console.log('Tweede Method');
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.users;
      }),
      take(1),
      switchMap(users => {
        if (!users || users.length <= 0) {
          return this.fetchUsers();
        } else {
          return of(users);
        }
      }),
      switchMap(users => {
        const updatedUserIndex = users.findIndex(pl => pl.id === newFriendUserID);
        updatedUser = [...users];
        const oldUser = updatedUser[updatedUserIndex];
        this.oldFriendsPending = oldUser.friendsPending;
        this.newFriendsList = oldUser.friends;
        this.newFriendsPending = this.oldFriendsPending.filter(
          user => user.userID !== userId
        );
        const newUser = {userEmail: userEmailPerson, userID: userId};
        this.newFriendsList.push(newUser);
        updatedUser[updatedUserIndex] = new User(
          oldUser.id,
          oldUser.email,
          this.newFriendsList,
          this.newFriendsPending,
          oldUser.userId,
          oldUser.profilePicture
        );
        return this.http.put(
          `https://stratos-ad2db.firebaseio.com/users/${newFriendUserID}.json?auth=${fetchedToken}`,
          { ...updatedUser[updatedUserIndex], id: null }
        );
      }),
      tap(() => {
        this._users.next(updatedUser);
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

  deleteFriend(userId: string, newFriendUserID: string) {
    let updatedUser: User[];
    let fetchedToken: string;
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.users;
      }),
      take(1),
      switchMap(users => {
        if (!users || users.length <= 0) {
          return this.fetchUsers();
        } else {
          return of(users);
        }
      }),
      switchMap(users => {
        this.deleteFriend2(userId, newFriendUserID);
        const updatedUserIndex = users.findIndex(pl => pl.id === userId);
        updatedUser = [...users];
        const oldUser = updatedUser[updatedUserIndex];
        this.oldFriendsList = oldUser.friends;
        this.newFriendsList = this.oldFriendsList.filter(
          user => user.userID !== newFriendUserID
        );
        updatedUser[updatedUserIndex] = new User(
          oldUser.id,
          oldUser.email,
          this.newFriendsList,
          oldUser.friendsPending,
          oldUser.userId,
          oldUser.profilePicture
        );
        return this.http.put(
          `https://stratos-ad2db.firebaseio.com/users/${userId}.json?auth=${fetchedToken}`,
          { ...updatedUser[updatedUserIndex], id: null }
        );
      }),
      tap(() => {
        this._users.next(updatedUser);
      })
    );
  }

  deleteFriend2(userId: string, newFriendUserID: string) {
    let updatedUser: User[];
    let fetchedToken: string;
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.users;
      }),
      take(1),
      switchMap(users => {
        if (!users || users.length <= 0) {
          return this.fetchUsers();
        } else {
          return of(users);
        }
      }),
      switchMap(users => {
        const updatedUserIndex = users.findIndex(pl => pl.id === newFriendUserID);
        updatedUser = [...users];
        const oldUser = updatedUser[updatedUserIndex];
        this.oldFriendsList = oldUser.friends;
        this.newFriendsList = this.oldFriendsList.filter(
          user => user.userID !== userId
        );
        updatedUser[updatedUserIndex] = new User(
          oldUser.id,
          oldUser.email,
          this.newFriendsList,
          oldUser.friendsPending,
          oldUser.userId,
          oldUser.profilePicture
        );
        return this.http.put(
          `https://stratos-ad2db.firebaseio.com/users/${newFriendUserID}.json?auth=${fetchedToken}`,
          { ...updatedUser[updatedUserIndex], id: null }
        );
      }),
      tap(() => {
        this._users.next(updatedUser);
      })
    );
  }

  deleteFriendInvitation(userId: string, friendId: string) {
    let updatedUser: User[];
    let fetchedToken: string;
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.users;
      }),
      take(1),
      switchMap(users => {
        if (!users || users.length <= 0) {
          return this.fetchUsers();
        } else {
          return of(users);
        }
      }),
      switchMap(users => {
        const updatedUserIndex = users.findIndex(pl => pl.id === userId);
        updatedUser = [...users];
        const oldUser = updatedUser[updatedUserIndex];
        this.oldFriendsPending = oldUser.friendsPending;
        this.newFriendsPending = this.oldFriendsPending.filter(
          user => user.userID !== friendId
        );
        updatedUser[updatedUserIndex] = new User(
          oldUser.id,
          oldUser.email,
          oldUser.friends,
          this.newFriendsPending,
          oldUser.userId,
          oldUser.profilePicture
        );
        return this.http.put(
          `https://stratos-ad2db.firebaseio.com/users/${userId}.json?auth=${fetchedToken}`,
          { ...updatedUser[updatedUserIndex], id: null }
        );
      }),
      tap(() => {
        this._users.next(updatedUser);
      })
    );
  }
}
