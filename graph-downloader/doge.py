import requests
import multiprocessing as mp
import datetime
import sys
import time

class Transaction:
  def __init__(self, sender, receiver, amount):
    self.sender = sender
    self.receiver = receiver
    self.amount = amount

#Find index of the first block
def findFirstBlock (timeBound, index):
	step = 10000
	descending = True
	while step > 0 or time < timeBound:   #finding the index of the blocks immediately before the lower bound and then returning index+1
		time = datetime.datetime.fromtimestamp(requests.get('https://sochain.com/api/v2/get_block/DOGE/'+ str(index)).json()['data']['time']).strftime('%Y-%m-%d %H:%M:%S')
		if time < timeBound:
			index = index + step 
			if descending == True:
				step = int(step/2)   
				descending = False
		else: #time >, to decrease
			index = index - step
			if descending ==False:
				step = int(step/2)
				descending = True

	return index + 1

#find index of the last block
def findLastBlock (timeBound, index):
	step = 10000
	time = ''
	while step > 0:
		#print (str(time) + " ___" + str(timeBound) + "    " + str(step))
		response = requests.get('https://sochain.com/api/v2/get_block/DOGE/'+ str(index + step))
		exceed = False
		if response == '<Response [404]>':
			exceed = True
		else:
			time = datetime.datetime.fromtimestamp(response.json()['data']['time']).strftime('%Y-%m-%d %H:%M:%S')
			exceed = time > timeBound

		if exceed:
			step = int(step/2)
		else:
			index = index + step

	return index

#share the workload
def splitInterval (start, end, batches):
	each = int((end - start + 1) / batches)
	res = []
	iterator = start
	for i in range (batches):
		res.append([iterator, (iterator + each - 1)])
		iterator += each
	res [-1][1] = end
	return res


def download(intervals):
	lowerB = intervals[0] 
	upperB = intervals[1]
	blockIterator = lowerB

	while blockIterator <= upperB:
		r = requests.get('https://sochain.com/api/v2/get_block/DOGE/'+ str(blockIterator)).json()
		print (datetime.datetime.fromtimestamp(r['data']['time']).strftime('%Y-%m-%d %H:%M:%S') + '   '+str(mp.current_process().pid))
		for t in r['data']['txs']:
			tx = requests.get('https://sochain.com/api/v2/get_tx/DOGE/' + t)
			try:
				tx = tx.json()
				for i in tx['data']['inputs']:
					nodeSet.add(i['address'])
					for o in tx['data']['outputs']:
						nodeSet.add(o['address'])
						transList.append (Transaction(i['address'], o['address'], 0))  #amount currently disabled
			except:
				print ("Transaction not available, too many requests. Waiting...")
				time.sleep(cores * 5)
		blockIterator += 1

	return nodeSet, transList



start="2020-09-01 00:00:00"
end="2020-09-01 00:30:00"
transList=[]
nodeSet = set()
nodeDict={}
fileRes = "res/doge.net"
cores = 1
if len(sys.argv) > 2:
	start = list(sys.argv[1])
	start[10] = ' '             #adding ' ' between date and hour as requested by the API
	start = "".join(start)
	end = list(sys.argv[2])
	end[10] = ' '
	end = "".join(end)
	if len(sys.argv) > 3:
		fileRes = sys.argv[3]
	if len(sys.argv) == 5:
		cores = int(sys.argv[4])
pool = mp.Pool(processes=cores) 

print ("Finding the index of the first block")
firstBlock = findFirstBlock(start, 3450000)
print ("Finding the index of the last block")
lastBlock = findLastBlock (end, firstBlock)
print("Start reading the blocks")
dates_pairs = splitInterval (firstBlock, lastBlock, cores)

parallelRes = pool.map(download, dates_pairs)
for batch in parallelRes:
	for item in batch[0]:
		nodeSet.add(item)
	for item in batch[1]:
		transList.append(item)

with open(fileRes, 'w') as f:	
	print ("Saving the graph in " + fileRes)	
	print ('*Vertices ' + str(len(nodeSet)), file=f)
	for elem in enumerate (nodeSet):
		nodeDict[elem[1]] = elem[0]
		print (str(elem[0]) + ' "' + str(elem[1]) + '"', file = f)
		
	print ("*Arcs " + str(len(transList)), file = f)
	for t in transList:
		print (str(nodeDict[t.sender]) + ' ' +  str(nodeDict[t.receiver]) + ' ' + str(t.amount), file = f)
	