#!/usr/bin/env bash
while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
  -dlt)
    DLT="$2"
    shift # past argument
    shift # past value
    ;;
  -start)
    START="$2"
    shift # past argument
    shift # past value
    ;;
  -end)
    END="$2"
    shift
    shift
    ;;
  -api)
    API="$2"
    shift
    shift
    ;;
  -res)
    RES="$2"
    shift
    shift
    ;;
  -cores)
    CORES="$2"
    shift
    shift
    ;;
  esac
done

case $DLT in
eth | ethereum | Ethereum | ETH)
  python3 ethereum.py $API $START $END $RES $CORES
  ;;
btc | bitcoin | Bitcoin | BTC) 
  python3 soChainDownloader.py 'BTC' $START $END $RES $CORES
  ;;  
btc2 | bitcoin2 | Bitcoin2 | BTC2) 
  node ./build/no-layout/start-no-layout.js -type=btc -firstDate=$START -lastDate=$END
  ;;
xrp | ripple | Ripple | XRP)
  python3 ripple.py $START $END $RES $CORES
  ;;
doge | dogecoin | Dogecoin | DOGE)
  python3 soChainDownloader.py 'DOGE' $START $END $RES $CORES
  ;;
zcash | ZCash | zec | ZEC)
  python3 soChainDownloader.py 'ZEC' $START $END $RES $CORES
  ;;
dash | DASH)
  python3 soChainDownloader.py 'DASH' $START $END $RES $CORES
  ;;
LTC | ltc | Litecoin| litecoin)
  python3 soChainDownloader.py 'LTC' $START $END $RES $CORES
  ;;
*)
  echo "DLT not available. Allowed options are: -eth, -btc -xrp, -doge, -zec, -dash, -ltc"
  ;;
esac



