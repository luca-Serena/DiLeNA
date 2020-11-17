import requests
import datetime
import sys
import multiprocessing as mp

class Transaction:
  def __init__(self, sender, receiver, amount):
    self.sender = sender
    self.receiver = receiver
    self.amount = amount

def download(intervals):
	lowerB = int(intervals[0])
	upperB = int(intervals[1])
	iterator = lowerB
	while iterator <= upperB:
		r = requests.get('https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=' + hex(iterator) +'&boolean=true&apikey=' + key).json()
		print (str(iterator - lowerB + 1) + ' / ' + str(upperB - lowerB + 1) + "   Process: " + str(mp.current_process().pid))
		if 'result' in r and 'transactions' in r['result']:
			for t in r['result']['transactions']:
				sender = t['from']
				recipient = t['to']
				amount = 0   #amount = t['value']    ------->    disabled currently
				nodeSet.add(sender)
				nodeSet.add(recipient)
				transList.append (Transaction(sender, recipient, amount))
		else:
			print ('Input error on the block occurred, moving on')
		iterator += 1
	return transList, nodeSet


def splitInterval (start, end, batches):
	each = int((end - start + 1) / batches)
	res = []
	iterator = start
	for i in range (batches):
		res.append([iterator, (iterator + each - 1)])
		iterator += each
	res [-1][1] = end
	return res

fileRes = 'res/eth.net'
start="2020-04-01 00:00:00"
end="2020-04-01 00:10:00"
key = 'J5R7CZPRK7GET1VP1BWIB487JYM518NV5K'
cores = 1
if len(sys.argv) > 4:
	key = sys.argv[1]
	start = list(sys.argv[2])
	start[10] = ' '             #adding ' ' between date and hour 
	start = "".join(start)
	end = list(sys.argv[3])
	end[10] = ' '
	end = "".join(end)
	if len(sys.argv) > 4:
		fileRes = sys.argv[4]
	if len(sys.argv) > 5:
		cores = int(sys.argv[5])

startTimestamp = int( datetime.datetime.timestamp(datetime.datetime.strptime(start, '%Y-%m-%d %H:%M:%S'))) #input from date to timestamp
endTimestamp = int( datetime.datetime.timestamp(datetime.datetime.strptime(end, '%Y-%m-%d %H:%M:%S')))
firstBlock = int (requests.get ('https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=' + 
	str(startTimestamp) + '&closest=after&apikey=' + key).json()['result']) 								#first block index
lastBlock = int (requests.get ('https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=' + 
	str(endTimestamp) + '&closest=before&apikey=' + key).json()['result'])  								#last block index

transList=[]
nodeSet = set()
nodeDict={}
pool = mp.Pool(processes=cores) 
dates_pairs = splitInterval (firstBlock, lastBlock, cores)
parallelRes = pool.map(download, dates_pairs)
for batch in parallelRes:
	for item in batch[1]:
		nodeSet.add(item)
	for item in batch[0]:
		transList.append(item)

with open(fileRes, 'w') as f:	
	print ("Saving the graph in " + fileRes)
	print ('*Vertices ' + str(len(nodeSet)), file=f)
	for elem in enumerate (nodeSet):
		nodeDict[elem[1]] = elem[0]
		print (str(elem[0]) + ' "' + str(elem[1]) + '"', file = f)
		
	print ("*Arcs", file = f)
	for t in transList:
		print (str(nodeDict[t.sender]) + ' ' +  str(nodeDict[t.receiver]) + ' ' + str(t.amount), file = f)