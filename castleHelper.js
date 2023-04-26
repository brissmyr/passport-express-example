const axios = require('axios')

class CastleApiHelper {
  constructor(apiSecret) {
    this.apiSecret = apiSecret;
  }

  async sendEvent(req, endpoint, userPayload) {
    const { requestToken, ip, headers } = this._getRequestData(req);
    const payload = this._createPayload(requestToken, ip, headers, userPayload);
    return (await this._sendLoginEventToCastle(endpoint, payload)).data;
  }

  _getRequestData(req) {
    const requestToken = req.body.request_token

    const ip = req.get('x-forwarded-for') || req.connection.remoteAddress;
    if (ip.indexOf(',') > -1) {
      ip = ip.split(',')[0];
    }

    let headers = JSON.parse(JSON.stringify(req.headers));
    delete headers['cookie'];

    return { requestToken, ip, headers };
  }

  _createPayload(requestToken, ip, headers, userPayload) {
    return {
      ...userPayload,
      context: {
        ip: ip,
        headers: headers,
      },
      request_token: requestToken,
    };
  }

  async _sendLoginEventToCastle(endpoint, payload) {
    return await axios.post('https://api.castle.io' + endpoint,
      payload, { auth: { password: this.apiSecret, username: '' } }
    )
  }
}

module.exports = CastleApiHelper;
