import open3d as o3d
import numpy as np

def save_to_mesh(folder, dest, fn, filters):

    print("loading PLY file...")
    pcd = o3d.io.read_point_cloud(folder + "/" + fn)

    #if filters given filter the mesh
    if(len(filters) > 0):
        print("filtering vertices...")
        pcd = filter_mesh(pcd, filters)

    print("estimating normals...")
    pcd.estimate_normals()

    print("calculating poisson reconstruction...")
    
    mesh, densities = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(pcd, depth = 10)

    #remove any points with density below threshold
    print("filtering densities...")
    mask_densities = densities < np.quantile(densities, 0.2)
    mesh.remove_vertices_by_mask(mask_densities)

    # pMesh.merge_close_vertices(0.05)
    print("saving mesh...")
    fn_save = dest + "/" + fn[:-4] + ".obj"
    o3d.io.write_triangle_mesh(fn_save, mesh)
    
    print(f"mesh saved at {fn_save}")

filterMap = {

"floor"          :   [152., 223., 138.],
"wall"           :   [174., 199., 232.],
"cabinet"        :   [31., 119., 180.],
"bed"            :   [255., 187., 120.],
"chair"          :   [188., 189., 34.],
"sofa"           :   [140., 86., 75.],
"table"          :   [255., 152., 150.],
"door"           :   [214., 39., 40.],
"window"         :   [197., 176., 213.],
"bookshelf"      :   [148., 103., 189.],
"picture"        :   [196., 156., 148.],
"counter"        :   [23., 190., 207.],
"desk"           :   [247., 182., 210.],
"curtain"        :   [219., 219., 141.],
"refrigerator"   :   [255., 127., 14.],
"bathtub"        :   [227., 119., 194.],
"shower curtain" :   [158., 218., 229.],
"toilet"         :   [44., 160., 44.],
"sink"           :   [112., 128., 144.],
"otherfurn"      :   [82., 84., 163.]

}

#filters out points from mesh based on labels
def filter_mesh(pcd, filters):

    colors = np.asarray(pcd.colors) * 255.0

    points = np.asarray(pcd.points)

    mask = np.zeros(colors.shape[0], dtype=bool)

    #create boolean mask by looping over vertex colors with filters
    for filter in filters:
        mask += np.all(colors == np.array(filterMap[filter]), axis = 1)

    mask = np.invert(mask)

    filteredPoints = points[mask]
    filteredPoints = o3d.utility.Vector3dVector(filteredPoints)

    filteredPcd = o3d.geometry.PointCloud(filteredPoints)
    
    return filteredPcd