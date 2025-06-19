import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Row, Col, Modal, Pagination } from 'react-bootstrap';


function EmployeeComponent() {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    e_id: '',
    fname: '',
    lname: '',
    address: '',
    phn_no: '',
    email: '',
    sal: ''
  });
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editEmployeeId, setEditEmployeeId] = useState(null);

  // For sorting and pagination
  const [sortConfig, setSortConfig] = useState({ key: 'fname', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(5); // Items per page

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch all employees when the component mounts
  useEffect(() => {
    axios.get('http://localhost:8000/pharma/api/employees/')
      .then(response => {
        setEmployees(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the employees!', error);
      });
  }, []);

  const handleInputChange = (e) => {
    setNewEmployee({
      ...newEmployee,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      axios.put(`http://localhost:8000/pharma/api/employees/${editEmployeeId}/`, newEmployee)
        .then(response => {
          const updatedEmployees = employees.map(employee =>
            employee.id === editEmployeeId ? response.data : employee
          );
          setEmployees(updatedEmployees);
          resetForm();
        })
        .catch(error => {
          console.error('There was an error updating the employee!', error);
        });
    } else {
      axios.post('http://localhost:8000/pharma/api/employees/', newEmployee)
        .then(response => {
          setEmployees([...employees, response.data]);
          resetForm();
        })
        .catch(error => {
          console.error('There was an error adding the employee!', error);
        });
    }
  };

  const resetForm = () => {
    setNewEmployee({
      e_id: '',
      fname: '',
      lname: '',
      address: '',
      phn_no: '',
      email: '',
      sal: ''
    });
    setShowAddEmployee(false);
    setIsEditing(false);
    setEditEmployeeId(null);
  };

  const handleEdit = (employee) => {
    setIsEditing(true);
    setShowAddEmployee(true);
    setEditEmployeeId(employee.id);
    setNewEmployee({
      e_id: employee.e_id,
      fname: employee.fname,
      lname: employee.lname,
      address: employee.address,
      phn_no: employee.phn_no,
      email: employee.email,
      sal: employee.sal
    });
  };

  const handleDelete = (employeeId) => {
    axios.delete(`http://localhost:8000/pharma/api/employees/${employeeId}/`)
      .then(() => {
        setEmployees(employees.filter(employee => employee.id !== employeeId));
      })
      .catch(error => {
        console.error('There was an error deleting the employee!', error);
      });
  };

  const handleViewEmployeesConfirm = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmViewEmployees = () => {
    setShowConfirmModal(false);
    setShowAddEmployee(false);
  };

  const handleCancelViewEmployees = () => {
    setShowConfirmModal(false);
  };

  // Sorting Functionality
  const sortEmployees = (employees, config) => {
    const sortedEmployees = [...employees];
    sortedEmployees.sort((a, b) => {
      if (a[config.key] < b[config.key]) {
        return config.direction === 'asc' ? -1 : 1;
      }
      if (a[config.key] > b[config.key]) {
        return config.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortedEmployees;
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Pagination logic
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = sortEmployees(employees, sortConfig).slice(indexOfFirstEmployee, indexOfLastEmployee);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(employees.length / employeesPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div>
      <h2>Employees</h2>

      <div className="mb-3">
        <Button variant="primary" onClick={() => setShowAddEmployee(true)}>Add Employee</Button>
        {' '}
        <Button variant="secondary" onClick={handleViewEmployeesConfirm}>View Employees</Button>
      </div>

      <Modal show={showConfirmModal} onHide={handleCancelViewEmployees}>
        <Modal.Header closeButton>
          <Modal.Title>View Employees</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to view the employees list?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelViewEmployees}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirmViewEmployees}>Yes, View Employees</Button>
        </Modal.Footer>
      </Modal>

      {showAddEmployee && (
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control type="number" name="e_id" placeholder="Employee ID" value={newEmployee.e_id} onChange={handleInputChange} required />
            </Col>
            <Col md={6}>
              <Form.Control type="text" name="fname" placeholder="First Name" value={newEmployee.fname} onChange={handleInputChange} required />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control type="text" name="lname" placeholder="Last Name" value={newEmployee.lname} onChange={handleInputChange} required />
            </Col>
            <Col md={6}>
              <Form.Control type="text" name="address" placeholder="Address" value={newEmployee.address} onChange={handleInputChange} required />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control type="text" name="phn_no" placeholder="Phone" value={newEmployee.phn_no} onChange={handleInputChange} required />
            </Col>
            <Col md={6}>
              <Form.Control type="email" name="email" placeholder="Email" value={newEmployee.email} onChange={handleInputChange} required />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control type="text" name="sal" placeholder="Salary" value={newEmployee.sal} onChange={handleInputChange} required />
            </Col>
          </Row>
          <Button type="submit" variant="primary">{isEditing ? 'Update Employee' : 'Add Employee'}</Button>
        </Form>
      )}

      {!showAddEmployee && (
        <Table striped bordered hover responsive className="mt-4">
          <thead>
            <tr>
              <th onClick={() => requestSort('e_id')}>Employee ID</th>
              <th onClick={() => requestSort('fname')}>First Name</th>
              <th onClick={() => requestSort('lname')}>Last Name</th>
              <th onClick={() => requestSort('email')}>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.length > 0 ? (
              currentEmployees.map(employee => (
                <tr key={employee.id}>
                  <td>{employee.e_id}</td>
                  <td>{employee.fname}</td>
                  <td>{employee.lname}</td>
                  <td>{employee.email}</td>
                  <td>
                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(employee)}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(employee.id)}>Delete</Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">No Employees Available</td>
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

export default EmployeeComponent;
