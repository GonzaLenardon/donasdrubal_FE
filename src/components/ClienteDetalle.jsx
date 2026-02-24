import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCliente } from '../api/clientes.js';
import Pozos from './Pozos.jsx';
import Maquinas from './Maquinas.jsx';
import JornadasTable from './JornadasTable.jsx';
import ClienteDashboard from './Clientedashboard_errorgranular.jsx';

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
} from 'lucide-react';

const ClienteDetalles = () => {
  const { cliente_id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    dataCliente();
  }, [cliente_id]);

  const dataCliente = async () => {
    try {
      const res = await getCliente(cliente_id);
      setCliente(res.data);
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

  return (
    <div className="container_seccion">
      {/* ================= HEADER DEL CLIENTE ================= */}
      {/*  <div className="cliente-header">
        <div className="cliente-header-bg"></div>

        <div className="cliente-header-content">
          <div className="cliente-header-top">
          
            <div className="cliente-header-main">
              <div className="cliente-header-icon">
                <Building2 size={28} />
              </div>
              <div className="cliente-header-title">
                <h1>{cliente?.razon_social}</h1>
                <p>
                  <FileText
                    size={14}
                    style={{ display: 'inline-block', marginRight: '0.25rem' }}
                  />
                  CUIT: {cliente?.cuil_cuit || 'No especificado'}
                </p>
              </div>
            </div>

           
            <div className="cliente-info-inline">
              <div className="cliente-info-item">
                <Phone size={16} />
                <div className="cliente-info-text">
                  <span className="cliente-info-label">Teléfono</span>
                  <span className="cliente-info-value">
                    {cliente?.telefono || 'No especificado'}
                  </span>
                </div>
              </div>

              <div className="cliente-info-item">
                <Mail size={16} />
                <div className="cliente-info-text">
                  <span className="cliente-info-label">Email</span>
                  <span className="cliente-info-value">
                    {cliente?.email || 'No especificado'}
                  </span>
                </div>
              </div>

              <div className="cliente-info-item">
                <MapPin size={16} />
                <div className="cliente-info-text">
                  <span className="cliente-info-label">Ubicación</span>
                  <span className="cliente-info-value">
                    {cliente?.ciudad || 'No especificado'},{' '}
                    {cliente?.provincia || ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
 */}
      {/* ================= TABS NAVIGATION ================= */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard className="tab-icon" size={18} />
          <span>Dashboard</span>
        </button>

        <button
          className={`tab-button ${activeTab === 'pozos' ? 'active' : ''}`}
          onClick={() => setActiveTab('pozos')}
        >
          <Droplet className="tab-icon" size={18} />
          <span>Pozos</span>
        </button>

        <button
          className={`tab-button ${activeTab === 'maquinas' ? 'active' : ''}`}
          onClick={() => setActiveTab('maquinas')}
        >
          <Tractor className="tab-icon" size={18} />
          <span>Máquinas</span>
        </button>

        <button
          className={`tab-button ${activeTab === 'jornadas' ? 'active' : ''}`}
          onClick={() => setActiveTab('jornadas')}
        >
          <Calendar className="tab-icon" size={18} />
          <span>Jornadas</span>
        </button>
      </div>

      {/* ================= CONTENT AREA ================= */}
      <div className="tab-content-container">
        {activeTab === 'dashboard' && <ClienteDashboard cliente={cliente} />}
        {activeTab === 'pozos' && <Pozos cliente_id={cliente_id} />}
        {activeTab === 'maquinas' && <Maquinas cliente_id={cliente_id} />}
        {activeTab === 'jornadas' && <JornadasTable cliente_id={cliente_id} />}
      </div>
    </div>
  );
};

export default ClienteDetalles;
