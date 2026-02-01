import mongoose, { Schema } from "mongoose";

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        default: "",
        maxlength: 200
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    blogCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }
}, 
{ 
    timestamps: {
        createdAt: 'createdAt'
    } 
})

export default mongoose.model("categories", categorySchema);
