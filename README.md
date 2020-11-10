# DiLeNA

Graph Downloader:

Examples:
#to download Ripple transactions in a certain time interval \n
./main.sh -dlt xrp -start "2020-04-01-00:00:00" -end "2020-04-01-00:01:00" -res 'res/xrp.net' \n
./main.sh -dlt eth -api 'your Etherscan.io key' -start "2020-04-01-00:00:00" -end "2020-04-01-00:01:00" -res 'res/ethereum.net' \n
./main.sh -dlt doge -start "2020-04-01-00:00:00" -end "2020-04-01-00:01:00" -res 'res/doge.net' \n
./main.sh -dlt btc -start "2020-04-01" -end "2020-04-01"
