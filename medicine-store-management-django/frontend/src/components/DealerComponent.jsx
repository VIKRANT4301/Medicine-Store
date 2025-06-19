import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Row, Col, Modal, Pagination } from 'react-bootstrap';



function DealerComponent() {
  const [dealers, setDealers] = useState([]);
  const [newDealer, setNewDealer] = useState({
    dname: '',
    address: '',
    phn_no: '',
    email: ''
  });
  const [showAddDealer, setShowAddDealer] = useState(false); 
  const [isEditing, setIsEditing] = useState(false); 
  const [editDealerId, setEditDealerId] = useState(null);
  
  // For sorting and pagination
  const [sortConfig, setSortConfig] = useState({ key: 'dname', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [dealersPerPage] = useState(5); // Items per page
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch all dealers when the component mounts
  useEffect(() => {
    axios.get('http://localhost:8000/pharma/api/dealers/')
      .then(response => {
        setDealers(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the dealers!', error);
      });
  }, []);

  const handleInputChange = (e) => {
    setNewDealer({
      ...newDealer,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      axios.put(`http://localhost:8000/pharma/api/dealers/${editDealerId}/`, newDealer)
        .then(response => {
          const updatedDealers = dealers.map(dealer =>
            dealer.id === editDealerId ? response.data : dealer
          );
          setDealers(updatedDealers);
          resetForm();
        })
        .catch(error => {
          console.error('There was an error updating the dealer!', error);
        });
    } else {
      axios.post('http://localhost:8000/pharma/api/dealers/', newDealer)
        .then(response => {
          setDealers([...dealers, response.data]);
          resetForm();
        })
        .catch(error => {
          console.error('There was an error adding the dealer!', error);
        });
    }
  };

  const resetForm = () => {
    setNewDealer({ dname: '', address: '', phn_no: '', email: '' });
    setShowAddDealer(false);
    setIsEditing(false);
    setEditDealerId(null);
  };

  const handleEdit = (dealer) => {
    setIsEditing(true);
    setShowAddDealer(true);
    setEditDealerId(dealer.id);
    setNewDealer({
      dname: dealer.dname,
      address: dealer.address,
      phn_no: dealer.phn_no,
      email: dealer.email
    });
  };

  const handleDelete = (dealerId) => {
    axios.delete(`http://localhost:8000/pharma/api/dealers/${dealerId}/`)
      .then(() => {
        setDealers(dealers.filter(dealer => dealer.id !== dealerId));
      })
      .catch(error => {
        console.error('There was an error deleting the dealer!', error);
      });
  };

  const handleViewDealersConfirm = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmViewDealers = () => {
    setShowConfirmModal(false);
    setShowAddDealer(false);
  };

  const handleCancelViewDealers = () => {
    setShowConfirmModal(false);
  };

  // Sorting Functionality
  const sortDealers = (dealers, config) => {
    const sortedDealers = [...dealers];
    sortedDealers.sort((a, b) => {
      if (a[config.key] < b[config.key]) {
        return config.direction === 'asc' ? -1 : 1;
      }
      if (a[config.key] > b[config.key]) {
        return config.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortedDealers;
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Pagination logic
  const indexOfLastDealer = currentPage * dealersPerPage;
  const indexOfFirstDealer = indexOfLastDealer - dealersPerPage;
  const currentDealers = sortDealers(dealers, sortConfig).slice(indexOfFirstDealer, indexOfLastDealer);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(dealers.length / dealersPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div>
      <h2>Dealers</h2>

      <div className="mb-3">
        <Button variant="primary" onClick={() => setShowAddDealer(true)}>Add Dealer</Button>
        {' '}
        <Button variant="secondary" onClick={handleViewDealersConfirm}>View Dealers</Button>
      </div>

      <Modal show={showConfirmModal} onHide={handleCancelViewDealers}>
        <Modal.Header closeButton>
          <Modal.Title>View Dealers</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to view the dealers list?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelViewDealers}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirmViewDealers}>Yes, View Dealers</Button>
        </Modal.Footer>
      </Modal>

      {showAddDealer && (
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control type="text" name="dname" placeholder="Name" value={newDealer.dname} onChange={handleInputChange} required />
            </Col>
            <Col md={6}>
              <Form.Control type="text" name="address" placeholder="Address" value={newDealer.address} onChange={handleInputChange} required />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control type="text" name="phn_no" placeholder="Phone" value={newDealer.phn_no} onChange={handleInputChange} required />
            </Col>
            <Col md={6}>
              <Form.Control type="email" name="email" placeholder="Email" value={newDealer.email} onChange={handleInputChange} required />
            </Col>
          </Row>
          <Button type="submit" variant="primary">{isEditing ? 'Update Dealer' : 'Add Dealer'}</Button>
        </Form>
      )}

      {!showAddDealer && (
        <Table striped bordered hover responsive className="mt-4">
          <thead>
            <tr>
              <th onClick={() => requestSort('dname')}>Name</th>
              <th onClick={() => requestSort('address')}>Address</th>
              <th onClick={() => requestSort('phn_no')}>Phone</th>
              <th onClick={() => requestSort('email')}>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentDealers.length > 0 ? (
              currentDealers.map(dealer => (
                <tr key={dealer.id}>
                  <td>{dealer.dname}</td>
                  <td>{dealer.address}</td>
                  <td>{dealer.phn_no}</td>
                  <td>{dealer.email}</td>
                  <td>
                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(dealer)}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(dealer.id)}>Delete</Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">No Dealers Available</td>
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

export default DealerComponent;
