import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import $ from 'jquery';
import Backbone from 'backbone';
import _ from 'underscore';
import CornPurchase from './backbone/models/CornPurchase';
import PurchaseView from './backbone/views/PurchaseView';

// Configurar jQuery para CORS
$.support.cors = true;

const API_URL = 'http://localhost:3001/api';

function App() {
  const [clientId, setClientId] = useState('');
  const [purchaseStatus, setPurchaseStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [purchases, setPurchases] = useState(0);
  const [cornAnimation, setCornAnimation] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(0);
  
  // Backbone model and view references
  const backboneModelRef = useRef(null);
  const backboneViewRef = useRef(null);

  // Initialize Backbone components after render
  useEffect(() => {
    // Wait to make sure the DOM element exists
    setTimeout(() => {
      try {
        // Create Backbone model
        backboneModelRef.current = new CornPurchase();
        
        // Create Backbone view
        backboneViewRef.current = new PurchaseView({
          model: backboneModelRef.current,
          el: '#backbone-purchase-form' // Make sure this element exists
        });
        
        console.log('Backbone component initialized');
      } catch (err) {
        console.error('Error initializing Backbone component:', err);
      }
    }, 100);
    
    // Clean up on unmount
    return () => {
      if (backboneViewRef.current) {
        backboneViewRef.current.remove();
      }
    };
  }, []);

  // Fetch purchase count when clientId changes
  useEffect(() => {
    if (clientId) {
      fetchPurchases();
    }
  }, [clientId]);

  // Countdown timer for rate limit
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prevCount => prevCount - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  // Fetch client's purchase history
  const fetchPurchases = async () => {
    try {
      const response = await axios.get(`${API_URL}/purchases/${clientId}`);
      setPurchases(response.data.purchaseCount);
    } catch (err) {
      console.error('Error fetching purchases:', err);
    }
  };

  // Handle client ID input change
  const handleClientIdChange = (e) => {
    setClientId(e.target.value);
    setPurchaseStatus(null);
    setError(null);
  };

  // Handle corn purchase
  const handleBuyCorn = async () => {
    if (!clientId) {
      setError('Please enter a client ID');
      return;
    }
    
    setLoading(true);
    setError(null);
    setPurchaseStatus(null);

    try {
      const response = await axios.post(`${API_URL}/buy-corn`, { clientId });
      
      setPurchaseStatus(response.data);
      fetchPurchases(); // Update purchase count
      
      // Trigger corn animation
      setCornAnimation(true);
      setTimeout(() => setCornAnimation(false), 500);
      
    } catch (err) {
      console.error('Error buying corn:', err);
      
      if (err.response && err.response.status === 429) {
        // Rate limit error - start countdown
        setError('Rate limit exceeded: You can only buy 1 corn per minute');
        setCountdown(60);
      } else {
        setError(err.response?.data?.message || 'Failed to buy corn. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-amber-700">Bob's Corn</h1>
          <p className="text-gray-600 mt-2">The fairest farmer in town 🌽</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
              Client ID
            </label>
            <input
              type="text"
              id="clientId"
              value={clientId}
              onChange={handleClientIdChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter your client ID"
            />
          </div>
          
          <button
            onClick={handleBuyCorn}
            disabled={loading || countdown > 0}
            className={`w-full py-2 px-4 rounded-md font-medium text-white 
              ${loading || countdown > 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
              }`}
          >
            {loading ? 'Processing...' : countdown > 0 ? `Try again in ${countdown}s` : 'Buy Corn with React'}
          </button>
          
          {error && (
            <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {purchaseStatus && purchaseStatus.success && (
            <div className="p-3 bg-green-100 border border-green-200 text-green-700 rounded-md flex items-center justify-between">
              <span>{purchaseStatus.message}</span>
              <span className={cornAnimation ? "text-2xl corn-animation" : "text-2xl"}>
                {purchaseStatus.emoji}
              </span>
            </div>
          )}
          
          {clientId && (
            <div className="p-3 bg-amber-100 border border-amber-200 text-amber-700 rounded-md">
              <p className="font-medium">Purchase History (React)</p>
              <p>You've bought {purchases} corn so far!</p>
            </div>
          )}
        </div>
        
        {/* Backbone.js Purchase Component */}
        <div>
          <h2 className="text-xl font-semibold text-amber-800 mb-4">Backbone.js Purchase</h2>
          <div id="backbone-purchase-form" className="border border-amber-300 rounded-md p-4"></div>
        </div>
        
        <div className="text-xs text-gray-500 text-center mt-4">
          <p>Policy: 1 corn per client per minute</p>
        </div>
      </div>
    </div>
  );
}

export default App;