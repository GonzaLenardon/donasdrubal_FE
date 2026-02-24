import { createContext, useContext, useState } from 'react';

// 1️⃣ Crear contexto
const UserContext = createContext();

// 2️⃣ Provider
export function UserProvider({ children }) {
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedMaquina, setSelectedMaquina] = useState(null);
  const [selectedPozo, setSelectedPozo] = useState(null);

  return (
    <UserContext.Provider
      value={{
        selectedCliente,
        setSelectedCliente,
        selectedMaquina,
        setSelectedMaquina,
        selectedPozo,
        setSelectedPozo,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useCliente() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser debe usarse dentro de UserProvider');
  }

  return context;
}
