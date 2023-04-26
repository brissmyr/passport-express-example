import './style.css';
import * as Castle from '@castleio/castle-js';

const castle = Castle.configure({ pk: window.castlePublishableKey });

// Note: It's recommended that you use the form submit helper if you can
var myForm = document.getElementsByTagName('form')[0];
myForm.addEventListener(
  'submit',
  function (e) {
    e.preventDefault();

    // get or insert a hidden field with the Castle request token
    var hiddenField;
    for (var i = 0; i < myForm.childNodes.length; i++) {
      var node = myForm.childNodes[i];
      if (node.getAttribute && node.getAttribute('name') === 'castle_request_token') {
        hiddenField = node;
        break;
      }
    }
    if(!hiddenField) {
      hiddenField = document.createElement('input');
      hiddenField.setAttribute('type', 'hidden');
      hiddenField.setAttribute('name', 'request_token');
      myForm.appendChild(hiddenField);
    }

    castle.createRequestToken().then(function (token) {
      hiddenField.value = token;
      myForm.submit();
    });
    return false;
  }
);
