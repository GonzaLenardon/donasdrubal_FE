import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { allRemitos } from '../api/remitos';
import { allWarehouses } from '../api/depositos';
import { allCliente } from '../api/clientes';
import { allIngenieros } from '../api/users';
import RemitosFaltantesPanel from './RemitosFaltantesPanel';
import Spinner from './Spinner';
import '../css/page-header.css';

const InformeRemitosFaltantes = () => {
  const [remitos, setRemitos] = useState([]);
  const [depositos, setDepositos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [ingenieros, setIngenieros] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = JSON.parse(localStorage.getItem('user'))?.rol === 'Administrador';

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [remitosRes, depositosRes, clientesRes, ingenierosRes] =
          await Promise.all([
            allRemitos(),
            allWarehouses(),
            allCliente(),
            isAdmin ? allIngenieros() : Promise.resolve(null),
          ]);
        setRemitos(remitosRes.data ?? []);
        setDepositos(depositosRes.data ?? []);
        setClientes(clientesRes.data ?? []);
        setIngenieros(ingenierosRes?.data ?? []);
      } catch (error) {
        console.error('Error al cargar datos de remitos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [isAdmin]);

  const depositosConNumeracion = useMemo(
    () => new Set(remitos.map((remito) => remito.origin_warehouse_id)).size,
    [remitos],
  );

  if (loading) return <Spinner />;

  return (
    <div className="remitos py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="page-header__title">
            <AlertTriangle size={22} className="page-header__icon" />
            Faltantes de Remitos
          </h2>
          <p className="page-header__subtitle">
            Saltos en la numeración de remitos por depósito ·{' '}
            {remitos.length} remitos en {depositosConNumeracion} depósitos
          </p>
        </div>
      </div>

      <RemitosFaltantesPanel
        remitos={remitos}
        depositos={depositos}
        clientes={clientes}
        ingenieros={ingenieros}
      />
    </div>
  );
};

export default InformeRemitosFaltantes;
