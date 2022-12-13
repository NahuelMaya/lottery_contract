const path = require('path');
const fs = require('fs');
const solc = require('solc');

const lotteryPath = path.resolve('contracts', 'Lottery.sol');
const source = fs.readFileSync(lotteryPath, 'UTF-8');

const input = {
    language: 'Solidity',
    sources: {
        'Lottery.sol': {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*'],
            },
        },
    },
};

compilesFiles = JSON.parse(solc.compile(JSON.stringify(input)));
module.exports = compilesFiles.contracts['Lottery.sol'].Lottery
