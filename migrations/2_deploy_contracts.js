const MyToken = artifacts.require("MyToken.sol");
const MyTokenSale = artifacts.require("MyTokenSale");
const KYC = artifacts.require("KYCContract");

require('dotenv').config({path:"../.env"});

module.exports = async deployer =>{
    let address = await web3.eth.getAccounts();
    await deployer.deploy(MyToken, process.env.INITIAL_TOKENS);
    await deployer.deploy(KYC);
    await deployer.deploy(MyTokenSale, 1, address[0], MyToken.address, KYC.address);
    let instance = await MyToken.deployed();
    await instance.transfer(MyTokenSale.address, process.env.INITIAL_TOKENS);
}