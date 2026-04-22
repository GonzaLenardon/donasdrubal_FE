import React, { useEffect, useState } from 'react';
import { login } from '../api/users';
import { useNavigate } from 'react-router-dom';
import Spinner from './Spinner';
import { handleApiError } from '../utils/handleApiError';

export const Login = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [user, setUser] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const getlogin = async () => {
    try {
      const resp = await login(user);
      console.log('REspuesta Login', resp);

      localStorage.setItem(
        'user',
        JSON.stringify({ id: resp.id, email: resp.email, rol: resp.rol }),
      );

      setLoading(true);
      setMsg(`Hola ${resp.email}`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setLoading(false);
      setMsg('');
      navigate('/', { replace: true });
    } catch (error) {
      console.log('Erororororoorororo', error);

      const mensaje = handleApiError(error);
      console.log('Daooooooooooooooooooooooooooooooo', mensaje);

      setLoading(true);
      setMsg(mensaje);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } finally {
      setMsg('');
      setLoading(false);
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
    <>
      <div className="login-container">
        {/* ── Imagen fullscreen de fondo ── */}
        <div className="login-image-container"></div>

        {/* ── Contenido sobre la imagen ── */}
        <div className="login-layout">
          {/* Textos izquierda */}
          <div className="login-left-column">
            <div className="login-left-badge">
              <span className="login-left-badge-dot" />
              <p className="login-left-badge-text">Plataforma Agrícola</p>
            </div>

            <h1 className="login-title">
              Bienvenidos a<br />
              Don Asdrúbal
            </h1>

            <p className="login-description">
              Líderes en la Región en asesoramiento en pulverizaciones agrícolas
              — Cooperando para una producción sustentable.
            </p>

            <div className="login-stats">
              <div>
                <p className="login-stat-value">+500</p>
                <p className="login-stat-label">Clientes</p>
              </div>
              <div>
                <p className="login-stat-value">+12</p>
                <p className="login-stat-label">Años</p>
              </div>
              <div>
                <p className="login-stat-value">100%</p>
                <p className="login-stat-label">Trazable</p>
              </div>
            </div>

            <footer className="login-footer">
              <p className="login-footer-text">© 2026 Derechos Reservados.</p>
            </footer>
          </div>

          {/* Formulario derecha — fundido */}
          <div className="login-right-column">
            <h2 className="login-heading">Iniciar sesión</h2>
            <p className="login-subheading">
              Ingresá tus credenciales para continuar
            </p>

            <div className="login-tabs-wrapper">
              <div className="login-tabs">
                <button
                  className={`login-tab ${activeTab === 'signin' ? 'login-tab-active' : ''}`}
                  onClick={() => setActiveTab('signin')}
                >
                  <p>Sign In</p>
                </button>
                <button
                  className={`login-tab ${activeTab === 'signup' ? 'login-tab-active' : ''}`}
                  onClick={() => setActiveTab('signup')}
                >
                  <p>Sign Up</p>
                </button>
              </div>
            </div>

            <div className="login-input-wrapper">
              <label className="login-label">
                <span className="login-label-text">Email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="usuario@empresa.com"
                  className="login-input"
                  value={user.email}
                  onChange={handeleUser}
                />
              </label>
            </div>

            <div className="login-input-wrapper">
              <label className="login-label">
                <span className="login-label-text">Contraseña</span>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="login-input"
                  value={user.password}
                  onChange={handeleUser}
                  onKeyDown={(e) => e.key === 'Enter' && getlogin()}
                />
              </label>
            </div>

            <p className="login-forgot-password">¿Olvidaste tu contraseña?</p>

            <div className="login-button-wrapper">
              <button className="login-button" onClick={getlogin}>
                <span className="login-button-text">Ingresar</span>
              </button>
            </div>

            <p className="login-signup-link">¿No tenés cuenta? Sign up</p>
          </div>
        </div>
      </div>

      <Spinner msg={msg} loading={loading} />
    </>
  );
};
