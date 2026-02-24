const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
	// Header'dan token'ı al
	const token = req.header('x-auth-token') || req.header('Authorization')?.split(' ')[1];

	// Token yoksa yetkisiz
	if (!token) {
		return res.status(401).json({ mesaj: 'Token bulunamadı, yetkilendirme reddedildi.' });
	}

	try {
		// Token'ı doğrula
		const secret = process.env.JWT_SECRET || 'ik_uygulamasi_gizli_anahtar_123';
		const decoded = jwt.verify(token, secret);

		// İstek objesine kullanıcı bilgisini ekle
		req.user = decoded.user;
		next();
	} catch (err) {
		res.status(401).json({ mesaj: 'Token geçersiz.' });
	}
};
