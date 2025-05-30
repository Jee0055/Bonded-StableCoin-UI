import React, { useState, useEffect, useRef } from "react";
import { Typography, Steps, Input, Form, Button, Space } from "antd";
import { useTranslation } from 'react-i18next';
import config from "config";
import socket from "services/socket";
import { isBoolean } from "lodash";
import { generateLink } from "utils/generateLink";
import { useWindowSize } from "hooks/useWindowSize.js";
import { getTargetCurrency } from "components/SelectStablecoin/SelectStablecoin";
import { useSelector } from "react-redux";
import { QRButton } from "components/QRButton/QRButton";

const { Title, Text } = Typography;
const { Step } = Steps;

const reservedTokens = ["RECH", "MBYTE", "KBYTE", "BYTE"];
const initStateValue = {
  value: "",
  valid: false,
};
export const RegisterSymbols = (props) => {
  let initCurrentStep = 0;
  if (!props.symbol1 && !props.pendings.tokens1) {
    initCurrentStep = 0;
  } else if (!props.symbol2 && !props.pendings.tokens2) {
    initCurrentStep = 1;
  } else if (!props.symbol3 && !props.pendings.tokens3) {
    initCurrentStep = 2;
  } else if (!props.symbol4 && !props.pendings.tokens4) {
    initCurrentStep = 3;
  }

  const [width] = useWindowSize();
  const [currentStep, setCurrentStep] = useState(initCurrentStep);
  const currentSymbol = currentStep + 1;
  const [isAvailable, setIsAvailable] = useState(undefined);
  const [symbolByCurrentAsset, setSymbolByCurrentAsset] = useState(undefined);
  const [token, setToken] = useState(initStateValue);
  const [tokenSupport, setTokenSupport] = useState(initStateValue);
  const [descr, setDescr] = useState(initStateValue);
  const { params, bonded_state } = useSelector((state) => state.active);
  const { t } = useTranslation();
  const checkRef = useRef(null);
  const regRef = useRef(null);
  const symbolInputRef = useRef(null);

  let currentAsset;

  if (currentSymbol === 1 || currentSymbol === 2 || currentSymbol === 3) {
    currentAsset = props["asset" + currentSymbol];
  } else if (currentSymbol === 4) {
    currentAsset = props.fund_asset;
  }

  let currentDecimals;

  if (currentSymbol === 3 || currentSymbol === 2) {
    currentDecimals = props.decimals2;
  } else if (currentSymbol === 4) {
    currentDecimals = props.reserve_asset_decimals;
  } else {
    currentDecimals = props.decimals1;
  }

  useEffect(() => {
    if (!props.symbol1 && !props.pendings.tokens1) {
      setCurrentStep(0);
    } else if (!props.symbol2 && !props.pendings.tokens2) {
      setCurrentStep(1);
    } else if (!props.symbol3 && !props.pendings.tokens3) {
      setCurrentStep(2);
    } else if (!props.symbol4 && !props.pendings.tokens4) {
      setCurrentStep(3);
    }
  }, [props]);

  useEffect(() => {
    setIsAvailable(undefined);
    setToken(initStateValue);
    setTokenSupport(initStateValue);
    setDescr(initStateValue);
    (async () => {
      const symbol = await socket.api.getSymbolByAsset(
        config.TOKEN_REGISTRY,
        currentAsset
      );
      if (symbol !== currentAsset.replace(/[+=]/, "").substr(0, 6)) {
        setSymbolByCurrentAsset(symbol);
      } else {
        setSymbolByCurrentAsset(null);
      }
    })();
  }, [currentStep, setSymbolByCurrentAsset, currentAsset]);

  useEffect(() => {
    if (isAvailable === null) {
      (async () => {
        const asset = await socket.api.getAssetBySymbol(
          config.TOKEN_REGISTRY,
          token.value
        );
        if (!!asset) {
          setIsAvailable(false);
        } else {
          setIsAvailable(true);
          let initDescr;
          const targetCurrency = getTargetCurrency(params, bonded_state);

          if (currentSymbol === 4) {
            initDescr = `Stability fund shares for ${targetCurrency}-pegged stablecoin (${props.address})`;
          } if (currentSymbol === 3) {
            initDescr = `Stable token for ${targetCurrency}-pegged stablecoin (${props.address})`;
          } else if (currentSymbol === 2) {
            initDescr = `Interest token for ${targetCurrency}-pegged stablecoin (${props.address})`;
          } else if (currentSymbol === 1) {
            initDescr = `Growth token for ${targetCurrency}-pegged stablecoin (${props.address})`;
          }

          setDescr({
            value: initDescr,
            valid: true,
          });

          setTokenSupport({ value: "0.1", valid: true })
        }
      })();
      symbolInputRef?.current.blur();
    } else if (isAvailable === undefined) {
      symbolInputRef?.current.focus({
        cursor: 'start',
      });
    }
  }, [isAvailable, props.address, currentSymbol]);

  const data = {
    asset: currentAsset,
    symbol: token.value,
    decimals:
      (isAvailable && !symbolByCurrentAsset && currentDecimals) || undefined,
    description:
      (isAvailable && descr.valid && !symbolByCurrentAsset && descr.value) ||
      undefined,
  };

  const handleChangeSymbol = (ev) => {
    const targetToken = ev.target.value.toUpperCase();
    // eslint-disable-next-line no-useless-escape
    const reg = /^[0-9A-Z_\-]+$/;
    if (reg.test(targetToken) || !targetToken) {
      if (targetToken.length > 0) {
        if (targetToken.length <= 40) {
          if (reservedTokens.find((t) => targetToken === t)) {
            setToken({ ...token, value: targetToken, valid: false });
          } else {
            setToken({ ...token, value: targetToken, valid: true });
          }
        } else {
          setToken({
            ...token,
            value: targetToken,
            valid: false,
          });
        }
      } else {
        setToken({ ...token, value: targetToken, valid: false });
      }
    }
  };
  const handleChangeSupport = (ev) => {
    const support = ev.target.value;
    const reg = /^[0-9.]+$/;
    const f = (x) =>
      ~(x + "").indexOf(".") ? (x + "").split(".")[1].length : 0;
    if (support) {
      if (reg.test(support) && f(support) <= 9) {
        if (Number(support) >= 0.1) {
          setTokenSupport({ ...token, value: support, valid: true });
        } else {
          setTokenSupport({ ...token, value: support, valid: false });
        }
      }
    } else {
      setTokenSupport({ ...token, value: "", valid: false });
    }
  };
  const handleChangeDescr = (ev) => {
    const { value } = ev.target;
    if (value.length < 140) {
      setDescr({ value, valid: true });
    } else {
      setDescr({ value, valid: false });
    }
  };

  let helpSymbol = undefined;
  if (isBoolean(isAvailable)) {
    if (isAvailable) {
      helpSymbol = t("reg_symbol.available", "Symbol name {{value}} is available, you can register it", { value: token.value });
    } else {
      helpSymbol = t("reg_symbol.taken", "This token name is already taken. This will start a dispute");
    }
  }

  const clickOnRegBtn = (ev) => {
    if (ev.key === "Enter") {
      if (token.valid && descr.valid && tokenSupport.valid) {
        regRef.current.click();
      }
    }
  }

  return (
    <div>
      <Title level={3} type="secondary">
        {t("reg_symbol.title", "Register symbols")}
      </Title>

      <Steps
        current={currentStep}
        style={{ marginTop: 20 }}
        direction={width > 800 ? "horizontal" : "vertical"}
      >
        <Step title={t("reg_symbol.step_growth", "Symbol for growth token")} />
        <Step title={t("reg_symbol.step_interest", "Symbol for interest token")} />
        <Step style={!props.interest ? { display: 'none' } : {}} title={t("reg_symbol.step_stable", "Symbol for stable tokens")} />
        {props.isV2 && <Step title={t("reg_symbol.step_fond", "Symbol for fund tokens")} />}
      </Steps>

      {symbolByCurrentAsset && (
        <p style={{ paddingTop: 20, maxWidth: 600 }}>
          <Text type="secondary">
            {t("reg_symbol.taken_desc", "This stablecoin already has a symbol {{symbol}} assigned to it. Attempting to assign a new symbol will start a dispute process which can take more than 30 days. The symbol that gets more support (in terms of RECH deposits) eventually wins.", { symbol: symbolByCurrentAsset })}
          </Text>
        </p>
      )}
      <Form size="large" style={{ marginTop: 35 }}>
        <Form.Item
          hasFeedback
          extra={helpSymbol}
          validateStatus={
            (isAvailable === false && "warning") ||
            (isAvailable === true && "success")
          }
        >
          <Input
            placeholder={t("reg_symbol.symbol", "Symbol")}
            allowClear
            autoFocus={true}
            ref={symbolInputRef}
            disabled={isBoolean(isAvailable)}
            autoComplete="off"
            value={token.value}
            onChange={handleChangeSymbol}
            onKeyPress={(ev) => {
              if (ev.key === "Enter") {
                if (token.valid) {
                  checkRef.current.click();
                }
              }
            }}
          />
        </Form.Item>
        {isAvailable !== undefined && isAvailable !== null && (
          <Form.Item>
            <Input
              placeholder={t("reg_symbol.placeholder_support", "Support (Min amount 0.1 GB)")}
              suffix="GB"
              autoComplete="off"
              value={tokenSupport.value}
              onChange={handleChangeSupport}
              autoFocus={isBoolean(isAvailable)}
              onKeyPress={clickOnRegBtn}
            />
          </Form.Item>
        )}
        {isAvailable === true && !symbolByCurrentAsset && (
          <Form.Item>
            <Form.Item
              hasFeedback
            // validateStatus={descr && !descr.valid ? "error" : null}
            >
              <Input.TextArea
                style={{ fontSize: 16 }}
                rows={5}
                value={descr.value}
                onChange={handleChangeDescr}
                placeholder={t("reg_symbol.placeholder_desc", "Description of an asset (up to 140 characters)")}
              />
            </Form.Item>
          </Form.Item>
        )}
        <Form.Item>
          <Space>
            {isAvailable === undefined || isAvailable === null ? (
              <Button
                onClick={() => {
                  setIsAvailable(null);
                }}
                key="btn-check"
                loading={isAvailable === null}
                disabled={token.value === "" || !token.valid}
                ref={checkRef}
              >
                {t("reg_symbol.check_availability", "Check availability")}
              </Button>
            ) : (
              <QRButton
                disabled={!token.valid || !tokenSupport.valid}
                key="btn-reg"
                ref={regRef}
                href={generateLink(
                  tokenSupport.value * 1e9,
                  data,
                  props.activeWallet,
                  config.TOKEN_REGISTRY
                )}
              >
                {isAvailable && !symbolByCurrentAsset
                  ? t("reg_symbol.register", "Register")
                  : t("reg_symbol.register_anyway", "Register anyway")}
              </QRButton>
            )}
            <Button
              type="link"
              danger
              onClick={() => {
                props.handleSkip(true);
              }}
            >
              {t("reg_symbol.skip", "Skip")}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};
