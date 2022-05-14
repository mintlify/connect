import mongoose, { Schema } from 'mongoose';

export type CodeType = {
    doc: string;
    url?: string;
    sha: string;
    provider: string;
    file: string;
    org: string;
    repo: string;
    type: string;
    branch?: string;
    line?: number;
    endLine?: number;
}

const CodeSchema = new Schema({
    doc: { type: Schema.Types.ObjectId, required: true },
    url: { type: String },
    sha: { type: String, required: true },
    provider: { type: String, required: true },
    file: { type: String, required: true },
    org: { type: Schema.Types.ObjectId, required: true },
    repo: { type: String, required: true },
    type: { type: String, required: true },
    branch: { type: String },
    line: { type: Number },
    endLine: { type: Number }
});

const Code = mongoose.model('Code', CodeSchema, 'code');

export default Code;