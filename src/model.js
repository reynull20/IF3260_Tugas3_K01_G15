class Model {
    constructor(id = -1, name = "Undefined", vertices = [], colors = [], joints = [], translation = [0,0,0], rotation = [0,0,0], scale = [0,0,0], ch_translation = [0,0,0], ch_rotation = [0,0,0], ch_scale = [0,0,0], animation = [], childs = [], parentMatrix = m4.identity(), textureMode = 0) {
        if(textureMode == null) {
            textureMode = 0;
        }
        this.id = id;
        this.name = name;
        this.vertices = vertices;
        this.colors = colors;
        this.translation = translation;
        this.rotation = rotation;
        this.scale = scale;
        this.joints = joints;
        this.joint_rotation = [0,0,0];
        this.ch_translation = ch_translation;
        this.ch_rotation = ch_rotation;
        this.ch_scale = ch_scale;
        this.animation = animation;
        this.parentMatrix = parentMatrix;
        this.setupCenter();
        this.calculateNormals();
        this.matrix_child = this.modelMatrixChild(this.parentMatrix);
        this.matrix = this.modelMatrix();
        this.setupChilds(childs);
        this.currentAnimIndex = 0;
        this.setupTextureCoord(); // TODO: cek udah sesuai sama model ga
        this.textureMode = textureMode;
        // TODO: this.getAllVectors(); // terutama untuk bump.        
    }

    setupChilds = (childs) => {
        this.childs = [];
        for (let i = 0; i < childs.length; i++) {
            this.childs.push(new Model(childs[i].id, childs[i].name, childs[i].vertices, childs[i].colors, childs[i].joint, childs[i].translation, childs[i].rotation, childs[i].scale, childs[i].ch_translation, childs[i].ch_rotation, childs[i].ch_scale, childs[i].animation, childs[i].childs, this.matrix_child, childs[i].textureMode));
        }
    }
    
    traverseAsArray = () => {
        if (this.name === "Torso") {
            this.updateMatrix()
            this.updateAnimation()
        }
        let array = [];
        array.push(this);
        for (let i = 0; i < this.childs.length; i++) {
            array = array.concat(this.childs[i].traverseAsArray());
        }
        return array;
    }

    updateMatrix = (parentMatrix = null) => {
        if (parentMatrix != null) {
            this.parentMatrix = parentMatrix;
        }
        this.matrix_child = this.modelMatrixChild(this.parentMatrix);
        this.matrix = this.modelMatrix(parentMatrix);

        for (let i = 0; i < this.childs.length; i++) {
            this.childs[i].updateMatrix(this.matrix_child);
        }
    }

    updateJoint = () => {
        if (this.parentMatrix !== null) {
            let worldMatrix = m4.multiply(this.parentMatrix, this.joints);
            return [
                worldMatrix[0], 0, 0, 1,
                0, worldMatrix[5], 0, 1,
                0, 0, worldMatrix[10], 1,
                0, 0, 0, 1
            ];
        }
        return this.joints;
    }

    modelMatrixChild = (parentMatrix = m4.identity()) => {
        let current_joint = this.updateJoint();
        let worldMatrix = m4.translation(current_joint[0],current_joint[5],current_joint[10]);
        worldMatrix = m4.xRotate(worldMatrix,this.joint_rotation[0]);
        worldMatrix = m4.yRotate(worldMatrix,this.joint_rotation[1]);
        worldMatrix = m4.zRotate(worldMatrix,this.joint_rotation[2]);
        worldMatrix = m4.translate(worldMatrix,-current_joint[0],-current_joint[5],-current_joint[10]);
        worldMatrix = m4.translate(worldMatrix,this.center[0], this.center[1], this.center[2])
        worldMatrix = m4.translate(worldMatrix, this.ch_translation[0], this.ch_translation[1], this.ch_translation[2]);
        worldMatrix = m4.xRotate(worldMatrix, this.ch_rotation[0]);
        worldMatrix = m4.yRotate(worldMatrix, this.ch_rotation[1]);
        worldMatrix = m4.zRotate(worldMatrix, this.ch_rotation[2]);
        worldMatrix = m4.scale(worldMatrix, this.ch_scale[0], this.ch_scale[1], this.ch_scale[2]);
        worldMatrix = m4.translate(worldMatrix, this.center[0]*(-1), this.center[1]*(-1), this.center[2]*(-1));
        worldMatrix = m4.multiply(worldMatrix, parentMatrix);
        return worldMatrix;
    }

    updateAnimation = () => {
        var currentAnim = this.animation[this.currentAnimIndex];
        var nextAnim = this.animation[(this.currentAnimIndex+1)%this.animation.length];
        
        // Select current and next frame
        if (nextAnim.time === 0 || then < 0.05) {
            this.translation = nextAnim.translation;
            this.rotation = nextAnim.rotation;
            this.scale = nextAnim.scale
            this.joint_rotation = nextAnim.joint_rotation
            this.ch_translation = nextAnim.ch_translation
            this.ch_rotation = nextAnim.ch_rotation
            this.ch_scale = nextAnim.ch_scale

            this.currentAnimIndex = 0
            currentAnim = this.animation[this.currentAnimIndex]
            nextAnim = this.animation[(this.currentAnimIndex+1)%this.animation.length];
            time = 0;
        } else if (nextAnim.time < time + dt) {
            currentAnim = nextAnim
            this.currentAnimIndex = (this.currentAnimIndex + 1) % this.animation.length
            nextAnim = this.animation[(this.currentAnimIndex+1) % this.animation.length]
        }

        // Interpolate between current and next frame
        var dTime = nextAnim.time - currentAnim.time // interval between next and current frame in seconds
        this.translation = [
            this.translation[0] + (((nextAnim.translation[0] - currentAnim.translation[0])/dTime) * dt),
            this.translation[1] + (((nextAnim.translation[1] - currentAnim.translation[1])/dTime) * dt),
            this.translation[2] + (((nextAnim.translation[2] - currentAnim.translation[2])/dTime) * dt),
        ]
        this.rotation = [
            this.rotation[0] + (((nextAnim.rotation[0] - currentAnim.rotation[0])/dTime) * dt),
            this.rotation[1] + (((nextAnim.rotation[1] - currentAnim.rotation[1])/dTime) * dt),
            this.rotation[2] + (((nextAnim.rotation[2] - currentAnim.rotation[2])/dTime) * dt),
        ]
        this.scale = [
            this.scale[0] + (((nextAnim.scale[0] - currentAnim.scale[0])/dTime) * dt),
            this.scale[1] + (((nextAnim.scale[1] - currentAnim.scale[1])/dTime) * dt),
            this.scale[2] + (((nextAnim.scale[2] - currentAnim.scale[2])/dTime) * dt),
        ]

        this.joint_rotation = [
            this.joint_rotation[0] + (((nextAnim.joint_rotation[0] - currentAnim.joint_rotation[0])/dTime) * dt),
            this.joint_rotation[1] + (((nextAnim.joint_rotation[1] - currentAnim.joint_rotation[1])/dTime) * dt),
            this.joint_rotation[2] + (((nextAnim.joint_rotation[2] - currentAnim.joint_rotation[2])/dTime) * dt),
        ]
        this.ch_translation = [
            this.ch_translation[0] + (((nextAnim.ch_translation[0] - currentAnim.ch_translation[0])/dTime) * dt),
            this.ch_translation[1] + (((nextAnim.ch_translation[1] - currentAnim.ch_translation[1])/dTime) * dt),
            this.ch_translation[2] + (((nextAnim.ch_translation[2] - currentAnim.ch_translation[2])/dTime) * dt),
        ]
        this.ch_rotation = [
            this.ch_rotation[0] + (((nextAnim.ch_rotation[0] - currentAnim.ch_rotation[0])/dTime) * dt),
            this.ch_rotation[1] + (((nextAnim.ch_rotation[1] - currentAnim.ch_rotation[1])/dTime) * dt),
            this.ch_rotation[2] + (((nextAnim.ch_rotation[2] - currentAnim.ch_rotation[2])/dTime) * dt),
        ]
        this.ch_scale = [
            this.ch_scale[0] + (((nextAnim.ch_scale[0] - currentAnim.ch_scale[0])/dTime) * dt),
            this.ch_scale[1] + (((nextAnim.ch_scale[1] - currentAnim.ch_scale[1])/dTime) * dt),
            this.ch_scale[2] + (((nextAnim.ch_scale[2] - currentAnim.ch_scale[2])/dTime) * dt),
        ]
        console.log("Current Frame :: " + currentAnim.time + "s");
    }

    modelMatrix = () => {
        let worldMatrix = m4.identity();
        worldMatrix = m4.translate(worldMatrix,this.center[0], this.center[1], this.center[2])
        worldMatrix = m4.translate(worldMatrix, this.translation[0], this.translation[1], this.translation[2]);
        worldMatrix = m4.xRotate(worldMatrix, this.rotation[0]);
        worldMatrix = m4.yRotate(worldMatrix, this.rotation[1]);
        worldMatrix = m4.zRotate(worldMatrix, this.rotation[2]);
        worldMatrix = m4.scale(worldMatrix, this.scale[0], this.scale[1], this.scale[2]);
        worldMatrix = m4.translate(worldMatrix, this.center[0]*(-1), this.center[1]*(-1), this.center[2]*(-1));
        worldMatrix = m4.multiply(this.matrix_child, worldMatrix);
        return worldMatrix;
    }
        

    manipulatedVertices = () => {
        let manipulatedVertices = [];
        let matrixModel = m4.translation(this.joints[0],this.joints[5],this.joints[10]);
        matrixModel = m4.xRotate(matrixModel,this.joint_rotation[0]);
        matrixModel = m4.yRotate(matrixModel,this.joint_rotation[1]);
        matrixModel = m4.zRotate(matrixModel,this.joint_rotation[2]);
        matrixModel = m4.translate(matrixModel,-this.joints[0],-this.joints[5],-this.joints[10]);
        matrixModel = m4.translate(matrixModel,this.translation[0], this.translation[1], this.translation[2]);
        matrixModel = m4.xRotate(matrixModel, this.rotation[0]);
        matrixModel = m4.yRotate(matrixModel, this.rotation[1]);
        matrixModel = m4.zRotate(matrixModel, this.rotation[2]);
        matrixModel = m4.scale(matrixModel, this.scale[0], this.scale[1], this.scale[2]);
        for (let i = 0; i < this.vertices.length; i+=3) {
            let vertex = [this.vertices[i], this.vertices[i+1], this.vertices[i+2]];
            vertex[0] -= this.center[0];
            vertex[1] -= this.center[1];
            vertex[2] -= this.center[2];
            let manipulatedVertex = m4.getManipulatedVertex(vertex, matrixModel);
            manipulatedVertex[0] += this.center[0];
            manipulatedVertex[1] += this.center[1];
            manipulatedVertex[2] += this.center[2];
            for(let j=0; j<manipulatedVertex.length; j++) {
                manipulatedVertices.push(manipulatedVertex[j]);
            }
        }
        return manipulatedVertices;
    }

    manipulatedNormals = () => {
        let manipulatedNormals = [];
        let matrixModel = m4.translation(this.translation[0], this.translation[1], this.translation[2]);

        matrixModel = m4.xRotate(matrixModel, this.rotation[0]);
        matrixModel = m4.yRotate(matrixModel, this.rotation[1]);
        matrixModel = m4.zRotate(matrixModel, this.rotation[2]);
        matrixModel = m4.scale(matrixModel, this.scale[0], this.scale[1], this.scale[2]);
        for (let i = 0; i < this.normals.length; i+=3) {
            let normal = [this.normals[i], this.normals[i+1], this.normals[i+2]];
            let manipulatedNormal = m4.getManipulatedVertex(normal, matrixModel);

            //normalizing
            let length = Math.sqrt(manipulatedNormal[0] * manipulatedNormal[0] + manipulatedNormal[1] * manipulatedNormal[1] + manipulatedNormal[2] * manipulatedNormal[2]);
            if (length > 0.00001) {
                manipulatedNormal[0] /= length;
                manipulatedNormal[1] /= length;
                manipulatedNormal[2] /= length;
            }
            else {
                manipulatedNormal[0] = 0;
                manipulatedNormal[1] = 0;
                manipulatedNormal[2] = 0;
            }
            for(let j=0; j<manipulatedNormal.length; j++) {
                manipulatedNormals.push(manipulatedNormal[j]);
            }
        
        }

        return manipulatedNormals;
    }

    setupCenter = () => {
        let center = [0, 0, 0];
        for (let i = 0; i < this.vertices.length; i+=3) {
            let vertex = [this.vertices[i], this.vertices[i+1], this.vertices[i+2]];
            center[0] += vertex[0];
            center[1] += vertex[1];
            center[2] += vertex[2];
        }
        center[0] /= this.vertices.length/3;
        center[1] /= this.vertices.length/3;
        center[2] /= this.vertices.length/3;
        this.center = center;
    }

    calculateNormals = () => {
        let normals = [];
        for (let i = 0; i < this.vertices.length; i+=9) {
            let v1 = [this.vertices[i], this.vertices[i+1], this.vertices[i+2]];
            let v2 = [this.vertices[i+3], this.vertices[i+4], this.vertices[i+5]];
            let v3 = [this.vertices[i+6], this.vertices[i+7], this.vertices[i+8]];
            let e1 = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
            let e2 = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];
            let normal = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];

            // Normalize
            let length = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]);
            normal[0] /= length;
            normal[1] /= length;
            normal[2] /= length;
            
            for (let j = 0; j < 3; j++) {
                normals.push(normal[0]);
                normals.push(normal[1]);
                normals.push(normal[2]);
            }
        }
        this.normals = normals;
    }

    setupTextureCoord = () => {
        let textureCoord = [];
        for (let i = 0; i < this.vertices.length; i+=18) {
            textureCoord = textureCoord.concat([
                0, 0, // kiri atas
                0, 1, // kiri bawah
                1, 1, // kanan bawah
                0, 0,
                1, 1, // kanan atas
                1, 0,
            ]);
            // textureCoord = textureCoord.concat([
            //     0, 0,
            //     0, 1,
            //     1, 1,
            //     0, 0,
            //     1, 1,
            //     1, 0,
            // ]);
        }
        this.textureCoord = textureCoord;
    }    

    saveRecursively = () => {
        let data = {
            "name": this.name,
            "vertices": this.vertices,
            "colors": this.colors,
            "joint": this.joints,
            "textureMode": this.textureMode,
            "translation": this.translation,
            "rotation": this.rotation,
            "scale": this.scale,
            "ch_translation": this.ch_translation,
            "ch_rotation": this.ch_rotation,
            "ch_scale": this.ch_scale,
            "childs": []
        }
        for (let i = 0; i < this.childs.length; i++) {
            data.childs.push(this.childs[i].saveRecursively());
        }
        return data;
    }
}
