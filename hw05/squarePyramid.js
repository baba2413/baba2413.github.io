
export class Pyramid {
    constructor(gl) {
        this.gl = gl;
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        this.vertices = new Float32Array([
            -0.5, 0, -0.5,  0.5, 0, -0.5,  0.5, 0, 0.5,
            -0.5, 0, -0.5,  0.5, 0, 0.5,  -0.5, 0, 0.5,

            -0.5, 0, -0.5,   0.5, 0, -0.5,   0.0, 1, 0.0,

             0.5, 0, -0.5,   0.5, 0,  0.5,   0.0, 1, 0.0,

             0.5, 0, 0.5,   -0.5, 0, 0.5,   0.0, 1, 0.0,

            -0.5, 0, 0.5,   -0.5, 0, -0.5,   0.0, 1, 0.0,
        ]);

        this.colors = new Float32Array([
            0.6, 0.6, 0.6, 1,  0.6, 0.6, 0.6, 1,  0.6, 0.6, 0.6, 1,
            0.6, 0.6, 0.6, 1,  0.6, 0.6, 0.6, 1,  0.6, 0.6, 0.6, 1,

            1, 0, 0, 1,  1, 0, 0, 1,  1, 0, 0, 1,

            0, 1, 1, 1,  0, 1, 1, 1,  0, 1, 1, 1,

            1, 0, 1, 1,  1, 0, 1, 1,  1, 0, 1, 1,

            1, 1, 0, 1,  1, 1, 0, 1,  1, 1, 0, 1,
        ]);


        // index
        this.indices = new Uint16Array([
            0, 1, 2,
            3, 4, 5,
            6, 7, 8,
            9, 10, 11,
            12, 13, 14,
            15, 16, 17
        ]);

        this.normals = computeNormal(this.vertices, this.indices);

        this.initBuffers();
    }

    initBuffers() {
        const gl = this.gl;
        const vSize = this.vertices.byteLength;
        const nSize = this.normals.byteLength;
        const cSize = this.colors.byteLength;

        const totalSize = vSize + nSize + cSize;

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, totalSize, gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize, this.colors);


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, vSize);
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, vSize + nSize);


        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);


        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    draw(shader) {
        const gl = this.gl;
        shader.use();
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }

}

function computeNormal(positions, indices) {
    const normals = new Float32Array(positions.length);

    for (let i = 0; i < indices.length; i += 3) {
        let i0 = indices[i] * 3;
        let i1 = indices[i+1] * 3;
        let i2 = indices[i+2] * 3;

        let p0 = [positions[i0], positions[i0+1], positions[i0+2]];
        let p1 = [positions[i1], positions[i1+1], positions[i1+2]];
        let p2 = [positions[i2], positions[i2+1], positions[i2+2]];

        const u = vec3.create();
        const v = vec3.create();
        const n = vec3.create();

        vec3.sub(u, p1, p0);
        vec3.sub(v, p2, p0);
        vec3.cross(n, u, v);
        vec3.normalize(n, n);

        normals[i0] = n[0];
        normals[i0+1] = n[1];
        normals[i0+2] = n[2];
        
        normals[i1] = n[0];
        normals[i1+1] = n[1];
        normals[i1+2] = n[2];
        
        normals[i2] = n[0];
        normals[i2+1] = n[1];
        normals[i2+2] = n[2];
    }

    return normals;
}