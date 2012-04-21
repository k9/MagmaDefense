function World() {
    this.dirtLayer = CSG.cylinder({
        start: [0, -1, 0],
        end: [0, 1, 0],
        radius: 100,
        slices: 16
    }).toMesh();

    this.dirtLayer.compile();
}