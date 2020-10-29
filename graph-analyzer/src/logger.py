import os
import sys
import logging
import time
from datetime import datetime

def config_logger(filename):
	LOG_DIRECTORY = "./../logs"
	LOG_PATH = "{0}/{1}.log".format(LOG_DIRECTORY, filename)

	if not os.path.exists(LOG_DIRECTORY):
		os.makedirs(LOG_DIRECTORY)

	logging.Formatter.converter = time.gmtime
	logging.basicConfig(filename=LOG_PATH, filemode='a', level=logging.INFO,
		format='[%(asctime)s] %(message)s', datefmt='%Y-%m-%d %H:%M:%S')

def log(data):
	'''Print data and save the same data in file whit date in UTC format.'''
    
	logging.info(data)
	print("[" + datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S") + "] " + data) 

def progress_bar(msg, elem, total):
	'''Progress bar showed on terminal'''

	percentage = elem / total * 100
	sys.stdout.write('\r{0}, nodes calculated: {1}/{2}, percentage: {3:.6f}{4}'.format(msg, elem, total, percentage, "%"))
	if elem == total:
		sys.stdout.write('\n')
	sys.stdout.flush() 