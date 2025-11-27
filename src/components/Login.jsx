import React, { useEffect, useState } from 'react';
import img from '../assets/imagen.png';
import { login } from '../api/users';

export const Login = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [user, setUser] = useState({ email: '', password: '' });

  const getlogin = async () => {
    try {
      const resp = await login(user);
      console.log('Login exitoso');

      // El token ya está en la cookie, solo guardar info del usuario
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: resp.id,
          name: resp.user,
          email: resp.email,
          rol: resp.rol,
        })
      );

      // Redirigir
      /*  navigate('/dashboard'); */
    } catch (error) {
      console.error('Error en login');

      // Mostrar el mensaje del backend
      const mensaje =
        error.response?.data?.mensaje || 'Error al iniciar sesión';
      alert(mensaje);
    }
  };

  const handeleUser = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    console.log('Usuario actualizado:', user);
  }, [user]);

  return (
    <div className="login-container">
      <div className="login-layout">
        <div className="login-content-wrapper">
          {/* COLUMNA IZQUIERDA - INFO E IMAGEN */}
          <div className="login-left-column">
            <div className="login-image-container">
              <img src={img} alt="Wellness" className="login-image" />
            </div>
            <h1 className="login-title">Bienvenidos a Don Asdruba</h1>
            <p className="login-description">
              Líderes en la Región en asesoramiento en pulverizaciones agrícolas
              - Cooperando para una producción sustentable.
            </p>

            <footer className="login-footer">
              <p className="login-footer-text">© 2025 Derechos Reservados.</p>
            </footer>
          </div>

          {/* COLUMNA DERECHA - FORMULARIO */}
          <div className="login-right-column">
            {/* TABS */}
            <div className="login-tabs-wrapper">
              <div className="login-tabs">
                <button
                  className={`login-tab ${
                    activeTab === 'signin' ? 'login-tab-active' : ''
                  }`}
                  onClick={() => setActiveTab('signin')}
                >
                  <p className="login-tab-text">Sign In</p>
                </button>
                <button
                  className={`login-tab ${
                    activeTab === 'signup' ? 'login-tab-active' : ''
                  }`}
                  onClick={() => setActiveTab('signup')}
                >
                  <p className="login-tab-text">Sign Up</p>
                </button>
              </div>
            </div>

            {/* INPUTS */}
            <div className="login-input-wrapper">
              <label className="login-label">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="login-input"
                  value={user.email}
                  onChange={handeleUser}
                />
              </label>
            </div>

            <div className="login-input-wrapper">
              <label className="login-label">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="login-input"
                  value={user.password}
                  onChange={handeleUser}
                  onKeyPress={(e) => e.key === 'Enter' && getlogin()}
                />
              </label>
            </div>

            <p className="login-forgot-password">Forgot password?</p>

            {/* BOTÓN */}
            <div className="login-button-wrapper">
              <button className="login-button" onClick={getlogin}>
                <span className="login-button-text">Sign In</span>
              </button>
            </div>

            <p className="login-signup-link">Don't have an account? Sign up</p>
          </div>
        </div>
      </div>
    </div>
  );
};
