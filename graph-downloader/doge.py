import requests
import datetime
import sys

class Transaction:
  def __init__(self, sender, receiver, amount):
    self.sender = sender
    self.receiver = receiver
    self.amount = amount

start="2020-09-01 00:00:00"
end="2020-09-01 00:10:00"
transList=[]
nodeDict={}
indexIterator=1
fileRes = "res/file.net"
if len(sys.argv) > 2:
	start = list(sys.argv[1])
	start[10] = ' '             #adding ' ' between date and hour as requested by the API
	start = "".join(start)
	end = list(sys.argv[2])
	end[10] = ' '
	end = "".join(end)
	if len(sys.argv) == 4:
		fileRes = sys.argv[3]

def findFirstBlock (timeBound, index):
	step = 10000
	while step > 1:
		#print (index)
		time = datetime.datetime.fromtimestamp(requests.get('https://sochain.com/api/v2/get_block/DOGE/'+ str(index)).json()['data']['time']).strftime('%Y-%m-%d %H:%M:%S')
		if time < timeBound:
			index = index + step - 1
			step = int(step/2)

		else:
			index = index - step
	return index

def findLastBlock (timeBound, index):
	step = 10000
	time = ''
	while step > 1:
		#print (index)
		response = requests.get('https://sochain.com/api/v2/get_block/DOGE/'+ str(index))
		overlap = False
		if response == '<Response [404]>':
			overlap = True
		else :
			time = datetime.datetime.fromtimestamp(response.json()['data']['time']).strftime('%Y-%m-%d %H:%M:%S')
			overlap = time > timeBound

		if overlap:
			index = index - step + 1
			step = int(step/2)
		else:
			index = index + step
	return index

print ("Finding the index of the first block")
firstBlock = findFirstBlock(start, 3450000)
print ("Finding the index of the last block")
lastBlock = findLastBlock (end, firstBlock)
blockIterator = firstBlock
print("Start reading the blocks")

with open('file.net', 'w') as f:
	while blockIterator <=lastBlock:
		r = requests.get('https://sochain.com/api/v2/get_block/DOGE/'+ str(blockIterator)).json()
		print (datetime.datetime.fromtimestamp(r['data']['time']).strftime('%Y-%m-%d %H:%M:%S'))
		for t in r['data']['txs']:
			tx = requests.get('https://sochain.com/api/v2/get_tx/DOGE/' + t).json()
			for i in tx['data']['inputs']:
				if (i['address'] not in nodeDict):
						nodeDict[i['address']] = indexIterator
						indexIterator += 1
				for o in tx['data']['outputs']:
					if (o['address'] not in nodeDict):
						nodeDict[o['address']] = indexIterator
						indexIterator += 1
					transList.append (Transaction(i['address'], o['address'], 0))  #amount currently disabled
		blockIterator += 1

	print ('*Vertices ' + str(len(nodeDict)), file=f)
	for elem in nodeDict:
		print (str(nodeDict[elem]) + ' "' + str(elem) + '"', file = f)
		
	print ("*Arcs", file = f)
	for t in transList:
		print (str(nodeDict[t.sender]) + ' ' +  str(nodeDict[t.receiver]) + ' ' + str(t.amount), file = f)
