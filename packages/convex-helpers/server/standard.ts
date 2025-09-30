import type { StandardSchemaV1 } from "@standard-schema/spec";
import { toJsonSchema } from "@standard-community/standard-json";

export async function standardToConvex<T extends StandardSchemaV1>(schema: T) {
  const convexSchema = await toJsonSchema(schema);

  // return convexSchema;
}

function convertJsonSchemaToConvexSchema(
  jsonSchema: Awaited<ReturnType<typeof toJsonSchema>>,
) {}
