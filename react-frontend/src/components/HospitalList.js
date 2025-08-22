import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import './HospitalList.css';

const HospitalList = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await apiService.getHospitals();
      if (response.ok) {
        setHospitals(response.hospitals);
      } else {
        setError('Failed to fetch hospitals');
      }
    } catch (error) {
      setError(error.error || 'Failed to fetch hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalClick = async (hospitalId) => {
    try {
      const response = await apiService.getHospitalById(hospitalId);
      if (response.ok) {
        setSelectedHospital(response.hospital);
      }
    } catch (error) {
      console.error('Error fetching hospital details:', error);
    }
  };

  const closeModal = () => {
    setSelectedHospital(null);
  };

  if (loading) {
    return (
      <div className="hospital-list-container">
        <div className="loading">Loading hospitals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hospital-list-container">
        <div className="error">Error: {error}</div>
        <button onClick={fetchHospitals}>Retry</button>
      </div>
    );
  }

  return (
    <div className="hospital-list-container">
      <h2>Available Hospitals</h2>
      
      <div className="hospitals-grid">
        {hospitals.map((hospital) => (
          <div key={hospital.id} className="hospital-card">
            <h3>{hospital.name}</h3>
            <p className="address">{hospital.address}</p>
            <p className="specialty">Specialty: {hospital.specialty}</p>
            <p className="contact">Contact: {hospital.contact}</p>
            
            <div className="services">
              <strong>Services:</strong>
              <ul>
                {hospital.services && JSON.parse(hospital.services).map((service, index) => (
                  <li key={index}>{service}</li>
                ))}
              </ul>
            </div>
            
            <div className="emergency-badge">
              {hospital.emergency_services ? (
                <span className="emergency">Emergency Services Available</span>
              ) : (
                <span className="non-emergency">No Emergency Services</span>
              )}
            </div>
            
            <button 
              onClick={() => handleHospitalClick(hospital.id)}
              className="details-btn"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Hospital Details Modal */}
      {selectedHospital && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedHospital.name}</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-row">
                <strong>Address:</strong>
                <p>{selectedHospital.address}</p>
              </div>
              
              <div className="detail-row">
                <strong>Contact:</strong>
                <p>{selectedHospital.contact}</p>
              </div>
              
              <div className="detail-row">
                <strong>Specialty:</strong>
                <p>{selectedHospital.specialty}</p>
              </div>
              
              <div className="detail-row">
                <strong>Location:</strong>
                <p>Lat: {selectedHospital.lat}, Lng: {selectedHospital.lng}</p>
              </div>
              
              <div className="detail-row">
                <strong>Services:</strong>
                <ul>
                  {selectedHospital.services && JSON.parse(selectedHospital.services).map((service, index) => (
                    <li key={index}>{service}</li>
                  ))}
                </ul>
              </div>
              
              <div className="detail-row">
                <strong>Emergency Services:</strong>
                <p>{selectedHospital.emergency_services ? 'Available' : 'Not Available'}</p>
              </div>
              
              <div className="detail-row">
                <strong>Created:</strong>
                <p>{new Date(selectedHospital.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalList;
