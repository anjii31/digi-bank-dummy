import React, { useState } from 'react';

const initialContributions = [
  // Example data
  // { member: 'Asha', amount: 500, date: '2024-06-01' },
];

function GroupSavingsTracker() {
  const [contributions, setContributions] = useState(initialContributions);
  const [member, setMember] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!member || !amount || !date) {
      setError('Please fill all fields.');
      return;
    }
    setContributions([
      ...contributions,
      { member, amount: Number(amount), date }
    ]);
    setMember('');
    setAmount('');
    setDate('');
    setError('');
  };

  const totalSavings = contributions.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="container py-5" style={{maxWidth: 700}}>
      <div className="mb-4 text-center">
        <h2 className="fw-bold text-primary mb-2">
          <i className="fas fa-users me-2"></i>
          Group Savings Tracker
        </h2>
        <p className="lead text-muted">Track group savings and individual contributions for your SHG.</p>
      </div>
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <form className="row g-3 align-items-end mb-4" onSubmit={handleAdd}>
            <div className="col-md-4">
              <label htmlFor="member" className="form-label">Member Name</label>
              <input 
                type="text" 
                className="form-control" 
                id="member" 
                value={member} 
                onChange={e => setMember(e.target.value)}
                placeholder="e.g., Asha"
                required
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="amount" className="form-label">Amount (₹)</label>
              <input 
                type="number" 
                className="form-control" 
                id="amount" 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g., 500"
                required
                min="1"
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="date" className="form-label">Date</label>
              <input 
                type="date" 
                className="form-control" 
                id="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            <div className="col-md-1 d-grid">
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </form>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <h5 className="mb-3 text-success">Total Group Savings: ₹{totalSavings}</h5>
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Member</th>
                  <th>Amount (₹)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {contributions.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center text-muted">No contributions yet.</td>
                  </tr>
                ) : (
                  contributions.map((c, idx) => (
                    <tr key={idx}>
                      <td>{c.member}</td>
                      <td>{c.amount}</td>
                      <td>{c.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupSavingsTracker; 