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

    it('allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.5', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })

        assert.equal(accounts[0], players[0])
        assert.equal(1, players.length)
    });

    it('allows multiple account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.5', 'ether')
        });

        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.5', 'ether')
        });

        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.5', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })

        assert.equal(accounts[0], players[0])
        assert.equal(accounts[1], players[1])
        assert.equal(accounts[2], players[2])
        assert.equal(3, players.length)
    });

    it('requires 0.5 ether to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 200
            });
            assert(false, "Sender should not be able to enter the lottery with an amount different than 0.5 ether");
        } catch (err) {
            assert(err.message.includes('you have to send .01 ether'), 'Sender should receive an error message indicating the required amount');
        }
    });

    it('Only manager can call pickWinner ', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1] 
            });
            assert(false, 'pickWinner was called from non-manager account');
        } catch (err) {
            assert(err.message.includes('Only manager can call this function'));
        }
    });

    it('sends money to the winner and resets the players array', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.5', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);

        await lottery.methods.pickWinner().send({ from: accounts[0] });

        const finalBalance = await web3.eth.getBalance(accounts[0]);

        const difference = finalBalance - initialBalance
        assert(difference > web3.utils.toWei('0.3', 'ether'));
    })
});

