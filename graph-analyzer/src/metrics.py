import networkx as nx
from collections import defaultdict
from multiprocessing import Lock, Value
from operator import itemgetter 

import logger

__completed_unweighted = Value("i", 0)
__completed_weighted = Value("i", 0)
__progress_bar_lock = Lock()


def nodes_number(graph):
	'''Compute the number of nodes in graph'''

	nodes_num = graph.number_of_nodes()
	logger.log("Nodes number calculated")
	return nodes_num

def edges_number(graph):
	'''Compute the number of edges in graph'''

	edges_num = graph.number_of_edges()
	logger.log("Edges number calculated")
	return edges_num

def degree_distribution(graph, degree_type="tot"):
	'''
	Parameters:
    graph (DiGraph): Graph to analyze
	degree_type (string): tot, out or in for tot_degree, in_degree or out_degree

	Compute degree for each node. Group nodes for degree.
	For each degree count number of nodes then calculate percentage of degree. 
	'''

	degrees = defaultdict(list)

	graph_degree = (graph.out_degree if degree_type == "out" else 
		graph.in_degree if degree_type == "in" else 
		graph.degree)

	#group nodes for degree
	for key, value in sorted(graph_degree):
		degrees[value].append(key)

	#compute percentage for each degree
	for k, v in degrees.items():
		degrees[k] = len(v) #/ graph.number_of_nodes() * 100

	deg_distr = dict(degrees)
	logger.log("Degree distribution {0} calculated".format(degree_type))
	return deg_distr

def clustering_coefficient(graph, weight=None):
	'''Compute graph clustering coefficient'''
	clust_coeff = nx.average_clustering(graph, weight=weight)
	logger.log("Clustering coefficient calculated")
	return clust_coeff

def load_centrality (graph ):
	degs =  dict (graph.degree())
	N = 11
	most_connected = dict(sorted(degs.items(), key = itemgetter(1), reverse = True)[:N]) 
	#most_connected = max(degs.items(), key = lambda x: x[1])[0]
	res = dict()
	for n in most_connected:
		print ("here")
		res [most_connected[n]] = nx.load_centrality (graph, v = n)
	return res #nx.load_centrality (graph, v = most_connected)


def main_component(graph):
	#logger.log("rrr  "+str (len(graph.subgraph(max(nx.weakly_connected_components(graph), key=len)).nodes)  ) + "  _")
	return graph.subgraph(max(nx.weakly_connected_components(graph), key=len)).copy()

def total_paths_length_from_source(graph, source, sample, weight=None):
	'''Compute average shortest paths form one node to others'''

	total_weight = 0.0
	total_paths = 0

	for target in sample:
		if nx.has_path(graph, source, target) and source != target:
			total_weight += nx.shortest_path_length(graph, source, target, weight=weight)
			total_paths += 1
	
	with __progress_bar_lock:
		#need for correct log, one variable generate error with log even if improve code
		if weight != None:
			weightStr = "weighted "
			__completed_weighted.value += 1
			completed = __completed_weighted.value
		else:
			weightStr = ""	
			__completed_unweighted.value += 1
			completed = __completed_unweighted.value
		
		bar_message = "Average {0}path length".format(weightStr)

		logger.progress_bar(bar_message, completed, len(sample))

		if completed == len(sample):
			__completed_weighted.value = 0
			__completed_unweighted.value = 0
			logger.log("{0} calculated".format(bar_message))

	return total_weight, total_paths
	#{'hops': total_weight, 'paths' : total_paths}