import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { allWarehouses } from '../api/depositos';
import { allIngenieros } from '../api/users';
import RemitosFaltantesPanel from './RemitosFaltantesPanel';
import Spinner from './Spinner';
import '../css/page-header.css';

const InformeRemitosFaltantes = () => {
  const [depositos, setDepositos] = useState([]);
  const [ingenieros, setIngenieros] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = JSON.parse(localStorage.getItem('user'))?.rol === 'Administrador';

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [depositosRes, ingenierosRes] = await Promise.all([
          allWarehouses(),
          isAdmin ? allIngenieros() : Promise.resolve(null),
        ]);
        setDepositos(depositosRes.data ?? []);
        setIngenieros(ingenierosRes?.data ?? []);
      } catch (error) {
        console.error('Error al cargar datos del informe de remitos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [isAdmin]);

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
            Saltos en la numeración de remitos por depósito
          </p>
        </div>
      </div>

      <RemitosFaltantesPanel depositos={depositos} ingenieros={ingenieros} />
    </div>
  );
};

export default InformeRemitosFaltantes;
