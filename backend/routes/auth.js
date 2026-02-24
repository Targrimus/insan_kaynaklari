const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST /api/auth/register
// @desc    Yeni kullanıcı (İK yetkilisi) kaydeder
// @access  Public (Şimdilik ilk kullanıcıyı oluşturmak için açık bırakıyoruz, normalde Admin yetkisi gerekebilir)
router.post('/register', async (req, res) => {
	try {
		const { adSoyad, email, sifre, rol } = req.body;

		const kullaniciVarMi = await User.findOne({ email });
		if (kullaniciVarMi) {
			return res.status(400).json({ mesaj: 'Bu e-posta adresi ile kayıtlı bir kullanıcı zaten var.' });
		}

		const yeniKullanici = new User({
			adSoyad,
			email,
			sifre,
			rol,
		});

		await yeniKullanici.save();

		res.status(201).json({ mesaj: 'Kullanıcı başarıyla oluşturuldu.' });
	} catch (error) {
		res.status(500).json({ hata: error.message });
	}
});

// @route   POST /api/auth/login
// @desc    Kullanıcı girişi yapar ve JWT token döndürür
// @access  Public
router.post('/login', async (req, res) => {
	try {
		const { email, sifre } = req.body;

		// Kullanıcıyı bul
		const kullanici = await User.findOne({ email });
		if (!kullanici) {
			return res.status(401).json({ mesaj: 'Geçersiz e-posta veya şifre.' });
		}

		// Şifreyi kontrol et
		const sifreDogruMu = await kullanici.sifreKontrol(sifre);
		if (!sifreDogruMu) {
			return res.status(401).json({ mesaj: 'Geçersiz e-posta veya şifre.' });
		}

		// Token oluştur
		// JWT_SECRET yoksa varsayılan bir değer kullanıyoruz, .env'ye eklenmeli
		const secret = process.env.JWT_SECRET || 'ik_uygulamasi_gizli_anahtar_123';

		const payload = {
			user: {
				id: kullanici._id,
				rol: kullanici.rol,
			},
		};

		jwt.sign(
			payload,
			secret,
			{ expiresIn: '24h' }, // Token 24 saat geçerli
			(err, token) => {
				if (err) throw err;
				res.json({
					token,
					kullanici: {
						id: kullanici._id,
						adSoyad: kullanici.adSoyad,
						email: kullanici.email,
						rol: kullanici.rol,
					},
				});
			},
		);
	} catch (error) {
		res.status(500).json({ hata: error.message });
	}
});

module.exports = router;
