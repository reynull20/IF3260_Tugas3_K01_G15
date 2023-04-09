saveModels = () => {
    let savedModels = [];
    for (let i = 0; i < models.length; i++) {
        let model = models[i];
        let savedModel = {
            "id" : model.id,
            "vertices" : model.manipulatedVertices(),
            "colors" : model.colors,
            "normals" : model.normals,
        }
        savedModels.push(savedModel);
    }
    if(savedModels.length == 0) {
        console.log("No models to save");
    } else {
        saveFile("models.json", JSON.stringify(savedModels, null, 4))
    }
}

saveFile = (filename, content) => {
    const anchor = document.createElement("a");
    anchor.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
    anchor.setAttribute("download", filename);
    anchor.click();
}

loadModels = () => {
    let input = document.createElement("input");
    input.type = "file";
    let inputModels = [];
    input.onchange = e => {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = readerEvent => {
            let content = readerEvent.target.result;
            inputModels = JSON.parse(content);
            for (let i = 0; i < inputModels.length; i++) {
                let inputModel = inputModels[i];
                let model = new Model(models.length, inputModel.vertices, inputModel.colors, inputModel.childs);
                updateBuffers(model);
                models.push(model);
            }
            selectModel.innerHTML = "";
            for(let i=0; i< models.length; i++) {
                selectModel.appendChild(new Option("Model " + (i), i));
            }
            selectedModel = models[0];
            setupSelectedModel();
            drawScene();
        }
    }
    input.click();
}

setupSelectedModel = () => {
    sliderTranslationX.value = selectedModel.translation[0];
    document.getElementById("transXValue").value = sliderTranslationX.value;
    sliderTranslationY.value = selectedModel.translation[1];
    document.getElementById("transYValue").value = sliderTranslationY.value;
    sliderTranslationZ.value = selectedModel.translation[2];
    document.getElementById("transZValue").value = sliderTranslationZ.value;
    sliderRotationX.value = selectedModel.rotation[0] * 180 / Math.PI;
    document.getElementById("rotationXValue").value = sliderRotationX.value;
    sliderRotationY.value = selectedModel.rotation[1] * 180 / Math.PI;
    document.getElementById("rotationYValue").value = sliderRotationY.value;
    sliderRotationZ.value = selectedModel.rotation[2] * 180 / Math.PI;
    document.getElementById("rotationZValue").value = sliderRotationZ.value;
    sliderScalingX.value = selectedModel.scale[0];
    document.getElementById("scaleValX").value = sliderScalingX.value;
    sliderScalingY.value = selectedModel.scale[1];
    document.getElementById("scaleValY").value = sliderScalingY.value;
    sliderScalingZ.value = selectedModel.scale[2];
    document.getElementById("scaleValZ").value = sliderScalingZ.value;
}

function sliderTransX(event) {
    selectedModel.translation[0] = parseFloat(event.target.value)
    selectedModel.updateMatrix()
    drawScene()
}

function sliderTransY(event) {
    selectedModel.translation[1] = parseFloat(event.target.value)
    selectedModel.updateMatrix()
    drawScene()
}

function sliderTransZ(event) {
    selectedModel.translation[2] = parseFloat(event.target.value)
    selectedModel.updateMatrix()
    drawScene()
}

function sliderRotateX(e) {
    selectedModel.rotation[0] = parseFloat(e.target.value) * Math.PI / 180
    selectedModel.updateMatrix()
    drawScene()
}

function sliderRotateY(e) {
    selectedModel.rotation[1] = parseFloat(e.target.value) * Math.PI / 180
    selectedModel.updateMatrix()
    drawScene()
}

function sliderRotateZ(e) {
    selectedModel.rotation[2] = parseFloat(e.target.value) * Math.PI / 180
    selectedModel.updateMatrix()
    drawScene()
}

function rotateX(angle) {
    let c = Math.cos(angle)
    let s = Math.sin(angle)
    return [
        1, 0, 0,
        0, c, -s,
        0, s, c
    ]
}

function rotateY(angle) {
    let c = Math.cos(angle)
    let s = Math.sin(angle)
    return [
        c, 0, s,
        0, 1, 0,
        -s, 0, c
    ]
}

function rotateZ(angle) {
    let c = Math.cos(angle)
    let s = Math.sin(angle)
    return [
        c, -s, 0,
        s, c, 0,
        0, 0, 1
    ]
}

function sliderScaleX(e) {
    let scaleFactorX = parseFloat(e.target.value)
    selectedModel.scale[0] = scaleFactorX
    selectedModel.updateMatrix()
    drawScene()
}

function sliderScaleY(e) {
    let scaleFactorY = parseFloat(e.target.value)
    selectedModel.scale[1] = scaleFactorY
    selectedModel.updateMatrix()
    drawScene()
}

function sliderScaleZ(e) {
    let scaleFactorZ = parseFloat(e.target.value)
    selectedModel.scale[2] = scaleFactorZ
    selectedModel.updateMatrix()
    drawScene()
}

function degToRad(angle) {
    return angle * Math.PI / 180
}

normalize = (v) => {
    var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (length > 0.00001) {
      return [v[0] / length, v[1] / length, v[2] / length];
    } else {
      return [0, 0, 0];
    }    
}

cross = (a, b) => {
    return [a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]];
  }


multVectWithMat3 = (v,m) => {
    return [m[0] * v[0] + m[3] * v[1] + m[6] * v[2],
            m[1] * v[0] + m[4] * v[1] + m[7] * v[2],
            m[2] * v[0] + m[5] * v[1] + m[8] * v[2]];
}

multMat3WithMat3 = (m1,m2) => {
    return [m1[0] * m2[0] + m1[3] * m2[1] + m1[6] * m2[2],
            m1[1] * m2[0] + m1[4] * m2[1] + m1[7] * m2[2],
            m1[2] * m2[0] + m1[5] * m2[1] + m1[8] * m2[2],
            m1[0] * m2[3] + m1[3] * m2[4] + m1[6] * m2[5],
            m1[1] * m2[3] + m1[4] * m2[4] + m1[7] * m2[5],
            m1[2] * m2[3] + m1[5] * m2[4] + m1[8] * m2[5],
            m1[0] * m2[6] + m1[3] * m2[7] + m1[6] * m2[8],
            m1[1] * m2[6] + m1[4] * m2[7] + m1[7] * m2[8],
            m1[2] * m2[6] + m1[5] * m2[7] + m1[8] * m2[8]];
}

function changeYCamera(e) {
    cameraYAngle = degToRad(parseInt(e.target.value))
    drawScene()
}

function changeXCamera(e) {
    cameraXAngle = degToRad(parseInt(e.target.value))
    drawScene()
}

function changeUpCamera(e) {
    cameraUpAngle = degToRad(parseInt(e.target.value))
    drawScene()
}

function changeLightX(e) {
    lightBase[0] = parseFloat(e.target.value)
    readjustLight()
}

function changeLightY(e) {
    lightBase[1] = parseFloat(e.target.value)
    readjustLight()
}

function changeLightZ(e) {
    lightBase[2] = parseFloat(e.target.value)
    readjustLight()
}

function readjustLight(){
    light = normalize(lightBase)
    drawScene()
}

function changeRadiusCamera(e) {
    radiusCamera = parseInt(e.target.value)
    drawScene()
}

function resetView() {
    near = -800;
    document.querySelector("#near").value = near;
    document.querySelector("#nearValue").value = near;
    far = 800;
    document.querySelector("#far").value = far;
    document.querySelector("#farValue").value = far;

    zNear = 1;
    document.querySelector("#zNear").value = zNear;
    document.querySelector("#zNearValue").value = zNear;
    zFar = 2000;
    document.querySelector("#zFar").value = zFar;
    document.querySelector("#zFarValue").value = zFar;

    fieldOfView = degToRad(100);
    document.querySelector("#field-of-view").value = 100;
    document.querySelector("#fovValue").value = 100;

    theta = 75
    document.querySelector("#theta").value = theta;
    document.querySelector("#thetaValue").value = theta;
    phi = 75
    document.querySelector("#phi").value = phi;
    document.querySelector("#phiValue").value = phi;

    cameraYAngle = degToRad(0);
    document.querySelector("#camera-y-angle").value = cameraYAngle
    document.querySelector("#cameraYValue").value = cameraYAngle
    cameraXAngle = degToRad(0);
    document.querySelector("#camera-x-angle").value = cameraXAngle
    document.querySelector("#cameraXValue").value = cameraXAngle
    cameraUpAngle = degToRad(0);
    document.querySelector("#camera-up-angle").value = cameraUpAngle
    document.querySelector("#cameraUpValue").value = cameraUpAngle

    radiusCamera = 400;
    document.querySelector("#camera-radius").value = radiusCamera
    document.querySelector("#cameraRadiusValue").value = radiusCamera

    drawScene()
}

// Projection Change
var projections = document.querySelectorAll("input[name='state-d']")
var tools = document.querySelector(".projection-util")

for (item in projections) {
    projections[item].onchange = function () {
        if (document.getElementById("Orthographic").checked) {
            projectionMode = ProjectMode.ORTHOGRAPHIC
            tools.children[0].style.display = "block"
            tools.children[1].style.display = "none"
            tools.children[2].style.display = "none"
        } else if (document.getElementById("Perspective").checked) {
            projectionMode = ProjectMode.PERSPECTIVE
            tools.children[0].style.display = "none"
            tools.children[1].style.display = "block"
            tools.children[2].style.display = "none"
        } else if (document.getElementById("Oblique").checked) {
            projectionMode = ProjectMode.OBLIQUE
            tools.children[0].style.display = "none"
            tools.children[1].style.display = "none"
            tools.children[2].style.display = "block"
        }

        drawScene()
    }
}

changeOrthoNear = (e) => {
    near = parseInt(e.target.value)
    drawScene()
}

changeOrthoFar = (e) => {
    far = parseInt(e.target.value)
    drawScene()
}

changePersNear = (e) => {
    zNear = parseInt(e.target.value)
    drawScene()
}

changePersFar = (e) => {
    zFar = parseInt(e.target.value)
    drawScene()
}

changeOblTheta = (e) => {
    theta = parseInt(e.target.value)
    drawScene()
}

changeOblPhi = (e) => {
    phi = parseInt(e.target.value)
    drawScene()
}

changeShading = () => {
    shading = !shading
    drawScene()
}