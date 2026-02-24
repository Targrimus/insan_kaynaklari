import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash } from 'react-icons/fa';

const PersonelEkle = () => {
	const navigate = useNavigate();
	const [hata, setHata] = useState('');
	const [formData, setFormData] = useState({
		tcKimlikNo: '',
		ad: '',
		soyad: '',
		cinsiyet: 'Belirtmek İstemiyor',
		dogumTarihi: '',
		kanGrubu: 'Bilinmiyor',
		telefonNumarasi: '',
		epostaAdresleri: [''],
		adres: [{ il: '', ilce: '', sokak: '', disKapiNo: '', icKapiNo: '', numarataj: '' }],
		vesikalikFotograf: '',
		medeniHal: 'Bekar',
		engelliMi: false,
		engellilikDurumu: { engelNedeni: '', engelDerecesi: '' },
		bakmaklaYukumluOlduguKisiler: [],
		sicilNo: '',
		iseBaslamaTarihi: '',
		istenCikisTarihi: '',
		unvani: '',
		gorevAldigiSirket: '',
		gorevAldigiSube: '',
		ihtarVeUyarilar: [],
		egitimBilgileri: [],
		yakini: {
			ad: '',
			soyad: '',
			telefonNumarasi: '',
			adres: { il: '', ilce: '', sokak: '', disKapiNo: '', icKapiNo: '', numarataj: '' },
		},
		ehliyetDurumu: { ehliyetSinifi: '', srcBelgesi: '', psikoteknikBelgesi: '' },
		sertifikaBilgileri: [],
		bankaHesaplari: [],
		kkdZimmetleri: [],
	});

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		if (name.includes('.') && !name.startsWith('adres')) {
			const keys = name.split('.'); // e.g., yakini.adres.il
			if (keys.length === 2) {
				setFormData((prev) => ({ ...prev, [keys[0]]: { ...prev[keys[0]], [keys[1]]: value } }));
			} else if (keys.length === 3) {
				setFormData((prev) => ({
					...prev,
					[keys[0]]: { ...prev[keys[0]], [keys[1]]: { ...prev[keys[0]][keys[1]], [keys[2]]: value } },
				}));
			}
		} else if (type === 'checkbox') {
			setFormData((prev) => ({ ...prev, [name]: checked }));
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handlePhotoUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setFormData((prev) => ({ ...prev, vesikalikFotograf: reader.result }));
			};
			reader.readAsDataURL(file);
		}
	};

	const handleArrayChange = (field, index, subField, value) => {
		const newArray = [...formData[field]];
		newArray[index][subField] = value;
		setFormData({ ...formData, [field]: newArray });
	};

	const handleStringArrayChange = (field, index, value) => {
		const newArray = [...formData[field]];
		newArray[index] = value;
		setFormData({ ...formData, [field]: newArray });
	};

	const addArrayItem = (field, emptyItem) => {
		setFormData({ ...formData, [field]: [...formData[field], emptyItem] });
	};

	const removeArrayItem = (field, index) => {
		const newArray = formData[field].filter((_, i) => i !== index);
		setFormData({ ...formData, [field]: newArray });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setHata('');
		try {
			// Frontend'de ehliyet bilgilerini virgülle ayrılmış string olarak alıp array'e çeviriyoruz
			const payload = { ...formData };
			payload.ehliyetDurumu = {
				ehliyetSinifi: formData.ehliyetDurumu.ehliyetSinifi
					? formData.ehliyetDurumu.ehliyetSinifi.split(',').map((s) => s.trim())
					: [],
				srcBelgesi: formData.ehliyetDurumu.srcBelgesi
					? formData.ehliyetDurumu.srcBelgesi.split(',').map((s) => s.trim())
					: [],
				psikoteknikBelgesi: formData.ehliyetDurumu.psikoteknikBelgesi
					? formData.ehliyetDurumu.psikoteknikBelgesi.split(',').map((s) => s.trim())
					: [],
			};
			// Boş e-postaları filtrele
			payload.epostaAdresleri = payload.epostaAdresleri.filter((e) => e.trim() !== '');

			await axios.post('http://localhost:5000/api/personel', payload);
			alert('Personel başarıyla eklendi!');
			navigate('/');
		} catch (error) {
			setHata(error.response?.data?.error || 'Personel eklenirken hata oluştu');
			console.error(error);
		}
	};

	return (
		<Container fluid>
			<Card className='shadow-sm border-0 mb-5'>
				<Card.Header className='bg-primary text-white py-3'>
					<h4 className='mb-0 fw-bold'>Yeni Personel Kaydı</h4>
				</Card.Header>
				<Card.Body>
					{hata && <Alert variant='danger'>{hata}</Alert>}
					<Form onSubmit={handleSubmit}>
						<Tabs defaultActiveKey='kisisel' id='personel-tabs' className='mb-4' fill>
							{/* 1. SEKMESİ: KİŞİSEL BİLGİLER */}
							<Tab eventKey='kisisel' title='Kişisel Bilgiler & İletişim'>
								<Row className='mb-4 align-items-center bg-light p-3 rounded'>
									<Col md={2} className='text-center'>
										{formData.vesikalikFotograf ? (
											<img
												src={formData.vesikalikFotograf}
												alt='Vesikalık'
												className='img-thumbnail rounded-circle'
												style={{ width: '100px', height: '100px', objectFit: 'cover' }}
											/>
										) : (
											<div
												className='bg-secondary text-white d-flex align-items-center justify-content-center rounded-circle mx-auto'
												style={{ width: '100px', height: '100px' }}>
												Foto Yok
											</div>
										)}
									</Col>
									<Col md={10}>
										<Form.Group>
											<Form.Label className='fw-bold'>
												Vesikalık Fotoğraf Yükle (Sadece Görsel)
											</Form.Label>
											<Form.Control type='file' accept='image/*' onChange={handlePhotoUpload} />
										</Form.Group>
									</Col>
								</Row>

								<Row>
									<Col md={4}>
										<Form.Group className='mb-3'>
											<Form.Label>TC Kimlik No</Form.Label>
											<Form.Control
												type='text'
												name='tcKimlikNo'
												required
												maxLength={11}
												onChange={handleChange}
											/>
										</Form.Group>
									</Col>
									<Col md={4}>
										<Form.Group className='mb-3'>
											<Form.Label>Ad</Form.Label>
											<Form.Control type='text' name='ad' required onChange={handleChange} />
										</Form.Group>
									</Col>
									<Col md={4}>
										<Form.Group className='mb-3'>
											<Form.Label>Soyad</Form.Label>
											<Form.Control type='text' name='soyad' required onChange={handleChange} />
										</Form.Group>
									</Col>
								</Row>
								<Row>
									<Col md={3}>
										<Form.Group className='mb-3'>
											<Form.Label>Cinsiyet</Form.Label>
											<Form.Select name='cinsiyet' onChange={handleChange}>
												<option value='Belirtmek İstemiyor'>Belirtmek İstemiyor</option>
												<option value='Erkek'>Erkek</option>
												<option value='Kadın'>Kadın</option>
											</Form.Select>
										</Form.Group>
									</Col>
									<Col md={3}>
										<Form.Group className='mb-3'>
											<Form.Label>Doğum Tarihi</Form.Label>
											<Form.Control type='date' name='dogumTarihi' onChange={handleChange} />
										</Form.Group>
									</Col>
									<Col md={3}>
										<Form.Group className='mb-3'>
											<Form.Label>Kan Grubu</Form.Label>
											<Form.Select name='kanGrubu' onChange={handleChange}>
												<option value='Bilinmiyor'>Bilinmiyor</option>
												<option value='A Rh+'>A Rh+</option>
												<option value='A Rh-'>A Rh-</option>
												<option value='B Rh+'>B Rh+</option>
												<option value='B Rh-'>B Rh-</option>
												<option value='AB Rh+'>AB Rh+</option>
												<option value='AB Rh-'>AB Rh-</option>
												<option value='0 Rh+'>0 Rh+</option>
												<option value='0 Rh-'>0 Rh-</option>
											</Form.Select>
										</Form.Group>
									</Col>
									<Col md={3}>
										<Form.Group className='mb-3'>
											<Form.Label>Medeni Hal</Form.Label>
											<Form.Select name='medeniHal' onChange={handleChange}>
												<option value='Bekar'>Bekar</option>
												<option value='Evli'>Evli</option>
												<option value='Boşanmış'>Boşanmış</option>
												<option value='Dul'>Dul</option>
											</Form.Select>
										</Form.Group>
									</Col>
								</Row>
								<Row>
									<Col md={4}>
										<Form.Group className='mb-3'>
											<Form.Label>Telefon Numarası</Form.Label>
											<Form.Control type='text' name='telefonNumarasi' onChange={handleChange} />
										</Form.Group>
									</Col>
									<Col md={8}>
										<Form.Group className='mb-3'>
											<Form.Label>E-posta Adresleri</Form.Label>
											{formData.epostaAdresleri.map((email, idx) => (
												<div key={idx} className='d-flex mb-2'>
													<Form.Control
														type='email'
														value={email}
														onChange={(e) =>
															handleStringArrayChange(
																'epostaAdresleri',
																idx,
																e.target.value,
															)
														}
														placeholder='ornek@mail.com'
													/>
													{idx === formData.epostaAdresleri.length - 1 ? (
														<Button
															variant='outline-success'
															className='ms-2'
															onClick={() => addArrayItem('epostaAdresleri', '')}>
															<FaPlus />
														</Button>
													) : (
														<Button
															variant='outline-danger'
															className='ms-2'
															onClick={() => removeArrayItem('epostaAdresleri', idx)}>
															<FaTrash />
														</Button>
													)}
												</div>
											))}
										</Form.Group>
									</Col>
								</Row>

								<hr className='my-4' />
								<div className='d-flex justify-content-between align-items-center mb-3'>
									<h5 className='mb-0'>Adres Bilgileri</h5>
									<Button
										variant='outline-primary'
										size='sm'
										onClick={() =>
											addArrayItem('adres', {
												il: '',
												ilce: '',
												sokak: '',
												disKapiNo: '',
												icKapiNo: '',
												numarataj: '',
											})
										}>
										<FaPlus /> Adres Ekle
									</Button>
								</div>
								{formData.adres.length === 0 && (
									<Alert variant='secondary' className='py-2'>
										Kayıtlı adres bulunmuyor.
									</Alert>
								)}
								{formData.adres.map((adr, idx) => (
									<div
										key={idx}
										className='mb-4 p-3 border border-2 border-light rounded position-relative'>
										{formData.adres.length > 1 && (
											<Button
												variant='danger'
												size='sm'
												className='position-absolute top-0 end-0 m-2'
												onClick={() => removeArrayItem('adres', idx)}>
												<FaTrash />
											</Button>
										)}
										<Row>
											<Col md={4}>
												<Form.Group className='mb-3'>
													<Form.Label>İl</Form.Label>
													<Form.Control
														type='text'
														value={adr.il}
														onChange={(e) =>
															handleArrayChange('adres', idx, 'il', e.target.value)
														}
													/>
												</Form.Group>
											</Col>
											<Col md={4}>
												<Form.Group className='mb-3'>
													<Form.Label>İlçe</Form.Label>
													<Form.Control
														type='text'
														value={adr.ilce}
														onChange={(e) =>
															handleArrayChange('adres', idx, 'ilce', e.target.value)
														}
													/>
												</Form.Group>
											</Col>
											<Col md={4}>
												<Form.Group className='mb-3'>
													<Form.Label>Sokak</Form.Label>
													<Form.Control
														type='text'
														value={adr.sokak}
														onChange={(e) =>
															handleArrayChange('adres', idx, 'sokak', e.target.value)
														}
													/>
												</Form.Group>
											</Col>
										</Row>
										<Row>
											<Col md={4}>
												<Form.Group className='mb-3'>
													<Form.Label>Dış Kapı No</Form.Label>
													<Form.Control
														type='text'
														value={adr.disKapiNo}
														onChange={(e) =>
															handleArrayChange('adres', idx, 'disKapiNo', e.target.value)
														}
													/>
												</Form.Group>
											</Col>
											<Col md={4}>
												<Form.Group className='mb-3'>
													<Form.Label>İç Kapı No</Form.Label>
													<Form.Control
														type='text'
														value={adr.icKapiNo}
														onChange={(e) =>
															handleArrayChange('adres', idx, 'icKapiNo', e.target.value)
														}
													/>
												</Form.Group>
											</Col>
											<Col md={4}>
												<Form.Group className='mb-3'>
													<Form.Label>Numarataj</Form.Label>
													<Form.Control
														type='text'
														value={adr.numarataj}
														onChange={(e) =>
															handleArrayChange('adres', idx, 'numarataj', e.target.value)
														}
													/>
												</Form.Group>
											</Col>
										</Row>
									</div>
								))}

								<hr />
								<Form.Group className='mb-3' controlId='engelliCheckbox'>
									<Form.Check
										type='checkbox'
										label='Engelli Mi?'
										name='engelliMi'
										checked={formData.engelliMi}
										onChange={handleChange}
									/>
								</Form.Group>
								{formData.engelliMi && (
									<Row className='bg-light p-3 rounded'>
										<Col md={6}>
											<Form.Group className='mb-3'>
												<Form.Label>Engel Nedeni</Form.Label>
												<Form.Control
													type='text'
													name='engellilikDurumu.engelNedeni'
													required
													onChange={handleChange}
												/>
											</Form.Group>
										</Col>
										<Col md={6}>
											<Form.Group className='mb-3'>
												<Form.Label>Engel Derecesi (%)</Form.Label>
												<Form.Control
													type='number'
													name='engellilikDurumu.engelDerecesi'
													required
													min='1'
													max='100'
													onChange={handleChange}
												/>
											</Form.Group>
										</Col>
									</Row>
								)}
							</Tab>

							{/* 2. SEKMESİ: ŞİRKET BİLGİLERİ */}
							<Tab eventKey='sirket' title='Şirket & Görev'>
								<Row>
									<Col md={4}>
										<Form.Group className='mb-3'>
											<Form.Label>İşyeri Sicil No</Form.Label>
											<Form.Control type='text' name='sicilNo' required onChange={handleChange} />
										</Form.Group>
									</Col>
									<Col md={4}>
										<Form.Group className='mb-3'>
											<Form.Label>İşe Başlama Tarihi</Form.Label>
											<Form.Control
												type='date'
												name='iseBaslamaTarihi'
												required
												onChange={handleChange}
											/>
										</Form.Group>
									</Col>
									<Col md={4}>
										<Form.Group className='mb-3'>
											<Form.Label>İşten Çıkış Tarihi</Form.Label>
											<Form.Control type='date' name='istenCikisTarihi' onChange={handleChange} />
										</Form.Group>
									</Col>
								</Row>
								<Row>
									<Col md={4}>
										<Form.Group className='mb-3'>
											<Form.Label>Ünvanı</Form.Label>
											<Form.Control type='text' name='unvani' onChange={handleChange} />
										</Form.Group>
									</Col>
									<Col md={4}>
										<Form.Group className='mb-3'>
											<Form.Label>Görev Aldığı Şirket</Form.Label>
											<Form.Control
												type='text'
												name='gorevAldigiSirket'
												onChange={handleChange}
											/>
										</Form.Group>
									</Col>
									<Col md={4}>
										<Form.Group className='mb-3'>
											<Form.Label>Görev Aldığı Şube</Form.Label>
											<Form.Control type='text' name='gorevAldigiSube' onChange={handleChange} />
										</Form.Group>
									</Col>
								</Row>

								<hr />
								<div className='d-flex justify-content-between align-items-center mb-3'>
									<h5 className='mb-0'>İhtar ve Uyarılar</h5>
									<Button
										variant='outline-primary'
										size='sm'
										onClick={() =>
											addArrayItem('ihtarVeUyarilar', {
												tipi: 'Sözlü Uyarı',
												nedeni: '',
												tarihi: '',
											})
										}>
										<FaPlus /> Uyarı Ekle
									</Button>
								</div>
								{formData.ihtarVeUyarilar.map((uyari, idx) => (
									<Card key={idx} className='mb-3 border-warning'>
										<Card.Body className='py-2'>
											<Row className='align-items-end'>
												<Col md={3}>
													<Form.Group>
														<Form.Label>Tipi</Form.Label>
														<Form.Select
															value={uyari.tipi}
															onChange={(e) =>
																handleArrayChange(
																	'ihtarVeUyarilar',
																	idx,
																	'tipi',
																	e.target.value,
																)
															}>
															<option value='Sözlü Uyarı'>Sözlü Uyarı</option>
															<option value='Yazılı Uyarı'>Yazılı Uyarı</option>
															<option value='İhtarname'>İhtarname</option>
															<option value='Kınama'>Kınama</option>
														</Form.Select>
													</Form.Group>
												</Col>
												<Col md={5}>
													<Form.Group>
														<Form.Label>Nedeni</Form.Label>
														<Form.Control
															type='text'
															value={uyari.nedeni}
															required
															onChange={(e) =>
																handleArrayChange(
																	'ihtarVeUyarilar',
																	idx,
																	'nedeni',
																	e.target.value,
																)
															}
														/>
													</Form.Group>
												</Col>
												<Col md={3}>
													<Form.Group>
														<Form.Label>Tarihi</Form.Label>
														<Form.Control
															type='date'
															value={uyari.tarihi}
															required
															onChange={(e) =>
																handleArrayChange(
																	'ihtarVeUyarilar',
																	idx,
																	'tarihi',
																	e.target.value,
																)
															}
														/>
													</Form.Group>
												</Col>
												<Col md={1}>
													<Button
														variant='danger'
														onClick={() => removeArrayItem('ihtarVeUyarilar', idx)}>
														<FaTrash />
													</Button>
												</Col>
											</Row>
										</Card.Body>
									</Card>
								))}
							</Tab>

							{/* 3. SEKMESİ: EĞİTİM BİLGİLERİ */}
							<Tab eventKey='egitim' title='Eğitim Bilgileri'>
								<div className='d-flex justify-content-between align-items-center mb-3'>
									<h5 className='mb-0'>Mezuniyet ve Okul Bilgileri</h5>
									<Button
										variant='outline-primary'
										size='sm'
										onClick={() =>
											addArrayItem('egitimBilgileri', {
												mezuniyetDurumu: 'Lisans',
												okulAdi: '',
												bolumAdi: '',
												baslamaTarihi: '',
												mezuniyetTarihi: '',
												mezuniyetNotuTipi: "4'lük",
												mezuniyetNotu: '',
											})
										}>
										<FaPlus /> Eğitim Ekle
									</Button>
								</div>
								{formData.egitimBilgileri.length === 0 && (
									<Alert variant='secondary'>Henüz eğitim bilgisi eklenmedi.</Alert>
								)}
								{formData.egitimBilgileri.map((egitim, idx) => (
									<Card key={idx} className='mb-3 border-info'>
										<Card.Body>
											<Row className='mb-2'>
												<Col md={3}>
													<Form.Group>
														<Form.Label>Seviye</Form.Label>
														<Form.Select
															value={egitim.mezuniyetDurumu}
															onChange={(e) =>
																handleArrayChange(
																	'egitimBilgileri',
																	idx,
																	'mezuniyetDurumu',
																	e.target.value,
																)
															}>
															<option value='İlköğretim'>İlköğretim</option>
															<option value='Lise'>Lise</option>
															<option value='Önlisans'>Önlisans</option>
															<option value='Lisans'>Lisans</option>
															<option value='Yüksek Lisans'>Yüksek Lisans</option>
															<option value='Doktora'>Doktora</option>
														</Form.Select>
													</Form.Group>
												</Col>
												<Col md={5}>
													<Form.Group>
														<Form.Label>Okul Adı</Form.Label>
														<Form.Control
															type='text'
															required
															value={egitim.okulAdi}
															onChange={(e) =>
																handleArrayChange(
																	'egitimBilgileri',
																	idx,
																	'okulAdi',
																	e.target.value,
																)
															}
														/>
													</Form.Group>
												</Col>
												<Col md={4}>
													<Form.Group>
														<Form.Label>Bölüm</Form.Label>
														<Form.Control
															type='text'
															value={egitim.bolumAdi}
															onChange={(e) =>
																handleArrayChange(
																	'egitimBilgileri',
																	idx,
																	'bolumAdi',
																	e.target.value,
																)
															}
														/>
													</Form.Group>
												</Col>
											</Row>
											<Row className='align-items-end'>
												<Col md={3}>
													<Form.Group>
														<Form.Label>Başlama Tarihi</Form.Label>
														<Form.Control
															type='date'
															required
															value={egitim.baslamaTarihi}
															onChange={(e) =>
																handleArrayChange(
																	'egitimBilgileri',
																	idx,
																	'baslamaTarihi',
																	e.target.value,
																)
															}
														/>
													</Form.Group>
												</Col>
												<Col md={3}>
													<Form.Group>
														<Form.Label>Mezuniyet Tarihi</Form.Label>
														<Form.Control
															type='date'
															value={egitim.mezuniyetTarihi}
															onChange={(e) =>
																handleArrayChange(
																	'egitimBilgileri',
																	idx,
																	'mezuniyetTarihi',
																	e.target.value,
																)
															}
														/>
													</Form.Group>
												</Col>
												<Col md={2}>
													<Form.Group>
														<Form.Label>Not Tipi</Form.Label>
														<Form.Select
															value={egitim.mezuniyetNotuTipi}
															onChange={(e) =>
																handleArrayChange(
																	'egitimBilgileri',
																	idx,
																	'mezuniyetNotuTipi',
																	e.target.value,
																)
															}>
															<option value="4'lük">4'lük</option>
															<option value="100'lük">100'lük</option>
														</Form.Select>
													</Form.Group>
												</Col>
												<Col md={2}>
													<Form.Group>
														<Form.Label>Mezuniyet Notu</Form.Label>
														<Form.Control
															type='number'
															step='0.01'
															value={egitim.mezuniyetNotu}
															onChange={(e) =>
																handleArrayChange(
																	'egitimBilgileri',
																	idx,
																	'mezuniyetNotu',
																	e.target.value,
																)
															}
														/>
													</Form.Group>
												</Col>
												<Col md={2} className='text-end'>
													<Button
														variant='danger'
														className='w-100'
														onClick={() => removeArrayItem('egitimBilgileri', idx)}>
														<FaTrash /> Sil
													</Button>
												</Col>
											</Row>
										</Card.Body>
									</Card>
								))}
							</Tab>

							{/* 4. SEKMESİ: AİLE VE YAKIN BİLGİLERİ */}
							<Tab eventKey='aile' title='Aile & Acil Durum'>
								<div className='d-flex justify-content-between align-items-center mb-3'>
									<h5 className='mb-0'>Bakmakla Yükümlü Olduğu Kişiler</h5>
									<Button
										variant='outline-primary'
										size='sm'
										onClick={() =>
											addArrayItem('bakmaklaYukumluOlduguKisiler', {
												yakinlikDerecesi: 'Eş',
												kisiTipi: 'Yetişkin',
												adSoyad: '',
												dogumTarihi: '',
											})
										}>
										<FaPlus /> Kişi Ekle
									</Button>
								</div>
								{formData.bakmaklaYukumluOlduguKisiler.length === 0 && (
									<Alert variant='secondary' className='py-2'>
										Kayıtlı kişi bulunmuyor.
									</Alert>
								)}
								{formData.bakmaklaYukumluOlduguKisiler.map((kisi, idx) => (
									<Row key={idx} className='mb-3 align-items-end'>
										<Col md={2}>
											<Form.Group>
												<Form.Label>Yakınlık</Form.Label>
												<Form.Select
													value={kisi.yakinlikDerecesi}
													onChange={(e) =>
														handleArrayChange(
															'bakmaklaYukumluOlduguKisiler',
															idx,
															'yakinlikDerecesi',
															e.target.value,
														)
													}>
													<option value='Eş'>Eş</option>
													<option value='Çocuk'>Çocuk</option>
													<option value='Anne'>Anne</option>
													<option value='Baba'>Baba</option>
													<option value='Kardeş'>Kardeş</option>
													<option value='Diğer'>Diğer</option>
												</Form.Select>
											</Form.Group>
										</Col>
										<Col md={2}>
											<Form.Group>
												<Form.Label>Tipi</Form.Label>
												<Form.Select
													value={kisi.kisiTipi}
													onChange={(e) =>
														handleArrayChange(
															'bakmaklaYukumluOlduguKisiler',
															idx,
															'kisiTipi',
															e.target.value,
														)
													}>
													<option value='Yetişkin'>Yetişkin</option>
													<option value='Çocuk'>Çocuk</option>
												</Form.Select>
											</Form.Group>
										</Col>
										<Col md={4}>
											<Form.Group>
												<Form.Label>Ad Soyad</Form.Label>
												<Form.Control
													type='text'
													value={kisi.adSoyad}
													onChange={(e) =>
														handleArrayChange(
															'bakmaklaYukumluOlduguKisiler',
															idx,
															'adSoyad',
															e.target.value,
														)
													}
												/>
											</Form.Group>
										</Col>
										<Col md={3}>
											<Form.Group>
												<Form.Label>Doğum Tarihi</Form.Label>
												<Form.Control
													type='date'
													value={kisi.dogumTarihi}
													onChange={(e) =>
														handleArrayChange(
															'bakmaklaYukumluOlduguKisiler',
															idx,
															'dogumTarihi',
															e.target.value,
														)
													}
												/>
											</Form.Group>
										</Col>
										<Col md={1}>
											<Button
												variant='danger'
												onClick={() => removeArrayItem('bakmaklaYukumluOlduguKisiler', idx)}>
												<FaTrash />
											</Button>
										</Col>
									</Row>
								))}

								<hr className='my-4' />
								<h5 className='mb-3'>Acil Durumlarda Ulaşılabilecek Yakını</h5>
								<Row>
									<Col md={4}>
										<Form.Group className='mb-3'>
											<Form.Label>Ad</Form.Label>
											<Form.Control type='text' name='yakini.ad' onChange={handleChange} />
										</Form.Group>
									</Col>
									<Col md={4}>
										<Form.Group className='mb-3'>
											<Form.Label>Soyad</Form.Label>
											<Form.Control type='text' name='yakini.soyad' onChange={handleChange} />
										</Form.Group>
									</Col>
									<Col md={4}>
										<Form.Group className='mb-3'>
											<Form.Label>Telefon</Form.Label>
											<Form.Control
												type='text'
												name='yakini.telefonNumarasi'
												onChange={handleChange}
											/>
										</Form.Group>
									</Col>
								</Row>
								<h6>Yakını Adresi</h6>
								<Row>
									<Col md={4}>
										<Form.Group className='mb-3'>
											<Form.Label>İl</Form.Label>
											<Form.Control type='text' name='yakini.adres.il' onChange={handleChange} />
										</Form.Group>
									</Col>
									<Col md={4}>
										<Form.Group className='mb-3'>
											<Form.Label>İlçe</Form.Label>
											<Form.Control
												type='text'
												name='yakini.adres.ilce'
												onChange={handleChange}
											/>
										</Form.Group>
									</Col>
									<Col md={4}>
										<Form.Group className='mb-3'>
											<Form.Label>Sokak</Form.Label>
											<Form.Control
												type='text'
												name='yakini.adres.sokak'
												onChange={handleChange}
											/>
										</Form.Group>
									</Col>
								</Row>
							</Tab>

							{/* 5. SEKMESİ: YETKİNLİK VE SERTİFİKALAR */}
							<Tab eventKey='yetkinlik' title='Sertifika & Belgeler'>
								<h5 className='mb-3'>Ehliyet ve Özel Belgeler (Virgülle ayırarak yazınız)</h5>
								<Row>
									<Col md={4}>
										<Form.Group className='mb-3'>
											<Form.Label>Ehliyet Sınıfları (Örn: B, A2)</Form.Label>
											<Form.Control
												type='text'
												name='ehliyetDurumu.ehliyetSinifi'
												onChange={handleChange}
											/>
										</Form.Group>
									</Col>
									<Col md={4}>
										<Form.Group className='mb-3'>
											<Form.Label>SRC Belgeleri (Örn: SRC2, SRC4)</Form.Label>
											<Form.Control
												type='text'
												name='ehliyetDurumu.srcBelgesi'
												onChange={handleChange}
											/>
										</Form.Group>
									</Col>
									<Col md={4}>
										<Form.Group className='mb-3'>
											<Form.Label>Psikoteknik Belgeleri</Form.Label>
											<Form.Control
												type='text'
												name='ehliyetDurumu.psikoteknikBelgesi'
												onChange={handleChange}
											/>
										</Form.Group>
									</Col>
								</Row>

								<hr className='my-4' />
								<div className='d-flex justify-content-between align-items-center mb-3'>
									<h5 className='mb-0'>Sertifikalar ve Mesleki Eğitimler</h5>
									<Button
										variant='outline-primary'
										size='sm'
										onClick={() =>
											addArrayItem('sertifikaBilgileri', {
												egitimTipi: 'Diğer',
												egitimAdi: '',
												sertifikaTarihi: '',
												dosyaYolu: '',
											})
										}>
										<FaPlus /> Sertifika Ekle
									</Button>
								</div>
								{formData.sertifikaBilgileri.length === 0 && (
									<Alert variant='secondary' className='py-2'>
										Kayıtlı sertifika bulunmuyor.
									</Alert>
								)}
								{formData.sertifikaBilgileri.map((serti, idx) => (
									<Row key={idx} className='mb-3 align-items-end p-3 bg-light rounded'>
										<Col md={2}>
											<Form.Group>
												<Form.Label>Tipi</Form.Label>
												<Form.Select
													value={serti.egitimTipi}
													onChange={(e) =>
														handleArrayChange(
															'sertifikaBilgileri',
															idx,
															'egitimTipi',
															e.target.value,
														)
													}>
													<option value='İSG'>İSG</option>
													<option value='MYK'>MYK</option>
													<option value='İlkyardım'>İlkyardım</option>
													<option value='Diğer'>Diğer</option>
												</Form.Select>
											</Form.Group>
										</Col>
										<Col md={5}>
											<Form.Group>
												<Form.Label>Eğitim/Sertifika Adı</Form.Label>
												<Form.Control
													type='text'
													required
													value={serti.egitimAdi}
													onChange={(e) =>
														handleArrayChange(
															'sertifikaBilgileri',
															idx,
															'egitimAdi',
															e.target.value,
														)
													}
												/>
											</Form.Group>
										</Col>
										<Col md={3}>
											<Form.Group>
												<Form.Label>Veriliş Tarihi</Form.Label>
												<Form.Control
													type='date'
													required
													value={serti.sertifikaTarihi}
													onChange={(e) =>
														handleArrayChange(
															'sertifikaBilgileri',
															idx,
															'sertifikaTarihi',
															e.target.value,
														)
													}
												/>
											</Form.Group>
										</Col>
										<Col md={2}>
											<Button
												variant='danger'
												className='w-100'
												onClick={() => removeArrayItem('sertifikaBilgileri', idx)}>
												<FaTrash /> Sil
											</Button>
										</Col>
									</Row>
								))}
							</Tab>
							{/* 6. SEKMESİ: FİNANS VE ZİMMET BİLGİLERİ */}
							<Tab eventKey='finans' title='Finans & Zimmet'>
								<div className='d-flex justify-content-between align-items-center mb-3'>
									<h5 className='mb-0'>Banka ve IBAN Bilgileri</h5>
									<Button
										variant='outline-primary'
										size='sm'
										onClick={() => addArrayItem('bankaHesaplari', { bankaAdi: '', ibanNo: '' })}>
										<FaPlus /> Hesap Ekle
									</Button>
								</div>
								{formData.bankaHesaplari.length === 0 && (
									<Alert variant='secondary' className='py-2'>
										Kayıtlı banka hesabı bulunmuyor.
									</Alert>
								)}
								{formData.bankaHesaplari.map((banka, idx) => (
									<Row key={idx} className='mb-3 align-items-end p-3 bg-light rounded'>
										<Col md={4}>
											<Form.Group>
												<Form.Label>Banka Adı</Form.Label>
												<Form.Control
													type='text'
													required
													value={banka.bankaAdi}
													onChange={(e) =>
														handleArrayChange(
															'bankaHesaplari',
															idx,
															'bankaAdi',
															e.target.value,
														)
													}
												/>
											</Form.Group>
										</Col>
										<Col md={7}>
											<Form.Group>
												<Form.Label>IBAN Numarası</Form.Label>
												<Form.Control
													type='text'
													required
													value={banka.ibanNo}
													placeholder='TR...'
													onChange={(e) =>
														handleArrayChange(
															'bankaHesaplari',
															idx,
															'ibanNo',
															e.target.value,
														)
													}
												/>
											</Form.Group>
										</Col>
										<Col md={1}>
											<Button
												variant='danger'
												className='w-100'
												onClick={() => removeArrayItem('bankaHesaplari', idx)}>
												<FaTrash />
											</Button>
										</Col>
									</Row>
								))}

								<hr className='my-4' />
								<div className='d-flex justify-content-between align-items-center mb-3'>
									<h5 className='mb-0'>KKD (Kişisel Koruyucu Donanım) ve Cihaz Zimmetleri</h5>
									<Button
										variant='outline-primary'
										size='sm'
										onClick={() =>
											addArrayItem('kkdZimmetleri', {
												kkdTipi: '',
												verilisTarihi: '',
												iadeTarihi: '',
												dosyaYolu: '',
											})
										}>
										<FaPlus /> Zimmet Ekle
									</Button>
								</div>
								{formData.kkdZimmetleri.length === 0 && (
									<Alert variant='secondary' className='py-2'>
										Kayıtlı zimmet bulunmuyor.
									</Alert>
								)}
								{formData.kkdZimmetleri.map((zimmet, idx) => (
									<Row key={idx} className='mb-3 align-items-end p-3 bg-light rounded'>
										<Col md={3}>
											<Form.Group>
												<Form.Label>KKD Tipi (Baret, Laptop vb.)</Form.Label>
												<Form.Control
													type='text'
													required
													value={zimmet.kkdTipi}
													onChange={(e) =>
														handleArrayChange(
															'kkdZimmetleri',
															idx,
															'kkdTipi',
															e.target.value,
														)
													}
												/>
											</Form.Group>
										</Col>
										<Col md={3}>
											<Form.Group>
												<Form.Label>Veriliş Tarihi</Form.Label>
												<Form.Control
													type='date'
													required
													value={zimmet.verilisTarihi}
													onChange={(e) =>
														handleArrayChange(
															'kkdZimmetleri',
															idx,
															'verilisTarihi',
															e.target.value,
														)
													}
												/>
											</Form.Group>
										</Col>
										<Col md={2}>
											<Form.Group>
												<Form.Label>İade Tarihi</Form.Label>
												<Form.Control
													type='date'
													value={zimmet.iadeTarihi}
													onChange={(e) =>
														handleArrayChange(
															'kkdZimmetleri',
															idx,
															'iadeTarihi',
															e.target.value,
														)
													}
												/>
											</Form.Group>
										</Col>
										<Col md={3}>
											<Form.Group>
												<Form.Label>Zimmet Dosya Yolu</Form.Label>
												<Form.Control
													type='text'
													placeholder='Dosya linki/yolu'
													value={zimmet.dosyaYolu}
													onChange={(e) =>
														handleArrayChange(
															'kkdZimmetleri',
															idx,
															'dosyaYolu',
															e.target.value,
														)
													}
												/>
											</Form.Group>
										</Col>
										<Col md={1}>
											<Button
												variant='danger'
												className='w-100'
												onClick={() => removeArrayItem('kkdZimmetleri', idx)}>
												<FaTrash />
											</Button>
										</Col>
									</Row>
								))}
							</Tab>
						</Tabs>

						<div className='d-flex justify-content-end mt-4 pt-3 border-top'>
							<Button variant='secondary' className='me-3 px-4' onClick={() => navigate('/')}>
								İptal Et
							</Button>
							<Button variant='primary' size='lg' type='submit'>
								Tüm Bilgileri Kaydet
							</Button>
						</div>
					</Form>
				</Card.Body>
			</Card>
		</Container>
	);
};

export default PersonelEkle;
