export abstract class Entity<ID extends Entity$ID, JSON extends Entity$JSON<ID>, ROW extends Entity$ROW<ID>> {

  id: ID;

  constructor(json?: JSON) {
    this.id = json?.id;
  }

  clone(): this { return new (this.constructor as any)(this.toJSON()) }

  abstract toJSON(): JSON;
  abstract toROW(): ROW;

}

export type Entity$ID = object | number | string | void;
export type Entity$JSON<ID extends Entity$ID> = { id?: ID }
export type Entity$ROW<ID extends Entity$ID> = ID extends object ? ID : { id?: ID }
