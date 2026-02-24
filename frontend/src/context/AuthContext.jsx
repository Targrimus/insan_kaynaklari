import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) {
			try {
				const decoded = jwtDecode(token);
				// Token süresi dolmuş mu kontrol et (saniye cinsinden)
				if (decoded.exp * 1000 < Date.now()) {
					logout();
				} else {
					setUser(decoded.user);
					setAuthToken(token);
				}
			} catch (error) {
				console.error('Token decode hatası:', error);
				logout();
			}
		}
		setLoading(false);
	}, []);

	const login = async (email, sifre) => {
		try {
			const res = await axios.post('http://localhost:5000/api/auth/login', { email, sifre });
			localStorage.setItem('token', res.data.token);
			setUser(res.data.kullanici);
			setAuthToken(res.data.token);
			return { success: true };
		} catch (error) {
			return {
				success: false,
				message: error.response?.data?.mesaj || 'Giriş yapılamadı',
			};
		}
	};

	const logout = () => {
		localStorage.removeItem('token');
		setUser(null);
		setAuthToken(null);
	};

	return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
};

// Axios interceptor / default header ayarı
export const setAuthToken = (token) => {
	if (token) {
		axios.defaults.headers.common['x-auth-token'] = token;
	} else {
		delete axios.defaults.headers.common['x-auth-token'];
	}
};
