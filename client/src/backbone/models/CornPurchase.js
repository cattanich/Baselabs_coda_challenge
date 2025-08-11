// models/CornPurchase.js
import Backbone from 'backbone';
import $ from 'jquery';

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
  
  // Method to buy corn using jQuery AJAX
  buyCorn: function() {
    if (!this.get('clientId')) {
      this.set({
        status: 'error',
        message: 'Client ID is required'
      });
      return Promise.reject(new Error('Client ID is required'));
    }
    
    console.log('Buying corn for client:', this.get('clientId'));
    
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `${API_URL}/buy-corn`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ clientId: this.get('clientId') }),
        crossDomain: true,
        success: (data) => {
          console.log('Buy corn success:', data);
          this.set({
            status: 'success',
            message: data.message
          });
          this.fetchPurchaseCount();
          resolve(data);
        },
        error: (xhr, status, error) => {
          console.error('Error buying corn:', status, error);
          if (xhr.status === 429) {
            this.set({
              isRateLimited: true,
              countdown: 60,
              status: 'error',
              message: 'Rate limit exceeded: You can only buy 1 corn per minute'
            });
          } else {
            this.set({
              status: 'error',
              message: error || 'Failed to buy corn'
            });
          }
          reject(error);
        }
      });
    });
  },
  
  // Method to fetch purchase count using jQuery AJAX
  fetchPurchaseCount: function() {
    const clientId = this.get('clientId');
    if (!clientId) return Promise.resolve();
    
    console.log('Fetching purchase count for', clientId);
    
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `${API_URL}/purchases/${clientId}`,
        method: 'GET',
        contentType: 'application/json',
        crossDomain: true,
        success: (data) => {
          console.log('Purchase data:', data);
          this.set({ purchaseCount: data.purchaseCount });
          resolve(data);
        },
        error: (xhr, status, error) => {
          console.error('Error fetching purchases:', status, error);
          reject(error);
        }
      });
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