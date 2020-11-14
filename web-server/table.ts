import { Pool, QueryResult, PoolClient } from 'pg';
import {AppProperties} from "../app.properties";
import {Page} from "../../../web-shared/src/domain/page.model";

export abstract class Table {

    private static $pool: Pool;

    private static get pool(): Pool {
        return this.$pool = this.$pool || new Pool({
            database: AppProperties.DATABASE_NAME,
            host: AppProperties.DATABASE_HOST,
            user: AppProperties.DATABASE_USERNAME,
            password: AppProperties.DATABASE_PASSWORD,
            max: 12,
            min: 4,
        });
    }

    protected static async query(query: string | string[], schema: string, values?: any[]): Promise<QueryResult> {
        let connection: PoolClient;
        let result: QueryResult;

        query = Array.isArray(query) ? query : [query];
        values = values || [];
        values = Array.isArray(values[0]) ? values : [values];

        try {
            connection =
            await this.pool.connect();
            await connection.query(`BEGIN`);
            await connection.query(`SELECT set_config('search_path', $1, true)`, [schema]); // Thanks https://dba.stackexchange.com/a/222090 & https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADMIN-SET

            for (let stmt of query)
                result = await Promise.all(values.map(value => connection.query(stmt, value))).then(value => value[0]);

            await connection.query('COMMIT');

            return result;
        } catch(error) {
            connection && await connection.query('ROLLBACK');
            throw error;
        } finally {
            connection && connection.release();
        }
    }

    protected static async queryOne<T>(query: string, schema: string, mapper: (row: any) => T, values?: any[]): Promise<T> {
        let result = await this.query(
            query,
            schema,
            values,
        );

        return result.rows.length
            ? await mapper(result.rows[0])
            : null
        ;
    }

    protected static async queryAll<T>(query: string, schema: string, mapper: (row: any) => T, values?: any[]): Promise<T[]> {
        let result = await this.query(
            query,
            schema,
            values,
        );

        return result.rows.length
            ? await Promise.all(result.rows.map(row => mapper(row)))
            : null
            ;
    }

    protected static async queryPage<T>(query: string, schema: string, mapper: (row: any) => T, page: Page<T>, values?: any[]): Promise<Page<T>> {
        page = page || {} as any;
        page.page = page.page || 1;
        page.pageSize = Math.min(page.pageSize || Number.MAX_SAFE_INTEGER, 2147483647);

        query = query.replace(/\$[0-9]+/g, param => `$${ +param.slice(1) + 2 }`);
        values = [page.page, page.pageSize].concat(values || []);

        let result = await Table.query(
            `
                WITH result AS (${ query })
                SELECT json_agg(result)::TEXT "result" FROM (SELECT * FROM result LIMIT $2 OFFSET ($2::INTEGER * ($1::INTEGER - 1))) result UNION ALL
                SELECT CEIL(COUNT(*)::DECIMAL / 10::DECIMAL)::TEXT FROM result
            `,
            schema,
            values,
        );

        Object.assign(page, {
            content: await Promise.all((JSON.parse(result.rows[0].result) || []).map(value => mapper(value))),
            pageTotal: +result.rows[1].result,
        });

        return page;
    }

}
