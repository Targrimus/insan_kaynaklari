const mongoose = require('mongoose');
const { Schema } = mongoose;

const adresSema = new Schema(
	{
		il: { type: String, trim: true },
		ilce: { type: String, trim: true },
		sokak: { type: String, trim: true },
		disKapiNo: { type: String, trim: true },
		icKapiNo: { type: String, trim: true },
		numarataj: { type: String, trim: true },
	},
	{ _id: false },
);

const personelSema = new Schema(
	{
		// Kişisel Bilgiler
		tcKimlikNo: { type: String, required: true, unique: true, trim: true, minlength: 11, maxlength: 11 },
		ad: { type: String, required: true, trim: true },
		soyad: { type: String, required: true, trim: true },
		cinsiyet: {
			type: String,
			enum: ['Erkek', 'Kadın', 'Belirtmek İstemiyor'],
			default: 'Belirtmek İstemiyor',
		},
		dogumTarihi: { type: Date },
		kanGrubu: {
			type: String,
			enum: ['A Rh+', 'A Rh-', 'B Rh+', 'B Rh-', 'AB Rh+', 'AB Rh-', '0 Rh+', '0 Rh-', 'Bilinmiyor'],
			default: 'Bilinmiyor',
		},
		telefonNumaralari: [
			{
				tip: { type: String, enum: ['Şahsi', 'İş'], default: 'Şahsi' },
				numara: { type: String, trim: true, required: true },
				kisaKod: { type: String, trim: true }, // İş telefonu için zorunlu değil
			},
		],
		epostaAdresleri: [
			{
				type: String,
				trim: true,
				lowercase: true,
				match: [/^\S+@\S+\.\S+$/, 'Lütfen geçerli bir e-posta adresi giriniz'],
			},
		],
		adres: [adresSema],
		vesikalikFotograf: { type: String },
		medeniHal: {
			type: String,
			enum: ['Bekar', 'Evli', 'Boşanmış', 'Dul'],
		},
		engelliMi: { type: Boolean, default: false },
		engellilikDurumu: {
			engelNedeni: {
				type: String,
				trim: true,
				required: function () {
					return this.engelliMi === true;
				},
			},
			engelDerecesi: {
				type: Number,
				min: 1,
				max: 100,
				required: function () {
					return this.engelliMi === true;
				},
			},
		},
		bakmaklaYukumluOlduguKisiler: [
			{
				yakinlikDerecesi: {
					type: String,
					enum: ['Eş', 'Çocuk', 'Anne', 'Baba', 'Kardeş', 'Diğer'],
					required: true,
				},
				kisiTipi: {
					type: String,
					enum: ['Yetişkin', 'Çocuk'],
					required: true,
				},
				adSoyad: { type: String, trim: true },
				dogumTarihi: { type: Date }, // Yaş tespiti ve eğitim yardımları için faydalı olabilir
			},
		],

		// Şirket & Görev Bilgileri
		sicilNo: { type: String, required: true, unique: true, trim: true },
		iseBaslamaTarihi: { type: Date, required: true },
		istenCikisTarihi: { type: Date },
		unvani: { type: String, trim: true },
		gorevAldigiSirket: { type: String, trim: true },
		gorevAldigiSube: { type: String, trim: true },
		ihtarVeUyarilar: [
			{
				tipi: {
					type: String,
					enum: ['Sözlü Uyarı', 'Yazılı Uyarı', 'İhtarname', 'Kınama'],
					required: true,
				},
				nedeni: { type: String, trim: true, required: true },
				tarihi: { type: Date, required: true },
				dosyaYolu: { type: String, trim: true }, // Uyarı/İhtar belgesi dosya yolu
			},
		],

		// Eğitim Bilgileri
		egitimBilgileri: [
			{
				mezuniyetDurumu: {
					type: String,
					enum: ['İlköğretim', 'Lise', 'Önlisans', 'Lisans', 'Yüksek Lisans', 'Doktora'],
				},
				okulAdi: { type: String, trim: true, required: true },
				bolumAdi: { type: String, trim: true },
				baslamaTarihi: { type: Date, required: true },
				mezuniyetTarihi: { type: Date }, // Mezun olmamış veya devam ediyor olabilir
				mezuniyetNotuTipi: {
					type: String,
					enum: ["4'lük", "100'lük"],
				},
				mezuniyetNotu: { type: Number, min: 0 },
			},
		],

		// Acil Durum / Yakını Bilgileri
		yakini: [
			{
				ad: { type: String, trim: true },
				soyad: { type: String, trim: true },
				telefonNumarasi: { type: String, trim: true },
				adres: { type: adresSema },
			},
		],

		// Yetkinlikler ve Belgeler
		ehliyetDurumu: {
			ehliyetSinifi: [{ type: String, trim: true }],
			srcBelgesi: [{ type: String, trim: true }],
			psikoteknikBelgesi: [{ type: String, trim: true }],
		},

		sertifikaBilgileri: [
			{
				egitimTipi: {
					type: String,
					enum: ['İSG', 'MYK', 'İlkyardım', 'Diğer'],
					required: true,
					default: 'Diğer',
				},
				egitimAdi: { type: String, trim: true, required: true },
				sertifikaTarihi: { type: Date, required: true },
				dosyaYolu: { type: String, trim: true }, // Sertifika PDF/Görsel dosya yolu
			},
		],

		// Finans & Maaş Bilgileri
		bankaHesaplari: [
			{
				bankaAdi: { type: String, trim: true, required: true },
				ibanNo: { type: String, trim: true, required: true, minlength: 24 }, // Sadece TR numara kısmı veya tamamı
			},
		],

		// KKD (Kişisel Koruyucu Donanım) & Zimmet Bilgileri
		kkdZimmetleri: [
			{
				kkdTipi: { type: String, trim: true, required: true }, // Örn: Baret, Yelek, Laptop, Telefon
				marka: { type: String, trim: true },
				model: { type: String, trim: true },
				seriNo: { type: String, trim: true },
				verilisTarihi: { type: Date, required: true }, // Zimmet/Teslim tarihi
				iadeTarihi: { type: Date }, // İşten çıkışta veya eskidiğinde iade tarihi
				dosyaYolu: { type: String, trim: true }, // Zimmet belgesi/formu vb. dosya yolu
			},
		],
		// Görev Değişiklikleri Bilgileri
		gorevDegisiklikleri: [
			{
				oncekiUnvan: { type: String, trim: true },
				oncekiSirket: { type: String, trim: true },
				oncekiSube: { type: String, trim: true },
				yeniUnvan: { type: String, trim: true },
				yeniSirket: { type: String, trim: true },
				yeniSube: { type: String, trim: true },
				degisiklikTarihi: { type: Date, required: true },
			},
		],

		// Sistemde yapılan genel değişikliklerin (Log) geçmişi
		degisiklikGecmisi: [
			{
				degistirilenAlan: { type: String, required: true },
				eskiDeger: mongoose.Schema.Types.Mixed,
				yeniDeger: mongoose.Schema.Types.Mixed,
				degisiklikTarihi: { type: Date, default: Date.now },
				degistirenKullanici: { type: String },
			},
		],
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

const Personel = mongoose.model('Personel', personelSema);

module.exports = Personel;
