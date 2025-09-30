import { describe, it } from "vitest";
import { z } from "zod";
import { toJsonSchema } from "@standard-community/standard-json";

const schema = z.object({ a: z.literal("a") });
describe("standardToConvex", () => {
  it("should be defined", async () => {
    console.log(JSON.stringify(await toJsonSchema(schema), null, 2));
  });
});
