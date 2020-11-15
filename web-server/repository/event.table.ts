import {Repository} from "../repository";
import {Event} from "../../web-shared/entity/event";

export abstract class EventTable extends Repository {
  static async delete(schema: string, id: number): Promise<void> {
    await this.query(
      'DELETE FROM process_lawyer WHERE lawyer_id IN (SELECT id from lawyer WHERE id = $1)',
      schema,
      [id]
    );
    await this.query(
      ' DELETE FROM lawyer WHERE "id" = $1',
      schema,
      [id]
    )
  }

  static async countAll(schema: string): Promise<number> {
    return await this.queryOne(
      'SELECT COUNT(*) "count" FROM lawyer',
      schema,
      async (value: object) => +value['count'],
    );
  }

  static async findAll(schema: string, page?: Page<Lawyer>): Promise<Page<Lawyer>> {
    return await this.queryPage(
      'SELECT * FROM lawyer ORDER BY "id"',
      schema,
      Event.fromROW,
      page,
    );
  }

  static async findAllByProcess(schema: string, process: Process): Promise<Lawyer[]> {
    return await this.queryAll(
      `
                SELECT
                    lawyer.*
                FROM
                    lawyer RIGHT JOIN process_lawyer ON lawyer_id = lawyer.id
                WHERE
                    process_id = $1
            `,
      schema,
      Event.fromROW,
      [process.id],
    )
  }

  static async findOne(schema: string, id: number): Promise<Lawyer> {
    return await this.queryOne(
      'SELECT * FROM lawyer WHERE "id" = $1',
      schema,
      Event.fromROW,
      [id],
    );
  }

  static async findOneByEmail(schema: string, emailCitius: string): Promise<Lawyer> {
    return await this.queryOne(
      'SELECT * FROM lawyer WHERE "email_citius" = $1',
      schema,
      Event.fromROW,
      [emailCitius],
    );
  }

  static async findPrincipal(schema: string): Promise<Lawyer> {
    return await this.queryOne(
      'SELECT * FROM lawyer WHERE "is_principal" = TRUE',
      schema,
      Event.fromROW,
      undefined,
    );
  }

  static async search(schema: string, search: string, page?: Page<Lawyer>): Promise<Page<Lawyer>> {
    return await this.queryPage(
      `
                SELECT * FROM lawyer
                WHERE 1<>1
                    OR LOWER(email) LIKE '%' || $1 || '%'
                    OR LOWER(email_citius) LIKE '%' || $1 || '%'
            `,
      schema,
      Event.fromROW,
      page,
      [search.trim().toLowerCase()]
    )
  }

  static async save(schema: string, lawyer: Lawyer): Promise<Lawyer> {
    if (lawyer.id == null)
      lawyer.id = await this.query(
        'INSERT INTO lawyer ("email", "email_citius") VALUES (LOWER($1), LOWER($2)) RETURNING "id"',
        schema,
        [lawyer.email, lawyer.emailCitius]
      ).then(value => value.rows[0].id);
    else
      await this.query(
        `
                    UPDATE lawyer SET
                        "email" = LOWER($2),
                        "email_citius" = LOWER($3)
                    WHERE "id" = $1
                `,
        schema,
        [lawyer.id, lawyer.email, lawyer.emailCitius]
      );

    return lawyer;
  }

  static async savePrincipal(schema: string, lawyer: Lawyer): Promise<Lawyer> {
    await this.query([
      'UPDATE lawyer SET "is_principal" = NULL WHERE "id" <> $1',
      'UPDATE lawyer SET "is_principal" = TRUE WHERE "id" = $1',
    ], schema, [lawyer.id]);

    return lawyer;
  }

}
