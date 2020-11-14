export abstract class Entity<JSON, ROW> {

  constructor(json?: JSON) {}

  abstract toJSON(): JSON;
  abstract toROW(): ROW;

}
