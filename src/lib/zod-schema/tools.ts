import { isNonEmptyString, isUUID } from 'nhb-toolbox';
import { z } from 'zod';
import { BULK_UUID_LIMIT, UUID_VERSIONS } from '@/lib/constants';

export const UUIDGeneratorSchema = z
    .object({
        version: z.enum(UUID_VERSIONS),
        name: z.string(),
        namespace: z.string(),
        uppercase: z.boolean(),
    })
    .superRefine(({ version, name, namespace }, ctx) => {
        if (version === 'v3' || version === 'v5') {
            if (!isNonEmptyString(name)) {
                ctx.addIssue({
                    code: 'custom',
                    message: `Name is required for ${version} UUIDs`,
                    path: ['name'],
                });
            }

            if (!isNonEmptyString(namespace)) {
                ctx.addIssue({
                    code: 'custom',
                    message: `Namespace is required for ${version} UUIDs`,
                    path: ['namespace'],
                });
            }

            if (isNonEmptyString(namespace) && !isUUID(namespace)) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Namespace must be a valid UUID',
                    path: ['namespace'],
                });
            }
        }
    });

export const BulkUUIDGeneratorSchema = UUIDGeneratorSchema.extend({
    count: z.number().int().min(1).max(BULK_UUID_LIMIT),
});
