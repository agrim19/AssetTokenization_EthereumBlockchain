const TokenSale = artifacts.require("MyTokenSale");
const Token = artifacts.require("MyToken");
const KYC = artifacts.require("KYCContract");

const chai = require("./setupChai");
const BN = web3.utils.BN;
const expect = chai.expect;

require('dotenv').config({path:"../.env"});

contract("TokenSale test", async accounts =>{
    const [deployerAccount, recipient, anotherAccount] = accounts;

    it("should not have any tokens in my deployer account", async () =>{
        let instance = await Token.deployed();
        expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equals(new BN(0));
    });

    it("all tokens should be in the TokenSale smart contract by default", async ()=>{
        let instance = await Token.deployed();
        let balanceOfTokenSale = await instance.balanceOf(TokenSale.address);
        let totalSupply = await instance.totalSupply();
        expect(balanceOfTokenSale).to.be.a.bignumber.equals(totalSupply);
    });

    it("should be possible to buy tokens", async ()=>{
        let tokenInstance = await Token.deployed();
        let tokenSaleInstance = await TokenSale.deployed();
        let balanceBefore = await tokenInstance.balanceOf(deployerAccount);
        let kycInstance = await KYC.deployed();
        await kycInstance.setKycCompleted(deployerAccount, {from:deployerAccount});
        expect(tokenSaleInstance.sendTransaction({from: deployerAccount, value: web3.utils.toWei("1", "wei")})).to.eventually.be.fulfilled;
        return expect(tokenInstance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equals(balanceBefore.add(new BN("1")));
    });
});