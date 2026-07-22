import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Plus, 
  FileSpreadsheet, 
  Upload, 
  Pencil, 
  Trash2, 
  X, 
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Filter,
  ShieldAlert
} from 'lucide-react';

export const Elementos = () => {
  const { user, isAdmin } = useAuth();

  // Estados de datos
  const [elementos, setElementos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  // Estados de búsqueda y filtrado
  const [buscar, setBuscar] = useState('');
  const [categoria, setCategoria] = useState('');

  // Modales
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalImportar, setModalImportar] = useState(false);
  const [elementoSeleccionado, setElementoEditar] = useState(null);

  // Formularios
  const [formData, setFormData] = useState({
    codigoBarras: '',
    nombre: '',
    descripcion: '',
    categoria: '',
    precio: '',
    imagen: null
  });

  const [archivoExcel, setArchivoExcel] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  // Categorías fijas de ejemplo
  const categoriasBase = ['Equipos de Cómputo', 'Mobiliario', 'Herramientas', 'Redes', 'General'];

  // Cargar elementos desde el Backend
  const cargarElementos = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (buscar.trim()) params.buscar = buscar.trim();
      if (categoria) params.categoria = categoria;

      const response = await api.get('/elementos', { params });
      setElementos(response.data);
    } catch (err) {
      setError('Error al obtener el catálogo de elementos desde el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarElementos();
  }, [categoria]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    cargarElementos();
  };

  // Limpiar formularios
  const resetForm = () => {
    setFormData({
      codigoBarras: '',
      nombre: '',
      descripcion: '',
      categoria: '',
      precio: '',
      imagen: null
    });
    setElementoEditar(null);
  };

  // Comprobar si el usuario actual es dueño del registro o Administrador
  const puedeModificar = (item) => {
    if (isAdmin()) return true;
    return item.usuarioIdPropietario === user?.id;
  };

  // --- CREAR ELEMENTO ---
  const handleCrearSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensajeExito('');
    setSubiendo(true);

    try {
      const payload = new FormData();
      payload.append('codigoBarras', formData.codigoBarras);
      payload.append('nombre', formData.nombre);
      payload.append('descripcion', formData.descripcion || '');
      payload.append('categoria', formData.categoria);
      payload.append('precio', formData.precio);
      if (formData.imagen) {
        payload.append('imagen', formData.imagen);
      }

      await api.post('/elementos', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMensajeExito('Elemento registrado con éxito en el inventario.');
      setModalCrear(false);
      resetForm();
      cargarElementos();
    } catch (err) {
      if (err.response?.status === 409) {
        setError('El código de barras ya se encuentra registrado en el sistema.');
      } else {
        setError(err.response?.data?.message || 'Error al guardar el nuevo elemento.');
      }
    } finally {
      setSubiendo(false);
    }
  };

  // --- EDITAR ELEMENTO ---
  const abrirModalEditar = (item) => {
    setElementoEditar(item);
    setFormData({
      codigoBarras: item.codigoBarras || '',
      nombre: item.nombre || '',
      descripcion: item.descripcion || '',
      categoria: item.categoria || '',
      precio: item.precio || '',
      imagen: null
    });
    setModalEditar(true);
  };

  const handleEditarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensajeExito('');
    setSubiendo(true);

    try {
      const updateData = {
        id: elementoSeleccionado.id,
        codigoBarras: formData.codigoBarras,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        precio: parseFloat(formData.precio),
        rutaImagen: elementoSeleccionado.rutaImagen || '',
        usuarioIdPropietario: elementoSeleccionado.usuarioIdPropietario
      };

      await api.put(`/elementos/${elementoSeleccionado.id}`, updateData);

      setMensajeExito('Elemento actualizado correctamente.');
      setModalEditar(false);
      resetForm();
      cargarElementos();
    } catch (err) {
      if (err.response?.status === 403) {
        setError('No tienes permisos de propiedad ni de administrador para modificar este elemento.');
      } else {
        setError(err.response?.data?.message || 'Error al actualizar el elemento.');
      }
    } finally {
      setSubiendo(false);
    }
  };

  // --- ELIMINAR ELEMENTO ---
  const handleEliminar = async (item) => {
    if (!window.confirm(`¿Estás seguro de eliminar el elemento "${item.nombre}"?`)) return;

    setError('');
    setMensajeExito('');

    try {
      await api.delete(`/elementos/${item.id}`);
      setMensajeExito('Elemento eliminado del inventario.');
      cargarElementos();
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Acceso denegado: Solo el propietario o un Administrador pueden eliminar este bien.');
      } else {
        setError('Error al intentar eliminar el elemento.');
      }
    }
  };

  // --- EXPORTAR A EXCEL ---
  const handleExportarExcel = async () => {
    try {
      const params = {};
      if (buscar.trim()) params.buscar = buscar.trim();

      const response = await api.get('/elementos/exportar', {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Inventario_Bienes_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Ocurrió un error al generar y descargar el archivo Excel.');
    }
  };

  // --- IMPORTAR DESDE EXCEL ---
  const handleImportarSubmit = async (e) => {
    e.preventDefault();
    if (!archivoExcel) {
      setError('Por favor seleccione un archivo Excel (.xlsx) o CSV.');
      return;
    }

    setError('');
    setMensajeExito('');
    setSubiendo(true);

    try {
      const payload = new FormData();
      payload.append('archivo', archivoExcel);

      await api.post('/elementos/importar', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMensajeExito('Carga masiva procesada e importada con éxito.');
      setModalImportar(false);
      setArchivoExcel(null);
      cargarElementos();
    } catch (err) {
      setError(err.response?.data?.message || 'El archivo cargado contiene errores de formato o códigos duplicados.');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Catálogo de Elementos</h1>
          <p className="text-slate-400 text-sm mt-1">Gestión maestro de activos físicos del sistema</p>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportarExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/20 font-semibold rounded-xl text-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={() => setModalImportar(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Importar Masivo</span>
          </button>

          <button
            onClick={() => { resetForm(); setModalCrear(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Elemento</span>
          </button>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between text-red-400 text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}

      {mensajeExito && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-emerald-400 text-sm">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{mensajeExito}</span>
          </div>
          <button onClick={() => setMensajeExito('')} className="text-emerald-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
          <input
            type="text"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar por nombre o código de barras..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-all"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider shrink-0">
            <Filter className="w-4 h-4" />
            <span>Categoría:</span>
          </div>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full md:w-56 py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-all"
          >
            <option value="">Todas las Categorías</option>
            {categoriasBase.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Cargando catálogo de bienes...</span>
          </div>
        ) : elementos.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No se encontraron elementos registrados con los filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Imagen</th>
                  <th className="py-3.5 px-4">Código de Barras</th>
                  <th className="py-3.5 px-4">Nombre</th>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4">Precio</th>
                  <th className="py-3.5 px-4 text-center">Permisos</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {elementos.map((item) => {
                  const editable = puedeModificar(item);
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        {item.rutaImagen ? (
                          <img
                            src={`http://localhost:5051${item.rutaImagen}`}
                            alt={item.nombre}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-700 bg-slate-950"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-indigo-400">{item.codigoBarras}</td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {item.nombre}
                        {item.descripcion && (
                          <p className="text-xs text-slate-500 font-normal truncate max-w-xs">{item.descripcion}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs">
                          {item.categoria}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-400">
                        ${typeof item.precio === 'number' ? item.precio.toFixed(2) : item.precio}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {editable ? (
                          <span className="inline-flex items-center text-xs text-emerald-400 font-medium">Propietario / Admin</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500" title="Solo lectura">
                            <ShieldAlert className="w-3.5 h-3.5" /> Lectura
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => abrirModalEditar(item)}
                            disabled={!editable}
                            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                            title={editable ? "Editar Elemento" : "No eres propietario de este bien"}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEliminar(item)}
                            disabled={!editable}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                            title={editable ? "Eliminar Elemento" : "No eres propietario de este bien"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL CREAR ELEMENTO --- */}
      {modalCrear && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white">Nuevo Elemento</h3>
              <button onClick={() => setModalCrear(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCrearSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Código de Barras *</label>
                <input
                  type="text"
                  required
                  value={formData.codigoBarras}
                  onChange={(e) => setFormData({ ...formData, codigoBarras: e.target.value })}
                  placeholder="Ej: 7861001234567"
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Laptop HP ProBook"
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Categoría *</label>
                  <select
                    required
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Seleccionar...</option>
                    {categoriasBase.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Precio ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    placeholder="0.00"
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Detalles adicionales del bien..."
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Imagen del Activo (Opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, imagen: e.target.files[0] })}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-indigo-400 hover:file:bg-slate-700"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalCrear(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 font-semibold rounded-xl text-sm hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={subiendo}
                  className="px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-500 disabled:opacity-50"
                >
                  {subiendo ? 'Guardando...' : 'Guardar Elemento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL EDITAR ELEMENTO --- */}
      {modalEditar && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white">Editar Elemento</h3>
              <button onClick={() => setModalEditar(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleEditarSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Código de Barras *</label>
                <input
                  type="text"
                  required
                  value={formData.codigoBarras}
                  onChange={(e) => setFormData({ ...formData, codigoBarras: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Categoría *</label>
                  <select
                    required
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {categoriasBase.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Precio ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalEditar(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 font-semibold rounded-xl text-sm hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={subiendo}
                  className="px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-500 disabled:opacity-50"
                >
                  {subiendo ? 'Actualizando...' : 'Actualizar Elemento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL IMPORTAR EXCEL --- */}
      {modalImportar && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white">Importar Lote Excel</h3>
              <button onClick={() => setModalImportar(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleImportarSubmit} className="space-y-4">
              <div className="p-4 border-2 border-dashed border-slate-800 rounded-2xl text-center bg-slate-950/50">
                <FileSpreadsheet className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-3">Selecciona un archivo .xlsx o .csv estructurado</p>
                <input
                  type="file"
                  accept=".xlsx, .csv"
                  required
                  onChange={(e) => setArchivoExcel(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalImportar(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 font-semibold rounded-xl text-sm hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={subiendo}
                  className="px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl text-sm hover:bg-emerald-500 disabled:opacity-50"
                >
                  {subiendo ? 'Procesando...' : 'Iniciar Carga'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};