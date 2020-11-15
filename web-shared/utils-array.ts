declare interface Array<T> {

  forEachAsync<T>(forEach: (value: T, index: number, array: T[]) => Promise<any>): Promise<void>;
  mapAsync<U>(map: (value: T, index: number, array: T[]) => Promise<U>): Promise<U[]>;

}

Array.prototype.forEachAsync = async function<T>(forEach: (value: T, index: number, array: T[]) => Promise<any>) {
  for (let i = 0; i < this.length; i ++)
    await forEach(this[i], i, this)
};

Array.prototype.mapAsync = function<T, U>(map: (value: T, index: number, array: T[]) => Promise<U>) {
  return Promise.all(this.map(map)) as Promise<U[]>
};
