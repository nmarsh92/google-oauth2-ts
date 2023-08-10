import { Schema, model, Types } from 'mongoose';
import { Auditable, AuditableSchema } from '../../../shared/domain/auditable';
import { User } from './user';
import { HasId } from '../../../shared/domain/hasId';
import { USER_SCHEMA, USER_ACTIVITY_SCHEMA } from '../constants/schemas';
/**
 *  Actvity.
 */
enum Activity {
  Login = 'LOGIN',
  LoginAttemptFailed = 'LOGIN_ATTEMPT_FAILED',
  LockedOut = 'LOCKED_OUT',
  SignUp = "SIGN_UP",
  Invalid_Refresh = "INVALID_REFRESH"
}

/**
 * Represents a User entity.
 * @interface
 * @extends {Auditable}
 */
interface UserActivity extends Auditable, HasId {
  type: Activity | string,
  user: User | Types.ObjectId
}

const UserActivitySchema = new Schema<UserActivity>({
  type: { type: String, required: true, enum: Object.values(Activity) },
  user: { type: Schema.Types.ObjectId, ref: USER_SCHEMA },
});

UserActivitySchema.add(AuditableSchema);

const UserActivityModel = model<UserActivity>(USER_ACTIVITY_SCHEMA, UserActivitySchema);

export { UserActivity, UserActivityModel, Activity }

