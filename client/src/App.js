import React, { Component } from "react";
import MyToken from "./contracts/MyToken.json";
import MyTokenSale from "./contracts/MyTokenSale.json";
import KYCContract from "./contracts/KYCContract.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = {loaded:false, kycAddress:"", tokenSaleAddress:null, userTokens:0};

  componentDidMount = async () => {
    try {
      this.web3 = await getWeb3();
      this.accounts = await this.web3.eth.getAccounts();
      this.networkId = await this.web3.eth.net.getId();
      this.tokenInstance = new this.web3.eth.Contract(
        MyToken.abi,
        MyToken.networks[this.networkId] && MyToken.networks[this.networkId].address,
      );
      
      this.tokenSaleInstance = new this.web3.eth.Contract(
        MyTokenSale.abi,
        MyTokenSale.networks[this.networkId] && MyTokenSale.networks[this.networkId].address,
      );
      
      this.KycInstance = new this.web3.eth.Contract(
        KYCContract.abi,
        KYCContract.networks[this.networkId] && KYCContract.networks[this.networkId].address,
      );
      this.listenToTokenTransfer();
      this.setState({loaded:true, tokenSaleAddress: MyTokenSale.networks[this.networkId].address}, this.updateUserTokens);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  updateUserTokens = async ()=>{
    let userTokens  = await this.tokenInstance.methods.balanceOf(this.accounts[0]).call();
    this.setState({userTokens:userTokens});
  }

  listenToTokenTransfer = ()=>{
    this.tokenInstance.events.Transfer({to:this.accounts[0]}).on("data", this.updateUserTokens)
  }

  handleInputChange = event=>{
    const target = event.target;
    const value = target.type == 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({[name]:value});
  }

  handleKyc = async ()=>{
    await this.KycInstance.methods.setKycCompleted(this.state.kycAddress).send({from:this.accounts[0]});
    alert("white listed this account : "+this.state.kycAddress);
  }

  handleBuyTokens = async ()=>{
    await this.tokenSaleInstance.methods.buyTokens(this.accounts[0]).send({from: this.accounts[0], value: 1});
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Tokenization System</h1>
        <h2>Whitelist an account</h2>
        Address to allow : <input type = 'text' name = 'kycAddress' value = {this.state.kycAddress} onChange = {this.handleInputChange}/>
        <button type = "button" onClick = {this.handleKyc}>Add to Whitelist</button>
        <h2>Buy Tokens</h2>
        <p>If you want to do so, send money to this address: {this.state.tokenSaleAddress}</p>
        <p>You already have: {this.state.userTokens} CAPPU tokens</p>
        <button type="button" onClick={this.handleBuyTokens}>Buy More Tokens</button>
      </div>
    );
  }
}

export default App;
