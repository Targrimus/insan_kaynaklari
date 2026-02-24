require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose
	.connect(process.env.MONGO_URI)
	.then(async () => {
		console.log('MongoDB veritabanina baglanildi.');

		const adminEmail = 'admin@ik.com';
		const kullaniciVarMi = await User.findOne({ email: adminEmail });

		if (kullaniciVarMi) {
			console.log('Admin kullanicisi zaten var!');
			process.exit();
		}

		const adminUser = new User({
			adSoyad: 'Sistem Yöneticisi',
			email: adminEmail,
			sifre: '123456', // Modelde otomatik hashlenir
			rol: 'Admin',
		});

		await adminUser.save();
		console.log('Admin kullanicisi basariyla eklendi! (Email: admin@ik.com / Sifre: 123456)');
		process.exit();
	})
	.catch((err) => {
		console.error('Baglanti Hatasi:', err);
		process.exit(1);
	});
