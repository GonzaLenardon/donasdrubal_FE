import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ModalMaquinas } from './ModalMaquinas.jsx';
import { getCliente } from '../api/clientes.js';
import Pozos from './Pozos.jsx';
import Maquinas from './Maquinas.jsx';
import JornadasCards from './JornadasCards.jsx';
import JornadasTable from './JornadasTable.jsx';  

const ClienteDetalles = () => {
  const { cliente_id } = useParams();

  const [cliente, setCliente] = useState();

  console.log('UserDetalles', cliente_id);

  useEffect(() => {
    dataCliente();
  }, []);

  useEffect(() => {}, []);

  const dataCliente = async () => {
    try {
      console.log('paso x aca');
      const res = await getCliente(cliente_id);
      setCliente(res.data);
      console.log('cliente', res);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      <div className="container-view">
        {cliente && (
          <div className="container-datos">
            <div className="datos-user">
              <div className="user-name">{cliente.razon_social}</div>
              <span>{cliente.email}</span>
              <span>{cliente.telefono}</span>
            </div>
          </div>
        )}
      </div>

      <Maquinas cliente_id={cliente_id} />
      <Pozos cliente_id={cliente_id} />
      {/* <JornadasCards cliente_id={cliente_id} /> */}
      <JornadasTable cliente_id={cliente_id} />
    </>
  );
};

export default ClienteDetalles;
