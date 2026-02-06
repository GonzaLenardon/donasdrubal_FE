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
        <div className="relative mb-8 rounded-2xl overflow-hidden bg-gradient-to-r from-[#2d5016] to-[#4a7c1f] shadow-xl">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          </div>

          <div className="relative z-10 p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {cliente?.razon_social}
                </h1>
                <p className="text-white/80 text-sm">
                  Cliente activo desde {new Date().getFullYear() - 2}
                </p>
              </div>
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="text-white/80" size={18} />
                  <p className="text-xs text-white/70 uppercase tracking-wider font-semibold">
                    Razón Social
                  </p>
                </div>
                <p className="text-white font-semibold text-lg">
                  {cliente?.razon_social}
                </p>
              </div>

              <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Phone className="text-white/80" size={18} />
                  <p className="text-xs text-white/70 uppercase tracking-wider font-semibold">
                    Teléfono
                  </p>
                </div>
                <p className="text-white font-semibold text-lg">
                  {cliente?.telefono || 'No especificado'}
                </p>
              </div>

              <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="text-white/80" size={18} />
                  <p className="text-xs text-white/70 uppercase tracking-wider font-semibold">
                    Localidad
                  </p>
                </div>
                <p className="text-white font-semibold text-lg">
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