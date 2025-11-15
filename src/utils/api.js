// API utility functions for database operations

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Stations API
export const stationsAPI = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/stations`);
    if (!response.ok) {
      throw new Error('Failed to fetch stations');
    }
    return response.json();
  },

  async saveAll(stations) {
    const response = await fetch(`${API_BASE_URL}/stations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stations }),
    });
    if (!response.ok) {
      throw new Error('Failed to save stations');
    }
    return response.json();
  },

  async update(station) {
    const response = await fetch(`${API_BASE_URL}/stations`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(station),
    });
    if (!response.ok) {
      throw new Error('Failed to update station');
    }
    return response.json();
  },

  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/stations?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete station');
    }
    return response.json();
  },
};

// Invoices API
export const invoicesAPI = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/invoices`);
    if (!response.ok) {
      throw new Error('Failed to fetch invoices');
    }
    return response.json();
  },

  async getByNumber(invoiceNumber) {
    const response = await fetch(`${API_BASE_URL}/invoices?invoiceNumber=${invoiceNumber}`);
    if (!response.ok) {
      throw new Error('Failed to fetch invoice');
    }
    return response.json();
  },

  async create(invoice) {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoice),
    });
    if (!response.ok) {
      throw new Error('Failed to create invoice');
    }
    return response.json();
  },
};

