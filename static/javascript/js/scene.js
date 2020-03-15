export default class Scene
{
    constructor(fn)
    {
        this.name = fn;
        this.inputPLY;
        this.labelledPLY;
        this.mesh;
    }
}

// 
// # TODO how to deal with overly large point clouds?
// # TODO add partial meshes?
// # TODO metadata for PCD
