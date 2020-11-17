# DiLeNA

## Graph Downloader: 

### Usage Bitcoin 

Bitcoin downloader is based on a previous version of the software thus the following tools are required:
*   Node.js
*   [Pm2](http://pm2.keymetrics.io/)

Build the src files (for Bitcoin):
```
$ npm run flow:build
```
The server is meant to be ran using `pm2`.

```
$ pm2 start ecosystem.config.js
```
will start the server instances configured inside `ecosystem.config.js`.

By default the web server will serve on port `8888`. 

The other DLTs are downloaded with Python3 code

### Examples:

to download DLT transactions in a certain time interval:
```
./main.sh -dlt xrp -start "2020-04-01-00:00:00" -end "2020-04-01-00:01:00" -res 'res/xrp.net' -cores 8
./main.sh -dlt eth -api 'your Etherscan.io key' -start "2020-04-01-00:00:00" -end "2020-04-01-00:01:00" -res 'res/ethereum.net' -cores 8
./main.sh -dlt doge -start "2020-04-01-00:00:00" -end "2020-04-01-00:01:00" -res 'res/doge.net' -cores 8
./main.sh -dlt btc -start "2020-04-01" -end "2020-04-01" 
```
For dowloading Etherum blocks an `Etherscan.io` key is needed, otherwise restrictions occur \
For Ripple, Ethereum and Dogecoin it is necessary to install python3 \
Ripple requires library ripple_api, which can be downloaded with the command ``` pip install python-ripple-lib```

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


