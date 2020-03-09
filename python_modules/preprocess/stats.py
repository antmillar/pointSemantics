from scipy import stats
import os
import open3d as o3d
import numpy as np

directory = '/home/anthony/repos/Datasets/ScanNet/scans'

#loop over all the scan directories and calculates the statistics
#I ran this before and just stored the statistics
def get_scannet_stats():

    subfolderList = [item[2] for item in os.walk(directory)]
    files = [file for subFiles in subfolderList for file in subFiles]
    mean = np.zeros([1,3])
    minmax = np.zeros([2,3])
    variance = np.zeros([1,3])

    count = 0

    for file in files:
        if(file[-3:] == "ply"):
            scene_name = file[:12]
            data_folder = os.path.join(directory, scene_name)
            file = os.path.join(data_folder, file)

            pts =  o3d.io.read_point_cloud(file).points
            mean += stats.describe(np.asarray(pts)).mean
            minmax += stats.describe(np.asarray(pts)).minmax
            variance += stats.describe(np.asarray(pts)).variance
            
            count += 1

    print("mean : " + str(mean/count))
    print("minmax : " + str(minmax/count))
    print("variance : " + str(variance/count))


SCANNET_MEANS = [3.08072124, 2.93721497, 0.87943835]
SCANNET_MINS = [3.66360635e-01, 3.56836237e-01, 2.92708193e-03]
SCANNET_MAXS = [5.89, 5.48, 2.41]
SCANNET_VARS = [2.32206428, 2.07387446, 0.40561404]

root_path = "/home/anthony/Downloads/"

def normalize_point_cloud(path):

    print(root_path + path)
    pcd = o3d.io.read_point_cloud(root_path + path)
    pcd_pts = np.asarray(pcd.points)

    print("info : " + str(pcd))
    print("mean : " + str(stats.describe(pcd_pts).mean))
    print("minmax : " + str(stats.describe(pcd_pts).minmax))
    print("variance : " + str(stats.describe(pcd_pts).variance))

    xMin = stats.describe(pcd_pts).minmax[0][0]
    yMin = stats.describe(pcd_pts).minmax[0][1]
    zMin = stats.describe(pcd_pts).minmax[0][2]

    normalisedPts = np.zeros(pcd_pts.shape)
    #place the model on the plane
    normalisedPts[:,0] = ((pcd_pts[:,0] - xMin))
    normalisedPts[:,1] = ((pcd_pts[:,1] - yMin))
    normalisedPts[:,2] = ((pcd_pts[:,2] - zMin))

    print(stats.describe(normalisedPts))

    newPLY = o3d.geometry.PointCloud(pcd)
    newPLY.points = o3d.utility.Vector3dVector(normalisedPts)

    cols = np.asarray(newPLY.colors)
    pts = np.asarray(newPLY.points)

    arrays = (pts, cols)
    npydata = np.concatenate(arrays, axis = 1)
    extracols = np.zeros((cols.shape[0], 2))

    data = np.c_[npydata, extracols]

    outputFileName = root_path + path[:-4] + "NORM.npy"

    np.save(outputFileName, data)
    print("saved to : " + outputFileName)


