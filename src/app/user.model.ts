export class User {
    constructor(
        public id: string,
        public email: string,
        public friends = [],
        public friendsPending = [],
        public userId: string,
        public profilePicture: string
    ) {}
  }
