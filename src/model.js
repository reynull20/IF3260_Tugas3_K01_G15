class Model {
    constructor(id = -1, name = "Undefined", vertices = [], colors = [], joints = [], translation = [0,0,0], rotation = [0,0,0], scale = [0,0,0], ch_translation = [0,0,0], ch_rotation = [0,0,0], ch_scale = [0,0,0], animation = [], childs = [], parentMatrix = m4.identity()) {
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
    }

    setupChilds = (childs) => {
        this.childs = [];
        for (let i = 0; i < childs.length; i++) {
            this.childs.push(new Model(childs[i].id, childs[i].name, childs[i].vertices, childs[i].colors, childs[i].joint, childs[i].translation, childs[i].rotation, childs[i].scale, childs[i].ch_translation, childs[i].ch_rotation, childs[i].ch_scale, childs[i].animation, childs[i].childs, this.matrix_child));
        }
    }
    
    traverseAsArray = () => {
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
            console.log(worldMatrix);
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
}
