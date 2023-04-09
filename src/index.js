/** @type {HTMLCanvasElement} **/
var canvas = document.querySelector("#canvas")

/** @type {WebGLRenderingContext} **/
var gl = canvas.getContext("webgl")

if (!gl) {
    alert('Your browser doesn\'t support webgl')
}

// ============================= Initialization ============================= 
setUpTools()

var translation = [0.0, 0.0, 0.0]
var rotation = [0.0, 0.0, 0.0]
var scale = [1.0, 1.0, 1.0]
// Projection Var
const ProjectMode = Object.freeze({
    ORTHOGRAPHIC:   1,
    PERSPECTIVE:    2,
    OBLIQUE:        3
})
var projectionMode = ProjectMode.ORTHOGRAPHIC

// Orthographic Var
var near = -800;
var far = 800;

// Perspective Var
var zNear = 1;
var zFar = 2000;
var fieldOfView = degToRad(100);

// Oblique Var
var theta = 75
var phi = 75

var m4 = {
    transpose: function(m) {
        return [
            m[0], m[4], m[8], m[12],
            m[1], m[5], m[9], m[13],
            m[2], m[6], m[10], m[14],
            m[3], m[7], m[11], m[15],
        ];
    },

    translation: function(tx, ty, tz) {
        return [
            1,  0,  0,  0,
            0,  1,  0,  0,
            0,  0,  1,  0,
            tx, ty, tz, 1
        ]
    },
    
    xRotation: function (angleInRad) {
        var cos = Math.cos(angleInRad)
        var sin = Math.sin(angleInRad)
        return [
            1, 0, 0, 0,
            0, cos, sin, 0,
            0, -sin, cos, 0,
            0, 0, 0, 1
        ]
    },

    yRotation: function (angleInRad) {
        var cos = Math.cos(angleInRad)
        var sin = Math.sin(angleInRad)
        return [
            cos, 0, -sin, 0,
            0, 1, 0, 0,
            sin, 0, cos, 0,
            0, 0, 0, 1,
        ]
    },

    zRotation: function (angleInRad) {
        var cos = Math.cos(angleInRad)
        var sin = Math.sin(angleInRad)
        return [
            cos, sin, 0, 0,
            -sin, cos, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]
    },

    scaling: function (sx, sy, sz) {
        return [
            sx, 0,  0,  0,
            0, sy,  0,  0,
            0,  0, sz,  0,
            0,  0,  0,  1,
        ]
    },

    identity: function() {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    },

    inverse: function(m) {
        var m00 = m[0 * 4 + 0];
        var m01 = m[0 * 4 + 1];
        var m02 = m[0 * 4 + 2];
        var m03 = m[0 * 4 + 3];
        var m10 = m[1 * 4 + 0];
        var m11 = m[1 * 4 + 1];
        var m12 = m[1 * 4 + 2];
        var m13 = m[1 * 4 + 3];
        var m20 = m[2 * 4 + 0];
        var m21 = m[2 * 4 + 1];
        var m22 = m[2 * 4 + 2];
        var m23 = m[2 * 4 + 3];
        var m30 = m[3 * 4 + 0];
        var m31 = m[3 * 4 + 1];
        var m32 = m[3 * 4 + 2];
        var m33 = m[3 * 4 + 3];
        var tmp_0  = m22 * m33;
        var tmp_1  = m32 * m23;
        var tmp_2  = m12 * m33;
        var tmp_3  = m32 * m13;
        var tmp_4  = m12 * m23;
        var tmp_5  = m22 * m13;
        var tmp_6  = m02 * m33;
        var tmp_7  = m32 * m03;
        var tmp_8  = m02 * m23;
        var tmp_9  = m22 * m03;
        var tmp_10 = m02 * m13;
        var tmp_11 = m12 * m03;
        var tmp_12 = m20 * m31;
        var tmp_13 = m30 * m21;
        var tmp_14 = m10 * m31;
        var tmp_15 = m30 * m11;
        var tmp_16 = m10 * m21;
        var tmp_17 = m20 * m11;
        var tmp_18 = m00 * m31;
        var tmp_19 = m30 * m01;
        var tmp_20 = m00 * m21;
        var tmp_21 = m20 * m01;
        var tmp_22 = m00 * m11;
        var tmp_23 = m10 * m01;
    
        var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
            (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
            (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
            (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
            (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);
    
        var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
    
        return [
          d * t0,
          d * t1,
          d * t2,
          d * t3,
          d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
                (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
          d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
                (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
          d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
                (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
          d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
                (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
          d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
                (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
          d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
                (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
          d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
                (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
          d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
                (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
          d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
                (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
          d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
                (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
          d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
                (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
          d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
                (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
        ];
      },

    multiply: function(a, b) {
        var b00 = b[0 * 4 + 0];
        var b01 = b[0 * 4 + 1];
        var b02 = b[0 * 4 + 2];
        var b03 = b[0 * 4 + 3];
        var b10 = b[1 * 4 + 0];
        var b11 = b[1 * 4 + 1];
        var b12 = b[1 * 4 + 2];
        var b13 = b[1 * 4 + 3];
        var b20 = b[2 * 4 + 0];
        var b21 = b[2 * 4 + 1];
        var b22 = b[2 * 4 + 2];
        var b23 = b[2 * 4 + 3];
        var b30 = b[3 * 4 + 0];
        var b31 = b[3 * 4 + 1];
        var b32 = b[3 * 4 + 2];
        var b33 = b[3 * 4 + 3];
        var a00 = a[0 * 4 + 0];
        var a01 = a[0 * 4 + 1];
        var a02 = a[0 * 4 + 2];
        var a03 = a[0 * 4 + 3];
        var a10 = a[1 * 4 + 0];
        var a11 = a[1 * 4 + 1];
        var a12 = a[1 * 4 + 2];
        var a13 = a[1 * 4 + 3];
        var a20 = a[2 * 4 + 0];
        var a21 = a[2 * 4 + 1];
        var a22 = a[2 * 4 + 2];
        var a23 = a[2 * 4 + 3];
        var a30 = a[3 * 4 + 0];
        var a31 = a[3 * 4 + 1];
        var a32 = a[3 * 4 + 2];
        var a33 = a[3 * 4 + 3];
     
        return [
          b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
          b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
          b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
          b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
          b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
          b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
          b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
          b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
          b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
          b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
          b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
          b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
          b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
          b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
          b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
          b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33
        ];
    },

    orthographic: function(left, right, bottom, top, near, far) {
        return [
            2 / (right - left), 0, 0, 0,
            0, 2 / (top - bottom), 0, 0,
            0, 0, 2 / (near - far), 0,
        
            // (left + right) / (left - right),
            // (bottom + top) / (bottom - top),
            // (near + far) / (near - far),
            0, // biar start (0,0,0) di tengah
            0,
            0,
            1,
        ];
    },

    perspective: function(fieldOfViewInRads, aspect, near, far) {
        var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRads)
        var rangeInv = 1.0 / (near - far)

        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    },

    oblique: function (theta, phi) {
        var t = degToRad(theta)
        var p = degToRad(phi)
        var cotT = -1/Math.tan(t)
        var cotP = -1/Math.tan(p)
        
        var matx = [
            1, 0, cotT, 0,
            0, 1, cotP, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]
        
        return m4.transpose(matx)
    },

    // Simplified Function
    translate: function(m, tx, ty, tz) {
        return m4.multiply(m, m4.translation(tx, ty, tz));
    },
    
    xRotate: function(m, angleInRadians) {
        return m4.multiply(m, m4.xRotation(angleInRadians));
    },
    
    yRotate: function(m, angleInRadians) {
        return m4.multiply(m, m4.yRotation(angleInRadians));
    },
    
    zRotate: function(m, angleInRadians) {
        return m4.multiply(m, m4.zRotation(angleInRadians));
    },
    
    scale: function(m, sx, sy, sz) {
        return m4.multiply(m, m4.scaling(sx, sy, sz));
    },

    getManipulatedVertex: function (vertex, modelMatrix) {
        let manipulatedVertex = [0, 0, 0];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                manipulatedVertex[i] += modelMatrix[j * 4 + i] * vertex[j];
            }
            manipulatedVertex[i] += modelMatrix[3 * 4 + i];
        }
        return manipulatedVertex;
    },

    lookAtOrigin: function (cameraPosition, up) {
        var zAxis = normalize(cameraPosition);
        var xAxis = normalize(cross(up, zAxis));
        var yAxis = normalize(cross(zAxis, xAxis));
     
        return [
           xAxis[0], xAxis[1], xAxis[2], 0,
           yAxis[0], yAxis[1], yAxis[2], 0,
           zAxis[0], zAxis[1], zAxis[2], 0,
           cameraPosition[0],
           cameraPosition[1],
           cameraPosition[2],
           1,
        ];        
    }
}

var vertexShaderSource = document.querySelector("#vertex-shader-3d").textContent
var fragmentShaderSource = document.getElementById("fragment-shader-3d").textContent

var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
var program = createProgram(gl, vertexShader, fragmentShader)

// Bind matrix 
var worldViewProjectionLoc = gl.getUniformLocation(program, "u_worldViewProjection")
var worldInverseTransposeLoc = gl.getUniformLocation(program, "u_worldInverseTranspose")
var reverseLightDirectionLocation = gl.getUniformLocation(program, "u_reverseLightDirection")
var lightLocation = gl.getUniformLocation(program, "u_light")
var positionAttrLoc = gl.getAttribLocation(program, "a_position")
var colorLoc = gl.getAttribLocation(program,"a_color");
var normalLoc = gl.getAttribLocation(program,"a_normal");

var positionBuffers = [];
var colorBuffers = [];
var normalBuffers = [];
// ============================= End of Initialization =============================

// ============================= Rendering Code ============================
drawScene()
// ============================= End of Rendering Code =============================

// =============================  Library ============================= 
function setUpTools() {
    const sliderYCamera = document.querySelector('#camera-y-angle')
    sliderYCamera.addEventListener('input',changeYCamera)
    const sliderXCamera = document.querySelector('#camera-x-angle')
    sliderXCamera.addEventListener('input',changeXCamera)
    const sliderUpCamera = document.querySelector('#camera-up-angle')
    sliderUpCamera.addEventListener('input',changeUpCamera)
    const sliderRadius = document.querySelector('#camera-radius')
    sliderRadius.addEventListener('input',changeRadiusCamera)

    const sliderFOV = document.querySelector("#field-of-view")
    sliderFOV.addEventListener("input", changeFOV)

    const btnSave = document.querySelector("#btn-save");
    btnSave.addEventListener("click", function(e) {saveModels();});
    const btnLoad = document.querySelector("#btn-load");
    btnLoad.addEventListener("click", function(e) {loadModels();});

    const shadingCheck = document.querySelector("#shading-check");
    shadingCheck.addEventListener("change", function(e) {changeShading();});

    const lightX = document.querySelector("#light-x");
    lightX.addEventListener("input", changeLightX);
    const lightY = document.querySelector("#light-y");
    lightY.addEventListener("input", changeLightY);
    const lightZ = document.querySelector("#light-z");
    lightZ.addEventListener("input", changeLightZ);
}

function createShader(gl, type, source) {
    var shader = gl.createShader(type)
    gl.shaderSource(shader,source)
    gl.compileShader(shader)
    var success = gl.getShaderParameter(shader,gl.COMPILE_STATUS)
    if (success) {
        return shader
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader)
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram()
    gl.attachShader(program,vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    var success = gl.getProgramParameter(program,gl.LINK_STATUS)
    if(success) {
        return program
    }
    
    console.log(gl.getProgramInfoLog);
    gl.deleteProgram(program)   
}

function updateBuffers(model) {
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    setGeometry(gl, model.vertices);
    positionBuffers.push(positionBuffer);
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    setColors(gl, model.colors);
    colorBuffers.push(colorBuffer);
    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    setNormals(gl, model.normals);
    normalBuffers.push(normalBuffer);
}

function drawScene() {
    gl.viewport(0,0,gl.canvas.width,gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    // gl.enable(gl.CULL_FACE) // Only show front-facing triangles, cull the back-facing one
    gl.enable(gl.DEPTH_TEST)// Feature to filter pixel based on its depth
    gl.useProgram(program)

    // Compute the matrix
    var left = 0;
    var right = gl.canvas.clientWidth;
    var bottom = 0;
    var top = gl.canvas.clientHeight;

    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight

    var matrix = m4.identity()
    switch (projectionMode) {
        case ProjectMode.ORTHOGRAPHIC:
            matrix = m4.orthographic(left,right,bottom,top,near,far)
            break;
        
        case ProjectMode.PERSPECTIVE:
            matrix = m4.perspective(fieldOfView,aspect,zNear,zFar)
            break;

        case ProjectMode.OBLIQUE:
            matrix = m4.oblique(theta, phi)
            matrix = m4.multiply(matrix, m4.orthographic(left,right,bottom,top,near,far))
            break;

        default:
            console.log("Something Went Wrong went choosing Projection");
            break;
    }
    
    // Compute Camera Matrix
    var cameraMatrix = m4.xRotation(cameraXAngle);
    cameraMatrix = m4.yRotate(cameraMatrix, cameraYAngle);
    cameraMatrix = m4.translate(cameraMatrix, 0, 0, radiusCamera);
    var up = m4.getManipulatedVertex([0,1,0], m4.zRotation(cameraUpAngle));
    up = m4.getManipulatedVertex(up, cameraMatrix);
    var cameraPosition = [cameraMatrix[12], cameraMatrix[13], cameraMatrix[14]];
    var cameraMatrix = m4.lookAtOrigin(cameraPosition, up);

    var viewMatrix = m4.inverse(cameraMatrix)
    var viewProjectionMatrix = m4.multiply(matrix, viewMatrix)

    gl.uniform3fv(reverseLightDirectionLocation, light);
    gl.uniform1f(lightLocation, shading? 1.0: 0.0);    
    
    for(let i = 0; i < models.length; i++) {
        let model = models[i];

        gl.enableVertexAttribArray(positionAttrLoc)
        gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffers[i])

        var size = 3            // 2 component per iteration
        var type = gl.FLOAT     // the data is 32-bit float
        var normalize = false   // don't normalize the data
        var stride = 0          // move forward size each iteration
        var offset = 0          // Start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionAttrLoc,size,type,normalize,stride,offset
        )

        // Color 
        gl.enableVertexAttribArray(colorLoc)
        gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffers[i])
    
        var size = 3;                 // 3 components per iteration
        var type = gl.UNSIGNED_BYTE;  // the data is 8bit unsigned values
        var normalize = true;         // normalize the data (convert from 0-255 to 0-1)
        var stride = 0;               // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;               // start at the beginning of the buffer
        gl.vertexAttribPointer(
            colorLoc, size, type, normalize, stride, offset);
            
        // Normal
        gl.enableVertexAttribArray(normalLoc)
        gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[i])
        
        var size = 3;                 // 3 components per iteration
        var type = gl.FLOAT;          // the data is 32bit floats
        var normalize = false;        // don't normalize the data
        var stride = 0;               // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;               // start at the beginning of the buffer
        gl.vertexAttribPointer(
            normalLoc, size, type, normalize, stride, offset);

        var worldMatrix = model.matrix;

        var worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);
        var worldInverseMatrix = m4.inverse(worldMatrix);
        var worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);

        // Bind the matrix
        gl.uniformMatrix4fv(worldViewProjectionLoc,false,worldViewProjectionMatrix);
        gl.uniformMatrix4fv(worldInverseTransposeLoc,false,worldInverseTransposeMatrix);

        // Draw rectangle
        var primitiveTypes = gl.TRIANGLES
        var offset = 0
        var count = model.vertices.length
        gl.drawArrays(primitiveTypes,offset,count)        
    }
}

function makeZToWMatrix(fudgeFactor) {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, fudgeFactor,
        0, 0, 0, 1
    ];
}

function setGeometry(gl, vertices) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
      gl.STATIC_DRAW);
}

function setColors(gl, colors) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Uint8Array(colors),
        gl.STATIC_DRAW);
}

function setNormals(gl, normals) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(normals),
        gl.STATIC_DRAW);
}

function changeFOV(e) {
    fieldOfView = degToRad(parseInt(e.target.value))
    drawScene()
}