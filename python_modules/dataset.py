import os
import sys
import time
import torch
import numpy as np

sys.path.append(".")
# from lib.config import CONF

NUM_CLASSES = 20 


class ScannetDataset():
    def __init__(self, scene_list, npoints=8192, is_weighting=True):
        self.scene_list = scene_list
        self.npoints = npoints
        self.is_weighting = is_weighting
        self._load_scene_file()

    def _load_scene_file(self):
        self.scene_points_list = []
        self.semantic_labels_list = []
        for scene_id in self.scene_list:
            scene_data = np.load(CONF.SCANNETV2_FILE.format(scene_id))
            scene_data[:, 3:6] /= 255. # normalize the rgb values
            self.scene_points_list.append(scene_data[:, :6])
            self.semantic_labels_list.append(scene_data[:, 7])

        if self.is_weighting:
            labelweights = np.zeros(CONF.NUM_CLASSES)
            for seg in self.semantic_labels_list:
                tmp,_ = np.histogram(seg,range(CONF.NUM_CLASSES + 1))
                labelweights += tmp
            labelweights = labelweights.astype(np.float32)
            labelweights = labelweights/np.sum(labelweights)
            self.labelweights = 1/np.log(1.2+labelweights)
        else:
            self.labelweights = np.ones(CONF.NUM_CLASSES)

    def __getitem__(self, index):
        start = time.time()
        point_set = self.scene_points_list[index]
        semantic_seg = self.semantic_labels_list[index].astype(np.int32)
        coordmax = np.max(point_set,axis=0)[:3]
        coordmin = np.min(point_set,axis=0)[:3]
        smpmin = np.maximum(coordmax-[1.5,1.5,3.0], coordmin)
        smpmin[2] = coordmin[2]
        smpsz = np.minimum(coordmax-smpmin,[1.5,1.5,3.0])
        smpsz[2] = coordmax[2]-coordmin[2]
        isvalid = False

        for i in range(10):
            # curcenter = point_set[np.random.choice(len(semantic_seg),1)[0],:]
            curcenter = point_set[np.random.choice(len(semantic_seg),1)[0],:3]
            curmin = curcenter-[0.75,0.75,1.5]
            curmax = curcenter+[0.75,0.75,1.5]
            curmin[2] = coordmin[2]
            curmax[2] = coordmax[2]
            curchoice = np.sum((point_set[:, :3]>=(curmin-0.2))*(point_set[:, :3]<=(curmax+0.2)),axis=1)==3
            cur_point_set = point_set[curchoice,:]
            cur_semantic_seg = semantic_seg[curchoice]

            if len(cur_semantic_seg)==0:
                continue

            mask = np.sum((cur_point_set[:, :3]>=(curmin-0.01))*(cur_point_set[:, :3]<=(curmax+0.01)),axis=1)==3
            vidx = np.ceil((cur_point_set[mask,:3]-curmin)/(curmax-curmin)*[31.0,31.0,62.0])
            vidx = np.unique(vidx[:,0]*31.0*62.0+vidx[:,1]*62.0+vidx[:,2])
            isvalid = np.sum(cur_semantic_seg>0)/len(cur_semantic_seg)>=0.7 and len(vidx)/31.0/31.0/62.0>=0.02

            if isvalid:
                break

        choice = np.random.choice(len(cur_semantic_seg), self.npoints, replace=True)
        point_set = cur_point_set[choice,:]
        semantic_seg = cur_semantic_seg[choice]
        mask = mask[choice]
        sample_weight = self.labelweights[semantic_seg]
        sample_weight *= mask

        fetch_time = time.time() - start

        return point_set, semantic_seg, sample_weight, fetch_time

    def __len__(self):
        return len(self.scene_points_list)

class ScannetDatasetWholeScene():
    def __init__(self, scene_list, npoints= 8192, is_weighting=True):
        self.scene_list = scene_list

        self.npoints = npoints
        self.is_weighting = is_weighting
        self._load_scene_file()

    def _load_scene_file(self):
        self.scene_points_list = []
        self.semantic_labels_list = []
        for scene_id in self.scene_list:
            
            #load the numpy file
            # scene_data = np.load(CONF.SCANNETV2_FILE.format(scene_id))
            scene_data = np.load('/home/anthony/repos/pointSemantics/static/models/output/test.npy')
            scene_data[:, 3:6] /= 255. # normalize the rgb values
            self.scene_points_list.append(scene_data[:, :6])
            self.semantic_labels_list.append(scene_data[:, 7])

        if self.is_weighting:
            labelweights = np.zeros(NUM_CLASSES)
            for seg in self.semantic_labels_list:
                tmp,_ = np.histogram(seg,range(NUM_CLASSES + 1))
                labelweights += tmp
            labelweights = labelweights.astype(np.float32)
            labelweights = labelweights/np.sum(labelweights)
            self.labelweights = 1/np.log(1.2+labelweights)
        else:
            self.labelweights = np.ones(NUM_CLASSES)

    def __getitem__(self, index):
        start = time.time()
        #point_set_ini contains all the points in the pcd
        point_set_ini = self.scene_points_list[index]
        semantic_seg_ini = self.semantic_labels_list[index].astype(np.int32)

        ##max coord for each dimension
        coordmax = point_set_ini[:, :3].max(axis=0)
        coordmin = point_set_ini[:, :3].min(axis=0)
        xlength = 5. #1.5
        ylength = 5. #1.5

        #number of subvolumes
        nsubvolume_x = np.ceil((coordmax[0]-coordmin[0])/xlength).astype(np.int32)
        nsubvolume_y = np.ceil((coordmax[1]-coordmin[1])/ylength).astype(np.int32)

        point_sets = list()
        semantic_segs = list()
        sample_weights = list()

        print(nsubvolume_x)
        print(nsubvolume_y)

        for i in range(nsubvolume_x):

            for j in range(nsubvolume_y):


                #range of the current subvolume
                curmin = coordmin+[i*xlength, j*ylength, 0]
                curmax = coordmin+[(i+1)*xlength, (j+1)*ylength, coordmax[2]-coordmin[2]]
                #find points within the subvolume 
                mask = np.all((point_set_ini[:, :3]>=curmin)*(point_set_ini[:, :3]<=curmax), axis=1)
                cur_point_set = point_set_ini[mask,:]
                cur_semantic_seg = semantic_seg_ini[mask]

                #if empty subvolume exit the loop
                if len(cur_semantic_seg) == 0:
                    continue

                #select 8192 random points from the pt indices in the subvolume
                choice = np.random.choice(len(cur_semantic_seg), self.npoints, replace=True)
                #get these points from current point set
                point_set = cur_point_set[choice,:] # Nx3
                semantic_seg = cur_semantic_seg[choice] # N

                #this selects 8192 entries from mask (for the whole dataset) based on the first len(cur_semantic_seg)
                mask = mask[choice]

                #if the number of masks hit is less than 1% exit loop
                #I guess this is a way to say that if there are less than 1% of these points in the first len(cur semantic seg) then ignore?
                # if sum(mask)/float(len(mask))<0.01:
                #     continue

                sample_weight = self.labelweights[semantic_seg]
                sample_weight *= mask # N

                point_sets.append(np.expand_dims(point_set,0)) # 1xNx3
                semantic_segs.append(np.expand_dims(semantic_seg,0)) # 1xN
                sample_weights.append(np.expand_dims(sample_weight,0)) # 1xN
   
        point_sets = np.concatenate(tuple(point_sets),axis=0)
        semantic_segs = np.concatenate(tuple(semantic_segs),axis=0)
        sample_weights = np.concatenate(tuple(sample_weights),axis=0)

        fetch_time = time.time() - start

        return point_sets, semantic_segs, sample_weights, fetch_time

    def __len__(self):
        return len(self.scene_points_list)

def collate_random(data):
    '''
    for ScannetDataset: collate_fn=collate_random
    return: 
        coords               # torch.FloatTensor(B, N, 3)
        feats                # torch.FloatTensor(B, N, 3)
        semantic_segs        # torch.FloatTensor(B, N)
        sample_weights       # torch.FloatTensor(B, N)
        fetch_time           # float
    '''

    # load data
    (
        point_set, 
        semantic_seg, 
        sample_weight,
        fetch_time 
    ) = zip(*data)

    # convert to tensor
    point_set = torch.FloatTensor(point_set)
    semantic_seg = torch.LongTensor(semantic_seg)
    sample_weight = torch.FloatTensor(sample_weight)

    # split points to coords and feats
    coords = point_set[:, :, :3]
    feats = point_set[:, :, 3:]

    # pack
    batch = (
        coords,             # (B, N, 3)
        feats,              # (B, N, 3)
        semantic_seg,      # (B, N)
        sample_weight,     # (B, N)
        sum(fetch_time)          # float
    )

    return batch

def collate_wholescene(data):
    '''
    for ScannetDataset: collate_fn=collate_random
    return: 
        coords               # torch.FloatTensor(B, C, N, 3)
        feats                # torch.FloatTensor(B, C, N, 3)
        semantic_segs        # torch.FloatTensor(B, C, N)
        sample_weights       # torch.FloatTensor(B, C, N)
        fetch_time           # float
    '''

    # load data
    (
        point_sets, 
        semantic_segs, 
        sample_weights,
        fetch_time 
    ) = zip(*data)

    # convert to tensor
    point_sets = torch.FloatTensor(point_sets)
    semantic_segs = torch.LongTensor(semantic_segs)
    sample_weights = torch.FloatTensor(sample_weights)

    # split points to coords and feats
    coords = point_sets[:, :, :, :3]
    feats = point_sets[:, :, :, 3:]

    # pack
    batch = (
        coords,             # (B, N, 3)
        feats,              # (B, N, 3)
        semantic_segs,      # (B, N)
        sample_weights,     # (B, N)
        sum(fetch_time)          # float
    )

    return batch