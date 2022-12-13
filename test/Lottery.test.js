const assert = require ('assert');
const ganache = require ('ganache-cli');
const Web3 = require('web3');
const {abi, evm} = require('../compile');

const web3 = new Web3(ganache.provider());

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    
    // Use on of those account to deploy the contract
    // inbox is a js representation of our contract
    lottery = await new web3.eth.Contract(abi) // a js object must be passed 
        .deploy({ data: evm.bytecode.object })
        .send({ from: accounts[0], gas: '1000000'}) // this method sends the object created by deploy method
});

describe('Lottery Contract', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });
});

