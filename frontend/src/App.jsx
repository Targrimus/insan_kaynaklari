import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppNavbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages - Şimdilik oluşturulacaklar (İmport ediyoruz)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PersonelEkle from './pages/PersonelEkle';
import PersonelGuncelle from './pages/PersonelGuncelle';

function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<AppNavbar />
				<div className='container-fluid mt-4 px-4'>
					<Routes>
						<Route path='/login' element={<Login />} />

						{/* Protected Routes - Sadece giriş yapanlar görebilir */}
						<Route
							path='/'
							element={
								<ProtectedRoute>
									<Dashboard />
								</ProtectedRoute>
							}
						/>
						<Route
							path='/personel-ekle'
							element={
								<ProtectedRoute>
									<PersonelEkle />
								</ProtectedRoute>
							}
						/>
						<Route
							path='/personel-guncelle/:id'
							element={
								<ProtectedRoute>
									<PersonelGuncelle />
								</ProtectedRoute>
							}
						/>

						{/* Bilinmeyen rotaları anasayfaya yönlendir */}
						<Route path='*' element={<Navigate to='/' replace />} />
					</Routes>
				</div>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
