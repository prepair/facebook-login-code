(() => {

  const Errors = {
    blocked: 'Popup has been blocked by your browser',
    timeout: 'Timeout',
    closed: 'Popup has been closed',
    existing: 'Popup already exists',
    unauthorized: 'Unauthorized'
  };

  class Facebook {
    constructor(options) {
      this.clientId = options.clientId;
      this.scope = options.scope;
      this.redirectPath = options.redirectPath || '';
      this.dialogUrl = options.dialogUrl || 'https://graph.facebook.com/oauth/authorize';
      this.dialogDisplay = options.dialogDisplay || 'popup';
      this.dialogDimension = options.dialogDimension || { width: 650, height: 562 };
      this.apiUrl = options.apiUrl || 'https://graph.facebook.com/v2.10';
      this.pollingInterval = options.pollingInterval || 20;
      this.pollingTimeout = options.pollingTimeout || 60 * 1000;

      this.popupWindow = undefined;
    }

    login() {
      return new Promise((resolve, reject) => {
        // Multiple popups are not allowed
        if (typeof this.popupWindow !== 'undefined') {
          return reject(this.createError(Errors.existing));
        }

        // Open popup with specific URL
        let redirectUri = this.getRedirectUri();
        let dialogUrlParameters = this.createQueryParameters({
          client_id: this.clientId,
          redirect_uri: redirectUri,
          state: this.getState(),
          display: this.dialogDisplay,
          scope: this.scope
        });
        let dialogUrlWithParams = `${this.dialogUrl}?${dialogUrlParameters}`;
        this.popupWindow = window.open(dialogUrlWithParams, '_blank', this.getPopupFeatures());

        // Popup blocked by browser
        if (!this.popupWindow) {
          return reject(this.createError(Errors.blocked));
        }

        // Focus
        if (this.popupWindow && this.popupWindow.focus) {
          this.popupWindow.focus();
        }

        // Polling loop
        let timeElapsed = 0;
        let intervalId = setInterval(() => {
          // Timeout
          if (timeElapsed >= this.pollingTimeout) {
            clearInterval(intervalId);
            this.popupWindow.close();
            this.popupWindow = undefined;
            return reject(this.createError(Errors.timeout));
          }

          // Popup closed manually
          if (this.popupWindow.closed) {
            clearInterval(intervalId);
            this.popupWindow = undefined;
            return reject(this.createError(Errors.closed));
          }

          try {
            if (this.popupWindow.location.href.startsWith(redirectUri)) {
              let params = new URLSearchParams(this.popupWindow.location.search);

              if (params.has('error')) {
                reject(this.createError(params.get('error')));
              } else {
                resolve({
                  code: params.get('code'),
                  state: params.get('state')
                });
              }

              clearInterval(intervalId);
              this.popupWindow.close();
              this.popupWindow = undefined;
            }
          } catch (err) {
            // Capturing Cross-Origin errors
          }

          timeElapsed += this.pollingInterval;
        }, this.pollingInterval);
      });
    }

    api(path, params, accessToken) {
      let apiUrlParameters = this.createQueryParameters(params);

      return new Promise((resolve, reject) => {
        let request = new XMLHttpRequest();
        request.open('POST', `${this.apiUrl}${path}?${apiUrlParameters}`, true);
        request.setRequestHeader('Authorization', `Bearer ${accessToken}`);
        request.onload = event => {
          let response = JSON.parse(event.target.response);
          if (response.error) {
            reject(this.createError(response.error.message));
          } else {
            resolve(response);
          }
        };
        request.send();
      });
    }

    createError(errorMessage) {
      return new Error(errorMessage);
    }

    getState() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    createQueryParameters(params) {
      return Object.keys(params).map(element => `${element}=${params[element]}`).join('&');
    }

    getRedirectUri() {
      return `${window.location.origin}${window.location.pathname}${this.redirectPath}`;
    }

    getPopupFeatures() {
      let features = [];
      let width = this.dialogDimension.width;
      let height = this.dialogDimension.height;
      features.push(`width=${width}`);
      features.push(`height=${height}`);
      features.push('scrollbars=1');
      features.push('toolbar=0');
    
      let screenX = typeof window.screenX !== 'undefined' ? window.screenX : window.screenLeft;
      let screenY = typeof window.screenY !== 'undefined' ? window.screenY : window.screenTop;
      let outerWidth = typeof window.outerWidth !== 'undefined' ? window.outerWidth : document.documentElement.clientWidth;
      let outerHeight = typeof window.outerHeight !== 'undefined' ? window.outerHeight : document.documentElement.clientHeight - 22;
    
      let left = parseInt(screenX + (outerWidth - width) / 2, 10);
      let top = parseInt(screenY + (outerHeight - height) / 2.5, 10);
      features.push('left=' + left);
      features.push('top=' + top);
    
      return features.join(',');
    }
  }

  window.Facebook = Facebook;
})();