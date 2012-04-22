CSG.bumpyCylinder = function(options) {
    options = options || {};
    var s = new CSG.Vector(options.start || [0, -1, 0]);
    var e = new CSG.Vector(options.end || [0, 1, 0]);
    var ray = e.minus(s);

    var sliceArray = options.sliceArray;
    var axisZ = ray.unit(), isY = (Math.abs(axisZ.y) > 0.5);
    var axisX = new CSG.Vector(isY, !isY, 0).cross(axisZ).unit();
    var axisY = axisX.cross(axisZ).unit();
    var start = new CSG.Vertex(s, axisZ.negated());
    var end = new CSG.Vertex(e, axisZ.unit());
    var polygons = [];
    function point(stack, slice, normalBlend, r) {
        var angle = slice * Math.PI * 2;
        var out = axisX.times(Math.cos(angle)).plus(axisY.times(Math.sin(angle)));
        var pos = s.plus(ray.times(stack)).plus(out.times(r));
        var normal = out.times(1 - Math.abs(normalBlend)).plus(axisZ.times(normalBlend));
        return new CSG.Vertex(pos, normal);
    }

    var slices = sliceArray.length;
    for (var i = 0; i < slices; i++) {
        var t0 = i / slices, t1 = (i + 1) / slices;
        var r0 = sliceArray[i];
        var r1 = sliceArray[(i + 1) % slices];
        polygons.push(new CSG.Polygon([end, point(1, t1, 1, r1), point(1, t0, 1, r0)]));
    }
    return CSG.fromPolygons(polygons);
};