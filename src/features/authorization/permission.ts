import { Schema, model, Document } from "mongoose";
import { Auditable, AuditableSchema } from '../../shared/models/auditable';

const PERMISSION_SCHEMA = "permission";

/**
 * Interface representing a Permission.
 */
interface IPermission extends Auditable {
  code: string;
  description: string;
}

/**
 * The Mongoose schema for the Permission.
 */
const permissionSchema = new Schema<IPermission>({
  code: { type: String, required: true },
  description: { type: String, required: true },
});

// Add the AuditableSchema to the Permission schema
permissionSchema.add(AuditableSchema);

/**
 * The Mongoose model for the Permission.
 * @type {import("mongoose").Model<IPermission & Document>}
 */
const Permission = model<IPermission>(PERMISSION_SCHEMA, permissionSchema);

export { permissionSchema, Permission, IPermission };