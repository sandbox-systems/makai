import sys
import os

def file_len(fname):
    with open(fname) as f:
        for i, l in enumerate(f):
            pass
    try:
        return i + 1
    except UnboundLocalError:
        return 0

rootdir = sys.argv[1]
sum = 0

for subdir, dirs, files in os.walk(rootdir):
    for file in files:
        path = os.path.join(subdir, file)
        if 'font-awesome' in path or 'jquery' in path or 'pyc' in path or 'bootstrap' in path or 'treeview' in path or '__init__' in path or 'ace/src' in path or '.git' in path or '.idea' in path or ('py' not in path and 'html' not in path and 'css' not in path and 'js' not in path):
            continue
        print(path)
        len = int(file_len(path))
        sum += len

print("Total number of lines: " + str(sum))

