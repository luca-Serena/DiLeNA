from ripple_api import RippleDataAPIClient
import json
from pprint import pprint
import sys

class Transaction:
  def __init__(self, sender, receiver, amount):
    self.sender = sender
    self.receiver = receiver
    self.amount = amount

api = RippleDataAPIClient('https://data.ripple.com')
start="2020-09-04T20:14:40"
end="2020-10-01T00:00:00"
fileRes = "res/file.net"
if len(sys.argv) > 2:
	start = list(sys.argv[1])
	start[10] = 'T'             #adding 'T' between date and hour as requested by the API
	start = "".join(start)
	end = list(sys.argv[2])
	end[10] = 'T'
	end = "".join(end)
	if len(sys.argv) == 4:
		fileRes = sys.argv[3]
	
transList=[]
nodeDict={}
iter=1

#Sometimes weird input are received, in case advance 1 second the start time
def progressStartDate(start):
	print ("weird input received, moving on")
	newSec = int(start[17] + start[18]) + 1
	newStr = str(newSec)
	still = False
	if newSec < 10:
		newStr = '0' + str(newSec)
	if newSec > 59:
		newStr = '00'
		still = True
	start = list(start)
	start[17] = newStr[0]
	start[18] = newStr[1]
	start = "".join(start)
	if still == True:
		still = False
		newMin = int(start[14] + start[15]) + 1
		newStr = str(newMin)
		if newMin < 10:
			newStr = '0' + str(newMin)
		if newMin > 59:
			newStr = '00'
			still = True
		start = list(start)
		start[14] = newStr[0]
		start[15] = newStr[1]
		start = "".join(start)	
		if still == False:
			newHour = int(start[11] + start[12]) + 1
			newStr = str(newHour)
			if newHour < 10:
				newStr = '0' + str(newHour)
			start = list(start)
			start[11] = newStr[0]
			start[12] = newStr[1]
			start = "".join(start)	
	return start

with open(fileRes, 'w') as f:
	while start < end:
		print (start)
		params = {"start" : start, "type": "Payment", "end" : end, "limit" : 100 }
		query_params = dict(params)
		txs = api.get_transactions(**query_params)
		if "transactions" in txs:
			for t in txs["transactions"]:
				if (t["tx"]["Account"] != t["tx"]["Destination"] and start < end):
					if (t["tx"]["Account"] not in nodeDict):
						nodeDict[t["tx"]["Account"]] = iter
						iter += 1
					if (t["tx"]["Destination"] not in nodeDict):
						nodeDict[t["tx"]["Destination"]] = iter
						iter += 1
					
					amount = t["tx"]["Amount"]
					if (isinstance(t["tx"]["Amount"], dict)):
						amount = t["tx"]["Amount"]["value"]		
					transList.append (Transaction(t["tx"]["Account"], t["tx"]["Destination"], amount))
				start = t["date"]
		else: 
			start = progressStartDate(start)
			
	print ('*Vertices ' + str(len(nodeDict)), file=f)
	for elem in nodeDict:
		print (str(nodeDict[elem]) + ' "' + str(elem) + '"', file = f)
		
	print ("*Arcs", file = f)
	for t in transList:
		print (str(nodeDict[t.sender]) + ' ' +  str(nodeDict[t.receiver]) + ' ' + t.amount, file = f)
