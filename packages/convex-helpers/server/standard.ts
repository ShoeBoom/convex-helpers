import type { StandardSchemaV1 } from '@standard-schema/spec';



export function standardToConvex<T extends StandardSchemaV1>(
  schema: T,
) {
  const types = schema["~standard"].types;
}