import mongoose, { Schema } from 'mongoose';

export type EventType = {
    org: string;
    doc: string;
    event: string;
    change?: Object;
    add?: Object;
    remove?: Object;
};

const EventSchema = new Schema({
    org: { type: Schema.Types.ObjectId, required: true },
    doc: { type: Schema.Types.ObjectId, required: true },
    event: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    change: Object, // only for change events
    add: Object, // only for add events
    remove: Object, // only for remove events
});

const Event = mongoose.model('Event', EventSchema, 'events');

export default Event;