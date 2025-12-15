export class Result<T, E = Error> {
  private constructor(
    private readonly _value?: T,
    private readonly _error?: E,
  ) {}

  static ok<T>(value: T): Result<T> {
    return new Result(value);
  }

  static fail<E>(error: E): Result<undefined, E> {
    return new Result(undefined, error);
  }

  isSuccess(): boolean {
    return this._error === undefined;
  }

  isFailure(): boolean {
    return !this.isSuccess();
  }

  getValue(): T {
    if (this.isFailure()) {
      throw new Error('Cannot get value from failed result');
    }
    return this._value!;
  }

  getError(): E {
    if (this.isSuccess()) {
      throw new Error('Cannot get error from successful result');
    }
    return this._error!;
  }
}
