import "../styles/globals.css";
import Head from "next/head";
import toast, { Toaster } from 'react-hot-toast';

import { StateContextProvider} from '../context/index';

export default function App({ Component, pageProps }) {
  return (
    <>
      <StateContextProvider>
        <Component {...pageProps} />
        <Toaster />
      </StateContextProvider>
    </>
  );
}
