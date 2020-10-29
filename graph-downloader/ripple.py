from ripple_api import RippleDataAPIClient
import json
from pprint import pprint

class Transaction:
  def __init__(self, sender, receiver, amount):
    self.sender = sender
    self.receiver = receiver
    self.amount = amount

api = RippleDataAPIClient('https://data.ripple.com')
# to get name of a specific transaction type please refer to this link:
# https://developers.ripple.com/transaction-types.html
#start="2020-09-01T00:00:00"
start="2020-09-04T20:14:40"
end="2020-10-01T00:00:00"
nodeSet = set()
transList=[]
nodeDict={}
iter=1

def progressStartDate(start):
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

with open('file.net', 'w') as f:
	while start < end:
		print (start)
		params = {"start" : start, "type": "Payment", "end" : end, "limit" : 100 }
		query_params = dict(params)
		txs = api.get_transactions(**query_params)
		if "transactions" in txs:
			#print (txs["transactions"])
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
		

def progressStartDate(start):
	print("weird input")
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
				
			
			
		
	'''print('{"nodes":[', file = f)
	justOne = False
	for n in nodeSet:
		if justOne == False :
			print('\t\t{"id": "' + n + '"}', file = f, end ="")
		else:	
			print(',\n\t\t{"id": "' + n + '"}', file = f, end ="")
		justOne = True
	print('\n\t],"links":[\n', file=f, end='')
	for t in transList:
		if justOne == False :
			#print(',\n\t\t{"source":"' + str(t.sender) + '","target":"' + str(t.receiver) + '","amount":' + str(t.amount) + "}", file = f, end ="")
			print(',\n\t\t{"source":"' + str(t.sender) + '","target":"' + str(t.receiver) + '"}', file = f, end ="")
		else:	
			print('\t\t{"source":"' + t.sender + '","target":"' + t.receiver +  '"}', file = f, end ="")#'","amount":' + t.amount + "}", file = f, end ="")
		justOne = False
		
	print('\n]}', file = f)
	'''


