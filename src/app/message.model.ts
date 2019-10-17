export class Message {
    constructor(
        public id: string,
        public fromUser: string,
        public toUser: string,
        public toUserEmail: string,
        public message = []
    ) {}
}
