import React, { useState, useContext } from 'react';
import { Form, Button, Card, Container, Alert } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUserShield } from 'react-icons/fa';

const Login = () => {
	const [email, setEmail] = useState('');
	const [sifre, setSifre] = useState('');
	const [hata, setHata] = useState('');
	const [yukleniyor, setYukleniyor] = useState(false);

	const { login } = useContext(AuthContext);
	const navigate = useNavigate();

	const handleLogin = async (e) => {
		e.preventDefault();
		setHata('');
		setYukleniyor(true);

		const result = await login(email, sifre);
		if (result.success) {
			navigate('/');
		} else {
			setHata(result.message);
			setYukleniyor(false);
		}
	};

	return (
		<Container className='d-flex align-items-center justify-content-center' style={{ minHeight: '80vh' }}>
			<Card className='shadow-lg p-4' style={{ width: '400px', borderRadius: '15px' }}>
				<Card.Body>
					<div className='text-center mb-4'>
						<FaUserShield size={50} className='text-primary mb-3' />
						<Card.Title as='h3' className='fw-bold'>
							IK Yönetimi
						</Card.Title>
						<p className='text-muted'>Yetkili Girişi</p>
					</div>

					{hata && <Alert variant='danger'>{hata}</Alert>}

					<Form onSubmit={handleLogin}>
						<Form.Group className='mb-3'>
							<Form.Label>E-Posta Adresi</Form.Label>
							<Form.Control
								type='email'
								placeholder='ornek@sirket.com'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</Form.Group>

						<Form.Group className='mb-4'>
							<Form.Label>Şifre</Form.Label>
							<Form.Control
								type='password'
								placeholder='******'
								value={sifre}
								onChange={(e) => setSifre(e.target.value)}
								required
							/>
						</Form.Group>

						<Button variant='primary' type='submit' className='w-100 fw-bold' disabled={yukleniyor}>
							{yukleniyor ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
						</Button>
					</Form>
				</Card.Body>
			</Card>
		</Container>
	);
};

export default Login;
