var accounts;
var account;
var token;
var TOKEN_ADDRESS;

function setContractAddress() {
  if (web3.eth.getBlock(0).hash == '0x41941023680923e0fe4d74a34bdac8141f2540e3ae90623718e47d66d1ca4a2d') {
    // we are on the ropsten net
    TOKEN_ADDRESS = '0x67fdd9c3a4ab7f39fed01cae3319ab28b4fc51ab';
  } else {
    TOKEN_ADDRESS = Token.deployed().address;
  };
}
// var TOKEN_ADDRESS = '0x67fdd9c3a4ab7f39fed01cae3319ab28b4fc51ab';


function setStatus(message) {
  var status = document.getElementById("status");
  console.log(message);
  status.innerHTML = status.innerHTML + '\n' + message;
};

function refreshBalance() {
  // next line does not seem to return the right contract
  setStatus('Your account: ' + account)
  setStatus('Fetching contract at ' + TOKEN_ADDRESS)
  token = Token.at(TOKEN_ADDRESS);


  // XXX: without next line thing does not work - why?
  token.balanceOf(account);
  
  token.balanceOf.call(account, {from: account}).then(function(value) {
  	setStatus('Value of calling balanceOf: '+ String(value));
    var balance_element = document.getElementById("balance");
    balance_element.innerHTML = value.valueOf();
  }).catch(function(e) {
    console.log(e);
    setStatus("Error getting balance; see log.");
  });

  var token_accounts = [account, '0xe56eBaF2068EC449ACc4660Ce5dBa11fdDC91AAb']
  for (i=0; i < token_accounts.length; i++) {
  	(function(i) {
	  	token.balanceOf(token_accounts[i]).then(function(value) {
	  		setStatus('Balance of ' + String(token_accounts[i]) + ' is ' + value);
	  	});
 	})(i);
  };
};

function sendCoin() {
  var token = Token.at(TOKEN_ADDRESS)

  var amount = parseInt(document.getElementById("amount").value);
  var receiver = document.getElementById("receiver").value;

  setStatus("Initiating transaction... sending " + amount + " to  " + receiver);

  token.balanceOf(account);
  token.transfer(receiver, amount, {from: account}).then(function() {
    setStatus("Transaction complete!");
    refreshBalance();
  }).catch(function(e) {
    console.log(e);
    setStatus("Error sending coin; see log.");
  });
};

function checkNetworkStatus() {
  try {
    return web3.net.listening
  } catch(err) {
    setStatus('Network Error' + err)
    return false;
  }

}
window.onload = function() {
  web3.eth.getAccounts(function(err, accs) {
    if (!checkNetworkStatus()) {
      return true;
    }
    setContractAddress();
    setStatus('web3.version.network: ' + web3.version.network);
    setStatus('web3.version.node: ' + web3.version.node);
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
      return;
    }

    accounts = accs;
    account = accounts[0];
    setStatus('refreshing balance...')

    refreshBalance();
  });
}
