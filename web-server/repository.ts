import {Pool, PoolClient, QueryResult} from 'pg';
import {Entity, Entity$ID, Entity$JSON, Entity$ROW} from "../web-shared/entity";
import {Utils} from "../web-shared/utils";
import {ENV, Environment} from "./environment";

export abstract class Repository<ENTITY extends Entity<ID, JSON, ROW>, ID extends Entity$ID, JSON extends Entity$JSON<ID>, ROW extends Entity$ROW<ID>> {

  /*
  private static INITIALIZED = {} as { [key: string]: boolean };
   */

  private static POOL$: Pool;
  private static get POOL(): Pool {
    return this.POOL$ = this.POOL$ || new Pool({
      database: 'ushowme',

      ///TODO ROLLBACK BEFORE DEPLOY
      //host: ENV == Environment.PROD ? 'ushowme.ci4glrtqzsfe.eu-central-1.rds.amazonaws.com' : 'localhost',
      //user: ENV == Environment.PROD ? 'ushowme' : 'ushowme',
      //password: ENV == Environment.PROD ? '4b#e79^3gZumr5bJu6$Wm$38M55sMB' : 'ushowme',

      host: 'qa-ushowme.csvxhv0uqncx.eu-west-1.rds.amazonaws.com',
      user: 'ushowme',
      password: 'Ck7NWQXWAvUjKsh*K4P!',

      max: 12,
      min: 4,
    });
  }

  private readonly columns: Column<ID, ROW>[];
  private readonly columnsIndex: Column<ID, ROW>[];
  private readonly columnsPrimary: Column<ID, ROW>[];

  protected constructor(
    private readonly collection: string,
    private readonly factory: { fromROW(row: ROW): ENTITY },
    private readonly schema: Schema<ID, ROW>,
  ) {
    this.columns = Utils.objectKeys(schema).map(key => ({
      index: !!schema[key].index,
      name: key,
      null: !!schema[key].null,
      primary: !!schema[key].primary,
      type: schema[key].type,
    }));

    this.columnsIndex = this.columns.filter(value => value.index);
    this.columnsPrimary = this.columns.filter(value => value.primary);
  }

  async find(condition: string = '1=1', params: any[]): Promise<ENTITY[]> {
    return this.RUN(`SELECT * FROM ${ this.COLLECTION() } WHERE ${ condition }`, params).then(value => value.rows.map(value => this.factory.fromROW(value)));
  }
  async findAll(): Promise<ENTITY[]> {
    return this.find(undefined, undefined);
  }
  async findOne(condition: string, params: any[]): Promise<ENTITY> {
    return this.RUN(`SELECT * FROM ${ this.COLLECTION() } WHERE ${ condition } LIMIT 1`, params).then(value => value.rows.map(value => this.factory.fromROW(value))?.[0]);
  }
  async findOneById(id: ID): Promise<ENTITY> {
    return this.findOne('id=$1', [id]);
  }

  async save(entity: ENTITY): Promise<ENTITY> {
    let i = 1;
    let row = entity.toROW();
    let result = await this.RUN(`INSERT INTO ${ this.COLLECTION() } (${ this.columns.map(column => `"${ column.name }"`).join(',') }) VALUES ${ this.columns.map(column => `$${ i++ }`).join(',') } ${ this.columnsPrimary?.length ? 'RETURNING "id"' : '' }`, this.columns.map(value => row[value.name]));

    if (result?.rows[0]?.id != undefined && !isNaN(+result.rows[0].id))
        entity.id = entity.id || result.rows[0].id;

    return entity;
  }
  async saveAll(entity: ENTITY[]) {
    let i = 1;
    let row = entity.map(value => value.toROW());

    let result = await this.RUN(`INSERT INTO ${ this.COLLECTION() } (${ this.columns.map(column => `"${ column.name }"`).join(',') }) VALUES ${ row.map(row => `(${ this.columns.map(column => `$${ i++ }`).join(',') })`).join(',') } ${ this.columnsPrimary?.length ? 'RETURNING "id"' : '' }`, Utils.arrayFlatten(row.map(row => this.columns.map(value => row[value.name]))));
    if (result?.rows)
        result?.rows.forEach((result, i) => {
          if (result?.id != undefined && !isNaN(+result.id))
              entity[i].id = entity[i].id || result.id;
        })

    return entity;
  }

  protected COLLECTION() { return `"${ this.collection }"` }

  protected async INIT() {
    /*
    if (Repository.INITIALIZED[this.collection] != true) {
      // Create Table
      await this.RUN$(`
        CREATE TABLE IF NOT EXISTS ${ this.collection } (
          ${ this.columns.map(column => `${ column.name } ${ column.type } ${ this.columnsPrimary.length == 1 && column.primary ? 'PRIMARY KEY' : '' } ${ column.null ? '' : 'NOT NULL' }`).join(',') }
          ${ this.columnsPrimary.length > 1 ? `, PRIMARY KEY(${ this.columnsPrimary.map(value => value.name) })` : '' }
        )
      `, undefined);

      // Create Indexes
      this.columnsIndex.forEach(column => this.RUN$(`CREATE INDEX IF NOT EXISTS idx_${ column.name } ON ${ this.collection }(${ column.name })`, undefined));

      Repository.INITIALIZED[this.collection] = true;
    }
     */

    return true;
  }

  protected async RUN(query: string, values: any | any[]): Promise<QueryResult> { return await this.INIT() && await this.RUN$(query, values) }
  protected async RUN$(query: string, values: any | any[]): Promise<QueryResult> {
    let connection: PoolClient;
    let result: QueryResult;
        values = Array.isArray(values) ? values : [];

    try {
              connection = await Repository.POOL.connect();
        await connection.query(`BEGIN`);
        await connection.query(query, values).then(value => result = value);
        await connection.query('COMMIT');

        return result;
    } catch(error) {
        connection && await connection.query('ROLLBACK');
        throw error;
    } finally {
        connection && connection.release();
    }
  }


}

type Column<ID extends Entity$ID, ROW extends Entity$ROW<ID>> = { index?: boolean, name: keyof ROW, null?: boolean, primary?: boolean, type: ColumnType }
type ColumnType = 'BOOLEAN' | 'INTEGER' | 'TEXT' | 'TIMESTAMP';
type Schema<ID extends Entity$ID, ROW extends Entity$ROW<ID>> = { [key in keyof ROW]: Omit<Column<ID, ROW>, 'name'> }
