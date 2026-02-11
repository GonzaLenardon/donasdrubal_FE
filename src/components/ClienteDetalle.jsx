import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  getCliente,  
  // getClienteStats,
  // getClienteServicesChart, 
  // getClienteMachinesChart, 
  // getClienteUpcomingServices 
} from '../api/clientes.js';
import Pozos from './Pozos.jsx';
import Maquinas from './Maquinas.jsx';
import JornadasTable from './JornadasTable.jsx';
import ClienteDashboard from './Clientedashboard_errorgranular.jsx';
import {
  Building2,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
} from 'lucide-react';


const ClienteDetalles = () => {
  const { cliente_id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'pozos' | 'maquinas' | 'jornadas' | 'dashboard'

  useEffect(() => {
    dataCliente();
  }, []);

  const dataCliente = async () => {
    try {
      const res = await getCliente(cliente_id);
      setCliente(res.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  if (!cliente) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="mx-auto max-w-7xl">
        {/* ================= HEADER MODERNIZADO ================= */}
<div className="cliente-header">
  <div className="cliente-header-bg"></div>

  <div className="cliente-header-content">
    <div className="cliente-header-top">
      <div className="cliente-header-icon">
        <Building2 />
      </div>

      <div className="cliente-header-title">
        <h1>{cliente?.razon_social}</h1>
        <p>Cliente activo desde {new Date().getFullYear() - 2}</p>
      </div>
    </div>

    <div className="cliente-info-grid">
      <div className="cliente-info-card">
        <div className="cliente-info-label">
          <Building2 size={18} />
          <span>Razón Social</span>
        </div>
        <p className="cliente-info-value">{cliente?.razon_social}</p>
      </div>

      <div className="cliente-info-card">
        <div className="cliente-info-label">
          <Phone size={18} />
          <span>Teléfono</span>
        </div>
        <p className="cliente-info-value">
          {cliente?.telefono || 'No especificado'}
        </p>
      </div>

      <div className="cliente-info-card">
        <div className="cliente-info-label">
          <MapPin size={18} />
          <span>Localidad</span>
        </div>
        <p className="cliente-info-value">
          {cliente?.localidad || 'Paraná, Entre Ríos'}
        </p>
      </div>
    </div>
  </div>
</div>



        {/* ================= TABS NAVIGATION ================= */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
              activeTab === 'dashboard'
                ? 'bg-[#4a7c1f] text-white shadow-md'
                : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>

          <button
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
              activeTab === 'pozos'
                ? 'bg-[#4a7c1f] text-white shadow-md'
                : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('pozos')}
          >
            💧 Pozos
          </button>

          <button
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
              activeTab === 'maquinas'
                ? 'bg-[#4a7c1f] text-white shadow-md'
                : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('maquinas')}
          >
            🚜 Máquinas
          </button>

          <button
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
              activeTab === 'jornadas'
                ? 'bg-[#4a7c1f] text-white shadow-md'
                : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('jornadas')}
          >
            🎓 Jornadas
          </button>
        </div>

        {/* ================= CONTENT AREA ================= */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {activeTab === 'dashboard' && <ClienteDashboard cliente={cliente} />}
          {activeTab === 'pozos' && <Pozos cliente_id={cliente_id} />}
          {activeTab === 'maquinas' && <Maquinas cliente_id={cliente_id} />}
          {activeTab === 'jornadas' && <JornadasTable cliente_id={cliente_id} />}
        </div>
      </div>
    </div>
  );
};

export default ClienteDetalles;