import { useState, useEffect } from 'react';
import { Modal, Button, Form, Table, InputGroup, Badge } from 'react-bootstrap';
import { getFullRankings, addRanking, deleteRanking } from '../api/rankings';

const ModalRankings = ({ onClose }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRanked, setFilterRanked] = useState('all');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const res = await getFullRankings();
      setData(res.data);
    } catch (error) {
      console.error('Error al cargar rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRankingChange = async (productId, presentationId, newRanking, rankingId) => {
    try {
      setSaving(true);
      if (newRanking === 0 && rankingId) {
        await deleteRanking(rankingId);
      } else if (newRanking > 0) {
        if (rankingId) {
          const ranking = data.find((d) => d.ranking_id === rankingId);
          if (ranking) {
            ranking.ranking = newRanking;
            setData([...data]);
          }
        }
        await addRanking({ product_id: productId, product_presentation_id: presentationId, ranking: newRanking });
      }

      setData((prev) =>
        prev.map((item) => {
          if (item.product_id === productId && item.presentation_id === presentationId) {
            return {
              ...item,
              ranking: newRanking,
              ranking_id: newRanking > 0 ? item.ranking_id || 'new' : null,
            };
          }
          return item;
        }),
      );

      await cargarDatos();
    } catch (error) {
      console.error('Error al guardar ranking:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderStars = (rank, productId, presentationId, rankingId) => {
    return [...Array(5)].map((_, i) => (
      <i
        key={i}
        className={`bi ${i < rank ? 'bi-star-fill' : 'bi-star'} text-warning me-1`}
        style={{ cursor: 'pointer', fontSize: '1.2rem' }}
        onClick={() => handleRankingChange(productId, presentationId, i + 1, rankingId)}
      ></i>
    ));
  };

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.product_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_codigo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterRanked === 'all' ||
      (filterRanked === 'ranked' && item.ranking > 0) ||
      (filterRanked === 'unranked' && item.ranking === 0) ||
      (filterRanked === 'favorites' && item.ranking === 5);
    return matchesSearch && matchesFilter;
  });

  const groupedData = filteredData.reduce((acc, item) => {
    if (!acc[item.product_id]) {
      acc[item.product_id] = {
        product_id: item.product_id,
        product_nombre: item.product_nombre,
        product_codigo: item.product_codigo,
        product_imagen: item.product_imagen,
        presentations: [],
      };
    }
    acc[item.product_id].presentations.push(item);
    return acc;
  }, {});

  const groupedList = Object.values(groupedData);

  return (
    <Modal show onHide={onClose} centered size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Gestionar Rankings de Productos</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex gap-2 align-items-center">
            <Form.Control
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '250px' }}
            />
            <Form.Select
              value={filterRanked}
              onChange={(e) => setFilterRanked(e.target.value)}
              style={{ width: '180px' }}
            >
              <option value="all">Todos</option>
              <option value="ranked">Con ranking</option>
              <option value="unranked">Sin ranking</option>
              <option value="favorites">Favoritos (5)</option>
            </Form.Select>
          </div>
          <div className="d-flex align-items-center gap-2">
            {saving && <small className="text-muted">Guardando...</small>}
            <small className="text-muted">
              {filteredData.length} combinaciones
            </small>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-4">Cargando...</p>
        ) : groupedList.length === 0 ? (
          <p className="text-center text-muted py-4">No hay productos para mostrar</p>
        ) : (
          <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <Table hover bordered striped size="sm">
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
                <tr>
                  <th style={{ width: '300px' }}>Producto</th>
                  <th style={{ width: '200px' }}>Presentación</th>
                  <th className="text-center">Ranking</th>
                </tr>
              </thead>
              <tbody>
                {groupedList.map((product) =>
                  product.presentations.map((pres, idx) => (
                    <tr key={`${product.product_id}_${pres.presentation_id}`}>
                      {idx === 0 && (
                        <td rowSpan={product.presentations.length}>
                          <div className="d-flex align-items-center gap-2">
                            {product.product_imagen && (
                              <img
                                src={product.product_imagen}
                                alt={product.product_nombre}
                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                              />
                            )}
                            <div>
                              <strong>{product.product_nombre}</strong>
                              <br />
                              <small className="text-muted">{product.product_codigo}</small>
                            </div>
                          </div>
                        </td>
                      )}
                      <td>{pres.presentation_nombre}</td>
                      <td className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          {renderStars(pres.ranking, pres.product_id, pres.presentation_id, pres.ranking_id)}
                          <Badge bg={pres.ranking === 5 ? 'warning' : pres.ranking > 0 ? 'info' : 'secondary'}>
                            {pres.ranking}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </Table>
          </div>
        )}

        <div className="mt-3 p-3 bg-light rounded">
          <small className="text-muted">
            <strong>Cómo usar:</strong> Haga clic en las estrellas para asignar un ranking de 1 a 5.
            Los productos con ranking 5 aparecerán como favoritos en el catálogo de remitos.
            Click en la misma estrella del ranking actual lo elimina (vuelve a 0).
          </small>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRankings;
