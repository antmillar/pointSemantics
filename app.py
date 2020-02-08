from flask import Flask, render_template, request, redirect, url_for
import pickle
import os
from fastai.vision import *
import torch
import matplotlib.pyplot as plt
from PIL import Image
import json

app = Flask(__name__ , static_url_path = '/static' )
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0 ##prevent file caching
cwd = os.getcwd()
path = cwd + '/models'
upload_path = cwd + '/static/img/uploads'
output_path = cwd + '/static/img/output'
# #Loading the saved model using fastai's load_learner method

@app.route('/')
def hello():
    return render_template('index.html')
    # return "Hello World!"

@app.route('/three')
def three():
    return render_template('three.html')
    # return "Hello World!"

@app.route('/bloops')
def bloops():
    return render_template('bloops.html')
    # return "Hello World!"

@app.route('/chaos')
def chaos():
    return render_template('chaos.html')
    # return "Hello World!"

@app.route('/paper')
def paper():

    model = load_learner(path, 'model_camvid.pkl')

    image = open_image(upload_path + '/upload.png')

    labels_tensor = model.predict(image)[1]
    list_of_labels = labels_tensor.numpy().squeeze().tolist()

    labels = json.dumps(list_of_labels)

    return render_template('paper.html', labels = labels)
    # return "Hello World!"

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

@app.route('/runModel')
def runModel():
    # return render_template('index.html')
    return "Hello World!"


if __name__ == '__main__':
    app.run(debug=True)


