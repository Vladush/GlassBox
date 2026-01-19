import { Pool } from "pg";
import * as schema from "./schema";
import "dotenv/config";
export declare const db: import("drizzle-orm/node-postgres").NodePgDatabase<typeof schema> & {
    $client: Pool;
};
