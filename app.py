#python library imports
from flask import Flask, render_template, request, redirect, url_for, send_from_directory
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

#show the status text top right
global statusText
statusText = "view mode"

app = Flask(__name__ , static_url_path = '/static' )

 #prevent file caching
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

cwd = os.getcwd()
output_path = cwd + '/static/img/output'
load_path = cwd + '/static/models/load'
input_path = cwd + '/static/models/inputs'
output_path = cwd + '/static/models/outputs'
mesh_path = cwd + '/static/models/meshes'

@app.route('/')
def index():
    return render_template('index.html')

#route to hold the latest status 
@app.route('/progress/<int:thread_id>')
def progress(thread_id):
    global statusText
    return str(statusText)

@app.route('/modelViewer' , methods=["GET", "POST"])
def modelViewer():

    global statusText

    inputFiles = os.listdir(input_path)    
    outputFiles = os.listdir(output_path)    
    meshFiles = os.listdir(mesh_path)  

    if request.method == "POST":

        # loads files
        if(request.form.get("fileNameLoad")):

            fileToCopy = request.form.get("fileNameLoad")

            print(load_path + "/" + fileToCopy)

            statusText = "subsampling cloud.."
            pcd = preprocess_utils.down_sample(load_path, fileToCopy, statusText)

            statusText = "removing outliers and normalizing..."
            preprocess_utils.standardise(pcd, fileToCopy, input_path)

            statusText = "view mode"

        # removes files
        elif(request.form.get("fileNameRemove")):

            fileToRemove = request.form.get("fileNameRemove")

            print(input_path + "/" + fileToRemove)

            statusText = f"removing file : {fileToRemove}.."

            os.remove(input_path + "/" + fileToRemove)

            try:
                os.remove(output_path + "/" + fileToRemove[:-4] + "_labels.ply")
            except:
                pass

            try:
                os.remove(mesh_path + "/" + fileToRemove[:-4] + ".obj")
            except:
                pass

            try:
                os.remove(mesh_path + "/" + fileToRemove[:-4] + ".mtl")
            except:
                pass

            statusText = "view mode"

        #runs model
        elif(request.form.get("fileNameInput")):
        
            fileName = request.form.get("fileNameInput")

            torch.cuda.empty_cache()

            print(input_path + "/" + fileName)

            statusText = "calculating stats.."

            #get stats for cleaned pointcloud
            _, _, _, _, _, density = preprocess_utils.get_stats(input_path, fileName)
            
            print(f"density : {density}")

            statusText = "evaluating model.."
            #load filtered pointcloud, apply the model and save to new ply file
            eval.evaluate(input_path, fileName, density)
        
        #creates mesh
        elif (request.form.get("fileNameOutput")):

            statusText = "reconstructing mesh.."
        
            fileName = request.form.get("fileNameOutput")
            filterList = []

            #get the label filters
            if (request.form.get("filters")):
                filterList = request.form.get("filters").split(",")
            print(filterList)

            reconstruction.save_to_mesh(input_path, output_path, mesh_path, fileName, filters = filterList)

            statusText = "view mode"

        #downloads mesh
        elif (request.form.get("fileNameDownload")):

            fileName = request.form.get("fileNameDownload")[:-4] + ".obj" 

            print(f"downloading {fileName}")

            #open3d seems to always create an MTL file, can't figure out how to remove it. But the model should load fine without the MTL.
            return send_from_directory(directory=mesh_path, filename=fileName , as_attachment=True)

        #https://en.wikipedia.org/wiki/Post/Redirect/Get
        return redirect(url_for('modelViewer'))

    return render_template('modelViewer.html', inputFiles = inputFiles , outputFiles = outputFiles, meshFiles = meshFiles)


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))