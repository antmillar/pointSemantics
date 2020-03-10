import open3d as o3d
import numpy as np

def save_to_mesh(folder, dest, fn):

    print("loading PLY file...")
    pcd = o3d.io.read_point_cloud(folder + "/" + fn)

    print("estimating normals...")
    pcd.estimate_normals()

    print("calculating poisson reconstruction...")
    
    mesh, densities = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(pcd, depth = 10)

    #remove any points with density below threshold
    print("filtering densities...")
    mask_densities = densities < np.quantile(densities, 0.2)
    mesh.remove_vertices_by_mask(mask_densities)

    print(np.asarray(pcd.colors))

    # pMesh.merge_close_vertices(0.05)
    print("saving mesh...")
    fn_save = dest + "/" + fn[:-4] + ".obj"
    o3d.io.write_triangle_mesh(fn_save, mesh)
    
    print(f"mesh saved at {fn_save}")