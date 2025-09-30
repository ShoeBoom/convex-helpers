import { describe, it } from "vitest";
import { z } from "zod";
import { toJsonSchema } from "@standard-community/standard-json";

const schema = z.object({ a: z.number() });
describe("standardToConvex", () => {
  it("should be defined", async () => {
    console.log(await toJsonSchema(schema));
  });
});
