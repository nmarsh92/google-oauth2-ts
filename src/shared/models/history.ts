import { Schema, Types } from 'mongoose';

/**
 * Required fields for a historic child.
 * @interface
 */
interface History<T> {
  /**
   * The ID of the parent document.
   * @type {date} 
   * @memberof History
   */
  parent: Types.ObjectId | T

  /**
 * When the this revision expired.
 * @type {date} 
 * @memberof History
*/
  expiredAt: Date | number;

  /**
  * When the this revision expired.
  * @type {date} 
  * @memberof History
  */
  createdAt: Date;

  /**
   * Version of the revision.
   */
  version: number;
}

/**
 *  An entity with history.
 */
interface HistoryParent<T> {
  /**
   * @memberof HistoryParent
   */
  history: Array<T>
}

/**
 *  Factory for creating a history schema.
 */
class HistorySchemaFactory {
  /**
   * 
   * @param parentSchema - Name of the parent schema.
   * @returns {Schema} Schema
   */
  static createChild(parentSchema: string): Schema {
    return new Schema(
      {
        parent: { type: Types.ObjectId, ref: parentSchema },
        createdAt: { type: Date, required: true },
        expiredAt: { type: Date, required: true },
        version: { type: Number, required: true }
      }
    );
  }

  static createParent(childSchema: string): Schema {
    return new Schema({
      history: [{ type: Schema.Types.ObjectId, ref: childSchema }]
    })
  }
}

export { History, HistoryParent, HistorySchemaFactory };

