const { z } = require("zod");

const createClaimSchema = z.object({
  claimAmount: z.union([z.string(), z.number()]).transform(Number).refine((v) => v > 0, "Claim amount must be greater than 0"),
  reason: z.string().min(5, "Please provide a more detailed reason (min 5 characters)"),
});

const updateClaimStatusSchema = z.object({
  status: z.enum(["approved", "rejected"], { message: "Status must be 'approved' or 'rejected'" }),
});

module.exports = { createClaimSchema, updateClaimStatusSchema };