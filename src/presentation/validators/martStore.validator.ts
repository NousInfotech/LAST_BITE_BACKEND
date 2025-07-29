import { z } from "zod";
import { MartStoreSchema } from "../../domain/zod/martStore.zod.js";
import { RestaurantStatusEnum } from "../../domain/interfaces/utils.interface.js";

export const updateMartStoreSchema = MartStoreSchema.partial();

export const martStoreIdSchema = z.object({
  martStoreId: z.string().min(1, "martStoreId is required"),
});

export const martStoreIdArraySchema = z.object({
  martStoreIds: z
    .array(martStoreIdSchema.shape.martStoreId)
    .min(1, "At least one martStoreId is required"),
});

export const martStoreStatusSchema = z
  .object({
    status: z
      .nativeEnum(RestaurantStatusEnum)
      .default(RestaurantStatusEnum.PENDING),
    message: z.string().optional(),
    days: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.status === RestaurantStatusEnum.SUSPENDED &&
      (data.days === undefined || data.days <= 0)
    ) {
      ctx.addIssue({
        path: ["days"],
        code: z.ZodIssueCode.custom,
        message: "Suspended status requires a valid number of suspension days",
      });
    }

    if (
      data.status !== RestaurantStatusEnum.SUSPENDED &&
      data.days !== undefined
    ) {
      ctx.addIssue({
        path: ["days"],
        code: z.ZodIssueCode.custom,
        message: "Only suspended status should include suspension days",
      });
    }
  });
