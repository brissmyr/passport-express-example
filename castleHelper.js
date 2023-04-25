const axios = require('axios')

class CastleApiHelper {
  constructor(apiSecret) {
    this.apiSecret = apiSecret;
  }

  async getRequestDataAndSendLoginEvent(req, userPayload) {
    const { requestToken, ip, headers } = this._getRequestData(req);
    const payload = this._createPayload(requestToken, ip, headers, userPayload);
    await this._sendLoginEventToCastle(payload);
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

  async _sendLoginEventToCastle(payload) {
    const endpoint = '/v1/risk'
    await axios.post('https://api.castle.io' + endpoint,
      payload, { auth: { password: this.apiSecret, username: '' } }
    )
  }
}

module.exports = CastleApiHelper;
