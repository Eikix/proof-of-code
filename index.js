const ethers = require('ethers');
require('dotenv').config();
const abi = require('./Bridge.json').output.abi;

// Change these to your bridge's address
const ROPSTEN_BRIDGE_ADDRESS = '0x302aa7Fb9C82aAaa5D3d425b1b4cb189c114b990';
const MUMBAI_BRIDGE_ADDRESS = '0x038824D8F734dF6735068C8422fb5CA54DAE1fdb';

// Your provider's websocket connection string (e.g. wss://polygon-mumbai.g.alchemy.com/v2/<your-api-key>)
const WS_ROPSTEN = process.env.WS_ROPSTEN;
const WS_MUMBAI = process.env.WS_MUMBAI;

// Your connection to the blockchain
const ropstenWebSocket = new ethers.providers.WebSocketProvider(WS_ROPSTEN);
const mumbaiWebSocket = new ethers.providers.WebSocketProvider(WS_MUMBAI);

// Creating our wallet instances. These allow you to sign transactions with your private keys.
const walletMumbai = new ethers.Wallet(process.env.EVM_PK, mumbaiWebSocket);
const walletRopsten = new ethers.Wallet(process.env.EVM_PK, ropstenWebSocket);

// Creating the instances of our contracts
const bridgeRopsten = new ethers.Contract(
  ROPSTEN_BRIDGE_ADDRESS,
  abi,
  walletRopsten
);

const bridgeMumbai = new ethers.Contract(
  MUMBAI_BRIDGE_ADDRESS,
  abi,
  walletMumbai
);

async function main() {
  console.log('Hi there! I am a bridge bot.');
  console.log('Waiting for transactions...');

  bridgeRopsten.on(
    'Lock',
    async (from, to, sourceChain, destinationChain, amount) => {
      console.log(
        ` Bridge Ropsten Transfer Outbound : 
            - From: ${from}
            - To: ${to}
            - Source Chain: ${sourceChain}
            - Destination Chain: ${destinationChain}
            - Amount: ${amount.toString()}
            `
      );
      try {
        await bridgeMumbai.release(
          from,
          to,
          sourceChain,
          destinationChain,
          amount
        );
      } catch (err) {
        console.log(err);
      }
    }
  );

  bridgeRopsten.on(
    'Success',
    (from, to, sourceChain, destinationChain, amount) => {
      console.log(
        ` Bridge Ropsten Inbound! Bridge successful: 
            - From: ${from}
            - To: ${to}
            - Source Chain: ${sourceChain}
            - Destination Chain: ${destinationChain}
            - Amount: ${amount.toString()}
            `
      );
    }
  );

  bridgeMumbai.on(
    'Lock',
    async (from, to, sourceChain, destinationChain, amount) => {
      console.log(
        ` Bridge Mumbai Transfer Outbound : 
            - From: ${from}
            - To: ${to}
            - Source Chain: ${sourceChain}
            - Destination Chain: ${destinationChain}
            - Amount: ${amount.toString()}
            `
      );
      try {
        await bridgeRopsten.release(
          from,
          to,
          sourceChain,
          destinationChain,
          amount
        );
      } catch (err) {
        console.log(err);
      }
    }
  );
  bridgeMumbai.on(
    'Success',
    (from, to, sourceChain, destinationChain, amount) => {
      console.log(
        ` Bridge Mumbai Inbound! Bridge successful: 
            - From: ${from}
            - To: ${to}
            - Source Chain: ${sourceChain}
            - Destination Chain: ${destinationChain}
            - Amount: ${amount.toString()}
            `
      );
    }
  );
}

main();
