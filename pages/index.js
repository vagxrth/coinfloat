import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import { useStateContext } from '../context/index';
import Header from '../components/Header';
import Input from '../components/Input';
import Button from '../components/Button';
import Table from '../components/Table';
import PreSaleList from '../components/PreSaleList';
import UploadLogo from '../components/UploadLogo';
import Loader from '../components/Loader';
import Footer from '../components/Footer';
import ICOMarket from '../components/ICOMarket';
import TokenCreator from '../components/TokenCreator';
import TokenHistory from '../components/TokenHistory';
import MarketPlace from '../components/MarketPlace';
import CreateICO from '../components/CreateICO';
import Card from '../components/Card';
import BuyToken from '../components/BuyToken';
import WithdrawToken from '../components/WithdrawToken';
import TokenTransfer from '../components/TokenTransfer';

const index = (withdrawToken, buyToken, shortenAddress, transferToken, createICOSale, GET_ALL_ICO_TOKENS, GET_ALL_ICO_USERS, createERC20, connectWallet, notifySuccess, notifyError, address, setAddress, accountBalance, setAccountBalance, loader, setLoader, recall, setRecall, currency, setCurrency, openBuyToken, setOpenBuyToken, openWithdrawToken, setOpenWithdrawToken, openTransferToken, setOpenTransferToken, openTokenCreator, setOpenTokenCreator, openCreateICO, setOpenCreateICO, PINATA_API_KEY, PINATA_API_SECRET, COINFLOAT_ADDRESS) => {
  let notifySuccess = (message) => toast.success(message, { duration: 200 });
  let notifyError = (message) => toast.error(message, { duration: 200 });

  const [allICOs, setAllICOs] = useState();
  const [allUserICOs, setAllUserICOs] = useState();
  const [openAllICO, setOpenAllICO] = useState(false);
  const [openTokenHistory, setOpenTokenHistory] = useState(false);
  const [openICOMarketplace, setOpenICOMarketplace] = useState(false);

  const [buyICO, setBuyICO] = useState();

  const copyAddress = () => {
    navigator.clipboard.writeText(COINFLOAT_ADDRESS);
    notifySuccess('Address Copied');
  }
  return (
    <div>
      <Header />
      <Footer />
      <Loader />
    </div>

  )
};

export default index;
