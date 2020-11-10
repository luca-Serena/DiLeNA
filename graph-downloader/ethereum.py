import requests
import datetime
import sys

class Transaction:
  def __init__(self, sender, receiver, amount):
    self.sender = sender
    self.receiver = receiver
    self.amount = amount

fileRes = 'file.net'
start="2020-04-01 00:00:00"
end="2020-04-01 00:10:00"
if len(sys.argv) > 4:
	key = sys.argv[1]
	start = sys.argv[2]
	end = sys.argv[3]
	if len(sys.argv) == 5:
		fileRes = sys.argv[4]
		
nodeSet = set()
transList=[]
nodeDict={}
indexIterator=1
startTimestamp = int( datetime.datetime.timestamp(datetime.datetime.strptime(start, '%Y-%m-%d %H:%M:%S'))) #from date to timestamp
endTimestamp = int( datetime.datetime.timestamp(datetime.datetime.strptime(end, '%Y-%m-%d %H:%M:%S')))
key = 'J5R7CZPRK7GET1VP1BWIB487JYM518NV5K'
firstBlock = int (requests.get ('https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=' + 
	str(startTimestamp) + '&closest=after&apikey=' + key).json()['result'])
lastBlock = int (requests.get ('https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=' + 
	str(endTimestamp) + '&closest=before&apikey=' + key).json()['result'])
toDownload = lastBlock - firstBlock

blockIterator = firstBlock
with open(fileRes, 'w') as f:
	while blockIterator <=lastBlock:
		r = requests.get('https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=' + hex(blockIterator) +'&boolean=true&apikey=J5R7CZPRK7GET1VP1BWIB487JYM518NV5K' + key).json()
		print (str(blockIterator - firstBlock) + ' / ' + str(toDownload))
		for t in r['result']['transactions']:
			sender = t['from']
			recipient = t['to']
			amount = 0
			#amount = t['value']  disabled currently
			if (sender not in nodeDict):
				nodeDict[sender] = indexIterator
				indexIterator += 1
			if (recipient not in nodeDict):
				nodeDict[recipient] = indexIterator
				indexIterator += 1
				#print (i['address'] + " " + o['address'], file = f)
				transList.append (Transaction(sender, recipient, amount))
		blockIterator += 1

	print ('*Vertices ' + str(len(nodeDict)), file=f)
	for elem in nodeDict:
		print (str(nodeDict[elem]) + ' "' + str(elem) + '"', file = f)
		
	print ("*Arcs", file = f)
	for t in transList:
		print (str(nodeDict[t.sender]) + ' ' +  str(nodeDict[t.receiver]) + ' ' + str(t.amount), file = f)
