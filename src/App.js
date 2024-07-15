
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Form, Button } from 'react-bootstrap';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import axios from 'axios';
// import './customStyles.css';

const App = () => {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    axios.get('/data/data.json')
      .then(response => {
        setCustomers(response.data.customers);
        setTransactions(response.data.transactions);
        setFilteredTransactions(response.data.transactions);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const handleCustomerChange = (event) => {
    const customerId = parseInt(event.target.value, 10);
    setSelectedCustomer(customerId);
    setFilterText('');
    setSelectedDate(null);
    if (!customerId) {
      setFilteredTransactions(transactions);
    } else {
      const customerTransactions = transactions.filter(transaction => transaction.customer_id === customerId);
      setFilteredTransactions(customerTransactions);
    }
  };

  const handleFilterChange = (event) => {
    const text = event.target.value;
    setFilterText(text);
    setSelectedCustomer(null);
    setSelectedDate(null);
    if (!text) {
      setFilteredTransactions(transactions);
    } else {
      const filtered = transactions.filter(transaction =>
        transaction.amount.toString().includes(text) ||
        customers.find(c => c.id === transaction.customer_id)?.name.includes(text)
      );
      setFilteredTransactions(filtered);
    }
  };

  const handleCustomerClick = (customerId) => {
    setSelectedCustomer(customerId);
    const customerTransactions = transactions.filter(transaction => transaction.customer_id === customerId);
    setFilteredTransactions(customerTransactions);
    setSelectedDate(null);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dateTransactions = transactions.filter(transaction => transaction.date === date);
    setFilteredTransactions(dateTransactions);
    setSelectedCustomer(null);
  };

  const handleResetForm = () => {
    setSelectedCustomer(null);
    setFilterText('');
    setSelectedDate(null);
    setFilteredTransactions(transactions);
  };

  const getTransactionData = () => {
    return filteredTransactions.map(transaction => ({
      date: transaction.date,
      amount: transaction.amount
    }));
  };

  return (
    <Container className="container">
      <Row className="my-4">
        <Col>
          <h1>Welcome to Customer Transactions Dashboard</h1>
          <p>Explore customer transactions and visualize data interactively.</p>
        </Col>
      </Row>
      <Row className="my-4">
        <Col md={4}>
          <Form>
            <Form.Group controlId="formSelectCustomer">
              <Form.Label className="form-label">Select a customer to display in the chart</Form.Label>
              <Form.Control as="select" onChange={handleCustomerChange} value={selectedCustomer || ''}>
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Col>
        <Col md={4}>
          <Form>
            <Form.Group controlId="formFilter">
              <Form.Label className="form-label">Filter by customer name or transaction amount</Form.Label>
              <Form.Control type="text" placeholder="Search..." onChange={handleFilterChange} value={filterText} />
            </Form.Group>
          </Form>
        </Col>
        <Col md={4}>
          <Form>
            <Form.Group controlId="formSelectDate">
              <Form.Label className="form-label">Select a date to filter transactions</Form.Label>
              <Form.Control as="select" onChange={(e) => handleDateClick(e.target.value)} value={selectedDate || ''}>
                <option value="">Select a date</option>
                {[...new Set(transactions.map(transaction => transaction.date))].map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button variant="secondary" onClick={handleResetForm} className="button-reset mb-3">Reset Form</Button>
          <Table striped bordered hover responsive="md" className="table table-striped table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer Name</th>
                <th>Transaction Date</th>
                <th>Transaction Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(transaction => {
                const customer = customers.find(c => c.id === transaction.customer_id);
                return (
                  <tr key={transaction.id} onClick={() => handleCustomerClick(transaction.customer_id)}>
                    <td>{transaction.id}</td>
                    <td>{customer ? customer.name : 'Unknown'}</td>
                    <td>{transaction.date}</td>
                    <td>{transaction.amount}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row className="my-4">
        <Col>
          <h2>Transaction Chart</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={getTransactionData()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
