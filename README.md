# DiLeNA

## Graph Downloader: 

### Examples:

to download Ripple transactions in a certain time interval \
```
./main.sh -dlt xrp -start "2020-04-01-00:00:00" -end "2020-04-01-00:01:00" -res 'res/xrp.net' \
./main.sh -dlt eth -api 'your Etherscan.io key' -start "2020-04-01-00:00:00" -end "2020-04-01-00:01:00" -res 'res/ethereum.net' \
./main.sh -dlt doge -start "2020-04-01-00:00:00" -end "2020-04-01-00:01:00" -res 'res/doge.net' \
./main.sh -dlt btc -start "2020-04-01" -end "2020-04-01" \
```


## Graph Analyzer:

### Metrics calculated:

* Number of Nodes
* Number of Edges
* Tot Degree Distribution
* In Degree Distribution
* Out Degree Distribution
* Clustering coefficient
* Average path length (only main component)

Compare data with random graph for small world property.  

### Getting Started

For use this project simply clone this project, install python 3 and Networkx.


```
python3 main.py -graph=string -result=string -process=int -weight=bool
```

* -graph = path of graph reachable from src. 
* -result = name of file with results.
* -processNum = (OPTIONAL) number of process for better performance, default is 1 (sequential execution) recommended core number. 
* -weight = (OPTIONAL) also compute average path length weighted, default is False, high cost.

 ### Output

Some notes about format:
* All degrees are key-value structure, the number of pairs can be different.

Example:

```
{
	"loaded_graph": {
		"global": {
			"nodes_number": int, 
			"edges_number": int, 
			"clustering_coefficient": float, 
			"degree_distribution_tot": {
				"degree1": float
			}, 
			"degree_distribution_in": {
				"degree1": float, 
				"degree2": float
			}, 
			"degree_distribution_out": {
				"degree1": float
			}
		}, 
		"main_component": {
			"nodes_number": int, 
			"edges_number": int, 
			"clustering_coefficient": float, 
			"average_path_length": float, 
			"average_weighted_path_length": float, 
			"degree_distribution_tot": {
				"degree1": float,
				"degree2": float
			}, 
			"degree_distribution_in": {
				"degree1": float, 
				"degree2": float
			}, 
			"degree_distribution_out": {
				"degree1": float
			}
		}
	}, 
	"random_graph": {
		"global": {
			"nodes_number": int, 
			"edges_number": int, 
			"clustering_coefficient": float, 
			"degree_distribution_tot": {
				"degree1": float,
				"degree2": float
			}, 
			"degree_distribution_in": {
				"degree1": float, 
				"degree2": float
			}, 
			"degree_distribution_out": {
				"degree1": float,
				"degree2": float,
				"degree3": float
			}
		}, 
		"main_component": {
			"nodes_number": int, 
			"edges_number": int, 
			"clustering_coefficient": float, 
			"average_path_length": float, 
			"degree_distribution_tot": {
				"degree1": float
			}, 
			"degree_distribution_in": {
				"degree1": float, 
				"degree2": float,
				"degree3": float, 
				"degree4": float
			}, 
			"degree_distribution_out": {
				"degree1": float,
				"degree2": float,
				"degree3": float
			}
		}
	}, 
	"small_world": {
		"L": "NaN"/float, 
		"C": "NaN"/float
	}
}
```


