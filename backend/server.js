require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Personel = require('./models/Personel');

const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Multer Konfigürasyonu (Dinamik Klasör Yapısı İçin)
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const { personelId, kategori } = req.body;
		const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

		// Klasör yolu: uploads/personel_<id>/<kategori>/<tarih>
		const dest = path.join('uploads', `personel_${personelId || 'temp'}`, kategori || 'general', today);

		// Klasörü oluştur (yoksa)
		fs.mkdirSync(dest, { recursive: true });
		cb(null, dest);
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, file.fieldname + '-' + uniqueSuffix + ext);
	},
});

const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Dosya Yükleme API'si
app.post('/api/upload', authMiddleware, upload.single('file'), (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'Dosya yüklenemedi.' });
		}
		// İstemciye geri dönen yol (static servis edilen yol)
		const relativePath = req.file.path.replace(/\\/g, '/');
		res.json({ filePath: relativePath });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Database Connection
mongoose
	.connect(process.env.MONGO_URI)
	.then(() => console.log('MongoDB veritabanina basariyla baglanildi.'))
	.catch((err) => console.error('MongoDB baglanti hatasi:', err));

// Routes
app.get('/api/health', (req, res) => {
	res.json({ message: 'API sorunsuz calisiyor.' });
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// Personel Ekleme (Korumalı Route)
app.post('/api/personel', authMiddleware, async (req, res) => {
	try {
		const yeniPersonel = new Personel(req.body);
		const kaydedilenPersonel = await yeniPersonel.save();
		res.status(201).json(kaydedilenPersonel);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// Personelleri Listeleme (Korumalı Route)
app.get('/api/personel', authMiddleware, async (req, res) => {
	try {
		const personeller = await Personel.find();
		res.json(personeller);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Tek Personel Getirme (Korumalı Route)
app.get('/api/personel/:id', authMiddleware, async (req, res) => {
	try {
		const personel = await Personel.findById(req.params.id);
		if (!personel) {
			return res.status(404).json({ mesaj: 'Personel bulunamadı.' });
		}
		res.json(personel);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Nesne karşılaştırma ve farkları bulma fonksiyonu
function getDifferences(oldObj, newObj, path = '') {
	let diffs = [];
	if (!oldObj || typeof oldObj !== 'object') oldObj = {};
	if (!newObj || typeof newObj !== 'object') newObj = {};

	const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

	keys.forEach((key) => {
		if (['degisiklikGecmisi', 'updatedAt', 'createdAt', '_id', '__v'].includes(key)) return;

		const fullPath = path ? `${path}.${key}` : key;
		let oldVal = oldObj[key];
		let newVal = newObj[key];

		// Normalizasyon: null, undefined ve "" (boş string) değerlerini eşitle
		const isOldEmpty = oldVal === null || oldVal === undefined || oldVal === '';
		const isNewEmpty = newVal === null || newVal === undefined || newVal === '';

		if (isOldEmpty && isNewEmpty) return; // Her ikisi de "boş" ise fark yoktur

		// Tarihleri normalleştir (Yalnızca YYYY-MM-DD olarak karşılaştır)
		const normalizeDate = (val) => {
			if (!val) return val;
			if (val instanceof Date) return val.toISOString().substring(0, 10);
			if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}/)) return val.substring(0, 10);
			return val;
		};

		const normOld = normalizeDate(oldVal);
		const normNew = normalizeDate(newVal);

		if (JSON.stringify(normOld) !== JSON.stringify(normNew)) {
			// Alt objeleri tekrar sorgulama (Arrayleri doğrudan karşılaştırıyoruz)
			if (
				typeof normOld === 'object' &&
				normOld !== null &&
				!Array.isArray(normOld) &&
				typeof normNew === 'object' &&
				normNew !== null &&
				!Array.isArray(normNew)
			) {
				diffs = diffs.concat(getDifferences(normOld, normNew, fullPath));
			} else {
				diffs.push({
					degistirilenAlan: fullPath,
					eskiDeger: oldVal,
					yeniDeger: newVal,
					degisiklikTarihi: new Date(),
					degistirenKullanici: 'Bilinmiyor',
				});
			}
		}
	});

	return diffs;
}

// Personel Güncelleme (Korumalı Route)
app.put('/api/personel/:id', authMiddleware, async (req, res) => {
	try {
		const eskiPersonel = await Personel.findById(req.params.id);
		if (!eskiPersonel) {
			return res.status(404).json({ mesaj: 'Güncellenecek personel bulunamadı.' });
		}

		// Farkları hesaplıyoruz
		const bodyData = { ...req.body };
		const degisiklikler = getDifferences(eskiPersonel.toObject(), bodyData);

		// Geçmiş güncellemeye yeni farkları ekliyoruz
		if (degisiklikler.length > 0) {
			bodyData.degisiklikGecmisi = [...(eskiPersonel.degisiklikGecmisi || []), ...degisiklikler];
		}

		const guncellenenPersonel = await Personel.findByIdAndUpdate(req.params.id, bodyData, {
			new: true,
			runValidators: true,
		});
		res.json(guncellenenPersonel);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// Personel Silme (Korumalı Route)
app.delete('/api/personel/:id', authMiddleware, async (req, res) => {
	try {
		const silinenPersonel = await Personel.findByIdAndDelete(req.params.id);
		if (!silinenPersonel) {
			return res.status(404).json({ mesaj: 'Silinecek personel bulunamadı.' });
		}
		res.json({ mesaj: 'Personel başarıyla silindi.' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.listen(PORT, () => {
	console.log(`Sunucu ${PORT} portunda calisiyor...`);
});
