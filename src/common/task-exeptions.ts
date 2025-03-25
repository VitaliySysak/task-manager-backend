export class TaskAlreadyExists extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class TaskNotFound extends Error {
  constructor(msg: string) {
    super(msg);
  }
}
