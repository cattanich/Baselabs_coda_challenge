// models/CornPurchase.js
import Backbone from 'backbone';

const API_URL = 'http://localhost:3001/api';

const CornPurchase = Backbone.Model.extend({
  defaults: {
    clientId: '',
    purchaseCount: 0,
    isRateLimited: false,
    countdown: 0,
    message: '',
    status: ''
  },
  
  // URL for the model
  urlRoot: `${API_URL}/buy-corn`,
  
  // Method to buy corn
  buyCorn: function() {
    if (!this.get('clientId')) {
      this.set({
        status: 'error',
        message: 'Client ID is required'
      });
      return Promise.reject(new Error('Client ID is required'));
    }
    
    return fetch(`${API_URL}/buy-corn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: this.get('clientId') })
    })
    .then(response => {
      if (!response.ok) {
        if (response.status === 429) {
          this.set({
            isRateLimited: true,
            countdown: 60,
            status: 'error',
            message: 'Rate limit exceeded: You can only buy 1 corn per minute'
          });
        }
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    })
    .then(data => {
      this.set({
        status: 'success',
        message: data.message
      });
      this.fetchPurchaseCount();
      return data;
    })
    .catch(error => {
      if (!this.get('isRateLimited')) {
        this.set({
          status: 'error',
          message: error.message || 'Failed to buy corn'
        });
      }
      throw error;
    });
  },
  
  // Method to fetch purchase count
  fetchPurchaseCount: function() {
    const clientId = this.get('clientId');
    if (!clientId) return Promise.resolve();
    
    return fetch(`${API_URL}/purchases/${clientId}`)
      .then(response => response.json())
      .then(data => {
        this.set({ purchaseCount: data.purchaseCount });
        return data;
      });
  },
  
  // Countdown timer methods
  startCountdown: function() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    
    this.countdownInterval = setInterval(() => {
      const currentCount = this.get('countdown');
      if (currentCount <= 0) {
        clearInterval(this.countdownInterval);
        this.set({ isRateLimited: false });
      } else {
        this.set({ countdown: currentCount - 1 });
      }
    }, 1000);
  },
  
  stopCountdown: function() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
});

export default CornPurchase;