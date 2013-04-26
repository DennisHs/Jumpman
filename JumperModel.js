


var createJumperModel = function(shaderType)
{
    if (shaderType == "color")
    {
        var separateBodies = createSeparateBody();
    }
    else if (shaderType == "texture")
    {
        var separateBodies = createSeparateBodyTexture();
    }

    // Copy head and combine body/arms/legs
    var model = {
        "shaderType": shaderType,
        "vertex": separateBodies.head.vertex.slice(),
        "index": separateBodies.head.index.slice(),
    };
    
    if (separateBodies.head.color)
    {
        model["color"] = separateBodies.head.color.slice();
        model["colorItemSize"] = 4;
    }
    
    if (separateBodies.head.textureCoords)
    {
        model["textureCoords"] = separateBodies.head.textureCoords.slice();
        model["textureCoordItemSize"] = 2;
    }
    
    window.console.log("[JumperModel][createJumperModel] Combine body");
    model = combineModel(separateBodies.body, model);
    window.console.log("[JumperModel][createJumperModel] Combine left arm");
    model = combineModel(separateBodies.leftArm, model);
    window.console.log("[JumperModel][createJumperModel] Combine right arm");
    model = combineModel(separateBodies.rightArm, model);
    window.console.log("[JumperModel][createJumperModel] Combine left leg");
    model = combineModel(separateBodies.leftLeg, model);
    window.console.log("[JumperModel][createJumperModel] Combine right leg");
    model = combineModel(separateBodies.rightLeg, model);
    
    model["vertexItemSize"] = 3;
    model["itemNumbers"] = model.vertex.length / 3;
    model["indexItemSize"] = 1;
    model["indexItemNumbers"] = model.index.length;
    
    window.console.log("[JumperModel][createJumperModel] The model num items: " + model.vertex.length +
            " index item numbers: " + model["indexItemNumbers"]);
    
    return model;
}

var createSeparateBody = function()
{
    // Configuress
    var bodySize = 0.4;
    var trunkSize = 0.8
    var headSize = 1;
    
    var headPos = [0, headSize / 2 + trunkSize * 2, 0];
    var bodyPos = [0, trunkSize / 2 + trunkSize, 0];
    var leftArmPos = [bodySize / 2 + trunkSize / 2, trunkSize / 2 + trunkSize, 0];
    var rightArmPos = [-(bodySize / 2 + trunkSize / 2), trunkSize / 2 + trunkSize, 0];
    var leftLegPos = [bodySize / 3 + trunkSize / 2, trunkSize / 2, 0];
    var rightLegPos = [-(bodySize / 3 + trunkSize / 2), trunkSize / 2, 0];
    
    // The head
    //    5-------6
    //   /|      /|
    // 3,8-----2,9|
    //  | |     | |
    //  | |4----|-|7
    //  |/      |/
    // 0,11----1,10
    //
    // vertex coords array
    
    var headVertices = [
        // Front face   0~3
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Back face    4~7
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,

        // Top face     8~9
        //-1.0,  1.0, -1.0, // 5
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
        // 1.0,  1.0, -1.0, // 6

        // Bottom face  10~11
        //-1.0, -1.0, -1.0, // 4
         //1.0, -1.0, -1.0, // 7
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // Right face
         //1.0, -1.0, -1.0, // 7
         //1.0,  1.0, -1.0, // 6
         //1.0,  1.0,  1.0, // 9
         //1.0, -1.0,  1.0, // 10

        // Left face
        //-1.0, -1.0, -1.0, // 4
        //-1.0, -1.0,  1.0, // 11
        //-1.0,  1.0,  1.0, // 8
        //-1.0,  1.0, -1.0  // 5
    ];
    
    var helfHeadSize = headSize / 2;
    for (var i=0; i<headVertices.length / 3; i++)
    {
        headVertices[i*3] = headVertices[i*3] * helfHeadSize + headPos[0];
        headVertices[i*3+1] = headVertices[i*3+1] * helfHeadSize + headPos[1];
        headVertices[i*3+2] = headVertices[i*3+2] * helfHeadSize + headPos[2];
    }
        
    var headColors = [];
    var whiteColor = [1.0, 1.0, 1.0, 1.0];
    for (var i=0; i<headVertices.length / 3; i++)
    {
        headColors = headColors.concat(whiteColor);
    }
    
    var headIndexBuffer = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        5, 8, 9,      5, 9, 6,    // Top face
        4, 7, 10,     4, 10, 11,  // Bottom face
        7, 6, 9,      7, 9, 10,   // Right face
        4, 11, 8,     4, 8, 5,    // Left face
    ];
    
    normalBox = createBox();
    
    // Body
    var vertexBuffer = normalBox.vertex.slice();
    var colorBuffer = normalBox.color.slice();
    var indexBuffer = normalBox.index.slice();
    var helfBodySize = bodySize / 2;
    var helfTrunkSize = trunkSize / 2;
    for (var i=0; i<vertexBuffer.length / 3; i++)
    {
        vertexBuffer[i*3] = vertexBuffer[i*3] * helfBodySize + bodyPos[0];
        vertexBuffer[i*3+1] = vertexBuffer[i*3+1] * helfTrunkSize + bodyPos[1];
        vertexBuffer[i*3+2] = vertexBuffer[i*3+2] + bodyPos[2];
    }
    var body = {
        "vertex": vertexBuffer,
        "color": colorBuffer,
        "index": indexBuffer,
    };
    
    // Left Arm
    vertexBuffer = normalBox.vertex.slice();
    colorBuffer = normalBox.color.slice();
    indexBuffer = normalBox.index.slice();
    for (var i=0; i<vertexBuffer.length / 3; i++)
    {
        vertexBuffer[i*3] = vertexBuffer[i*3] * helfTrunkSize + leftArmPos[0];
        vertexBuffer[i*3+1] = vertexBuffer[i*3+1] * helfBodySize + leftArmPos[1];
        vertexBuffer[i*3+2] = vertexBuffer[i*3+2] * helfTrunkSize + leftArmPos[2];
    }
    var leftArm = {
        "vertex": vertexBuffer,
        "color": colorBuffer,
        "index": indexBuffer,
    };
    
    // Right Arm
    vertexBuffer = normalBox.vertex.slice();
    colorBuffer = normalBox.color.slice();
    indexBuffer = normalBox.index.slice();
    for (var i=0; i<vertexBuffer.length / 3; i++)
    {
        vertexBuffer[i*3] = vertexBuffer[i*3] * helfTrunkSize + rightArmPos[0];
        vertexBuffer[i*3+1] = vertexBuffer[i*3+1] * helfBodySize + rightArmPos[1];
        vertexBuffer[i*3+2] = vertexBuffer[i*3+2] * helfTrunkSize + rightArmPos[2];
    }
    var rightArm = {
        "vertex": vertexBuffer,
        "color": colorBuffer,
        "index": indexBuffer,
    };
    
    // Left Leg
    vertexBuffer = normalBox.vertex.slice();
    colorBuffer = normalBox.color.slice();
    indexBuffer = normalBox.index.slice();
    for (var i=0; i<vertexBuffer.length / 3; i++)
    {
        vertexBuffer[i*3] = vertexBuffer[i*3] * helfTrunkSize + leftLegPos[0];
        vertexBuffer[i*3+1] = vertexBuffer[i*3+1] * helfTrunkSize + leftLegPos[1];
        vertexBuffer[i*3+2] = vertexBuffer[i*3+2] * helfTrunkSize + leftLegPos[2];
    }
    var leftLeg = {
        "vertex": vertexBuffer,
        "color": colorBuffer,
        "index": indexBuffer,
    };
    
    // Right Leg
    vertexBuffer = normalBox.vertex.slice();
    colorBuffer = normalBox.color.slice();
    indexBuffer = normalBox.index.slice();
    for (var i=0; i<vertexBuffer.length / 3; i++)
    {
        vertexBuffer[i*3] = vertexBuffer[i*3] * helfTrunkSize + rightLegPos[0];
        vertexBuffer[i*3+1] = vertexBuffer[i*3+1] * helfTrunkSize + rightLegPos[1];
        vertexBuffer[i*3+2] = vertexBuffer[i*3+2] * helfTrunkSize + rightLegPos[2];
    }
    var rightLeg = {
        "vertex": vertexBuffer,
        "color": colorBuffer,
        "index": indexBuffer,
    };
    
    return {
        "head": {
            "vertex": headVertices,
            "color": headColors,
            "index": headIndexBuffer,
        },
        
        "body": body,
        "leftArm": leftArm,
        "rightArm": rightArm,
        "leftLeg": leftLeg,
        "rightLeg": rightLeg,
    };
}

var createSeparateBodyTexture = function()
{
    // Configuress
    var bodySize = 0.4;
    var trunkSize = 0.8
    var headSize = 1;
    
    var headPos = [0, headSize / 2 + trunkSize * 2, 0];
    var bodyPos = [0, trunkSize / 2 + trunkSize, 0];
    var leftArmPos = [bodySize / 2 + trunkSize / 2, trunkSize / 2 + trunkSize, 0];
    var rightArmPos = [-(bodySize / 2 + trunkSize / 2), trunkSize / 2 + trunkSize, 0];
    var leftLegPos = [bodySize / 3 + trunkSize / 2, trunkSize / 2, 0];
    var rightLegPos = [-(bodySize / 3 + trunkSize / 2), trunkSize / 2, 0];
    
    // The head
    //    5-------6
    //   /|      /|
    //  3-------2 |
    //  | |     | |
    //  | |4----|-|7
    //  |/      |/
    //  0-------1
    //
    // vertex coords array
    var headVertices = [
        // Front face   0~3
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Back face    4~7
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,

        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0, // 4
         1.0, -1.0, -1.0, // 7
         1.0, -1.0,  1.0, // 1
        -1.0, -1.0,  1.0, // 0

        // Right face (left image)
         1.0, -1.0, -1.0, // 7
         1.0,  1.0, -1.0, // 6
         1.0,  1.0,  1.0, // 2
         1.0, -1.0,  1.0, // 1

        // Left face (right image)
        -1.0, -1.0, -1.0, // 4
        -1.0, -1.0,  1.0, // 0
        -1.0,  1.0,  1.0, // 3
        -1.0,  1.0, -1.0  // 5
    ];
    
    // The head
    //    5-------6
    //   /|      /|
    //  3-------2 |
    //  | |     | |
    //  | |4----|-|7
    //  |/      |/
    //  0-------1
    //
    // vertex coords array
    var headTextureCoords = [
        // Front face
        0,    0.25,
        0.25, 0.25,
        0.25, 0,
        0,    0,
        
        // Back face
        1.0,  0.25,
        1.0,  0,
        0.75, 0,
        0.75, 0.25,
        
        // Top face
        0.0,  0.25,
        0.0,  0.5,
        0.25, 0.5,
        0.25, 0.25,
        
        // Bottom face
        0.25, 0.25,
        0,    0.25,
        0,    0.5,
        0.25, 0.5,
        
        // Right face (left image)
        0.5,  0.25,
        0.5,  0,
        0.25, 0,
        0.25, 0.25,
        
        // Left face (right image)
        0.5,  0.25,
        0.75, 0.25,
        0.75, 0,
        0.5,  0,
    ];
    
    var helfHeadSize = headSize / 2;
    for (var i=0; i<headVertices.length / 3; i++)
    {
        headVertices[i*3] = headVertices[i*3] * helfHeadSize + headPos[0];
        headVertices[i*3+1] = headVertices[i*3+1] * helfHeadSize + headPos[1];
        headVertices[i*3+2] = headVertices[i*3+2] * helfHeadSize + headPos[2];
    }
        
    var headIndexBuffer = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
    ];
    
    normalBox = createFullBox();
    
    // Body
    var vertexBuffer = normalBox.vertex.slice();
    var textureCoords = normalBox.textureCoords.slice();
    var indexBuffer = normalBox.index.slice();
    var helfBodySize = bodySize / 2;
    var helfTrunkSize = trunkSize / 2;
    for (var i=0; i<vertexBuffer.length / 3; i++)
    {
        vertexBuffer[i*3] = vertexBuffer[i*3] * helfBodySize + bodyPos[0];
        vertexBuffer[i*3+1] = vertexBuffer[i*3+1] * helfTrunkSize + bodyPos[1];
        vertexBuffer[i*3+2] = vertexBuffer[i*3+2] + bodyPos[2];
    }
    var body = {
        "vertex": vertexBuffer,
        "textureCoords": textureCoords,
        "index": indexBuffer,
    };
    
    // Left Arm
    vertexBuffer = normalBox.vertex.slice();
    textureCoords = normalBox.textureCoords.slice();
    indexBuffer = normalBox.index.slice();
    for (var i=0; i<vertexBuffer.length / 3; i++)
    {
        vertexBuffer[i*3] = vertexBuffer[i*3] * helfTrunkSize + leftArmPos[0];
        vertexBuffer[i*3+1] = vertexBuffer[i*3+1] * helfBodySize + leftArmPos[1];
        vertexBuffer[i*3+2] = vertexBuffer[i*3+2] * helfTrunkSize + leftArmPos[2];
    }
    var leftArm = {
        "vertex": vertexBuffer,
        "textureCoords": textureCoords,
        "index": indexBuffer,
    };
    
    // Right Arm
    vertexBuffer = normalBox.vertex.slice();
    textureCoords = normalBox.textureCoords.slice();
    indexBuffer = normalBox.index.slice();
    for (var i=0; i<vertexBuffer.length / 3; i++)
    {
        vertexBuffer[i*3] = vertexBuffer[i*3] * helfTrunkSize + rightArmPos[0];
        vertexBuffer[i*3+1] = vertexBuffer[i*3+1] * helfBodySize + rightArmPos[1];
        vertexBuffer[i*3+2] = vertexBuffer[i*3+2] * helfTrunkSize + rightArmPos[2];
    }
    var rightArm = {
        "vertex": vertexBuffer,
        "textureCoords": textureCoords,
        "index": indexBuffer,
    };
    
    // Left Leg
    vertexBuffer = normalBox.vertex.slice();
    textureCoords = normalBox.textureCoords.slice();
    indexBuffer = normalBox.index.slice();
    for (var i=0; i<vertexBuffer.length / 3; i++)
    {
        vertexBuffer[i*3] = vertexBuffer[i*3] * helfTrunkSize + leftLegPos[0];
        vertexBuffer[i*3+1] = vertexBuffer[i*3+1] * helfTrunkSize + leftLegPos[1];
        vertexBuffer[i*3+2] = vertexBuffer[i*3+2] * helfTrunkSize + leftLegPos[2];
    }
    var leftLeg = {
        "vertex": vertexBuffer,
        "textureCoords": textureCoords,
        "index": indexBuffer,
    };
    
    // Right Leg
    vertexBuffer = normalBox.vertex.slice();
    textureCoords = normalBox.textureCoords.slice();
    indexBuffer = normalBox.index.slice();
    for (var i=0; i<vertexBuffer.length / 3; i++)
    {
        vertexBuffer[i*3] = vertexBuffer[i*3] * helfTrunkSize + rightLegPos[0];
        vertexBuffer[i*3+1] = vertexBuffer[i*3+1] * helfTrunkSize + rightLegPos[1];
        vertexBuffer[i*3+2] = vertexBuffer[i*3+2] * helfTrunkSize + rightLegPos[2];
    }
    var rightLeg = {
        "vertex": vertexBuffer,
        "textureCoords": textureCoords,
        "index": indexBuffer,
    };
    
    return {
        "head": {
            "vertex": headVertices,
            "textureCoords": headTextureCoords,
            "index": headIndexBuffer,
        },
        
        "body": body,
        "leftArm": leftArm,
        "rightArm": rightArm,
        "leftLeg": leftLeg,
        "rightLeg": rightLeg,
    };
}

var createBox = function()
{
    var boxVertex = [
        // Front face   0~3
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Back face    4~7
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,
    ];
    
    var boxColors = [];
    var whiteColor = [1.0, 1.0, 1.0, 1.0];
    for (var i=0; i<boxVertex.length / 3; i++)
    {
        boxColors = boxColors.concat(whiteColor);
    }
    
    var boxIndexBuffer = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        5, 3, 2,      5, 2, 6,    // Top face
        4, 7, 1,      4, 1, 0,    // Bottom face
        7, 6, 2,      7, 2, 1,    // Right face
        4, 0, 3,      4, 3, 5,    // Left face
    ];
    
    window.console.log("[JumperModel][createBox] Vertex item: " + boxVertex.length +
            " color item: " + boxColors.length +
            " index item: " + boxIndexBuffer.length);
    
    return {
        "vertex": boxVertex,
        "color": boxColors,
        "index": boxIndexBuffer,
    };
}

var createFullBox = function()
{
    // Create a full vertex box, which can use for
    // different texture coordinates.
    
    //    5-------6
    //   /|      /|
    //  3-------2 |
    //  | |     | |
    //  | |4----|-|7
    //  |/      |/
    //  0-------1
    var boxVertex = [
        // Front face
        -1.0, -1.0,  1.0, // 0
         1.0, -1.0,  1.0, // 1
         1.0,  1.0,  1.0, // 2
        -1.0,  1.0,  1.0, // 3

        // Back face
        -1.0, -1.0, -1.0, // 4
        -1.0,  1.0, -1.0, // 5
         1.0,  1.0, -1.0, // 6
         1.0, -1.0, -1.0, // 7

        // Top face
        -1.0,  1.0, -1.0, // 5
        -1.0,  1.0,  1.0, // 3
         1.0,  1.0,  1.0, // 2
         1.0,  1.0, -1.0, // 6

        // Bottom face
        -1.0, -1.0, -1.0, // 4
         1.0, -1.0, -1.0, // 7
         1.0, -1.0,  1.0, // 1
        -1.0, -1.0,  1.0, // 0

        // Right face (left image)
         1.0, -1.0, -1.0, // 7
         1.0,  1.0, -1.0, // 6
         1.0,  1.0,  1.0, // 2
         1.0, -1.0,  1.0, // 1

        // Left face (right image)
        -1.0, -1.0, -1.0, // 4
        -1.0, -1.0,  1.0, // 0
        -1.0,  1.0,  1.0, // 3
        -1.0,  1.0, -1.0  // 5
    ];
    
    var boxTextureCoords = [
        0.25, 0.5,  // 0
        0.5,  0.5,  // 1
        0.5,  0.25, // 2
        0.25, 0.25, // 3
        
        0.5,  0.5,  // 4
        0.5,  0.25, // 5
        0.25, 0.25, // 6
        0.25, 0.5,  // 7
        
        0.25, 0.25, // 5
        0.25, 0.5,  // 3
        0.5,  0.5,  // 2
        0.5,  0.25, // 6
        
        0.25, 0.5,  // 4
        0.5,  0.5,  // 7
        0.5,  0.25, // 1
        0.25, 0.25, // 0
        
        0.5,  0.5,  // 7
        0.5,  0.25, // 6
        0.25, 0.25, // 2
        0.25, 0.5,  // 1
        
        0.25, 0.5,  // 4
        0.5,  0.5,  // 0
        0.5,  0.25, // 3
        0.25, 0.25, // 5
    ];
    
    var boxIndexBuffer = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
    ];
    
    window.console.log("[JumperModel][createBox] Vertex item: " + boxVertex.length +
            " index item: " + boxIndexBuffer.length);
    
    return {
        "vertex": boxVertex,
        "textureCoords": boxTextureCoords,
        "index": boxIndexBuffer,
    };
}

var createFullBox2 = function()
{
    boxModel = createFullBox();
    
    //    5-------6
    //   /|      /|
    //  3-------2 |
    //  | |     | |
    //  | |4----|-|7
    //  |/      |/
    //  0-------1
    var boxTextureCoords = [
        0, 1,   // 0
        1, 1,   // 1
        1, 0,   // 2
        0, 0,   // 3
        
        1, 1,   // 4
        1, 0,   // 5
        0, 0,   // 6
        1, 0,   // 7
        
        0, 0,   // 5
        0, 1,   // 3
        1, 1,   // 2
        1, 0,   // 6
        
        0, 1,   // 4
        1, 1,   // 7
        1, 0,   // 1
        0, 0,   // 0
        
        1, 1,   // 7
        1, 0,   // 6
        0, 0,   // 2
        0, 1,   // 1
        
        0, 1,   // 4
        1, 1,   // 0
        1, 0,   // 3
        0, 0,   // 5
    ];
    
    boxModel.textureCoords = boxTextureCoords
    boxModel["textureCoordItemSize"] = 2;
    boxModel["vertexItemSize"] = 3;
    boxModel["itemNumbers"] = boxModel.vertex.length / 3;
    boxModel["indexItemSize"] = 1;
    boxModel["indexItemNumbers"] = boxModel.index.length;
    
    return boxModel;
}

var createWallBox = function(wallSize)
{
    var boxVertex = [
        // Front face   0~3
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Back face    4~7
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,
    ];
    
    // Apply size
    for (var i=0; i<boxVertex.length; i++)
    {
        boxVertex[i] *= wallSize;
    }
    
    var boxColors = [];
    var whiteColor = [0.5, 0.5, 0.5, 1.0];
    for (var i=0; i<boxVertex.length / 3; i++)
    {
        boxColors = boxColors.concat(whiteColor);
    }
    
    var boxIndexBuffer = [
        //0, 2, 1,      0, 3, 2,    // Front face
        4, 6, 5,      4, 7, 6,    // Back face
        //5, 2, 3,      5, 6, 2,    // Top face
        //4, 1, 7,      4, 0, 1,    // Bottom face
        7, 2, 6,      7, 1, 2,    // Right face
        4, 3, 0,      4, 5, 3,    // Left face
    ];
    
    window.console.log("[JumperModel][createWallBox] Vertex item: " + boxVertex.length +
            " color item: " + boxColors.length +
            " index item: " + boxIndexBuffer.length);
    
    return {
        "vertex": boxVertex,
        "vertexItemSize": 3,
        "vertexItemNumbers": boxVertex.length / 3,
        "color": boxColors,
        "colorItemSize": 4,
        "index": boxIndexBuffer,
        "indexItemSize": 1,
        "indexItemNumbers": boxIndexBuffer.length,
    };
}

var createTextureWallBox = function(wallSize)
{
    var boxVertex = [
        // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,

        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // Right face
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
    ];
    
     // Apply size
    for (var i=0; i<boxVertex.length; i++)
    {
        boxVertex[i] *= wallSize;
    }
    
    var textureCoords = [
        // Front face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        
        // Back face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        
        // Top face
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        
        // Bottom face
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        
        // Right face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        
        // Left face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
    ];
    
    var boxIndices = [
        //0, 1, 2,      0, 2, 3,    // Front face
        //4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
    ];
    
    window.console.log("[JumperModel][createTextureWallBox] Vertex item: " + boxVertex.length +
            " texture coord item: " + textureCoords.length +
            " index item: " + boxIndices.length);
    
    model = {
        "vertex": boxVertex,
        "textureCoords": textureCoords,
        "index": boxIndices,
    };
    
    model["vertexItemSize"] = 3;
    model["textureCoordItemSize"] = 2;
    model["itemNumbers"] = model.vertex.length / 3;
    model["indexItemSize"] = 1;
    model["indexItemNumbers"] = model.index.length;
    
    return model;
}

var combineModel = function(source, dest)
{
    var startVertexIndex = dest.vertex.length / 3;
    var startIndexIndex = dest.index.length;
    if (source.color && source.vertex.length / 3 != source.color.length / 4)
    {
        window.console.log("[JumperModel][combineModel][Error] Vertex position buffer size(" + 
                source.vertex.length + ") does not match vertex color buffer size(" +
                source.color.length + ").");
        return;
    }
    if (source.textureCoords && source.vertex.length / 3 != source.textureCoords.length / 2)
    {
        window.console.log("[JumperModel][combineModel][Error] Vertex position buffer size(" + 
                source.vertex.length + ") does not match vertex texture coords buffer size(" +
                source.textureCoords.length + ").");
        return;
    }
    
    dest.vertex = dest.vertex.concat(source.vertex);
    if (source.color && dest.color)
        dest.color = dest.color.concat(source.color);
    if (source.textureCoords && dest.textureCoords)
        dest.textureCoords = dest.textureCoords.concat(source.textureCoords)
    dest.index = dest.index.concat(source.index);
    for (var i=startIndexIndex; i<dest.index.length; i++)
    {
        dest.index[i] += startVertexIndex;
    }
    
    return dest;
}
