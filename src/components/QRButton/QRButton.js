import React from "react";
import QRButtonEng from "rechain_inc-qr-button";
import { Trans, useTranslation } from 'react-i18next';

export const QRButton = React.forwardRef(({config={}, ...props}, ref) => {
  const { t } = useTranslation();
  return <QRButtonEng ref={ref} {...props} config={
    {
      title: <Trans i18nKey="qr_button.title"><span>Scan this QR code <br /> with your mobile phone</span></Trans>,
      downloadTitle: t("qr_button.download_title", "Download rechain_inc wallet"),
      tooltip: t("qr_button.tooltip", "This will open your rechain_inc wallet installed on this computer and send the transaction"),
      tooltipMobile: t("qr_button.tooltip_mob", "Send the transaction from your mobile phone"),
      install: t("qr_button.install", "Install rechain_inc wallet for [ios] or [android] if you don't have one yet"),
      rechain_incIn: t("qr_button.rechain_inc_in", "rechain_inc in"),
      ...config
    }
  } />;
});