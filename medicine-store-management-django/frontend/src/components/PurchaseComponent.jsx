import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Row, Col, Modal, Pagination } from 'react-bootstrap';
import '../styles/custom.css';

function PurchaseComponent() {
  const [purchases, setPurchases] = useState([]);
  const [newPurchase, setNewPurchase] = useState({
    pname: '',
    fname: '',
    lname: '',
    phn_no: '',
    price: '',
    qty: '',
    total: '',
    is_heart_lungs_patient: false // New field to track heart/lungs patient status
  });
  const [showAddPurchase, setShowAddPurchase] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editPurchaseId, setEditPurchaseId] = useState(null);

  // For sorting and pagination
  const [sortConfig, setSortConfig] = useState({ key: 'pname', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [purchasesPerPage] = useState(5); // Items per page

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch all purchases when the component mounts
  useEffect(() => {
    axios.get('http://localhost:8000/pharma/api/purchases/')
      .then(response => {
        setPurchases(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the purchases!', error);
      });
  }, []);

  // Handle input change and update total dynamically
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedPurchase = {
      ...newPurchase,
      [name]: type === 'checkbox' ? checked : value
    };

    // If price or quantity changes, recalculate the total
    if (name === 'price' || name === 'qty') {
      updatedPurchase.total = (updatedPurchase.price && updatedPurchase.qty)
        ? (parseFloat(updatedPurchase.price) * parseInt(updatedPurchase.qty)).toFixed(2)
        : '';
    }

    setNewPurchase(updatedPurchase);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      axios.put(`http://localhost:8000/pharma/api/purchases/${editPurchaseId}/`, newPurchase)
        .then(response => {
          const updatedPurchases = purchases.map(purchase =>
            purchase.id === editPurchaseId ? response.data : purchase
          );
          setPurchases(updatedPurchases);
          resetForm();
        })
        .catch(error => {
          console.error('There was an error updating the purchase!', error);
        });
    } else {
      axios.post('http://localhost:8000/pharma/api/purchases/', newPurchase)
        .then(response => {
          setPurchases([...purchases, response.data]);
          resetForm();
        })
        .catch(error => {
          console.error('There was an error adding the purchase!', error);
        });
    }
  };

  const resetForm = () => {
    setNewPurchase({
      pname: '',
      fname: '',
      lname: '',
      phn_no: '',
      price: '',
      qty: '',
      total: '',
      is_heart_lungs_patient: false
    });
    setShowAddPurchase(false);
    setIsEditing(false);
    setEditPurchaseId(null);
  };

  const handleEdit = (purchase) => {
    setIsEditing(true);
    setShowAddPurchase(true);
    setEditPurchaseId(purchase.id);
    setNewPurchase({
      pname: purchase.pname,
      fname: purchase.fname,
      lname: purchase.lname,
      phn_no: purchase.phn_no,
      price: purchase.price,
      qty: purchase.qty,
      total: purchase.total,
      is_heart_lungs_patient: purchase.is_heart_lungs_patient // Load heart/lungs status
    });
  };

  const handleDelete = (purchaseId) => {
    axios.delete(`http://localhost:8000/pharma/api/purchases/${purchaseId}/`)
      .then(() => {
        setPurchases(purchases.filter(purchase => purchase.id !== purchaseId));
      })
      .catch(error => {
        console.error('There was an error deleting the purchase!', error);
      });
  };

  const handleViewPurchasesConfirm = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmViewPurchases = () => {
    setShowConfirmModal(false);
    setShowAddPurchase(false);
  };

  const handleCancelViewPurchases = () => {
    setShowConfirmModal(false);
  };

  // Sorting Functionality
  const sortPurchases = (purchases, config) => {
    const sortedPurchases = [...purchases];
    sortedPurchases.sort((a, b) => {
      if (a[config.key] < b[config.key]) {
        return config.direction === 'asc' ? -1 : 1;
      }
      if (a[config.key] > b[config.key]) {
        return config.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortedPurchases;
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Pagination logic
  const indexOfLastPurchase = currentPage * purchasesPerPage;
  const indexOfFirstPurchase = indexOfLastPurchase - purchasesPerPage;
  const currentPurchases = sortPurchases(purchases, sortConfig).slice(indexOfFirstPurchase, indexOfLastPurchase);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(purchases.length / purchasesPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div>
      <h2>Purchases</h2>

      <div className="mb-3">
        <Button variant="primary" onClick={() => setShowAddPurchase(true)}>Add Purchase</Button>
        {' '}
        <Button variant="secondary" onClick={handleViewPurchasesConfirm}>View Purchases</Button>
      </div>

      <Modal show={showConfirmModal} onHide={handleCancelViewPurchases}>
        <Modal.Header closeButton>
          <Modal.Title>View Purchases</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to view the purchases list?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelViewPurchases}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirmViewPurchases}>Yes, View Purchases</Button>
        </Modal.Footer>
      </Modal>

      {showAddPurchase && (
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control type="text" name="pname" placeholder="Purchase Name" value={newPurchase.pname} onChange={handleInputChange} required />
            </Col>
            <Col md={6}>
              <Form.Control type="text" name="fname" placeholder="First Name" value={newPurchase.fname} onChange={handleInputChange} required />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control type="text" name="lname" placeholder="Last Name" value={newPurchase.lname} onChange={handleInputChange} required />
            </Col>
            <Col md={6}>
              <Form.Control type="text" name="phn_no" placeholder="Phone Number" value={newPurchase.phn_no} onChange={handleInputChange} required />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control type="number" name="price" placeholder="Price" value={newPurchase.price} onChange={handleInputChange} required />
            </Col>
            <Col md={6}>
              <Form.Control type="number" name="qty" placeholder="Quantity" value={newPurchase.qty} onChange={handleInputChange} required />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control type="number" name="total" placeholder="Total" value={newPurchase.total} readOnly />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Check
                type="checkbox"
                name="is_heart_lungs_patient"
                label="Heart/Lung Patient"
                checked={newPurchase.is_heart_lungs_patient}
                onChange={handleInputChange}
              />
            </Col>
          </Row>
          <Button type="submit" variant="primary">{isEditing ? 'Update Purchase' : 'Add Purchase'}</Button>
        </Form>
      )}

      {!showAddPurchase && (
        <Table striped bordered hover responsive className="mt-4">
          <thead>
            <tr>
              <th onClick={() => requestSort('pname')}>Purchase Name</th>
              <th onClick={() => requestSort('fname')}>First Name</th>
              <th onClick={() => requestSort('lname')}>Last Name</th>
              <th onClick={() => requestSort('phn_no')}>Phone Number</th>
              <th onClick={() => requestSort('price')}>Price</th>
              <th onClick={() => requestSort('qty')}>Quantity</th>
              <th onClick={() => requestSort('total')}>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPurchases.length > 0 ? (
              currentPurchases.map(purchase => (
                <tr key={purchase.id}>
                  <td>{purchase.pname}</td>
                  <td>{purchase.fname}</td>
                  <td>{purchase.lname}</td>
                  <td>{purchase.phn_no}</td>
                  <td>{purchase.price}</td>
                  <td>{purchase.qty}</td>
                  <td>{purchase.total}</td>
                  <td>
                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(purchase)}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(purchase.id)}>Delete</Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">No Purchases Available</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* Pagination */}
      <Pagination>
        {pageNumbers.map(number => (
          <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
            {number}
          </Pagination.Item>
        ))}
      </Pagination>
    </div>
  );
}

export default PurchaseComponent;
