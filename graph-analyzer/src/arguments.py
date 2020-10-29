import sys

args_list = {
	"graph": str,
	"result": str,
	"process": int,
	"weight": bool
}

def arguments():
    filtered = [arg for arg in sys.argv if arg[0] == "-"]
    args = {}
    for elem in filtered:
	    (k, v) = elem.split("=")
	    k = k[1:]
	    if k in args_list:
		    args[k] = args_list[k](v)
    return args