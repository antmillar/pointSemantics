from flask import Flask, render_template, request, redirect, url_for
import pickle
import os
from fastai.vision import *
import torch
import matplotlib.pyplot as plt
from PIL import Image
import json
import python_modules.eval as eval
import python_modules.postprocess.meshing as meshing


app = Flask(__name__ , static_url_path = '/static' )
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0 ##prevent file caching
cwd = os.getcwd()
path = cwd + '/models'
upload_path = cwd + '/static/img/uploads'
output_path = cwd + '/static/img/output'
input_path = cwd + '/static/models/inputs'
output_path = cwd + '/static/models/outputs'
mesh_path = cwd + '/static/models/meshes'
# #Loading the saved model using fastai's load_learner method

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/modelViewer' , methods=["GET", "POST"])
def modelViewer():

    inputFiles = os.listdir(input_path)    
    outputFiles = os.listdir(output_path)    
    meshFiles = os.listdir(mesh_path)  

    if request.method == "POST":

        if(request.form.get("fileNameInput")):
        
            fileName = request.form.get("fileNameInput")
            torch.cuda.empty_cache()
            # fileName = request.form.get("fileName")
            print(fileName)

            # return redirect(url_for('modelViewer', inputFiles = inputFiles , outputFiles = outputFiles))

            # if(fileName):
            print(input_path + "/" + fileName)
            vertexData = eval.readPLY(input_path + "/" +  fileName)
            print(vertexData.shape)
            data = eval.add_blank_cols(vertexData)
            print(data.shape)
            eval.evaluate(fileName, data)
        
        elif (request.form.get("fileNameOutput")):
        
            fileName = request.form.get("fileNameOutput")
            filterList = []
            if (request.form.get("filters")):
                filterList = request.form.get("filters").split(",")
            print(filterList)
            meshing.save_to_mesh(output_path, mesh_path, fileName, filters = filterList)
            
        
    #get list of files

    return render_template('modelViewer.html', inputFiles = inputFiles , outputFiles = outputFiles, meshFiles = meshFiles)

@app.route('/CPPN' , methods=["GET", "POST"])
def cppn():

    dimDict = {'128' : '1', '256' : '0', '512' : '0', '1024' : '0'}
    layerDict = {'1' : '1', '4' : '0', '8' : '0', '12' : '0'}
    neuronDict = {'4' : '1', '8' : '0', '12' : '0', '16' : '0'}

    #run the NN
    if request.method == "POST":

        inputDims = int(request.form.get('inputDims'))
        inputLayers = int(request.form.get('inputLayers'))
        inputNeurons = int(request.form.get('inputNeurons'))

        dimDict = dict.fromkeys(dimDict, 0)
        dimDict[str(inputDims)] = '1'
        layerDict = dict.fromkeys(layerDict, 0)
        layerDict[str(inputLayers)] = '1'
        neuronDict = dict.fromkeys(neuronDict, 0)
        neuronDict[str(inputNeurons)] = '1'

        import python_modules.CPPN as CPPN

        model = CPPN.CPPN(inputLayers, inputNeurons)
        model.apply(CPPN.init_weights)
        im = CPPN.createImage(model, inputDims)
        plt.imsave(output_path + '/neural.png', im)

        return render_template('cppn.html', dimDict = dimDict, layerDict = layerDict, neuronDict = neuronDict, inputDims = inputDims, inputLayers = inputLayers, inputNeurons = inputNeurons)

    return render_template('cppn.html', dimDict = dimDict, layerDict = layerDict, neuronDict = neuronDict)



@app.route('/paper')
def paper():

    model = load_learner(path, 'model_camvid.pkl')

    image = open_image(upload_path + '/upload.png')

    labels_tensor = model.predict(image)[1]
    list_of_labels = labels_tensor.numpy().squeeze().tolist()

    labels = json.dumps(list_of_labels)

    return render_template('paper.html', labels = labels)

@app.route('/segmentation', methods=["GET", "POST"])
def segmentation():

    ##image uploading
    if request.method == "POST":

        if request.files:

            image = request.files["image"]

            image.save(os.path.join(upload_path, "upload.png"))

            upload = 'static/img/uploads/' + "upload.png"


            return render_template('segmentation.html', upload = upload)

        ##run the model 

    if (request.method == "GET") & (len(os.listdir(upload_path)) != 0 ): 

        model = load_learner(path, 'model_camvid.pkl')

        image = open_image(upload_path + '/upload.png')

        mask_predict = model.predict(image)[0]
        labels_tensor = model.predict(image)[1]
        list_of_labels = labels_tensor.numpy().squeeze().tolist()

        labels = json.dumps(list_of_labels)
        
        model.destroy()
        gc.collect()
        torch.cuda.empty_cache()

        x = image2np(mask_predict.data).astype(np.uint8)
        plt.imsave(output_path + '/output.png', x, cmap = 'tab20')

        upload = 'static/img/uploads/' + "upload.png"
        output = 'static/img/output/' + "output.png"

        one = Image.open(upload).resize((480, 360)).convert('RGBA')
        two = Image.open(output).resize((480, 360)).convert('RGBA')
        two = two.copy()
        two.putalpha(125)
        three = Image.alpha_composite(one, two).save(output_path + "/overlay.png")
        overlay = 'static/img/output/' + "overlay.png"

        return render_template('segmentation.html', upload = upload, output = output, overlay = overlay)

    return render_template('segmentation.html')


if __name__ == '__main__':
    app.run(debug=True)


