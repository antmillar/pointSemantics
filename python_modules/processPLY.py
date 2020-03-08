from plyfile import PlyData, PlyElement
import numpy as np
import os
import torch
from torch.utils.data import DataLoader
import python_modules.pointnet2_semseg as pointnet2_semseg
from  python_modules.dataset import ScannetDatasetWholeScene, collate_wholescene


CONFIG = {}
CONFIG['ROOT'] = "/home/anthony/repos/Pointnet2.ScanNet" 
CONFIG['SCANNET_DIR'] =  "/home/anthony/repos/Datasets/ScanNet/scans"
CONFIG['SCENE_NAMES'] = '/home/anthony/repos/Datasets/ScanNet/scans'
CONFIG['MODEL_DIR'] = '/home/anthony/repos/pointSemantics/models/'
CONFIG['OUTPUT_DIR'] = '/home/anthony/repos/pointSemantics/static/models/output'

CONFIG['PALETTE'] = [
    (152, 223, 138),		# floor
    (174, 199, 232),		# wall
    (31, 119, 180), 		# cabinet
    (255, 187, 120),		# bed
    (188, 189, 34), 		# chair
    (140, 86, 75),  		# sofa
    (255, 152, 150),		# table
    (214, 39, 40),  		# door
    (197, 176, 213),		# window
    (148, 103, 189),		# bookshelf
    (196, 156, 148),		# picture
    (23, 190, 207), 		# counter
    (247, 182, 210),		# desk
    (219, 219, 141),		# curtain
    (255, 127, 14), 		# refrigerator
    (227, 119, 194),		# bathtub
    (158, 218, 229),		# shower curtain
    (44, 160, 44),  		# toilet
    (112, 128, 144),		# sink
    (82, 84, 163),          # otherfurn
]


batch_size = 1

#read a ply file to vertex np array
def read_ply_xyzrgb(filename):
    """ read XYZRGB point cloud from filename PLY file """
    assert(os.path.isfile(filename))
    with open(filename, 'rb') as f:
        plydata = PlyData.read(f)
        num_verts = plydata['vertex'].count
        vertices = np.zeros(shape=[num_verts, 6], dtype=np.float32)
        vertices[:,0] = plydata['vertex'].data['x']
        vertices[:,1] = plydata['vertex'].data['y']
        vertices[:,2] = plydata['vertex'].data['z']
        # vertices[:,3] = plydata['vertex'].data['red']
        # vertices[:,4] = plydata['vertex'].data['green']
        # vertices[:,5] = plydata['vertex'].data['blue']
    return vertices

#add two blank columns for input into the model
def add_blank_cols(vertices):
    data = np.zeros(shape=[vertices.shape[0], 8])
    data[:,:3] = vertices[:,:3]
    return data

def test():
    print("HELLO I@M WORKING")

def save(data):
    print(data.shape)
    np.save(CONFIG['OUTPUT_DIR'] + "/test"   , data)

def evaluate():

    args = None
    # prepare data
    print("preparing data...")
    # scene_list = get_scene_list(args)
    scene_list = [1]
    dataset = ScannetDatasetWholeScene(scene_list)
    dataloader = DataLoader(dataset, batch_size=1, collate_fn=collate_wholescene)

    # load model
    print("loading model...")
    model_path = os.path.join(CONFIG['MODEL_DIR'], "model.pth")
    model = pointnet2_semseg.get_model(num_classes=20, is_msg = False).cuda()
    model.load_state_dict(torch.load(model_path))
    model.eval()
    
    # # # predict
    print("predicting...")
    preds = predict_label(args, model, dataloader)

    # # # # visualize
    print("visualizing...")
    visualize(args, preds)
    

# ply_filename = os.path.join(data_folder, '%s_vh_clean_2.ply' % (scene_name))
# points = read_ply_xyzrgb(ply_filename)
# data = np.concatenate((scene_points, instance_labels, semantic_labels), 1)


def forward(args, model, coords, feats):
    pred = []
    coord_chunk, feat_chunk = torch.split(coords.squeeze(0), batch_size, 0), torch.split(feats.squeeze(0), batch_size, 0)
    assert len(coord_chunk) == len(feat_chunk)
    for coord, feat in zip(coord_chunk, feat_chunk):
        output = model(torch.cat([coord, feat], dim=2))
        pred.append(output)

    pred = torch.cat(pred, dim=0) # (CK, N, C)
    outputs = pred.max(2)[1]

    return outputs

def filter_points(coords, preds):
    assert coords.shape[0] == preds.shape[0]

    coord_hash = [hash(str(coords[point_idx][0]) + str(coords[point_idx][1]) + str(coords[point_idx][2])) for point_idx in range(coords.shape[0])]
    _, coord_ids = np.unique(np.array(coord_hash), return_index=True)
    coord_filtered, pred_filtered = coords[coord_ids], preds[coord_ids]
    
    
    filtered = []

    for point_idx in range(coord_filtered.shape[0]):
        filtered.append(
            [
                coord_filtered[point_idx][0],
                coord_filtered[point_idx][1],
                coord_filtered[point_idx][2],
                CONFIG['PALETTE'][pred_filtered[point_idx]][0],
                CONFIG['PALETTE'][pred_filtered[point_idx]][1],
                CONFIG['PALETTE'][pred_filtered[point_idx]][2]
            ]
        )

    return np.array(filtered)


def predict_label(args, model, dataloader):
    output_coords, output_preds = [], []
    print("predicting labels...")
    count = 0

    for data in dataloader:
        # unpack

        coords, feats, targets, weights, _ = data
        coords, feats, targets, weights = coords.cuda(), feats.cuda(), targets.cuda(), weights.cuda()
        
        # feed
        preds = forward(args, model, coords, feats)

        # dump
        coords = coords.squeeze(0).view(-1, 3).cpu().numpy()
        preds = preds.view(-1).cpu().numpy()
        output_coords.append(coords)
        output_preds.append(preds)
        count+=1


    print("filtering points...")
    output_coords = np.concatenate(output_coords, axis=0)
    output_preds = np.concatenate(output_preds, axis=0)

    filtered = filter_points(output_coords, output_preds)
    return filtered

def visualize(args, preds):

    vertex = []
    for i in range(preds.shape[0]):
        vertex.append(
            (
                preds[i][0],
                preds[i][1],
                preds[i][2],
                preds[i][3],
                preds[i][4],
                preds[i][5],
            )
        )

    vertex = np.array(
        vertex,
        dtype=[
            ("x", np.dtype("float32")), 
            ("y", np.dtype("float32")), 
            ("z", np.dtype("float32")),
            ("red", np.dtype("uint8")),
            ("green", np.dtype("uint8")),
            ("blue", np.dtype("uint8"))
        ]
    )

    import numpy
    output_pc = PlyElement.describe(vertex, "vertex")
    output_pc = PlyData([output_pc])
    output_root = os.path.join(CONFIG['OUTPUT_DIR'], "test", "preds")
    os.makedirs(output_root, exist_ok=True)
    output_pc.write(os.path.join(output_root, "{}.ply".format(1)))
