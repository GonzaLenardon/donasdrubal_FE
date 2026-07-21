import React, { useEffect, useState } from 'react';
import { useParams, useOutlet, useNavigate, useLocation } from 'react-router-dom';
import { getCliente } from '../api/clientes.js';
import Pozos from './Pozos.jsx';
import Maquinas from './Maquinas.jsx';
import JornadasTable from './JornadasTable.jsx';
import ClienteDashboard from './Clientedashboard.jsx';
import { useCliente } from '../context/UserContext';

import {
  Building2,
  Phone,
  MapPin,
  Calendar,
  LayoutDashboard,
  Droplet,
  Tractor,
  Mail,
  FileText,
  Notebook,
  NotebookIcon,
} from 'lucide-react';
import ModalNotas from './ModalNotas.jsx';
import NotasCliente from './NotasClientes.jsx';

const ClienteDetalles = () => {
  const { cliente_id } = useParams();
  const [cliente, setCliente] = useState(null);

  const { activeTab, setActiveTab, setSelectedCliente } = useCliente();
  const outlet = useOutlet();
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    dataCliente();
    setActiveTab('dashboard');
  }, [cliente_id]);

  useEffect(() => {
    if (location.pathname.includes('/calibraciones')) {
      setActiveTab('maquinas');
    } else if (location.pathname.includes('/muestras')) {
      setActiveTab('pozos');
    }
  }, [location.pathname]);

  const dataCliente = async () => {
    try {
      const res = await getCliente(cliente_id);
      setCliente(res.data);
      setSelectedCliente(res.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  if (!cliente) {
    return (
      <div className="container_seccion">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: '400px' }}
        >
          <div className="spinner-border text-white" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  const clientBasePath = `/cliente/${cliente_id}`;

  const goToTab = (tab) => {
    setActiveTab(tab);
    if (location.pathname !== clientBasePath) {
      navigate(clientBasePath);
    }
  };

  return (
    <div className="container_seccion">
      {/* ================= TABS NAVIGATION ================= */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => goToTab('dashboard')}
        >
          <LayoutDashboard className="tab-icon" size={18} />
          <span>Dashboard</span>
        </button>

        <button
          className={`tab-button ${activeTab === 'pozos' ? 'active' : ''}`}
          onClick={() => goToTab('pozos')}
        >
          <Droplet className="tab-icon" size={18} />
          <span>Pozos</span>
        </button>

        <button
          className={`tab-button ${activeTab === 'maquinas' ? 'active' : ''}`}
          onClick={() => goToTab('maquinas')}
        >
          <Tractor className="tab-icon" size={18} />
          <span>Máquinas</span>
        </button>

        <button
          className={`tab-button ${activeTab === 'jornadas' ? 'active' : ''}`}
          onClick={() => goToTab('jornadas')}
        >
          <Calendar className="tab-icon" size={18} />
          <span>Jornadas</span>
        </button>

        <button
          className={`tab-button ${activeTab === 'notas' ? 'active' : ''}`}
          onClick={() => goToTab('notas')}
        >
          <NotebookIcon className="tab-icon" size={18} />

          <span>Notas</span>
        </button>
      </div>

      {/* ================= CONTENT AREA ================= */}
      <div className="tab-content-container">
        {/*
          Si hay una sub-ruta activa (calibraciones / muestras),
          renderiza el Outlet. Si no, muestra el tab correspondiente.
        */}
        {outlet ? (
          outlet
        ) : (
          <>
            {activeTab === 'dashboard' && (<ClienteDashboard cliente={cliente} />)}
            {activeTab === 'pozos' && <Pozos cliente_id={cliente_id} />}
            {activeTab === 'maquinas' && <Maquinas cliente_id={cliente_id} />}
            {activeTab === 'jornadas' && (<JornadasTable cliente_id={cliente_id} />)}
            {activeTab === 'notas' && (<NotasCliente clienteId={cliente_id} userId={user.id} />)}
          </>
        )}
      </div>
    </div>
  );
};

export default ClienteDetalles;
