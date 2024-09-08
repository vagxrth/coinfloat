import React, { useState, useEffect, useContext, createContext } from 'react';
import { ethers } from 'ethers';
import Web3Modal, { local } from 'web3modal';
import toast from 'react-hot-toast';

import { ERC20Generator, ERC20Generator_BYTECODE, COINFLOAT_ADDRESS, COINFLOAT_CONTRACT, TOKEN_CONTRACT, shortenAddress, handleNetworkSwitch, PINATA_API_KEY, PINATA_API_SECRET } from './constants';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
    const [address, setAddress] = useState();
    const [accountBalance, setAccountBalance] = useState(null);
    const [loader, setLoader] = useState(false);
    const [recall, setRecall] = useState(0);
    const [currency, setCurrency] = useState('ETH');

    const [openBuyToken, setOpenBuyToken] = useState(false);
    const [openWithdrawToken, setOpenWithdrawToken] = useState(false);
    const [openTransferToken, setOpenTransferToken] = useState(false);
    const [openTokenCreator, setOpenTokenCreator] = useState(false);
    const [openCreateICO, setOpenCreateICO] = useState(false);

    const notifySuccess = (message) => toast.success(message, { duration: 200 });
    const notifyError = (message) => toast.error(message, { duration: 200 });

    const checkIfWalletIsConnected = async () => {
        try {
            if (!window.ethereum) return notifyError('No Account Found');
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length) {
                setAddress(accounts[0]);
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const getBalance = await provider.getBalance(accounts[0]);
                const balance = ethers.utils.formatEther(getBalance);
                setAccountBalance(balance);
                return accounts[0];
            } else {
                notifyError('No Account Found');
            }
        } catch (error) {
            console.log(error);
            notifyError('Please connect your wallet');
        }
    }

    const connectWallet = async () => {
        try {
            if (!window.ethereum) return notifyError('No Account Found');
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length) {
                setAddress(accounts[0]);
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const getBalance = await provider.getBalance(accounts[0]);
                const balance = ethers.utils.formatEther(getBalance);
                setAccountBalance(balance);
                return accounts[0];
            } else {
                notifyError('No Account Found');
            }
        } catch (error) {
            console.log(error);
            notifyError('Please connect your wallet');
        }
    }

    const _deployContract = async (signer, account, name, symbol, supply, imageURL) => {
        try {
            const factory = new ethers.ContractFactory(ERC20Generator.abi, ERC20Generator_BYTECODE, signer);
            const totalSupply = Number(supply);
            const _initialSupply = ethers.utils.parseUnits(totalSupply.toString(), "ether");

            let contract = await factory.deploy(name, symbol, _initialSupply);

            const transaction = await contract.deployed();

            if (contract.address) {
                const today = Date.now();
                let date = new Date(today);
                const _tokenCreatedDate = date.toLocaleDateString('en-US');

                const _token = {
                    account: account,
                    name: name,
                    symbol: symbol,
                    supply: supply.toString(),
                    logo: imageURL,
                    tokenAddress: contract.address,
                    createdAt: _tokenCreatedDate,
                    transactionHash: contract.deployTransaction.hash,
                };

                let tokenHistory = [];
                const history = localStorage.getItem('TOKEN_HISTORY');
                if (history) {
                    tokenHistory = JSON.parse(localStorage.getItem('TOKEN_HISTORY'));
                    tokenHistory.push(_token);
                    localStorage.setItem('TOKEN_HISTORY', tokenHistory);
                    setLoader(false);
                    setRecall(recall + 1);
                    setOpenTokenCreator(false);
                } else {
                    tokenHistory.push(_token);
                    localStorage.setItem('TOKEN_HISTORY', tokenHistory);
                    setLoader(false);
                    setRecall(recall + 1);
                    setOpenTokenCreator(false);
                }
            }
        } catch (error) {
            setLoader(false);
            notifyError("Something went wrong");
            console.log(error);
        }
    }

    const createERC20 = async (token, account, imageURL) => {
        const { name, symbol, supply } = token;
        try {
            setLoader(true);
            notifySuccess('Creating Token...');
            if (!name || !symbol || !supply) {
                notifyError('Please fill all the fields');
            }
            else {
                const web3Modal = new Web3Modal();
                const connection = await web3Modal.connect();
                const provider = new ethers.providers.Web3Provider(connection);

                const signer = provider.getSigner();

                _deployContract(signer, account, name, symbol, supply, imageURL);
            }
        } catch (error) {
            setLoader(false);
            notifyError("Something went wrong");
            console.log(error);
        }
    }

    const GET_ALL_ICO_TOKENS = async () => {
        try {
            setLoader(true);
            const address = await connectWallet();
            const contract = await COINFLOAT_CONTRACT();

            if (address) {
                const allICOToken = await contract.getAllTokens();
                const _tokenArray = Promise.all(
                    allICOToken.map(async (token) => {
                        const tokenContract = await TOKEN_CONTRACT(token?.token);
                        const balance = await tokenContract.balanceOf(COINFLOAT_ADDRESS);
                        return {
                            creator: token.creator,
                            name: token.name,
                            token: token.token,
                            symbol: token.symbol,
                            supported: token.supported,
                            price: ethers.utils.formatEther(token.price.toString()),
                            icoSaleBalance: ethers.utils.formatEther(balance.toString()),
                        }
                    })
                )
                setLoader(false);
                return _tokenArray;
            }
        } catch (error) {
            notifyError("Something went wrong");
            console.log(error);
        }
    }

    const GET_ALL_ICO_USERS = async () => {
        try {
            setLoader(true);
            const address = await connectWallet();
            const contract = await COINFLOAT_CONTRACT();

            if (address) {
                const allICOToken = await contract.getTokenCreatedByTheUser(address);
                const _tokenArray = Promise.all(
                    allICOToken.map(async (token) => {
                        const tokenContract = await TOKEN_CONTRACT(token?.token);
                        const balance = await tokenContract.balanceOf(COINFLOAT_ADDRESS);
                        return {
                            creator: token.creator,
                            name: token.name,
                            token: token.token,
                            symbol: token.symbol,
                            supported: token.supported,
                            price: ethers.utils.formatEther(token.price.toString()),
                            icoSaleBalance: ethers.utils.formatEther(balance.toString()),
                        }
                    })
                )
                setLoader(false);
                return _tokenArray;
            }
        } catch (error) {
            notifyError("Something went wrong");
            console.log(error);
        }
    }

    const createICOSale = async (icoSale) => {
        try {
            const { address, price } = icoSale;
            if (!address || !price) {
                return notifyError('Please fill all the fields');
            }
            setLoader(true);
            notifySuccess('Creating ICO Sale...');
            await connectWallet();

            const contract = await COINFLOAT_CONTRACT();

            const payableAmount = ethers.utils.parseUnits(price.toString(), "ether");

            const transaction = await contract.createICOSale(address, payableAmount, {
                gasLimit: ethers.utils.hexlify(8000000),
            });
            await transaction.wait();
            if (transaction.hash) {
                setLoader(false);
                setOpenCreateICO(false);
                setRecall(recall + 1);

            }
        } catch (error) {
            setLoader(false);
            setOpenCreateICO(false);
            notifyError("Something went wrong");
            console.log(error);
        }
    }

    const buyToken = async (tokenAddress, tokenQuantity) => {
        try {
            setLoader(true);
            notifySuccess('Buying Token...');

            const address = await connectWallet();
            const contract = await COINFLOAT_CONTRACT();

            const _tokenBalance = await contract.getBalance(tokenAddress);
            const _tokenDetails = await contract.getTokenDetails(tokenAddress);

            const availableToken = ethers.utils.formatEther(_tokenBalance.toString());
            if (availableToken > 0) {
                const price = ethers.utils.formatEther(_tokenDetails.price.toString()) * Number(tokenQuantity);

                const payAmount = ethers.utils.parseUnits(price.toString(), "ether");

                const transaction = await contract.buyToken(tokenAddress, Number(tokenQuantity), {
                    value: payAmount.toString(),
                    gasLimit: ethers.utils.hexlify(8000000),
                })
                await transaction.wait();
                setLoader(false);
                setRecall(recall + 1);
                setOpenBuyToken(false);
                notifySuccess('Token Purchased Successfully');
            } else {
                setLoader(false);
                setOpenBuyToken(false);
                notifyError('No Tokens Available');
            }
        } catch (error) {
            setLoader(false);
            setOpenBuyToken(false);
            notifyError("Something went wrong");
            console.log(error);
        }
    }

    const transferToken = async (transferTokenData) => {
        try {
            if (!transferTokenData.address || !transferTokenData.amount || !transferTokenData.tokenAddress) {
                return notifyError('Please fill all the fields');
            }
            setLoader(true);
            notifySuccess('Transferring Token...');
            const address = await connectWallet();
            const contract = await COINFLOAT_CONTRACT();
            const _availableBalance = await contract.balanceOf(address);
            const availableToken = ethers.utils.formatEther(_availableBalance.toString());

            if (availableToken > 1) {
                const payAmount = ethers.utils.parseUnits(transferTokenData.amount.toString(), "ether");
                const transaction = await contract.transfer(transferTokenData.address, payAmount, {
                    gasLimit: ethers.utils.hexlify(8000000),
                })
                await transaction.wait();
                setLoader(false);
                setRecall(recall + 1);
                setOpenTransferToken(false);
                notifySuccess('Token Transferred Successfully');
            } else {
                setLoader(false);
                setOpenTransferToken(false);
                notifyError('No Tokens Available');
            }
        } catch (error) {
            setLoader(false);
            setOpenTransferToken(false);
            notifyError("Something went wrong");
            console.log(error);
        }
    }

    const withdrawToken = async (withdrawQuantity) => {
        try {
            if (!withdrawQuantity.amount || !withdrawQuantity.token) {
                return notifyError('Please fill all the fields');
            }
            setLoader(true);
            notifySuccess('Withdrawing Token...');

            const address = await connectWallet();
            const contract = await COINFLOAT_CONTRACT();

            const payAmount = ethers.utils.parseUnits(withdrawQuantity.amount.toString(), "ether");
            const transaction = await contract.withdraw(withdrawQuantity.token, payAmount, {
                gasLimit: ethers.utils.hexlify(8000000),
            })
            await transaction.wait();
            setLoader(false);
            setRecall(recall + 1);
            setOpenWithdrawToken(false);
            notifySuccess('Token Withdrawn Successfully');
        } catch (error) {
            setLoader(false);
            setOpenWithdrawToken(false);
            notifyError("Something went wrong");
            console.log(error);
        }
    }

    return <StateContext.Provider value={{}}>{children}</StateContext.Provider>;
}


export const useStateContext = () => useContext(StateContext);