import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCliente } from '../api/clientes.js';
import Pozos from './Pozos.jsx';
import Maquinas from './Maquinas.jsx';
import JornadasCards from './JornadasCards.jsx';
import JornadasTable from './JornadasTable.jsx';
import {
  Building2,
  Wrench,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Plus,
  MoreVertical,
  FileText,
} from 'lucide-react';

const ClienteDetalles = () => {
  const { cliente_id } = useParams();

  const [cliente, setCliente] = useState(null);
  const [activeTab, setActiveTab] = useState('pozos'); // 'pozos' | 'maquinas'

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">     
          {/* HEADER REDISEÑADO */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Card Cliente */}
            {/*      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"> */}
            <div className="card_calibracion">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-white mb-3">
                    Información del Cliente
                  </h2>
                  <div className="space-y-1">
                    <div className="d-flex gap-5">
                      <p className="text-md w-25">Razón Social</p>
                      <p className="text-base font-xl  font-bold">
                        {cliente?.razon_social}
                      </p>
                    </div>
                    <div className="d-flex gap-5">
                      <p className="text-md w-25">Teléfono</p>
                      <p className="text-base font-lx  font-bold">
                        {cliente?.telefono}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

      {/* ================= TABS ================= */}
      <div className="d-flex gap-2 mb-3">
        <button
          className={`btn ${
            activeTab === 'pozos' ? 'btn-primary' : 'btn-outline-primary'
          }`}
          onClick={() => setActiveTab('pozos')}
        >
          Pozos
        </button>

        <button
          className={`btn ${
            activeTab === 'maquinas' ? 'btn-primary' : 'btn-outline-primary'
          }`}
          onClick={() => setActiveTab('maquinas')}
        >
          Máquinas
        </button>
        <button
          className={`btn ${
            activeTab === 'jornadas' ? 'btn-primary' : 'btn-outline-primary'
          }`}
          onClick={() => setActiveTab('jornadas')}
        >
          Jornadas
        </button>
      </div>

      {/* ================= CONTENIDO ================= */}
      <div>
        {activeTab === 'pozos' && <Pozos cliente_id={cliente_id} />}
        {activeTab === 'maquinas' && <Maquinas cliente_id={cliente_id} />}
        {activeTab === 'jornadas' && <JornadasTable cliente_id={cliente_id} />}
      </div>
    
      </div>
    </div>
  );
};

export default ClienteDetalles;
