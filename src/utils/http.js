export class Http {
  static async post(url, postData, options = {}) {
    const defaultHeaders = {
      'Content-Type': 'application/json'
    };
    const headers = {...defaultHeaders, ...(options.headers || {})};
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postData)
    });
    return this.handleResponse(response)
  }

  static async get(url, options = {}) {
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };
    const headers = {...defaultHeaders, ...(options.headers || {})};
    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: options.signal
    });
    return this.handleResponse(response);
  }

  static async delete(url, postData, options = {}) {
    const defaultHeaders = {
      'Content-Type': 'application/json'
    };
    const headers = {...defaultHeaders, ...(options.headers || {})};
    const response = await fetch(url, {
      method: 'DELETE',
      headers: headers,
      body: JSON.stringify(postData)
    });
    return this.handleResponse(response)
  }
}

export class HttpResponseError {
  message = '';
  data = null;

  constructor(message, data = null) {
    this.message = message;
    this.data = data;
  }
}
