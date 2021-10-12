'''	##############################################################################################
	DILENA, Distributed Ledger Network Analyzer			http://pads.cs.unibo.it

	Description:
		- download transaction graphs of certain Distributed Ledgers, at given time intervals
		- analyze the transaction graphs with multiple metrics

	Software developed by ANANSI research group:
		Gabriele D'Angelo <g.@unibo.it> Stefano Ferretti <stefano.ferretti@uniurb.it> Luca Serena <luca.serena2@unibo.it> Mirko Zichichi <mirko.zichichi@upm.es>

	############################################################################################### '''
from ripple_api import RippleDataAPIClient
import multiprocessing as mp
import sys
import time
import datetime

class Transaction:
  def __init__(self, sender, receiver, amount):
    self.sender = sender
    self.receiver = receiver
    self.amount = amount

#Sometimes weird input are received, in case advance 1 second the start time
def progressStartDate(start):
	if len (start) > 19:
		start = start [: -6] 					# cut +00:00
	oldDate = datetime.datetime.strptime(start, '%Y-%m-%dT%H:%M:%S')
	newDate = oldDate + datetime.timedelta(0,1)
	return newDate.strftime('%Y-%m-%dT%H:%M:%S')

def splitInterval (start, end, batches):
	sd = datetime.datetime.strptime(start, '%Y-%m-%dT%H:%M:%S')
	ed = datetime.datetime.strptime(end, '%Y-%m-%dT%H:%M:%S')
	diff = int((ed-sd).total_seconds())
	tSplit = int(diff / batches) - 1
	res = []
	iterDate = sd
	for i in range (batches):
		endBatch =  iterDate + datetime.timedelta(0,tSplit)
		temp = [iterDate.strftime('%Y-%m-%dT%H:%M:%S'), endBatch.strftime('%Y-%m-%dT%H:%M:%S')]
		iterDate = endBatch + datetime.timedelta(0, 1)
		res.append(temp)
	res [-1][1] = end
	return res

#called by each core. Just payment transactions are stored
def download (intervals):
	start = intervals[0]
	end = intervals[1]
	previousDate = ''       					    #avoid starvation in case of 100 transactions in the same second
	while start < end:
		if start == previousDate:					#control for starvation
			start = progressStartDate(start)
		previousDate = start
		print (start + "   Process: " + str(mp.current_process().pid))
		params = {"start" : start, "type": "Payment",  "limit" : 100 }
		query_params = dict(params)
		txs = api.get_transactions(**query_params)
		if "transactions" in txs:					#if not, probably error 429 occurred
			for t in txs["transactions"]:
				if (t["tx"]["Account"] != t["tx"]["Destination"] and start < end):
					nodeSet.add(t["tx"]["Account"])
					nodeSet.add(t["tx"]["Destination"])
					amount = t["tx"]["Amount"]
					if (isinstance(t["tx"]["Amount"], dict)):
						amount = t["tx"]["Amount"]["value"]		
					transList.append (Transaction(t["tx"]["Account"], t["tx"]["Destination"], (amount + " " + str(mp.current_process().pid)) ))
				start = t["date"]
		else: 
			print ("Too many requests, waiting...")
			time.sleep (cores * 5)					#wait some time to not overload the server

	return transList, nodeSet


api = RippleDataAPIClient('https://data.ripple.com')
start="2019-01-01T00:00:00"
end="2019-01-01T01:00:00"
fileRes = "res/xrp.net"
cores = 1
if len(sys.argv) > 2:
	start = list(sys.argv[1])
	start[10] = 'T'          	   	#adding 'T' between date and hour as requested for the format
	start = "".join(start)
	end = list(sys.argv[2])
	end[10] = 'T'
	end = "".join(end)
	if len(sys.argv) > 3:      		# file where to store the output
		fileRes = sys.argv[3]
	if len(sys.argv) == 5:			#number of cores to use
		cores = int(sys.argv[4])
	
transList=[]		
nodeSet = set()						#set of nodes. Set data structure helps avoiding repetitions
nodeDict={}							#it will map incremental int id with addresses
pool = mp.Pool(processes=cores) 
dates_pairs = splitInterval (start, end, cores)			#calculate time intervals to split the workload
parallelRes = pool.map(download, dates_pairs)			#dowload in parallel
for batch in parallelRes:
	for item in batch[1]:								#aggregating nodes
		nodeSet.add(item)
	for item in batch[0]:								#aggregating transactions
		transList.append(item)

with open(fileRes, 'w') as f:	
	print ("Saving the graph in " + fileRes)
	print ('*Vertices ' + str(len(nodeSet)), file=f)
	for elem in enumerate (nodeSet):
		nodeDict[elem[1]] = elem[0]
		print (str(elem[0]) + ' "' + str(elem[1]) + '"', file = f)
		
	print ("*Arcs", file = f)
	for t in transList:
		print (str(nodeDict[t.sender]) + ' ' +  str(nodeDict[t.receiver]) + ' ' + t.amount, file = f)
