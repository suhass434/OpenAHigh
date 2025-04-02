const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			trim: true,
		},
        username:{
            type:String,
            required:true,
        },
		password: {
			type: String,
			required: true,
		},
		approved: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);


module.exports = mongoose.model("user", userSchema);