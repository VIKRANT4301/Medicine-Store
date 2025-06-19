import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Row, Col, Modal, Pagination } from 'react-bootstrap';
import '../styles/custom.css';

function MedicineComponent() {
  const [medicines, setMedicines] = useState([]);
  const [newMedicine, setNewMedicine] = useState({
    m_id: '',
    mname: '',
    dname: '',
    desc: '',
    price: '',
    stock: ''
  });
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editMedicineId, setEditMedicineId] = useState(null);

  // For sorting and pagination
  const [sortConfig, setSortConfig] = useState({ key: 'mname', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [medicinesPerPage] = useState(5); // Items per page

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch all medicines when the component mounts
  useEffect(() => {
    axios.get('http://localhost:8000/pharma/api/medicines/')
      .then(response => {
        setMedicines(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the medicines!', error);
      });
  }, []);

  const handleInputChange = (e) => {
    setNewMedicine({
      ...newMedicine,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      axios.put(`http://localhost:8000/pharma/api/medicines/${editMedicineId}/`, newMedicine)
        .then(response => {
          const updatedMedicines = medicines.map(medicine =>
            medicine.id === editMedicineId ? response.data : medicine
          );
          setMedicines(updatedMedicines);
          resetForm();
        })
        .catch(error => {
          console.error('There was an error updating the medicine!', error);
        });
    } else {
      axios.post('http://localhost:8000/pharma/api/medicines/', newMedicine)
        .then(response => {
          setMedicines([...medicines, response.data]);
          resetForm();
        })
        .catch(error => {
          console.error('There was an error adding the medicine!', error);
        });
    }
  };

  const resetForm = () => {
    setNewMedicine({
      m_id: '',
      mname: '',
      dname: '',
      desc: '',
      price: '',
      stock: ''
    });
    setShowAddMedicine(false);
    setIsEditing(false);
    setEditMedicineId(null);
  };

  const handleEdit = (medicine) => {
    setIsEditing(true);
    setShowAddMedicine(true);
    setEditMedicineId(medicine.id);
    setNewMedicine({
      m_id: medicine.m_id,
      mname: medicine.mname,
      dname: medicine.dname,
      desc: medicine.desc,
      price: medicine.price,
      stock: medicine.stock
    });
  };

  const handleDelete = (medicineId) => {
    axios.delete(`http://localhost:8000/pharma/api/medicines/${medicineId}/`)
      .then(() => {
        setMedicines(medicines.filter(medicine => medicine.id !== medicineId));
      })
      .catch(error => {
        console.error('There was an error deleting the medicine!', error);
      });
  };

  const handleViewMedicinesConfirm = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmViewMedicines = () => {
    setShowConfirmModal(false);
    setShowAddMedicine(false);
  };

  const handleCancelViewMedicines = () => {
    setShowConfirmModal(false);
  };

  // Sorting Functionality
  const sortMedicines = (medicines, config) => {
    const sortedMedicines = [...medicines];
    sortedMedicines.sort((a, b) => {
      if (a[config.key] < b[config.key]) {
        return config.direction === 'asc' ? -1 : 1;
      }
      if (a[config.key] > b[config.key]) {
        return config.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortedMedicines;
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Pagination logic
  const indexOfLastMedicine = currentPage * medicinesPerPage;
  const indexOfFirstMedicine = indexOfLastMedicine - medicinesPerPage;
  const currentMedicines = sortMedicines(medicines, sortConfig).slice(indexOfFirstMedicine, indexOfLastMedicine);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(medicines.length / medicinesPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div>
      <h2>Medicines</h2>

      <div className="mb-3">
        <Button variant="primary" onClick={() => setShowAddMedicine(true)}>Add Medicine</Button>
        {' '}
        <Button variant="secondary" onClick={handleViewMedicinesConfirm}>View Medicines</Button>
      </div>

      <Modal show={showConfirmModal} onHide={handleCancelViewMedicines}>
        <Modal.Header closeButton>
          <Modal.Title>View Medicines</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to view the medicines list?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelViewMedicines}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirmViewMedicines}>Yes, View Medicines</Button>
        </Modal.Footer>
      </Modal>

      {showAddMedicine && (
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control type="text" name="m_id" placeholder="Medicine ID" value={newMedicine.m_id} onChange={handleInputChange} required />
            </Col>
            <Col md={6}>
              <Form.Control type="text" name="mname" placeholder="Medicine Name" value={newMedicine.mname} onChange={handleInputChange} required />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control type="text" name="dname" placeholder="Doctor Name" value={newMedicine.dname} onChange={handleInputChange} required />
            </Col>
            <Col md={6}>
              <Form.Control type="text" name="desc" placeholder="Description" value={newMedicine.desc} onChange={handleInputChange} required />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control type="text" name="price" placeholder="Price" value={newMedicine.price} onChange={handleInputChange} required />
            </Col>
            <Col md={6}>
              <Form.Control type="number" name="stock" placeholder="Stock" value={newMedicine.stock} onChange={handleInputChange} required />
            </Col>
          </Row>
          <Button type="submit" variant="primary">{isEditing ? 'Update Medicine' : 'Add Medicine'}</Button>
        </Form>
      )}

      {!showAddMedicine && (
        <Table striped bordered hover responsive className="mt-4">
          <thead>
            <tr>
              <th onClick={() => requestSort('mname')}>Medicine Name</th>
              <th onClick={() => requestSort('dname')}>Doctor Name</th>
              <th onClick={() => requestSort('desc')}>Description</th>
              <th onClick={() => requestSort('price')}>Price</th>
              <th onClick={() => requestSort('stock')}>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentMedicines.length > 0 ? (
              currentMedicines.map(medicine => (
                <tr key={medicine.id}>
                  <td>{medicine.mname}</td>
                  <td>{medicine.dname}</td>
                  <td>{medicine.desc}</td>
                  <td>{medicine.price}</td>
                  <td>{medicine.stock}</td>
                  <td>
                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(medicine)}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(medicine.id)}>Delete</Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">No Medicines Available</td>
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

export default MedicineComponent;
