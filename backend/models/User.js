const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSema = new mongoose.Schema(
	{
		adSoyad: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
			match: [/^\S+@\S+\.\S+$/, 'Lütfen geçerli bir e-posta adresi giriniz'],
		},
		sifre: {
			type: String,
			required: true,
			minLength: 6,
		},
		rol: {
			type: String,
			enum: ['Admin', 'IK_Uzmani'],
			default: 'IK_Uzmani',
		},
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

// Şifreyi veritabanına kaydetmeden önce hashleme işlemi
userSema.pre('save', async function () {
	if (!this.isModified('sifre')) {
		return;
	}
	const salt = await bcrypt.genSalt(10);
	this.sifre = await bcrypt.hash(this.sifre, salt);
});

// Girilen şifre ile veritabanındaki hashli şifreyi karşılaştırma metodu
userSema.methods.sifreKontrol = async function (girilenSifre) {
	return await bcrypt.compare(girilenSifre, this.sifre);
};

const User = mongoose.model('User', userSema);
module.exports = User;
