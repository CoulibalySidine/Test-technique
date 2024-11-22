import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, TextField, FormControlLabel, Checkbox, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    type: '',
    price: 0,
    rating: 0,
    warranty_years: 0,
    available: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/products');
      setProducts(response.data);
    } catch (error) {
      setError('Impossible de récupérer les produits. Veuillez vérifier la connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.type || newProduct.price <= 0 || newProduct.rating < 0) {
      alert("Veuillez remplir tous les champs correctement.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/products', newProduct);
      setProducts([...products, response.data]);
      setNewProduct({
        name: '',
        type: '',
        price: 0,
        rating: 0,
        warranty_years: 0,
        available: false
      });
    } catch (error) {
      alert('Impossible d\'ajouter le produit. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (product) => {
    setLoading(true);
    try {
      const response = await axios.put(`/products/${product._id}`, product);
      setProducts(products.map(p => p._id === product._id ? response.data : p));
      setEditingProduct(null);
    } catch (error) {
      alert('Impossible de mettre à jour le produit. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    setLoading(true);
    try {
      await axios.delete(`/products/${productId}`);
      setProducts(products.filter(product => product._id !== productId));
    } catch (error) {
      alert('Impossible de supprimer le produit. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (product) => {
    setEditingProduct({ ...product });
  };

  const cancelEditing = () => {
    setEditingProduct(null);
  };

  return (
    <div className="App">
      <h1>Gestion des Produits</h1>

      {/* Loading and Error messages */}
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Prix</TableCell>
              <TableCell>Évaluation</TableCell>
              <TableCell>Années de Garantie</TableCell>
              <TableCell>Disponible</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map(product => (
              <TableRow key={product._id}>
                <TableCell>{product._id}</TableCell>
                <TableCell>{editingProduct && editingProduct._id === product._id ? 
                    <TextField name="name" value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} /> 
                    : product.name}</TableCell>
                <TableCell>{editingProduct && editingProduct._id === product._id ? 
                    <TextField name="type" value={editingProduct.type} onChange={e => setEditingProduct({ ...editingProduct, type: e.target.value })} /> 
                    : product.type}</TableCell>
                <TableCell>{editingProduct && editingProduct._id === product._id ? 
                    <TextField name="price" type="number" value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })} /> 
                    : product.price}</TableCell>
                <TableCell>{editingProduct && editingProduct._id === product._id ? 
                    <TextField name="rating" type="number" value={editingProduct.rating} onChange={e => setEditingProduct({ ...editingProduct, rating: parseFloat(e.target.value) })} /> 
                    : product.rating}</TableCell>
                <TableCell>{editingProduct && editingProduct._id === product._id ? 
                    <TextField name="warranty_years" type="number" value={editingProduct.warranty_years} onChange={e => setEditingProduct({ ...editingProduct, warranty_years: parseInt(e.target.value, 10) })} /> 
                    : product.warranty_years}</TableCell>
                <TableCell>{editingProduct && editingProduct._id === product._id ? 
                    <FormControlLabel 
                      control={<Checkbox checked={editingProduct.available} onChange={e => setEditingProduct({ ...editingProduct, available: e.target.checked })} />}
                      label="Disponible" 
                    />
                    : (product.available ? 'Oui' : 'Non')}</TableCell>
                <TableCell>
                  {editingProduct && editingProduct._id === product._id ? (
                    <>
                      <Button variant="contained" onClick={() => updateProduct(editingProduct)}>Enregistrer</Button>
                      <Button variant="outlined" onClick={cancelEditing}>Annuler</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outlined" onClick={() => startEditing(product)}>Modifier</Button>
                      <Button variant="outlined" color="error" onClick={() => deleteProduct(product._id)}>Supprimer</Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div>
      <h2>Ajouter un Nouveau Produit</h2>
      <Box display="flex" flexDirection="column" gap={2}>
        {/* Champ Nom */}
        <TextField
          label="Nom"
          name="name"
          value={newProduct.name}
          onChange={handleInputChange}
          fullWidth
        />

        {/* Champ Type */}
        <TextField
          label="Type"
          name="type"
          value={newProduct.type}
          onChange={handleInputChange}
          fullWidth
        />

        {/* Champ Prix */}
        <TextField
          label="Prix"
          name="price"
          type="number"
          value={newProduct.price}
          onChange={handleInputChange}
          fullWidth
        />

        {/* Champ Évaluation */}
        <TextField
          label="Évaluation"
          name="rating"
          type="number"
          value={newProduct.rating}
          onChange={handleInputChange}
          fullWidth
        />

        {/* Champ Années de Garantie */}
        <TextField
          label="Années de Garantie"
          name="warranty_years"
          type="number"
          value={newProduct.warranty_years}
          onChange={handleInputChange}
          fullWidth
        />

        {/* Case à cocher - Disponible */}
        <FormControlLabel
          control={<Checkbox checked={newProduct.available} onChange={handleInputChange} name="available" />}
          label="Disponible"
        />

        {/* Bouton Ajouter */}
        <Button variant="contained" color="primary" onClick={addProduct} disabled={loading}>
          <FontAwesomeIcon icon={faPlusCircle} style={{ marginRight: '8px' }} />
          Ajouter
        </Button>
      </Box>
    </div>
    </div>
  );
}

export default App;
