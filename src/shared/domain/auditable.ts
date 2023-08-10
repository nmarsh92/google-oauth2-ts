import { Schema } from 'mongoose';

/**
 * Audit properties for an entity.
 * @interface
 */
interface Auditable {
  /**
   * The creation date.
   * @type {date} 
   * @memberof Auditable
   */
  createdAt: Date;

  /**
   * The creation date.
   * @type {date} 
   * @memberof Auditable
  */
  updatedAt: Date;

  /**
   * Is record deleted.
   * @type {boolean} 
   * @memberof Auditable
   */
  isDeleted: boolean;
}

const AuditableSchema = new Schema(
  {
    isDeleted: { type: Boolean, default: false }
  },
  { optimisticConcurrency: true, timestamps: true }
);

export { Auditable, AuditableSchema };

