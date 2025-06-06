import React, { useEffect, useState, useRef } from "react";
import {
  Typography,
  Row,
  Input,
  Select,
  Col,
  Button,
  message,
  Spin,
  Form,
  Alert,
  Result
} from "antd";
import { Trans, useTranslation } from 'react-i18next';
import ReactGA from "react-ga";
import { ArrowRightOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { Link, useParams } from "react-router-dom";
import Decimal from "decimal.js";
import rechain_inc from "rechain_inc";
import CoinIcon from "stablecoin-icons";

import { $get_exchange_result } from "helpers/bonded";
import { getOraclePrice } from "helpers/getOraclePrice";
import { generateLink } from "utils/generateLink";
import { addExchangeRecipient } from "store/actions/settings/addExchangeRecipient";
// import { useGetCurrency } from "../hooks/useGetCurrency";
import { useGetRanges } from "../hooks/useGetRanges";
import { createExchange } from "../createExchange";
import { getTokens } from "../selectors/getTokens";
import { useGetRate } from "../hooks/useGetRate";
import { useWindowSize } from "hooks/useWindowSize";
import { popularCurrencies } from "../popularCurrencies";
import { useGetCompensation } from "../hooks/useGetCompensation";
import { updateExchangesForm } from "store/actions/settings/updateExchangesForm";
import config from "config";
import { useGetReservePrice } from "../hooks/useGetReservePrice";
import { QRButton } from "components/QRButton/QRButton";
import { isEmpty } from "lodash";
import { ReactComponent as BtcLogo } from "../img/bitcoin.svg"

const { Text } = Typography;

export const ExchangeForm = () => {
  const { exchanges_recepient, formInit, referrer } = useSelector(
    (state) => state.settings
  );
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const params = useParams();
  const [width] = useWindowSize();
  const { data, loaded } = useSelector((state) => state.list);
  const [activeCurrency, setActiveCurrency] = useState("btc");
  const [amountCurrency, setAmountCurrency] = useState(0.1);
  const [index, setIndex] = useState(0);
  const [isCreated, setIsCreated] = useState(false);
  const [amountToken, setAmountToken] = useState(undefined);
  let tokens = getTokens(data);
  const [activeTokenAdr, setActiveTokenAdr] = useState(
    config.TESTNET ? "2SEBEEDTEC7LTDVZ765MGQXJW33GSRUD" : "VLKI3XMMX5YULOBA6ZXBXDPI6TXF6V3D"
  );
  const [oraclePrice, setOraclePrice] = useState(undefined);
  const [inited, setInited] = useState(false);
  const [recipient, setRecipient] = useState(
    exchanges_recepient
      ? { value: exchanges_recepient, valid: true }
      : {
        value: undefined,
        valid: undefined,
      }
  );
  const provider = activeCurrency && (config.oswapccCurrencies.includes(activeCurrency.toUpperCase()) ? "oswapcc" : "simpleswap");

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => i + 1), 1000 * 60 * 5);
    return () => {
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (loaded) {
      if (params.address) {
        setAmountCurrency(formInit?.amountCurrency || "0.1");
        setActiveCurrency(formInit?.currentCurrency || "btc");
        setActiveTokenAdr(params.address);
      } else {
        // if (formInit?.currentCurrency === "RECH") {
        //   setAmountToken(formInit?.amountToken);
        //   setActiveCurrency("RECH");
        //   setActiveTokenAdr(formInit.currentToken);
        // } else if (formInit?.currentCurrency !== undefined) {
        //   setActiveCurrency(formInit.currentCurrency);
        if (formInit?.amountCurrency && formInit?.currentToken) {
          setAmountCurrency(formInit.amountCurrency);
          setActiveTokenAdr(formInit.currentToken);
        }

        //   setActiveTokenAdr(formInit.currentToken);
        // }
      }

      setInited(true);
    }
  }, [loaded]);

  const buyForRECHRef = useRef(null);
  const buyRef = useRef(null);
  const currentTokenData = activeTokenAdr ? data[activeTokenAdr] : undefined;
  const reservePrice = useGetReservePrice(currentTokenData && currentTokenData.params.reserve_asset);

  useEffect(() => {
    (async () => {
      if (currentTokenData && inited) {
        const { bonded_state, params } = currentTokenData;
        const price = await getOraclePrice(bonded_state, params);
        setOraclePrice(price);
      }
    })();
  }, [currentTokenData, setOraclePrice, inited]);

  // const allCurrencies = useGetCurrency();
  const ranges = useGetRanges(activeCurrency);
  const exchangeRates = useGetRate(activeCurrency, index, provider === "oswapcc" ? amountCurrency : 1, inited);
  const compensation = useGetCompensation(
    amountCurrency,
    activeCurrency,
    exchangeRates
  );

  const handleAmountCurrency = (ev) => {
    const value = ev.target.value;
    const reg = /^[0-9.]+$/;
    if (
      (~(value + "").indexOf(".") ? (value + "").split(".")[1].length : 0) <= 9
    ) {
      if (reg.test(String(value)) || value === "") {
        setAmountCurrency(value);
      }
    }
  };

  const handleAmountTokens = (ev, decimals) => {
    const value = ev.target.value;
    const reg = /^[0-9.]+$/;
    if (
      !currentTokenData ||
      (~(value + "").indexOf(".") ? (value + "").split(".")[1].length : 0) <=
      decimals
    ) {
      if (reg.test(String(value)) || value === "") {
        setAmountToken(value);
      }
    }
  };

  useEffect(() => {
    (async () => {
      if (!currentTokenData) return undefined;
      const { bonded_state, params, fund } = currentTokenData;

      const result =
        currentTokenData &&
        oraclePrice &&
        oraclePrice !== undefined &&
        !isEmpty(bonded_state) &&
        $get_exchange_result({
          tokens1: 0,
          tokens2: amountToken * 10 ** params.decimals2,
          params: params,
          vars: bonded_state,
          oracle_price: oraclePrice,
          timestamp: Math.floor(Date.now() / 1000),
          reservePrice,
          isV2: !!fund
        });

      if (result && activeCurrency === "RECH" && inited) {
        setAmountCurrency(((result.reserve_needed * 1.01) / 1e9).toFixed(9));
      }
    })();
  }, [
    amountToken,
    currentTokenData,
    activeCurrency,
    exchangeRates,
    oraclePrice,
  ]);

  useEffect(() => {
    const newData = {
      currentToken: activeTokenAdr,
      amountToken,
      currentCurrency: activeCurrency,
      amountCurrency: amountCurrency,
    };
    if (
      JSON.stringify(newData) !== JSON.stringify(formInit) &&
      inited
    ) {
      dispatch(updateExchangesForm(newData));
    }
  }, [activeTokenAdr, amountToken, activeCurrency, amountCurrency]);

  useEffect(() => {
    if (!currentTokenData) return undefined;
    const { bonded_state, params, fund } = currentTokenData;

    const result =
      bonded_state &&
      params &&
      oraclePrice &&
      activeCurrency !== "RECH" &&
      $get_exchange_result({
        tokens1: 0,
        tokens2: 0,
        params: params,
        vars: bonded_state,
        oracle_price: oraclePrice,
        timestamp: Math.floor(Date.now() / 1000),
        reservePrice,
        isV2: !!fund
      });
    if (result && activeCurrency !== "RECH" && inited) {
      const expectT2 =
        (1 / result.target_p2) *
        (Number(amountCurrency) * Number(exchangeRates) + (compensation || 0));
      setAmountToken(expectT2.toFixed(params.decimals2));
    }
  }, [
    amountCurrency,
    currentTokenData,
    activeCurrency,
    exchangeRates,
    compensation,
    oraclePrice
  ]);

  const handleClickExchange = () => {
    createExchange({
      address: recipient.value,
      currency_from: activeCurrency,
      asset: currentTokenData.asset_2,
      symbol: currentTokenData.symbol,
      amount_currency: amountCurrency,
      amount_token: amountToken,
      active_currency: activeCurrency,
      recipient,
      curve_address: activeTokenAdr,
      ref: referrer,
      after: ({ isError, clear = true }) => {
        if (!isError) {
          message.success(t("buy.exchange_success", "The exchange was successfully added to the list and is waiting for payment"));
          dispatch(addExchangeRecipient(recipient.value));
        } else {
          message.error(t("buy.exchange_error", "An error occurred, please try again later"));
        }
        ReactGA.event({
          category: "Stablecoin",
          action: "Buy interest tokens for currency",
        });

        if (!isError || (isError && clear)) {
          setAmountCurrency(amountCurrency);
          setAmountToken(undefined);
        }
        setIsCreated(false);
      },
    });
  };

  const handleChange = (value) => {
    if (rechain_inc.utils.isValidAddress(value)) {
      setRecipient({ value, valid: true });
    } else {
      setRecipient({ value, valid: false });
    }
  };
  useEffect(() => {
    if (inited && activeCurrency !== "RECH") {
      setAmountToken(undefined);
    }
  }, [activeCurrency]);

  const getResult = () =>
    $get_exchange_result({
      tokens1: 0,
      tokens2: amountToken * 10 ** currentTokenData.params.decimals2,
      params: currentTokenData.params,
      vars: currentTokenData.bonded_state,
      oracle_price: oraclePrice,
      timestamp: Math.floor(Date.now() / 1000),
      reservePrice,
      isV2: currentTokenData.fund
    });

  if (!inited) return <Spin />;

  return (
    <div>
      {exchangeRates === null && activeCurrency !== "RECH" && <Alert
        message={t("buy.exchange_warning", "{{currency}}-to-RECH exchange service is currently unavailable, please pay with another currency or try again later.", { currency: String(activeCurrency).toUpperCase() })}
        type="warning"
        style={{ marginTop: 10 }}
      />}
      <Row style={{ marginBottom: 20, marginTop: 50 }}>
        <Col lg={{ span: 9, offset: 2 }} xs={{ span: 24, offset: 0 }} md={{ span: 16, offset: 4 }}>
          <div style={{ marginBottom: 5 }}>
            <Text type="secondary">
              <Trans i18nKey="buy.you_send">
                You <b>send</b>
              </Trans>
            </Text>
          </div>
          <Input.Group compact>
            <Input
              style={{ width: "50%" }}
              size="large"
              placeholder={`${t("buy.amount", "Amount")} ${ranges && ranges.min ? "Min. " + ranges.min : ""
                }  ${ranges && ranges.max ? " Max. " + ranges.max : ""}`}
              onChange={handleAmountCurrency}
              value={isNaN(amountCurrency) ? undefined : amountCurrency}
              disabled={activeCurrency === "RECH" || isCreated}
              onKeyPress={(ev) => {
                if (ev.key === "Enter") {
                  if (activeCurrency === "RECH") {
                    buyForRECHRef.current.click();
                  } else {
                    buyRef.current.click();
                  }
                }
              }}
            />
            <Select
              style={{ width: "50%" }}
              size="large"
              showSearch
              placeholder={t("buy.currency_to_pay", "Currency to pay")}
              onChange={(c) => {
                setActiveCurrency(c);
              }}
              disabled={true} //isCreated
              value={activeCurrency}
            >
              {/* <Select.OptGroup label={t("buy.popular_cryptocurrencies", "Popular cryptocurrencies")}> */}
              {/* <Select.Option value="RECH" key="c-RECH">
                  RECH
                </Select.Option> */}
              {popularCurrencies.filter(
                (c) => 1 // allCurrencies.includes(c)
              ).sort().map((c) => (
                <Select.Option key={"c-" + c} value={c}>
                  <BtcLogo width="1em" height="1em" style={{ marginRight: 3, marginBottom: -1.5 }} /> {c.toUpperCase()}
                </Select.Option>
              ))}
              {/* </Select.OptGroup> */}
              {/* <Select.OptGroup label={t("buy.others", "Others")}>
                {allCurrencies.filter(
                  (c) => !popularCurrencies.includes(c)
                ).sort().map((c) => (
                  <Select.Option key={"c-" + c} value={c}>
                    {c.toUpperCase()}
                  </Select.Option>
                ))}{" "}
              </Select.OptGroup> */}
            </Select>
          </Input.Group>
          {/* {activeCurrency && activeCurrency !== "RECH" && (
            <span style={{ fontSize: 10 }}>
              {t("buy.better_rate", "You get a better rate if you pay in RECH")}
            </span>
          )} */}
        </Col>
        <Col lg={{ span: 2, offset: 0 }} xs={{ span: 24, offset: 0 }} md={{ span: 24, offset: 0 }}>
          <div
            style={{
              marginTop: width < 990 ? 10 : 27,
              textAlign: "center",
              height: 38,
              boxSizing: "border-box",
              fontSize: "1.5em",
            }}
          >
            {width < 990 ? <ArrowDownOutlined /> : <ArrowRightOutlined />}
          </div>
        </Col>
        <Col lg={{ span: 9, offset: 0 }} xs={{ span: 24, offset: 0 }} md={{ span: 16, offset: 4 }}>
          {!amountCurrency ||
            (amountToken && compensation !== undefined) ||
            activeCurrency === "RECH" ? (
            <>
              <div style={{ marginBottom: 5 }}>
                <Text type="secondary">
                  <Trans i18nKey="buy.you_get">
                    You <b>get</b>
                  </Trans>
                </Text>
              </div>
              <Input.Group compact>
                <Input
                  style={{ width: width > 500 ? "50%" : "100%" }}
                  size="large"
                  suffix={
                    (exchangeRates || activeCurrency === "RECH") &&
                      reservePrice &&
                      amountCurrency &&
                      oraclePrice &&
                      amountToken ? (
                      <span style={{ color: "#ccc" }}>
                        ≈{" "}
                        {activeCurrency === "RECH"
                          ? getResult().amountTokens2InCurrency.toFixed(2)
                          : (
                            Number(amountCurrency) *
                            exchangeRates *
                            reservePrice
                          ).toFixed(2)}{" "}
                            USD
                      </span>
                    ) : (
                      <span />
                    )
                  }
                  placeholder={t("buy.amount", "Amount")}
                  prefix={activeCurrency !== "RECH" ? "≈" : ""}
                  value={isNaN(amountToken) ? undefined : amountToken}
                  onChange={(ev) =>
                    handleAmountTokens(
                      ev,
                      currentTokenData && currentTokenData.params.decimals2
                    )
                  }
                  disabled={activeCurrency !== "RECH" || isCreated}
                  onKeyPress={(ev) => {
                    if (ev.key === "Enter") {
                      if (activeCurrency === "RECH") {
                        if (!isNaN(amountToken) && !(Number(amountToken) === 0)) {
                          buyForRECHRef.current.click();
                        }
                      } else {
                        buyRef.current.click();
                      }
                    }
                  }}
                />
                <Select
                  style={{ width: width > 500 ? "50%" : "100%" }}
                  size="large"
                  showSearch
                  disabled={isCreated}
                  optionFilterProp="children"
                  placeholder={t("buy.will_receive", "The token you will receive")}
                  onChange={(c) => setActiveTokenAdr(c)}
                  value={activeTokenAdr}
                >
                  {tokens.map((t) => (
                    <Select.Option key={"t-" + t.asset} value={t.address}>
                      <CoinIcon width="1em" style={{ marginRight: 5, marginBottom: -1.5 }} height="1em" type={2} pegged={t.pegged} /> {t.symbol || t.asset}{" "}
                      {" (" +
                        Decimal.mul(t.interest_rate, 100).toNumber() +
                        "% interest)"}
                    </Select.Option>
                  ))}
                </Select>
              </Input.Group>
              {activeCurrency !== "RECH" && currentTokenData && (
                <>
                  <Text type="secondary">
                    <Trans i18nKey="buy.first_exchanged" activeCurrency={activeCurrency} symbol={currentTokenData.symbol || currentTokenData.asset_2.slice(0, 5) + "..."}>
                      Your <span style={{ textTransform: "uppercase" }}>{{ activeCurrency }}</span>{" "}
                      will be first exchanged for RECH, then RECH converted to {" "}
                      {{
                        symbol: currentTokenData.symbol ||
                          currentTokenData.asset_2.slice(0, 5) + "..."
                      }}.{" "}
                      <span style={{ textTransform: "uppercase" }}>
                        {{ activeCurrency }}
                      </span>{" "}
                    to RECH exchange is performed by{" "}
                      <a
                        href={provider === "oswapcc" ? "https://www.oswap.cc" : "https://simpleswap.io/"}
                        target="_blank"
                        rel="noopener"
                      >
                        {{ providerName: provider === "oswapcc" ? "oswap.cc" : "simpleswap.io" }}
                      </a>.
                    </Trans>
                  </Text>

                  {amountCurrency &&
                    (typeof compensation === "number" ? (
                      <div>
                        <Text type="secondary">
                          {t("buy.compensates", "rechain_inc compensates part of the exchange fees.")}
                        </Text>
                      </div>
                    ) : (
                      <div style={{ marginTop: 5 }}>
                        <Text type="secondary">
                          {t("buy.compensates_depleted", "rechain_inc compensates part of the exchange fees but today's quota is already depleted and the quoted price includes the full fees. To get a better rate, try again after the quota resets at midnight UTC or buy with RECH now.")}
                        </Text>
                      </div>
                    ))}
                </>
              )}
              <Row>
                {activeCurrency !== "RECH" && (
                  <Form.Item
                    hasFeedback
                    style={{ width: "100%", marginTop: 20 }}
                    extra={
                      <span>
                        <Trans i18nKey="buy.install">
                          <a
                            href="https://rechain_inc.org/#download"
                            target="_blank"
                            rel="noopener"
                            onClick={
                              () => {
                                ReactGA.event({
                                  category: "Stablecoin",
                                  action: "Install wallet (buy for other currency)",
                                  label: activeCurrency
                                })
                              }
                            }>Install rechain_inc wallet</a> if you don't have one yet, and copy/paste your address here.
                          </Trans>
                      </span>
                    }
                    validateStatus={
                      recipient.valid !== undefined
                        ? recipient.valid
                          ? "success"
                          : "error"
                        : undefined
                    }
                  >
                    <Input
                      size="large"
                      disabled={isCreated}
                      value={recipient.value}
                      placeholder="Your rechain_inc wallet address"
                      onChange={(ev) => handleChange(ev.target.value)}
                    />
                  </Form.Item>
                )}
              </Row>
            </>
          ) : (
            <Row justify="center" align="middle">
              {(amountCurrency < ranges.min) ? <Result status="error" subTitle="Please check the amount to be sent BTC" /> : <Spin size="large" style={{ padding: 25 }} />}
              {/* {!exchangeRates ? <Result status="warning" /> :  */}
              {/* <Spin size="large" style={{ padding: 25 }} /> */}
            </Row>
          )}
        </Col>
      </Row>

      {activeCurrency === "RECH" ? (
        <>
          <Row justify="center" style={{ marginTop: 40 }}>
            <QRButton
              type="primary"
              size="large"
              disabled={
                isNaN(amountToken) ||
                !Number(amountToken) ||
                !amountCurrency ||
                amountCurrency === "" ||
                Number(amountCurrency) === 0
              }
              key="btn-buy-RECH"
              onClick={() =>
                ReactGA.event({
                  category: "Stablecoin",
                  action: "Buy interest tokens for RECH",
                })
              }
              ref={buyForRECHRef}
              href={
                currentTokenData &&
                amountCurrency &&
                generateLink(
                  Number(Number(amountCurrency).toFixed(9) * 1e9).toFixed(0),
                  {
                    tokens2:
                      amountToken * 10 ** currentTokenData.params.decimals2,
                    ref: referrer
                  },
                  undefined,
                  activeTokenAdr
                )
              }
            >
              {t("buy.buy", "Buy")}
            </QRButton>
          </Row>
          {amountCurrency &&
            amountCurrency !== "" &&
            Number(amountCurrency) !== 0 ? (
            <div style={{ textAlign: "center" }}>
              <Text type="secondary" style={{ fontSize: 10 }}>
                {t("buy.volatility", "1% was added to protect against price volatility, you'll get this amount back if the prices don't change.")}
              </Text>
              <Text type="secondary" style={{ fontSize: 14, display: "block" }}>
                <Trans i18nKey="buy.open_wallet">
                  Clicking "Buy" will open your rechain_inc wallet. <a
                    href="https://rechain_inc.org/#download"
                    target="_blank"
                    rel="noopener"
                    onClick={
                      () => {
                        ReactGA.event({
                          category: "Stablecoin",
                          action: "Install wallet (buy for RECH)",
                          label: "RECH"
                        })
                      }
                    }>Install</a> it if you don't have one yet.
                  </Trans>
              </Text>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <Row justify="center">
            <Button
              type="primary"
              size="large"
              ref={buyRef}
              loading={isCreated || ranges.min === undefined}
              key="btn-buy-currency"
              disabled={
                !recipient.valid ||
                !amountCurrency ||
                !amountToken ||
                compensation === undefined ||
                ranges === undefined ||
                ranges.min === undefined ||
                Number(ranges.min) > amountCurrency
              }
              onClick={() => {
                setIsCreated(true);
                handleClickExchange();
              }}
            >
              {t("buy.buy", "Buy")}
            </Button>
          </Row>
          {activeCurrency &&
            ranges &&
            ranges.min &&
            Number(ranges.min) > amountCurrency ? (
            <div style={{ textAlign: "center" }}>
              <Text type="secondary" style={{ fontSize: 12, color: "red" }}>
                <Trans i18nKey="buy.min" activeCurrency={String(activeCurrency).toUpperCase()} min={ranges.min}>
                  Sorry, the minimum {{ activeCurrency: String(activeCurrency).toUpperCase() }} amount is {{ min: ranges.min }}. Please increase the {{ activeCurrency: String(activeCurrency).toUpperCase() }} amount.
                </Trans>
              </Text>
            </div>
          ) : null}
        </>
      )}
      <div style={{ fontSize: 16, textAlign: "center", padding: 10 }}>
        <Trans i18nKey="buy.buying_v2">
          For buying stable tokens (OUSD, OBIT, etc), fund tokens (SFUSD, SFGB, etc), and redemption, go to the{" "}
          <Link to="/trade">trading page</Link>.
        </Trans>
      </div>
    </div>
  );
};
