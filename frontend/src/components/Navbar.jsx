import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const AppNavbar = () => {
	const { user, logout } = useContext(AuthContext);
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	if (!user) return null; // Kullanıcı giriş yapmadıysa navbarı gösterme

	return (
		<Navbar bg='primary' variant='dark' expand='lg' className='mb-4 shadow-sm'>
			<Container fluid className='px-4'>
				<Navbar.Brand as={Link} to='/' className='fw-bold'>
					IK Yönetimi PRO
				</Navbar.Brand>
				<Navbar.Toggle aria-controls='basic-navbar-nav' />
				<Navbar.Collapse id='basic-navbar-nav'>
					<Nav className='me-auto'>
						<Nav.Link as={Link} to='/'>
							Dashboard
						</Nav.Link>
						<Nav.Link as={Link} to='/personel-ekle'>
							Personel Ekle
						</Nav.Link>
					</Nav>
					<Nav className='align-items-center'>
						<Navbar.Text className='text-white me-3 d-flex align-items-center gap-2'>
							<FaUserCircle size={20} />
							{user.adSoyad || 'Kullanıcı'} ({user.rol})
						</Navbar.Text>
						<Button
							variant='outline-light'
							size='sm'
							onClick={handleLogout}
							className='d-flex align-items-center gap-2'>
							<FaSignOutAlt /> Çıkış
						</Button>
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};

export default AppNavbar;
