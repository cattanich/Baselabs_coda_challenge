// views/PurchaseView.js
import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';

const PurchaseView = Backbone.View.extend({
  el: '#backbone-purchase-form',
  
  template: _.template(`
    <div class="p-4 border border-amber-300 rounded-md bg-amber-50">
      <h2 class="text-xl font-bold text-amber-800 mb-4">Backbone.js Purchase Component</h2>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
        <input 
          type="text" 
          id="backbone-client-id" 
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          placeholder="Enter your client ID"
          value="<%= clientId %>"
        />
      </div>
      
      <button 
        id="backbone-buy-button"
        class="w-full py-2 px-4 rounded-md font-medium text-white 
          <%= isRateLimited || !clientId ? 'bg-gray-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700' %>"
        <%= isRateLimited || !clientId ? 'disabled' : '' %>
      >
        <%= isRateLimited ? 'Try again in ' + countdown + 's' : 'Buy Corn with Backbone.js' %>
      </button>
      
      <% if (status === 'error') { %>
        <div class="p-3 mt-4 bg-red-100 border border-red-200 text-red-700 rounded-md">
          <%= message %>
        </div>
      <% } %>
      
      <% if (status === 'success') { %>
        <div class="p-3 mt-4 bg-green-100 border border-green-200 text-green-700 rounded-md flex items-center justify-between">
          <span><%= message %></span>
          <span class="text-2xl <%= animateCorn ? 'corn-animation' : '' %>">
            🌽
          </span>
        </div>
      <% } %>
      
      <% if (purchaseCount > 0) { %>
        <div class="p-3 mt-4 bg-amber-100 border border-amber-200 text-amber-700 rounded-md">
          <p class="font-medium">Backbone Purchase History</p>
          <p>You've bought <%= purchaseCount %> corn using Backbone.js!</p>
        </div>
      <% } %>
    </div>
  `),
  
  events: {
    'click #backbone-buy-button': 'onBuyClick',
    'input #backbone-client-id': 'onClientIdChange'
  },
  
  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
    this.render();
  },
  
  render: function() {
    // Add animateCorn property for animation
    const templateData = {
      ...this.model.toJSON(),
      animateCorn: this.animateCorn
    };
    
    this.$el.html(this.template(templateData));
    
    // Reset animation flag after render
    this.animateCorn = false;
    
    return this;
  },
  
  onBuyClick: function() {
    if (this.model.get('isRateLimited') || !this.model.get('clientId')) {
      return;
    }
    
    this.model.buyCorn()
      .then(() => {
        // Set animation flag for next render
        this.animateCorn = true;
        this.render();
      })
      .catch(error => {
        console.error('Error buying corn:', error);
        
        if (this.model.get('isRateLimited')) {
          // Start countdown timer
          this.model.startCountdown();
          this.listenTo(this.model, 'change:countdown', this.render);
        }
      });
  },
  
  onClientIdChange: function(e) {
    this.model.set('clientId', e.target.value);
    
    // Fetch purchase count when client ID changes
    if (e.target.value) {
      this.model.fetchPurchaseCount();
    }
  },
  
  remove: function() {
    // Clean up countdown timer
    this.model.stopCountdown();
    
    // Call the original remove method
    Backbone.View.prototype.remove.apply(this, arguments);
  }
});

export default PurchaseView;