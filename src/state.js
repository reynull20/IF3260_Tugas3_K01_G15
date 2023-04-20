const selectModel = document.getElementById("select-model");
const sliderTranslationX = document.querySelector("#translation-x")
sliderTranslationX.addEventListener("input", sliderTransX)
const sliderTranslationY = document.querySelector("#translation-y")
sliderTranslationY.addEventListener("input", sliderTransY)
const sliderTranslationZ = document.querySelector("#translation-z")
sliderTranslationZ.addEventListener("input", sliderTransZ)

const sliderRotationX = document.querySelector("#rotation-x")
sliderRotationX.addEventListener("input",sliderRotateX)
const sliderRotationY = document.querySelector("#rotation-y")
sliderRotationY.addEventListener("input",sliderRotateY)
const sliderRotationZ = document.querySelector("#rotation-z")
sliderRotationZ.addEventListener("input",sliderRotateZ)

const sliderScalingX = document.querySelector("#scale-x")
sliderScalingX.addEventListener("input", sliderScaleX)
const sliderScalingY = document.querySelector("#scale-y")
sliderScalingY.addEventListener("input", sliderScaleY)
const sliderScalingZ = document.querySelector("#scale-z")
sliderScalingZ.addEventListener("input", sliderScaleZ)

const jointSliderRotationX = document.querySelector("#joint-rotation-x")
jointSliderRotationX.addEventListener("input",jointSliderRotateX)
const jointSliderRotationY = document.querySelector("#joint-rotation-y")
jointSliderRotationY.addEventListener("input",jointSliderRotateY)
const jointSliderRotationZ = document.querySelector("#joint-rotation-z")
jointSliderRotationZ.addEventListener("input",jointSliderRotateZ)

const artSliderTranslationX = document.querySelector("#art-translation-x")
artSliderTranslationX.addEventListener("input", artSliderTransX)
const artSliderTranslationY = document.querySelector("#art-translation-y")
artSliderTranslationY.addEventListener("input", artSliderTransY)
const artSliderTranslationZ = document.querySelector("#art-translation-z")
artSliderTranslationZ.addEventListener("input", artSliderTransZ)

const artSliderRotationX = document.querySelector("#art-rotation-x")
artSliderRotationX.addEventListener("input",artSliderRotateX)
const artSliderRotationY = document.querySelector("#art-rotation-y")
artSliderRotationY.addEventListener("input",artSliderRotateY)
const artSliderRotationZ = document.querySelector("#art-rotation-z")
artSliderRotationZ.addEventListener("input",artSliderRotateZ)

const artSliderScalingX = document.querySelector("#art-scale-x")
artSliderScalingX.addEventListener("input", artSliderScaleX)
const artSliderScalingY = document.querySelector("#art-scale-y")
artSliderScalingY.addEventListener("input", artSliderScaleY)
const artSliderScalingZ = document.querySelector("#art-scale-z")
artSliderScalingZ.addEventListener("input", artSliderScaleZ)

const sliderOrthoNear = document.querySelector("#near")
sliderOrthoNear.addEventListener("input", changeOrthoNear)
const sliderOrthoFar = document.querySelector("#far")
sliderOrthoFar.addEventListener("input", changeOrthoFar)
const sliderPersNear = document.querySelector("#zNear")
sliderPersNear.addEventListener("input", changePersNear)
const sliderPersFar = document.querySelector("#zFar")
sliderPersFar.addEventListener("input", changePersFar)
const sliderOblTheta = document.querySelector("#theta")
sliderOblTheta.addEventListener("input", changeOblTheta)
const sliderOblPhi = document.querySelector("#phi")
sliderOblPhi.addEventListener("input", changeOblPhi)

var models = [[]];
var selectedModel = null;
var selectedComponentId = null;
var cameraYAngle = degToRad(0);
var cameraXAngle = degToRad(0);
var cameraUpAngle = degToRad(0);
var radiusCamera = 400;
var lightBase = [0, 0, 1];
var light = [0, 0, 1];
var shading = true;
var frame = 0;

selectModel.addEventListener("input", function (event) {
    selectedModel = models[frame][parseInt(event.target.value)];
    selectedComponent = selectedModel;
    setupSelectedModel();
});

const selectFrame = document.getElementById("select-frame");
selectFrame.addEventListener("input", function (event) {
    frame = parseInt(event.target.value);
    selectedModel = models[frame][0];
    console.log(selectedModel)
    selectedComponent = selectedModel;
    setupSelectedModel();
    // requestAnimationFrame(drawScene);
});

const moveUpButton = document.getElementById("btn-move-up");
moveUpButton.addEventListener("click", function () {
    if (frame > 0){
        var placeholderFrame = models[frame]
        models[frame] = models[frame-1]
        models[frame-1] = placeholderFrame
        console.log(models)
        setupSelectedModel();
        drawScene();
    }
})

const moveDownButton = document.getElementById("btn-move-down");
moveDownButton.addEventListener("click", function () {
    if (frame < models.length-1){
        var placeholderFrame = models[frame]
        models[frame] = models[frame+1]
        models[frame+1] = placeholderFrame
        console.log(models)
        setupSelectedModel();
        drawScene();
    }
})
