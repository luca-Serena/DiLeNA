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
  esac
done

start = "${start//+(-)/ }"
end = "${end//+(-)/ }"

case $DLT in
eth | ethereum | Ethereum | ETH)
  python3 ethereum.py $API $START $END $RES
  ;;
btc | bitcoin | Bitcoin | BTC) 
  node ./build/no-layout/start-no-layout.js -type=btc -firstDate=$start -lastDate=$END
  ;;
xrp | ripple | Ripple | XRP)
  python3 ripple.py $START $END $RES
  ;;
doge | dogecoin | Dogecoin | DOGE)
  python3 doge.py $STAT $END $RES
  ;;
*)
  echo "DLT not available. Allowed options are: -eth, -btc -xrp, -doge"
  ;;
esac



