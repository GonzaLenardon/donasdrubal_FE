import React from 'react';
import { useEffect, useState } from 'react';
import StatsRow from './StatsRow';
import ServicesRow from './ServiceRow';
import ChartsRow from './ChartsRow';
import { useCliente } from '../context/UserContext';
import { allCliente } from '../api/clientes';
import {
  allServices,
  machinesToClients,
  serviceToClients,
} from '../api/dashUser';

const Dash = () => {
  const { setSelectedCliente } = useCliente();
  const [clienteList, setClienteList] = useState(null);
  const [clienteIds, setClienteIds] = useState([]);
  const [service, setService] = useState(null);
  const [machines, setMachines] = useState(null);
  const [all, setAll] = useState(null);

  useEffect(() => {
    /*  setSelectedCliente(); */
    getAllCliente();
  }, []);

  useEffect(() => {
    if (clienteIds.length > 0) {
      fetchMachines();
      fetchServices();
      fetchAllService();
    }
  }, [clienteIds]);

  const getAllCliente = async () => {
    try {
      const resp = await allCliente();
      console.log('clientes', resp.data);
      setClienteIds(resp.data.map((cliente) => cliente.id));
      setClienteList(resp.data);
    } catch (error) {
      console.error('Error al traer los Clientes:', error.data);
    }
  };

  const fetchServices = async () => {
    try {
      const resp = await serviceToClients(clienteIds);
      console.log('clientes', resp.data);
      setService(resp.data);
    } catch (error) {
      console.error('Error al traer los Servicios:', error.data);
    }
  };

  const fetchMachines = async () => {
    try {
      const resp = await machinesToClients(clienteIds);
      console.log('clientes', resp.data);
      setMachines(resp.data);
    } catch (error) {
      console.error('Error al traer las Machines:', error.data);
    }
  };

  const fetchAllService = async () => {
    try {
      const resp = await allServices(clienteIds);
      console.log('clientes', resp.data);
      setAll(resp.data);
    } catch (error) {
      console.error('Error al traer las Machines:', error.data);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Page Heading */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-text-light dark:text-text-dark text-3xl font-black leading-tight tracking-tight">
          Dashboard cccc
        </h1>
      </div>
      {/*  <StatsRow /> <ChartsRow /> <ServicesRow /> */}

      <StatsRow></StatsRow>
      <ChartsRow></ChartsRow>
      <ServicesRow></ServicesRow>
    </div>
  );
};

export default Dash;
