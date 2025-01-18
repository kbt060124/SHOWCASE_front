export interface SavedMeshData {
    itemId: number;
    position: {
        x: number;
        y: number;
        z: number;
    };
    rotation: {
        x: number;
        y: number;
        z: number;
        w: number;
    };
    scaling: {
        x: number;
        y: number;
        z: number;
    };
    parentIndex: number;
}
