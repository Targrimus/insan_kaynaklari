require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Personel = require('./models/Personel');

const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// Personel Güncelleme (Korumalı Route)
app.put('/api/personel/:id', authMiddleware, async (req, res) => {
	try {
		const guncellenenPersonel = await Personel.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});
		if (!guncellenenPersonel) {
			return res.status(404).json({ mesaj: 'Güncellenecek personel bulunamadı.' });
		}
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
