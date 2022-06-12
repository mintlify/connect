import mongoose, { Schema, Types } from 'mongoose';

export type DocType = {
    _id: Types.ObjectId;
    org: string;
    url: string;
    method: string;
    favicon?: string;
    content?: string;
    title?: string;
    lastUpdatedAt: Date;
    createdAt: Date;
    changeConfirmationCount?: number;
    isJustAdded: boolean;
    // used for method = notion-private
    notion?: {
        pageId: string;
    };
    // used for method = googledocs-private
    googledocs?: {
        id: string;
    };
    slack?: boolean;
    email?: boolean;
};

const DocSchema = new Schema({
    org: { type: Schema.Types.ObjectId, required: true },
    url: { type: String, required: true },
    method: { type: String, required: true },
    content: String,
    title: String,
    favicon: String,
    lastUpdatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId },
    changeConfirmationCount: Number,
    isJustAdded: { type: Boolean, default: true },
    notion: {
        pageId: String,
    },
    googledocs: {
        id: String,
    },
    slack: Boolean,
    email: Boolean
});

const Doc = mongoose.model<DocType>('Doc', DocSchema, 'docs');

export default Doc;
