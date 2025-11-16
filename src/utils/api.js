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

// Reports API
export const reportsAPI = {
  async getUsageReport(date) {
    const dateParam = date ? `?type=usage&date=${date}` : '?type=usage';
    const response = await fetch(`${API_BASE_URL}/reports${dateParam}`);
    if (!response.ok) {
      throw new Error('Failed to fetch usage report');
    }
    return response.json();
  },

  async getDailyRevenue(date) {
    const dateParam = date ? `?type=daily-revenue&date=${date}` : '?type=daily-revenue';
    const response = await fetch(`${API_BASE_URL}/reports${dateParam}`);
    if (!response.ok) {
      throw new Error('Failed to fetch daily revenue');
    }
    return response.json();
  },

  async getMonthlyRevenue(month, year) {
    const params = new URLSearchParams({ type: 'monthly-revenue' });
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    const response = await fetch(`${API_BASE_URL}/reports?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch monthly revenue');
    }
    return response.json();
  },
};

