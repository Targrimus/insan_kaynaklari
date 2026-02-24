import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Card, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const Dashboard = () => {
	const [personeller, setPersoneller] = useState([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	const fetchPersoneller = async () => {
		try {
			const res = await axios.get('http://localhost:5000/api/personel');
			setPersoneller(res.data);
			setLoading(false);
		} catch (error) {
			console.error('Personel çekilirken hata:', error);
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPersoneller();
	}, []);

	const handleDelete = async (id) => {
		if (window.confirm('Bu personeli silmek istediğinize emin misiniz?')) {
			try {
				await axios.delete(`http://localhost:5000/api/personel/${id}`);
				setPersoneller(personeller.filter((p) => p._id !== id));
			} catch (error) {
				alert('Silme işlemi başarısız!');
				console.error(error);
			}
		}
	};

	if (loading) {
		return (
			<div className='text-center mt-5'>
				<Spinner animation='border' />
			</div>
		);
	}

	return (
		<Container fluid>
			<Card className='shadow-sm border-0'>
				<Card.Header className='bg-white d-flex justify-content-between align-items-center py-3'>
					<h4 className='mb-0 fw-bold text-primary'>Personel Listesi</h4>
					<Button
						variant='success'
						onClick={() => navigate('/personel-ekle')}
						className='d-flex align-items-center gap-2'>
						<FaPlus /> Yeni Personel Ekle
					</Button>
				</Card.Header>
				<Card.Body>
					<Table responsive hover className='align-middle'>
						<thead className='table-light'>
							<tr>
								<th>Ad Soyad</th>
								<th>TC Kimlik No</th>
								<th>İşyeri Sicil No</th>
								<th>Unvan / Departman</th>
								<th>Durum</th>
								<th className='text-end'>İşlemler</th>
							</tr>
						</thead>
						<tbody>
							{personeller.length === 0 ? (
								<tr>
									<td colSpan='6' className='text-center text-muted py-4'>
										Kayıtlı personel bulunamadı.
									</td>
								</tr>
							) : (
								personeller.map((personel) => (
									<tr key={personel._id}>
										<td className='fw-bold'>
											{personel.ad} {personel.soyad}
										</td>
										<td>{personel.tcKimlikNo}</td>
										<td>{personel.sicilNo}</td>
										<td>
											<div>{personel.unvani || 'Belirtilmemiş'}</div>
											<small className='text-muted'>{personel.gorevAldigiSube || '-'}</small>
										</td>
										<td>
											{!personel.istenCikisTarihi ? (
												<Badge bg='success'>Aktif Çalışan</Badge>
											) : (
												<Badge bg='danger'>İşten Ayrılmış</Badge>
											)}
										</td>
										<td className='text-end'>
											<Button
												variant='outline-primary'
												size='sm'
												className='me-2'
												onClick={() => navigate(`/personel-guncelle/${personel._id}`)}>
												<FaEdit />
											</Button>
											<Button
												variant='outline-danger'
												size='sm'
												onClick={() => handleDelete(personel._id)}>
												<FaTrash />
											</Button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</Table>
				</Card.Body>
			</Card>
		</Container>
	);
};

export default Dashboard;
