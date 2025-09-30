import type { StandardSchemaV1 } from "@standard-schema/spec";
import { toJsonSchema } from "@standard-community/standard-json";
import { v, type GenericValidator } from "convex/values";

export async function standardToConvex<T extends StandardSchemaV1>(schema: T) {
  const convexSchema = await toJsonSchema(schema);

  // return convexSchema;
  return convertJsonSchemaToConvexSchema(convexSchema);
}

function convertJsonSchemaToConvexSchemaObject(
  jsonSchema: Awaited<ReturnType<typeof toJsonSchema>>["properties"],
  required?: readonly string[],
): { [key: string]: GenericValidator } {
  return Object.fromEntries(
    Object.entries(jsonSchema ?? {}).map(([key, value]) => {
      const field = convertJsonSchemaToConvexSchema(value as any);
      const isRequired = required?.includes(key) ?? false;
      return [key, isRequired ? field : v.optional(field)];
    }),
  );
}

function convertJsonSchemaToConvexSchema(
  jsonSchema: Awaited<ReturnType<typeof toJsonSchema>>,
): GenericValidator {
  if (jsonSchema?.const !== undefined) {
    const t = jsonSchema.type;
    const c = jsonSchema.const;
    if (t === "null" || c === null) return v.null();
    switch (typeof c) {
      case "string":
        return v.literal(c);
      case "number":
        return v.literal(c);
      case "boolean":
        return v.literal(c);
      default:
        v.any();
    }
  }
  // if (Array.isArray((jsonSchema as any)?.enum)) {
  //   const values = (jsonSchema as any).enum as any[];
  //   return values.length === 1
  //     ? v.literal(values[0])
  //     : v.union(...values.map((val) => v.literal(val)));
  // }
  if (Array.isArray(jsonSchema?.enum)) {
    const values = jsonSchema.enum;
    const memberValidators = [];
    for (const valueItem of values) {
      if (valueItem === null) {
        memberValidators.push(v.null());
        continue;
      }
      if (
        typeof valueItem === "string" ||
        typeof valueItem === "number" ||
        typeof valueItem === "boolean"
      ) {
        memberValidators.push(v.literal(valueItem));
      }
    }
    if (memberValidators.length === 0) return v.any();
    if (memberValidators.length === 1) return memberValidators[0]!;
    return v.union(...memberValidators);
  }
  if (Array.isArray((jsonSchema as any)?.oneOf)) {
    const members = (jsonSchema as any).oneOf as any[];
    return v.union(...members.map((m) => convertJsonSchemaToConvexSchema(m)));
  }
  if (Array.isArray((jsonSchema as any)?.anyOf)) {
    const members = (jsonSchema as any).anyOf as any[];
    return v.union(...members.map((m) => convertJsonSchemaToConvexSchema(m)));
  }
  switch (jsonSchema.type) {
    case "string":
      return v.string();
    case "number":
      return v.number();
    case "integer":
      return v.number();
    case "boolean":
      return v.boolean();
    case "null":
      return v.null();
    case "object":
      return v.object(
        convertJsonSchemaToConvexSchemaObject(
          jsonSchema.properties!,
          (jsonSchema as any)?.required,
        ),
      );
    case "array":
      if (!("items" in jsonSchema)) return v.array(v.any());
      if (Array.isArray((jsonSchema as any).items)) return v.array(v.any());
      return v.array(
        convertJsonSchemaToConvexSchema((jsonSchema as any).items),
      );
    default:
      return v.any();
  }
}
