
export class Cone {
    /**
     * @param {WebGLRenderingContext} gl         - WebGL 렌더링 컨텍스트
     * @param {number} segments                 - 옆면 세그먼트 수 (원 둘레를 몇 등분할지)
     * @param {object} options
     *        options.color : [r, g, b, a] 형태의 색상 (기본 [0.8, 0.8, 0.8, 1.0])
     */
    constructor(gl, segments = 32, options = {}) {

        this.gl = gl;
        this.segments = segments;

        // param
        const r      = 0.5;            // radius
        const halfH     = 0.5;            // half height
        const h      = 1.0;            // full height
        const rOverH = r / h;          // 0.5
        // const col    = options.color || [0.8, 0.8, 0.8, 1];

        const defaultColor = [0.8, 0.8, 0.8, 1.0];
        const colorOption = options.color || defaultColor;

        // 배열
        const pos   = [];  // positions
        const sNor  = [];  // smooth-normals
        const fNor  = [];  // flat-normals
        const color = [];  // colors
        const tc    = [];  // texcoords
        const idx   = [];  // indices


        // 정점 셋팅
        const step   = (2 * Math.PI) / segments;

        for (let i = 0; i < segments; i++) {
            
            const angle0 = i * step;
            const angle1 = (i + 1) * step;

            // 각 세그먼트의 세 정점
            const base0 = [ r * Math.cos(angle0), -halfH, r * Math.sin(angle0) ];
            const base1 = [ r * Math.cos(angle1), -halfH, r * Math.sin(angle1) ];
            const apex  = [ 0, halfH, 0 ];

            pos.push(...apex, ...base1, ...base0);
            color.push(...colorOption, ...colorOption, ...colorOption);
            tc.push(
                0.5, 1.0,      // apex
                (i + 1) / segments, 0.0,   // base1
                i / segments, 0.0          // base0
            );

            // flat
            const v0 = [ base1[0] - apex[0], base1[1] - apex[1], base1[2] - apex[2] ];
            const v1 = [ base0[0] - apex[0], base0[1] - apex[1], base0[2] - apex[2] ];
            const n  = this.cross(v0, v1);
            this.normalize(n);
            fNor.push(...n, ...n, ...n);

            //smooth
            sNor.push(0, 1, 0); // apex

            for (const [x, , z] of [base1, base0]) {
                const n2 = [ x, 0.25, z ];
                this.normalize(n2);
                sNor.push(...n2);
            }

            // index
            const base = i * 3;
            idx.push(base, base + 1, base + 2);
        }

        this.vertices      = new Float32Array(pos);
        this.faceNormals   = new Float32Array(fNor);  // flat
        this.vertexNormals = new Float32Array(sNor);  // smooth
        this.normals       = new Float32Array(sNor); // 초기 = smooth
        this.colors        = new Float32Array(color);
        this.texCoords     = new Float32Array(tc);
        this.indices       = new Uint16Array(idx);

        this.initBuffers();
    }

    copyFaceNormalsToNormals()   { this.normals.set(this.faceNormals); }
    copyVertexNormalsToNormals() { this.normals.set(this.vertexNormals); }

    updateNormals() {
        const gl   = this.gl;
        const vB = this.vertices.byteLength;

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferSubData(gl.ARRAY_BUFFER, vB, this.normals);
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

    delete() {
        const gl = this.gl;
        gl.deleteBuffer(this.vbo);
        gl.deleteBuffer(this.ebo);
        gl.deleteVertexArray(this.vao);
    }

    cross(a, b) {
        return [
            a[1]*b[2] - a[2]*b[1],
            a[2]*b[0] - a[0]*b[2],
            a[0]*b[1] - a[1]*b[0]
        ];
    }
    normalize(v) {
        const l = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);

        v[0]/=l;
        v[1]/=l;
        v[2]/=l;
    }
    initBuffers() {
        const gl   = this.gl;
        const vB   = this.vertices.byteLength;
        const nB   = this.normals .byteLength;
        const cB   = this.colors  .byteLength;
        const tB   = this.texCoords.byteLength;
        const total= vB + nB + cB + tB;

        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, total, gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, vB, this.normals);
        gl.bufferSubData(gl.ARRAY_BUFFER, vB + nB, this.colors);
        gl.bufferSubData(gl.ARRAY_BUFFER, vB + nB + cB, this.texCoords);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, vB);
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, vB + nB);
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, vB + nB + cB);

        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.enableVertexAttribArray(3);

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}
