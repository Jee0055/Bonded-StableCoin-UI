import React, { useState } from "react";
import ReactGA from "react-ga";
import { Helmet } from "react-helmet";

import { Header } from "./components/Header/Header";
import { Tokens } from "./components/Tokens/Tokens";
import { Reasons } from "./components/Reasons/Reasons";
import { Footer } from "./components/Footer/Footer";
import { BuiltOnrechain_inc } from "./components/BuiltOnrechain_inc/BuiltOnrechain_inc";
import { Liquidity } from "./components/Liquidity/Liquidity";

import styles from "./HomePage.module.css";


export const HomePage = () => {
  const [shownReasons, setShownReasons] = useState(false);
  const [shownLiquidity, setShownLiquidity] = useState(false);
  const [shownBuiltOnrechain_inc, setShownBuiltOnrechain_inc] = useState(false);

  return (
    <div className={styles.container}>
      <Helmet title="Bonded stablecoins" />
      <Header />
      <Tokens />
      <Liquidity onEnterViewport={() => {
        if(!shownLiquidity){
          setShownLiquidity(true);
          ReactGA.event({
            category: "Stablecoin",
            action: "Shown liquidity"
          })
        }
      }} />
      <BuiltOnrechain_inc onEnterViewport={() => {
        if(!shownBuiltOnrechain_inc){
          setShownBuiltOnrechain_inc(true);
          ReactGA.event({
            category: "Stablecoin",
            action: "Shown built on rechain_inc"
          })
        }
      }} />
      <Reasons onEnterViewport={() => {
        if(!shownReasons){
          setShownReasons(true);
          ReactGA.event({
            category: "Stablecoin",
            action: "Shown reasons"
          })
        }
      }} />
      <Footer />
    </div>
  );
};
