import {z} from "zod";


export const schemaPage =  z.object({
  page: z.preprocess(
    (v) => Number(v),
    z.number().int().min(1).default(1)
  ),

  pageSize: z.preprocess(
    (v) => Number(v),
    z.number().int().min(1).default(5)
  ),
});