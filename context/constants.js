import {ethers} from 'ethers';
import Web3Modal from 'web3modal';

import ERC20Generator from './ERC20Generator.json';
import CoinFloat from './CoinFloat.json';

export const ERC20Generator_ABI = ERC20Generator.abi;
export const ERC20Generator_BYTECODE = ERC20Generator.bytecode;

export const COINFLOAT_ADDRESS = process.env.COINFLOAT_ADDRESS;
export const COINFLOAT_ABI = CoinFloat.abi;

export const PINATA_API_KEY = process.env.PINATA_API_KEY;
export const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

const networks = {
    sepolia: {
        chainId: `0x${Number(42).toString(16)}`,
        chainName: 'Sepolia',
        nativeCurrency: {
            name: 'Sepolia Ether',
            symbol: 'SEP',
            decimals: 18,
        },
        rpcUrls: ['https://eth-sepolia.g.alchemy.com/v2/vte7y06chIfX6lu8gumY8vXwjZrFFxI-'],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
    },
    mainnet: {
        chainId: `0x${Number(1).toString(16)}`,
        chainName: 'Ethereum',
        nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
        },
        rpcUrls: ['https://eth-mainnet.g.alchemy.com/v2/vte7y06chIfX6lu8gumY8vXwjZrFFxI-'],
        blockExplorerUrls: ['https://etherscan.io'],
    },
}

const changeNetwork = async ({networkName}) => {
    try {
        if (window.ethereum) throw new Error('No Crypto Wallet found');
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
                {
                    ...networkName[networkName]
                }
            ]
        })
    } catch (error) {
        console.log(error);
    }
}

export const handleNetworkSwitch = async () => {
    const networkName = 'sepolia';
    await changeNetwork({networkName});
}

export const shortenAddress = (address) => `${address?.slice(0, 5)}...${address?.length - 4}`;

const fetchContract = (address, abi, signer) => new ethers.Contract(address, abi, signer);

export const COINFLOAT_CONTRACT = async() => {
    try {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);

        const signer = provider.getSigner();
        const contract = fetchContract(COINFLOAT_ADDRESS, COINFLOAT_ABI, signer);

        return contract;
    } catch (error) {
        console.log(error);
    }
}

export const TOKEN_CONTRACT = async(TOKEN_ADDRESS) => {
    try {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);

        const signer = provider.getSigner();
        const contract = fetchContract(TOKEN_ADDRESS, ERC20Generator_ABI, signer);

        return contract;
    } catch (error) {
        console.log(error);
    }
}