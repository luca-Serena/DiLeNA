'''	##############################################################################################
	DILENA, Distributed Ledger Network Analyzer			http://pads.cs.unibo.it

	Description:
		- download transaction graphs of certain Distributed Ledgers, at given time intervals
		- analyze the transaction graphs with multiple metrics

	Software developed by ANANSI research group:
		Gabriele D'Angelo <g.@unibo.it> Stefano Ferretti <stefano.ferretti@uniurb.it> Luca Serena <luca.serena2@unibo.it> Mirko Zichichi <mirko.zichichi@upm.es>

	############################################################################################### '''
import os
import sys
import random
import networkx as nx

import graph_creator
import output_manager
import logger
import metrics
from arguments import arguments
from analyzable_graph import AnalyzableGraph

def analyze_loaded(graph, processNumber, weight=False):

	logger.log("Start metrics computing for complete loaded graph")
	graph_analyzer = AnalyzableGraph(graph, processNumber)

	fraction_sample = 1/1
	sample = random.sample(graph.nodes, int (len(graph.nodes) * fraction_sample ))

	
	#submit global metrics
	graph_analyzer.add_metric("graph_nodes_number", metric= metrics.nodes_number)
	graph_analyzer.add_metric("graph_edges_number", metric= metrics.edges_number)
	#graph_analyzer.add_metric("graph_load_centrality", metric=metrics.load_centrality)
	graph_analyzer.add_metric("graph_clust_coeff", metric=metrics.clustering_coefficient)
	graph_analyzer.add_metric("graph_deg_distr_tot", 
		metric=metrics.degree_distribution, args=("tot", ))
	graph_analyzer.add_metric("graph_deg_distr_in", 
		metric=metrics.degree_distribution, args=("in", ))
	graph_analyzer.add_metric("graph_deg_distr_out", 
		metric=metrics.degree_distribution, args=("out", ))

	graph_analyzer.close_pool()

	logger.log("Terminated metrics computing for complete loaded graph")

	#get complete graph results
	graph_results = graph_analyzer.get_results()
	graph_nodes_number = graph_results["graph_nodes_number"]
	graph_edges_number = graph_results["graph_edges_number"]
	#graph_load_centrality = graph_results["graph_load_centrality"]
	graph_clust_coeff = graph_results["graph_clust_coeff"]
	graph_deg_distr_tot = graph_results["graph_deg_distr_tot"]
	graph_deg_distr_in = graph_results["graph_deg_distr_in"]
	graph_deg_distr_out = graph_results["graph_deg_distr_out"]


	
	#get main component in main process, cannot submit other without result of this
	logger.log("Start metrics computing for main component of loaded graph")
	main_component = metrics.main_component(graph)
	main_comp_analyzer = AnalyzableGraph(main_component, processNumber)
	
	main_comp_sample = random.sample(main_component.nodes, int (len(main_component.nodes) * fraction_sample ))


	#submit metrics based on main_component
	main_comp_analyzer.add_metric("main_comp_nodes_number", metric= metrics.nodes_number)
	main_comp_analyzer.add_metric("main_comp_edges_number",metric= metrics.edges_number)
	main_comp_analyzer.add_metric("main_comp_clust_coeff", metric=metrics.clustering_coefficient)
	main_comp_analyzer.add_metric("main_comp_deg_distr_tot",
		 metric=metrics.degree_distribution, args=("tot", ))
	main_comp_analyzer.add_metric("main_comp_deg_distr_in", 
		metric=metrics.degree_distribution, args=("in", ))
	main_comp_analyzer.add_metric("main_comp_deg_distr_out", 
		metric=metrics.degree_distribution, args=("out", ))

	for node in main_comp_sample:
		main_comp_analyzer.add_metric("main_comp_avg_path_len", 
			metric=metrics.total_paths_length_from_source, args=(node, main_comp_sample, ))

	if weight:
		for node in main_component.nodes:
			main_comp_analyzer.add_metric("main_comp_avg_wgh_path_len", 
				metric=metrics.total_paths_length_from_source, args=(node, "weight", ))

	main_comp_analyzer.close_pool()
	logger.log("Terminated metrics computing for main component of loaded graph")

	#get main component results
	main_comp_results = main_comp_analyzer.get_results()
	main_comp_nodes_number = main_comp_results["main_comp_nodes_number"]
	main_comp_edges_number = main_comp_results["main_comp_edges_number"]
	main_comp_clust_coeff = main_comp_results["main_comp_clust_coeff"]
	main_comp_deg_distr_tot = main_comp_results["main_comp_deg_distr_tot"]
	main_comp_deg_distr_in = main_comp_results["main_comp_deg_distr_in"]
	main_comp_deg_distr_out = main_comp_results["main_comp_deg_distr_out"]

	countHops = 0
	countPaths = 0

	for elem in main_comp_results["main_comp_avg_path_len"]:
		countHops+=elem[0]
		countPaths+=elem[1]

	main_comp_avg_path_len = countHops / countPaths


	'''
	if weight:
		main_comp_avg_wgh_path_len = (sum(main_comp_results["main_comp_avg_wgh_path_len"]) / 
			(
				len(main_comp_results["main_comp_avg_wgh_path_len"]) * 
				(len(main_comp_results["main_comp_avg_wgh_path_len"]) -1)
		))
	'''

	logger.log( "Metrics computed for loaded graph")

	res = {
		"global": {
			"nodes_number": graph_nodes_number,
			"edges_number": graph_edges_number,
			"clustering_coefficient": graph_clust_coeff,
			"degree_distribution_tot": graph_deg_distr_tot,
			"degree_distribution_in": graph_deg_distr_in,
			"degree_distribution_out": graph_deg_distr_out
		},
		"main_component": {
			"nodes_number": main_comp_nodes_number,
			"edges_number": main_comp_edges_number,
			"clustering_coefficient": main_comp_clust_coeff,
			"average_path_length": main_comp_avg_path_len,
			"degree_distribution_tot": main_comp_deg_distr_tot,
			"degree_distribution_in": main_comp_deg_distr_in,
			"degree_distribution_out": main_comp_deg_distr_out
		}
	}
	if weight:
		res["main_component"]["average_weighted_path_length"] = main_comp_avg_wgh_path_len
		
	return res

def analyze_random(nodes_number, edges_number, processNumber=1):

	logger.log("Start creating random graph")
	graph = graph_creator.random_graph(nodes_number, edges_number)
	logger.log("Terminated random graph creation")

	logger.log("Start metrics computing for complete random graph")
	graph_analyzer = AnalyzableGraph(graph, processNumber)

	#submit global tasks
	graph_analyzer.add_metric("graph_nodes_number", metric= metrics.nodes_number)
	graph_analyzer.add_metric("graph_edges_number", metric= metrics.edges_number)
	graph_analyzer.add_metric("graph_clust_coeff", metric=metrics.clustering_coefficient)
	graph_analyzer.add_metric("graph_deg_distr_tot", 
		metric=metrics.degree_distribution, args=("tot", ))
	graph_analyzer.add_metric("graph_deg_distr_in", 
		metric=metrics.degree_distribution, args=("in", ))
	graph_analyzer.add_metric("graph_deg_distr_out", 
		metric=metrics.degree_distribution, args=("out", ))

	graph_analyzer.close_pool()

	logger.log("Terminated metrics computing for complete random graph")

	#get results
	graph_results = graph_analyzer.get_results()
	graph_nodes_number = graph_results["graph_nodes_number"]
	graph_edges_number = graph_results["graph_edges_number"]
	graph_clust_coeff = graph_results["graph_clust_coeff"]
	graph_deg_distr_tot = graph_results["graph_deg_distr_tot"]
	graph_deg_distr_in = graph_results["graph_deg_distr_in"]
	graph_deg_distr_out = graph_results["graph_deg_distr_out"]

	main_component = metrics.main_component(graph)
	main_comp_analyzer = AnalyzableGraph(main_component, processNumber)

	#submit metrics based on main_component
	logger.log("Start metrics computing for main component of random graph")
	fraction_sample = 1/1
	main_comp_sample = random.sample(main_component.nodes, int (len(main_component.nodes) * fraction_sample ))

	main_comp_analyzer.add_metric("main_comp_nodes_number", metric= metrics.nodes_number)
	main_comp_analyzer.add_metric("main_comp_edges_number", metric= metrics.edges_number)
	main_comp_analyzer.add_metric("main_comp_clust_coeff", metric=metrics.clustering_coefficient)
	main_comp_analyzer.add_metric("main_comp_deg_distr_tot", 
		metric=metrics.degree_distribution, args=("tot", ))
	main_comp_analyzer.add_metric("main_comp_deg_distr_in", 
		metric=metrics.degree_distribution, args=("in", ))
	main_comp_analyzer.add_metric("main_comp_deg_distr_out", 
		metric=metrics.degree_distribution, args=("out", ))
	
	for node in main_comp_sample:	
		main_comp_analyzer.add_metric("main_comp_avg_path_len", 
			metric=metrics.total_paths_length_from_source, args=(node, main_comp_sample, ))

	main_comp_analyzer.close_pool()

	logger.log("Terminated metrics computing for main component of random graph")

	#get results
	main_comp_results = main_comp_analyzer.get_results()
	main_comp_nodes_number = main_comp_results["main_comp_nodes_number"]
	main_comp_edges_number = main_comp_results["main_comp_edges_number"]
	main_comp_clust_coeff = main_comp_results["main_comp_clust_coeff"]
	main_comp_deg_distr_tot = main_comp_results["main_comp_deg_distr_tot"]
	main_comp_deg_distr_in = main_comp_results["main_comp_deg_distr_in"]
	main_comp_deg_distr_out = main_comp_results["main_comp_deg_distr_out"]

	countHops = 0
	countPaths = 0

	for elem in main_comp_results["main_comp_avg_path_len"]:
		countHops+=elem[0]
		countPaths+=elem[1]

	main_comp_avg_path_len = countHops / countPaths

	logger.log("Metrics computed for random graph")

	return {
		"global": {
			"nodes_number": graph_nodes_number,
			"edges_number": graph_edges_number,
			"clustering_coefficient": graph_clust_coeff,
			"degree_distribution_tot": graph_deg_distr_tot,
			"degree_distribution_in": graph_deg_distr_in,
			"degree_distribution_out": graph_deg_distr_out
		},
		"main_component": {
			"nodes_number": main_comp_nodes_number,
			"edges_number": main_comp_edges_number,
			"clustering_coefficient": main_comp_clust_coeff,
			"average_path_length": main_comp_avg_path_len,
			"degree_distribution_tot": main_comp_deg_distr_tot,
			"degree_distribution_in": main_comp_deg_distr_in,
			"degree_distribution_out": main_comp_deg_distr_out
		}
	}

def main():

	args = arguments()
	#parse params
	if "graph" not in args or "result" not in args:
		print("Missing params specify arguments:\n"
		"-graph -result -process -weight\n"
		"graph => path of graph from src folder\n"
		"result => name of file with results\n"
		"process => optional, improve performance best value is number of core\n"
		"weight => optional, compute also weighted average shortest path only loaded graph")
	else:
		GRAPH_PATH = args["graph"]
		OUTPUT_NAME = args["result"]
		PROCESSES_NUMBER = args["process"] if "process" in args else 1
		WEIGHTED = args["weight"] if "weight" in args else False

		if not os.path.exists(GRAPH_PATH):
			print("File {0} does not exist, please check your path".format(GRAPH_PATH))
			sys.exit(1)

		logger.config_logger(OUTPUT_NAME)
		
		#load file
		logger.log("Start loading graph")
		loaded_graph = graph_creator.load_pajek(GRAPH_PATH)
		logger.log("Terminated graph loading")
		
		if len(loaded_graph.edges) != 0:

			loaded_metrics = analyze_loaded(loaded_graph, PROCESSES_NUMBER, WEIGHTED)
			results = {}
			results["loaded_graph"] = loaded_metrics
			#output_manager.save_json_file(results, "temp_"+OUTPUT_NAME)
			random_metrics = analyze_random(nodes_number=loaded_graph.number_of_nodes(), 
				edges_number=loaded_graph.number_of_edges(), processNumber=PROCESSES_NUMBER)

			small_world = {}
			small_world["L"] = ("NaN" if random_metrics["main_component"]["average_path_length"] == 0 
				else loaded_metrics["main_component"]["average_path_length"] / 
					random_metrics["main_component"]["average_path_length"])
			small_world["C"] = ("NaN" if random_metrics["main_component"]["clustering_coefficient"] == 0 
				else loaded_metrics["main_component"]["clustering_coefficient"] / 
					random_metrics["main_component"]["clustering_coefficient"])
			
			
			results["random_graph"] = random_metrics
			results["small_world"] = small_world
			
			logger.log("Start saving metrics")
			output_manager.save_json_file(results, OUTPUT_NAME)
			logger.log("Metrics saved in file: {0}".format(OUTPUT_NAME))
		else:
			logger.log("Empty graph, no metrics calculated")

if __name__ == "__main__":
	main()
