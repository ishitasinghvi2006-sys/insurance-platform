const { z } = require("zod");

const createPolicySchema = z.object({
  customerId: z.union([z.string(), z.number()]).transform(Number),
  policyType: z.string().min(2, "Policy type is required"),
  premiumAmount: z.union([z.string(), z.number()]).transform(Number).refine((v) => v > 0, "Premium must be greater than 0"),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid start date"),
  termMonths: z.union([z.string(), z.number()]).transform(Number).refine((v) => v > 0, "Term must be greater than 0"),
});

const updatePolicySchema = z.object({
  policyType: z.string().min(2).optional(),
  premiumAmount: z.union([z.string(), z.number()]).transform(Number).optional(),
  endDate: z.string().optional(),
  status: z.enum(["active", "expired", "cancelled"]).optional(),
});

module.exports = { createPolicySchema, updatePolicySchema };