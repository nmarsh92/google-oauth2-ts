/**
 * Audit properties for an entity.
 * @interface
 */
export interface AuditableDto {
  /**
   * The creation date.
   * @type {date} 
   * @memberof Auditable
   */
  createdAt?: Date;

  /**
   * The creation date.
   * @type {date} 
   * @memberof Auditable
  */
  updatedAt?: Date;

  /**
   * Is record deleted.
   * @type {boolean} 
   * @memberof Auditable
   */
  isDeleted?: boolean;
}