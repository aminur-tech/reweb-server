import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';
import config from '../config';
import { IUser } from '../types/user.interface';

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    profileImg: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    role: {
      type: String,
      enum: ['admin', 'client', 'collaborator'],
      default: 'client',
    },
  },
  {
    timestamps: true,
  }
);

// 🔐 PRE SAVE → HASH PASSWORD
userSchema.pre('save', async function () {
  const user = this as IUser;

  // Only hash if password modified
  if (!this.isModified('password')) {
    return;
  }

  try {
    user.password = await bcrypt.hash(
      user.password as string, // Assert user.password as string
      Number(config.bcrypt_salt_rounds as string) // Assert config.bcrypt_salt_rounds as string
    );
  } catch (error) {
    throw error;
  }
});

// 🚫 REMOVE THIS (CAUSES ERROR)
// userSchema.post('save', function (user, next) {
//   user.password = '';
//   next();
// });

// ✅ OPTIONAL (SAFE LOG ONLY)
userSchema.post('save', function (doc) {
  console.log(`[User Created]: ${doc.email}`);
});

// ✅ BEST PRACTICE → METHOD TO HIDE PASSWORD
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = model<IUser>('User', userSchema);