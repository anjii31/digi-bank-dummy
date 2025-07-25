import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const initialContributions = [
  // Example data
  // { member: 'Asha', amount: 500, date: '2024-06-01' },
];

function GroupSavingsTracker() {
  const { language } = useLanguage();
  const translations = {
    en: {
      title: 'Group Savings Tracker',
      subtitle: 'Track group savings and individual contributions for your SHG.',
      add: 'Add Member',
      remove: 'Remove',
      total: 'Total Savings',
      member: 'Member',
      amount: 'Amount',
      save: 'Save',
      enterName: 'Enter member name',
      enterAmount: 'Enter amount',
      date: 'Date',
      noContributions: 'No contributions yet.',
      errorFillAll: 'Please fill all fields.'
    },
    hi: {
      title: 'समूह बचत ट्रैकर',
      subtitle: 'अपने SHG के लिए समूह बचत और व्यक्तिगत योगदान ट्रैक करें।',
      add: 'सदस्य जोड़ें',
      remove: 'हटाएं',
      total: 'कुल बचत',
      member: 'सदस्य',
      amount: 'राशि',
      save: 'सहेजें',
      enterName: 'सदस्य का नाम दर्ज करें',
      enterAmount: 'राशि दर्ज करें',
      date: 'तारीख',
      noContributions: 'अभी तक कोई योगदान नहीं।',
      errorFillAll: 'कृपया सभी फ़ील्ड भरें।'
    },
    mr: {
      title: 'समूह बचत ट्रॅकर',
      subtitle: 'आपल्या SHG साठी समूह बचत आणि वैयक्तिक योगदान ट्रॅक करा.',
      add: 'सदस्य जोडा',
      remove: 'काढा',
      total: 'एकूण बचत',
      member: 'सदस्य',
      amount: 'रक्कम',
      save: 'जतन करा',
      enterName: 'सदस्याचे नाव प्रविष्ट करा',
      enterAmount: 'रक्कम प्रविष्ट करा',
      date: 'तारीख',
      noContributions: 'अजून कोणतेही योगदान नाही.',
      errorFillAll: 'कृपया सर्व फील्ड भरा.'
    }
  };
  const t = translations[language] || translations.en;
  const [contributions, setContributions] = useState(initialContributions);
  const [member, setMember] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!member || !amount || !date) {
      setError(t.errorFillAll);
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
          {t.title}
        </h2>
        <p className="lead text-muted">{t.subtitle}</p>
      </div>
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <form className="row g-3 align-items-end mb-4" onSubmit={handleAdd}>
            <div className="col-md-4">
              <label htmlFor="member" className="form-label">{t.member}</label>
              <input 
                type="text" 
                className="form-control" 
                id="member" 
                value={member} 
                onChange={e => setMember(e.target.value)}
                placeholder={t.enterName}
                required
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="amount" className="form-label">{t.amount} (₹)</label>
              <input 
                type="number" 
                className="form-control" 
                id="amount" 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                placeholder={t.enterAmount}
                required
                min="1"
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="date" className="form-label">{t.date}</label>
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
                {t.add}
              </button>
            </div>
          </form>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <h5 className="mb-3 text-success">{t.total}: ₹{totalSavings}</h5>
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>{t.member}</th>
                  <th>{t.amount} (₹)</th>
                  <th>{t.date}</th>
                </tr>
              </thead>
              <tbody>
                {contributions.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center text-muted">{t.noContributions}</td>
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