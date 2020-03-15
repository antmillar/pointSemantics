#python library imports
from flask import Flask, render_template, request, redirect, url_for
import os
import torch
import json
import random
import threading
import time

#local module imports
import python_modules.eval as eval
import python_modules.preprocess.utils as preprocess_utils
import python_modules.postprocess.reconstruction as reconstruction



# class ExportingThread(threading.Thread):
#     def __init__(self):
#         self.progress = 0
#         self.status = "Generating Mesh..."
#         super().__init__()

#     def run(self):
#         # Your exporting stuff goes here ...
#         for _ in range(10):
#             time.sleep(1)
#             self.progress += 10

# exporting_threads = {}


app = Flask(__name__ , static_url_path = '/static' )

 #prevent file caching
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

cwd = os.getcwd()
output_path = cwd + '/static/img/output'
load_path = cwd + '/static/models/load'
input_path = cwd + '/static/models/inputs'
input_clean_path = cwd + '/static/models/inputs_clean'
output_path = cwd + '/static/models/outputs'
mesh_path = cwd + '/static/models/meshes'


@app.route('/')
def index():
    return render_template('index.html')

# @app.route('/progress/<int:thread_id>')
# def progress(thread_id):
#     global exporting_threads
#     return str(exporting_threads[thread_id].progress)

@app.route('/modelViewer' , methods=["GET", "POST"])
def modelViewer():

    global exporting_threads

    # thread_id = 1# random.randint(0, 10000)
    # exporting_threads[thread_id] = ExportingThread()
    # exporting_threads[thread_id].start()

    #get list of files
    inputFiles = os.listdir(input_path)    
    outputFiles = os.listdir(output_path)    
    meshFiles = os.listdir(mesh_path)  

    if request.method == "POST":

        if(request.form.get("fileNameLoad")):

            fileToCopy = request.form.get("fileNameLoad")

            print(load_path + "/" + fileToCopy)

            preprocess_utils.standardise(load_path, input_path, fileToCopy)



        #if the request is from the run model button
        elif(request.form.get("fileNameInput")):
        
            fileName = request.form.get("fileNameInput")

            torch.cuda.empty_cache()

            print(input_path + "/" + fileName)

            #get stats for cleaned pointcloud
            mean, minmax, variance, volume, ptCount, density = preprocess_utils.get_stats(input_path, fileName)
            
            print(f"density : {density}")

            #load filtered pointcloud, apply the model and save to new ply file
            eval.evaluate(input_path, fileName, density)
        
        #if the request is from the create mesh button
        elif (request.form.get("fileNameOutput")):
        
            fileName = request.form.get("fileNameOutput")
            filterList = []
            if (request.form.get("filters")):
                filterList = request.form.get("filters").split(",")
            print(filterList)

            reconstruction.save_to_mesh(output_path, mesh_path, fileName, filters = filterList)

        #https://en.wikipedia.org/wiki/Post/Redirect/Get
        return redirect(url_for('modelViewer'))

    return render_template('modelViewer.html', inputFiles = inputFiles , outputFiles = outputFiles, meshFiles = meshFiles)


if __name__ == '__main__':
    app.run(debug=True)


## currently input scene is 120k pts, average size is 75m3
## output scene is 8k pts 

## I need 30k ish

##currently my scans are approx 200k pts


