from multiprocessing import Pool

import metrics
import logger

class AnalyzableGraph:

    def __init__(self, graph, processes_number):
        self.__pool = Pool(processes=processes_number)
        self.__graph = graph
        self.__metrics = {}

    def add_metric(self, metric_name, metric, args=[]):
        params = []
        params.append(self.__graph)
        params += args
        if metric_name not in self.__metrics:
            self.__metrics[metric_name] = self.__pool.apply_async(func=metric, args=params)
        else:
            if not isinstance(self.__metrics[metric_name], list):
                elem = self.__metrics[metric_name]
                self.__metrics[metric_name] = []
                self.__metrics[metric_name].append(elem)

            self.__metrics[metric_name].append(self.__pool.apply_async(func=metric, args=params))
    
    def close_pool(self):
        #cannot submit other tasks
        self.__pool.close()
		#wait results
        self.__pool.join()

    def get_results(self):
        for key, value in self.__metrics.items():
            if isinstance(value, list):
                self.__metrics[key] = [elem.get() for elem in value]
            else:
                self.__metrics[key] = value.get()

        return self.__metrics