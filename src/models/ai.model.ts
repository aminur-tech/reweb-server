import { Schema, model } from 'mongoose';

const aiLogSchema = new Schema({
  userPrompt: { type: String, required: true },
  aiResponse: { type: Schema.Types.Mixed, required: true },
  type: { type: String, enum: ['chart', 'consultation'], required: true }
}, { timestamps: true });

export const AILog = model('AILog', aiLogSchema);