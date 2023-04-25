import * as Castle from '@castleio/castle-js';

const castle = Castle.configure({ pk: window.castlePublishableKey });

castle.createRequestToken().then( (requestToken) => {
  console.log(requestToken)
});
