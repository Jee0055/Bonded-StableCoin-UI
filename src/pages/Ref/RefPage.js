import React, { useEffect, useState } from "react";
import { Col, Row, Typography, message, Table, Space } from "antd";
import { useSelector } from "react-redux"
import { Helmet } from "react-helmet";
import { Trans, useTranslation } from 'react-i18next';
import moment from 'moment';
import { FacebookShareButton, FacebookIcon, VKShareButton, VKIcon, TwitterShareButton, TwitterIcon, TelegramShareButton, TelegramIcon } from "react-share";
import axios from "axios";

import RefImage from "./img/ref.svg";
import config from "config";
import styles from "./RefPage.module.css";

const { Title, Paragraph, Text } = Typography;

export const RefPage = ({ setWalletModalVisibility }) => {
  const { activeWallet } = useSelector(state => state.settings);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const [info, setInfo] = useState({});
  const [scale, setScale] = useState(0);

  const currentYear = moment().year();
  const countDays = moment(`${currentYear + 1}-01-01`, "YYYY-MM-DD").diff(`${currentYear}-01-01`, "days");
  const countWeeks = countDays / 7;

  const refUrl = `https://${config.TESTNET ? "testnet." : ""}ostable.org/?r=${activeWallet}`;
  const appInfo = {
    url: refUrl,
    title: "rechain_inc bonded stablecoins: earn 16% interest in USD, 11% in BTC",
    hashtag: "#rechain_inc"
  }
  const columns = [
    {
      title: t("ref.address", "Address"),
      dataIndex: "address",
      key: "address",
      ellipsis: {
        showTitle: true,
      },
    },
    {
      title: t("ref.usd_balance", "USD balance"),
      dataIndex: "usd_balance",
      key: "usd_balance",
      render: (value) => {
        return Number(value).toFixed(2) || <span>—</span>
      }
    }
  ];

  useEffect(() => {
    (async () => {
      let error = false;
      const infoData = await axios.get(`${config.REFERRAL_URL}/referrals/${activeWallet}`).catch((e) => {
        error = true;
        console.log("e", e);
      });

      if (!infoData || ("error" in infoData)) return setLoading(false);

      if (infoData) {
        const info = { ...infoData.data.data };
        const total = info && info.referrals && info.referrals.reduce((acc, value) => acc + value.usd_balance, 0);
        info.total = Number(total).toFixed(2);
        
        const distributionInfoData = await axios.get(`${config.REFERRAL_URL}/distributions/next`).catch((e) => {
          error = true;
          console.log("e", e);
        });
        
        if (!distributionInfoData || ("error" in distributionInfoData)) return setLoading(false)
       
        const {data: {data : {total_unscaled_rewards, total_rewards}}} = distributionInfoData;

        const scale = (total_rewards / total_unscaled_rewards) || 0;

        setScale(scale);
        
        if(!error){
          setLoading(false);
          setInfo(info);
        }
        
      }

    })();
  }, [activeWallet]);

  const pReferrerRewards = +Number(10 * scale).toFixed(3);
  const pReferrerRewardsAPY = +Number(10 * scale * countWeeks).toPrecision(4);
  const pReferralRewards = +Number(5 * scale).toFixed(3);

  return <>
    <Helmet title="Bonded stablecoins - Referral program" />
    <Title level={1} style={{ marginBottom: 30 }}>{t("ref.title", "Referral program")}</Title>
    <Row style={{ fontSize: 18 }}>
      <Col xl={{ offset: 1, span: 8 }} sm={{ span: 24 }} xs={{ span: 24 }}>
        <img className={styles.image} src={RefImage} alt="Referral program" />
        {activeWallet && info && !loading && <Paragraph className={styles.myInfo}>
          {info.distribution_date && <div>{t("ref.next_payment", "The next payment is on ")} {info.distribution_date}.</div>}
          {"my_info" in info && <div>{t("ref.expected_reward", "Your expected reward is")} {Number(info.my_info.usd_reward).toFixed(2)} IUSD.
          {info.referrer_address && t("ref.you_were_referred", "You were referred by {{referrer_address}} and this includes a reward for your own balance {{balance}}.", { balance: info.my_info.usd_balance, referrer_address: info.my_info.referrer_address })}</div>}
        </Paragraph>}
      </Col>
      <Col xl={{ offset: 1, span: 14 }} sm={{ span: 24 }} xs={{ span: 24 }}>
        {activeWallet ? <div>
          {t("ref.your_link", "This is your referral link")}:
          <div>
            <div className={styles.urlWrap}>
              <Text copyable={{ onCopy: () => message.success(t("ref.clipboard_link", "Your link was copied to the clipboard")) }}>{refUrl}</Text>
            </div>
          </div>
        </div> : <div className={styles.urlWrap_empty}><Trans i18nKey="ref.no_auth">To get a referral link, <span onClick={setWalletModalVisibility} className={styles.addWallet}>add your wallet address</span></Trans></div>}
        <div className={styles.info}>
          <Paragraph>
            {t("ref.your_link_desc", "Use it in your blogs, tweets, posts, newsletters, public profiles, videos, etc and earn referral rewards for bringing new holders into Bonded Stablecoins.")}
          </Paragraph>
          {activeWallet && <Paragraph>
            <Space style={{ justifyContent: "center", width: "100%" }}>
              <FacebookShareButton {...appInfo}>
                <FacebookIcon size={36} round={true} />
              </FacebookShareButton>
              <VKShareButton {...appInfo}>
                <VKIcon size={36} round={true} />
              </VKShareButton>
              <TwitterShareButton {...appInfo}>
                <TwitterIcon size={36} round={true} />
              </TwitterShareButton>
              <TelegramShareButton {...appInfo}>
                <TelegramIcon size={36} round={true} />
              </TelegramShareButton>
            </Space>
          </Paragraph>}
          <Trans i18nKey="ref.info" pReferrerRewards={pReferrerRewards} pReferrerRewardsAPY={pReferrerRewardsAPY} pReferralRewards={pReferralRewards}>
            <Paragraph>
              The referral rewards are paid in IUSD every Sunday and are proportional to dollar balances of the referred
              users in all tokens (stablecoins, interest tokens, growth tokens) issued on this website, as well as other
              tokens based on them: shares in <a target="_blank" rel="noopener" href="https://oswap.io/">oswap</a> liquidity pools and shares in arbitrage bots.
              The larger the total balances at the end of the weekly period, the larger the reward. Your weekly reward increases if the referred users accumulate more, decreases if they redeem or sell their tokens.
            </Paragraph>
            <Paragraph>
              The current weekly reward is <b>{{pReferrerRewards}}% of the balances of all referred users</b> at the end of the week (<b>{{pReferrerRewardsAPY}}% per year</b>).
            </Paragraph>
            <Paragraph>
              Your referrals also get rewarded for buying tokens through your link — they are expected to get <b>{{pReferralRewards}}% of their balances</b> every week.
            </Paragraph>
            <Paragraph>
              The total amount paid to all referrers and referred users is <b>$3,000 weekly</b> and is distributed in proportion to the referrals balances.
            </Paragraph>
          </Trans>
          {activeWallet && <Paragraph>
            {t("ref.title_list", "Here is the list of your referrals and their current balances")}:
          </Paragraph>}
        </div>
      </Col>
    </Row>

    {activeWallet && <Table
      loading={loading}
      columns={columns}
      footer={() => info && info.total && Number(info.total) !== 0 && <div style={{ display: "flex", justifyContent: "flex-end" }} ><b>{t("ref.total", "Total")}: {info.total} IUSD</b></div>}
      dataSource={((info && info.referrals) || []).map((r) => ({ ...r, key: r.address }))}
      locale={{
        emptyText: t("ref.empty", "no referrals yet"),
      }}
      pagination={{ pageSize: 20, hideOnSinglePage: true }}
    />}

  </>
}