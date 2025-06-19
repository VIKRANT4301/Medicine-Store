import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Row, Col, Modal, Pagination } from 'react-bootstrap';
import '../styles/custom.css';

function CustomerComponent() {
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    fname: '',
    lname: '',
    address: '',
    phn_no: '',
    email: ''
  });
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCustomerId, setEditCustomerId] = useState(null);

  // For sorting and pagination
  const [sortConfig, setSortConfig] = useState({ key: 'fname', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(5); // Items per page

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch all customers when the component mounts
  useEffect(() => {
    axios.get('http://localhost:8000/pharma/api/customers/')
      .then(response => {
        setCustomers(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the customers!', error);
      });
  }, []);

  const handleInputChange = (e) => {
    setNewCustomer({
      ...newCustomer,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      axios.put(`http://localhost:8000/pharma/api/customers/${editCustomerId}/`, newCustomer)
        .then(response => {
          const updatedCustomers = customers.map(customer =>
            customer.id === editCustomerId ? response.data : customer
          );
          setCustomers(updatedCustomers);
          resetForm();
        })
        .catch(error => {
          console.error('There was an error updating the customer!', error);
        });
    } else {
      axios.post('http://localhost:8000/pharma/api/customers/', newCustomer)
        .then(response => {
          setCustomers([...customers, response.data]);
          resetForm();
        })
        .catch(error => {
          console.error('There was an error adding the customer!', error);
        });
    }
  };

  const resetForm = () => {
    setNewCustomer({
      fname: '',
      lname: '',
      address: '',
      phn_no: '',
      email: ''
    });
    setShowAddCustomer(false);
    setIsEditing(false);
    setEditCustomerId(null);
  };

  const handleEdit = (customer) => {
    setIsEditing(true);
    setShowAddCustomer(true);
    setEditCustomerId(customer.id);
    setNewCustomer({
      fname: customer.fname,
      lname: customer.lname,
      address: customer.address,
      phn_no: customer.phn_no,
      email: customer.email
    });
  };

  const handleDelete = (customerId) => {
    axios.delete(`http://localhost:8000/pharma/api/customers/${customerId}/`)
      .then(() => {
        setCustomers(customers.filter(customer => customer.id !== customerId));
      })
      .catch(error => {
        console.error('There was an error deleting the customer!', error);
      });
  };

  const handleViewCustomersConfirm = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmViewCustomers = () => {
    setShowConfirmModal(false);
    setShowAddCustomer(false);
  };

  const handleCancelViewCustomers = () => {
    setShowConfirmModal(false);
  };

  // Sorting Functionality
  const sortCustomers = (customers, config) => {
    const sortedCustomers = [...customers];
    sortedCustomers.sort((a, b) => {
      if (a[config.key] < b[config.key]) {
        return config.direction === 'asc' ? -1 : 1;
      }
      if (a[config.key] > b[config.key]) {
        return config.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortedCustomers;
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Pagination logic
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = sortCustomers(customers, sortConfig).slice(indexOfFirstCustomer, indexOfLastCustomer);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(customers.length / customersPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div>
      <h2>Customers</h2>

      <div className="mb-3">
        <Button variant="primary" onClick={() => setShowAddCustomer(true)}>Add Customer</Button>
        {' '}
        <Button variant="secondary" onClick={handleViewCustomersConfirm}>View Customers</Button>
      </div>

      <Modal show={showConfirmModal} onHide={handleCancelViewCustomers}>
        <Modal.Header closeButton>
          <Modal.Title>View Customers</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to view the customers list?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelViewCustomers}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirmViewCustomers}>Yes, View Customers</Button>
        </Modal.Footer>
      </Modal>

      {showAddCustomer && (
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control type="text" name="fname" placeholder="First Name" value={newCustomer.fname} onChange={handleInputChange} required />
            </Col>
            <Col md={6}>
              <Form.Control type="text" name="lname" placeholder="Last Name" value={newCustomer.lname} onChange={handleInputChange} required />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control type="text" name="address" placeholder="Address" value={newCustomer.address} onChange={handleInputChange} required />
            </Col>
            <Col md={6}>
              <Form.Control type="text" name="phn_no" placeholder="Phone" value={newCustomer.phn_no} onChange={handleInputChange} required />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control type="email" name="email" placeholder="Email" value={newCustomer.email} onChange={handleInputChange} required />
            </Col>
          </Row>
          <Button type="submit" variant="primary">{isEditing ? 'Update Customer' : 'Add Customer'}</Button>
        </Form>
      )}

      {!showAddCustomer && (
        <Table striped bordered hover responsive className="mt-4">
          <thead>
            <tr>
              <th onClick={() => requestSort('fname')}>First Name</th>
              <th onClick={() => requestSort('lname')}>Last Name</th>
              <th onClick={() => requestSort('address')}>Address</th>
              <th onClick={() => requestSort('phn_no')}>Phone Number</th>
              <th onClick={() => requestSort('email')}>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentCustomers.length > 0 ? (
              currentCustomers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.fname}</td>
                  <td>{customer.lname}</td>
                  <td>{customer.address}</td>
                  <td>{customer.phn_no}</td>
                  <td>{customer.email}</td>
                  <td>
                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(customer)}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(customer.id)}>Delete</Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">No Customers Available</td>
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

export default CustomerComponent;
