import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCliente } from '../api/clientes.js';
import Pozos from './Pozos.jsx';
import Maquinas from './Maquinas.jsx';
import JornadasCards from './JornadasCards.jsx';
import JornadasTable from './JornadasTable.jsx';  

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
    <div className="container mt-4">
      {/* ================= DATOS CLIENTE ================= */}
      <div className="card mb-4" style={{ backgroundColor: '#1e293b' }}>
        <div className="card-body">
          <h4 className="fw-bold mb-1 fs-2 text-white">
            {cliente.razon_social}
          </h4>
          <p className="mb-0 text-info">{cliente.email}</p>
          <p className="mb-0 text-info">{cliente.telefono}</p>
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
      </div>

      {/* ================= CONTENIDO ================= */}
      <div>
        {activeTab === 'pozos' && <Pozos cliente_id={cliente_id} />}
        {activeTab === 'maquinas' && <Maquinas cliente_id={cliente_id} />}
      </div>
    </div>
  );
};

export default ClienteDetalles;
