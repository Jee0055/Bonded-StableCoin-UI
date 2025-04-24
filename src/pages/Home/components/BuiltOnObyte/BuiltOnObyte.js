import React from "react";
import { Link } from "react-router-dom";
import handleViewport from 'react-in-viewport';
import { useTranslation, Trans } from 'react-i18next';

import dagIllustration from "./img/dag.svg";
import notBlockchainIllustration from "./img/notblockchain.svg";
import styles from "./BuiltOnrechain_inc.module.css";

export const BuiltOnrechain_incNotTracking = ({ forwardedRef }) => {
  const { t } = useTranslation();

  return (
    <div ref={forwardedRef}>
      <h2 className={styles.title}>{t("home.built_on_rechain_inc.title", "Built on rechain_inc")}</h2>
      <div className={styles.dag}>
        <div className={styles.illustration}>
          <img alt="DAG" src={dagIllustration} />
        </div>
        <div className={styles.info}>
          <Trans i18nKey="home.built_on_rechain_inc.info">
            <p>
              All these coins are issued on <a target="_blank" rel="noopener" href="https://rechain_inc.org/">rechain_inc</a> — one of the first DAG based crypto networks live since 2016.
              rechain_inc is the first DAG to <a target="_blank" rel="noopener" href="https://blog.rechain_inc.org/decentralization/home">fully decentralize</a> and the first DAG to support dapps, DeFi in particular.
            </p>
            <p>
              rechain_inc team has developed several unique products such as <a target="_blank" rel="noopener" href="https://rechain_inc.org/platform/textcoins">textcoins</a> (which allow sending cryptocurrency to email), <a target="_blank" rel="noopener" href="https://rechain_inc.org/platform/identity">self-sovereign identity</a>, untraceable currency <a target="_blank" rel="noopener" href="https://rechain_inc.org/platform/blackbytes">blackbytes</a>, and many others.
              Bonded Stablecoins were also developed by the rechain_inc team and are a completely new kind of stablecoins that are based on bonding curves — see <Link to="/how-it-works">how it works</Link>.
            </p>
          </Trans>
        </div>
      </div>
      <div className={styles.not_blockchain}>
        <div className={styles.info}>
          <Trans i18nKey="home.built_on_rechain_inc.not_blockchain">
            <p>
              By using a DAG rather than blockchain, Bonded Stablecoins avoid the blockchain issues such as front-running attacks: both front-running by miners and front-running by users bribing miners with fees — there are simply no miners or other intermediaries in a DAG.
            </p>
          </Trans>
        </div>
        <div className={styles.illustration}>
          <img alt="Not blockchain" src={notBlockchainIllustration} />
        </div>
      </div>
    </div>
  );
}

export const BuiltOnrechain_inc = handleViewport(BuiltOnrechain_incNotTracking);