// Provide SceneEngine class to handle general scene rendering
// template methods.

function SceneEngine()
{
    window.console.log("[SceneEngine][Constructor] Create SceneEngine");
    
    this.cookieEngine = undefined;
    this.gl = undefined;
    this.shaderProgram = undefined;
    
    this.entityBucket = {};
    this.lastAnimateTime = 0;
}

SceneEngine.prototype.initialize = function(cookieEngine)
{
    window.console.log("[SceneEngine][initialize] Assign SceneEngine: " + cookieEngine);
    this.cookieEngine = cookieEngine;
    this.gl = cookieEngine.getGL();
    this.shaderProgram = cookieEngine.getShaderProgram();
}

SceneEngine.prototype.addScene = function(scene, name)
{
    window.console.log("[SceneEngine][addScene] Add scene: " + name);
    this.entityBucket[name] = scene;
}

SceneEngine.prototype.removeScene = function(name)
{
    window.console.log("[SceneEngine][addScene] Remove scene: " + name);
    try
    {
        delete this.entityBucket[name];
    }
    catch (e)
    {
    }
}

SceneEngine.prototype.clearScene = function(name)
{
    window.console.log("[SceneEngine][addScene] Clear all cached scene objects.");
    this.entityBucket = {};
}

SceneEngine.prototype.releaseBuffers = function()
{
    window.console.log("[SceneEngine][releaseBuffers] Delete all GL buffers.");
    
    gl = this.gl;
    
    if (this.vertexPositionBuffer && this.vertexItemNumbers > 0)
        gl.deleteBuffer(this.vertexPositionBuffer);
    delete this.vertexPositionBuffer;
    
    if (this.vertexColorBuffer)
        gl.deleteBuffer(this.vertexColorBuffer);
    delete this.vertexColorBuffer;
    
    if (this.vertexIndexBuffer && this.indexItemNumbers > 0)
        gl.deleteBuffer(this.vertexIndexBuffer);
    delete this.vertexIndexBuffer;
    
    if (this.vertexTextureCoordBuffer && this.vertexTextureCoordItemSize > 0)
        gl.deleteBuffer(this.vertexTextureCoordBuffer);
    delete this.vertexTextureCoordBuffer;
}

SceneEngine.prototype.onComposeScene = function()
{
    if (!this._showComposeSceneDetailOnce)
        window.console.log("[SceneEngine][onComposeScene] Compose all entity objects to single scene buffer.");
    
    var vertexPos = [];
    var indices = [];
    var colors = [];
    textureCoords = [];
    
    // Following variable is constant in current implementation.
    // We don't accept other size or format.
    this.vertexPositionItemSize = 3;
    this.vertexColorItemSize = 3;
    this.vertexIndexItemSize = 3;
    
    for (var key in this.entityBucket)
    {
        // The target entity.
        var entity = this.entityBucket[key];
        
        if (!entity.vertexPositions)
        {
            if (!this._showComposeSceneDetailOnce)
                window.console.log("[SceneEngine][onComposeScene] Entity does not define vertexPositions:"
                    + entity.entityName);
            continue;
        }
        
        var newVertexPos = entity.vertexPositions.slice();
        var startVertexIndex = vertexPos.length / 3;
        
        // Translate all vertex position from model to view.
        var transMat = mat4.create();
        var entityPos = entity.getPosition();
        mat4.translate(transMat, transMat, entityPos);
        for (var vtxIdx=0; vtxIdx<newVertexPos.length / 3; vtxIdx++)
        {
            var newPosVec = vec3.fromValues(
                newVertexPos[vtxIdx], newVertexPos[vtxIdx+1], newVertexPos[vtxIdx+2]);
            vec3.transformMat4(newPosVec, newPosVec, transMat);
            // Push translated vertex into compose list.
            vertexPos = vertexPos.concat([newPosVec[0], newPosVec[1], newPosVec[2]]);
        }
        
        var newIndices = entity.vertexIndices.slice();
        for (var idx in newIndices)
            newIndices[idx] += startVertexIndex;
        indices = indices.concat(newIndices);
        
        colors = colors.concat(entity.vertexColors);
        textureCoords = textureCoords.concat(entity.textureCoords);
        
        if (!this._showComposeSceneDetailOnce)
            window.console.log("[SceneEngine][onComposeScene] After compose: " + entity.entityName +
                " Vertex numbers: " + vertexPos.length +
                " index numbers:" + indices.length +
                " color numbers: " + colors.length +
                " texture coords numbers: " + textureCoords.length);
    }
    
    this.vertexPositions = vertexPos;
    this.vertexColors = colors;
    this.vertexIndices = indices;
    this.textureCoords = textureCoords;
    
    // TODO: Bind all composed buffer.
    this.releaseBuffers();
    var vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexPositions), gl.STATIC_DRAW);
    this.vertexPositionBuffer = vertexPositionBuffer;
    this.vertexItemNumbers = vertexPos.length / 3;
    this.vertexItemSize = 3;
    
    var vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexColors), gl.STATIC_DRAW);
    this.vertexColorBuffer = vertexColorBuffer;
    this.colorItemSize = 4;
    
    var vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.vertexIndices), gl.STATIC_DRAW);
    this.vertexIndexBuffer = vertexIndexBuffer;
    this.vertexIndexItemNumbers = indices.length / 3;
    this.indexItemSize = 1;
    
    if (this.textureCoords)
    {
        var textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.textureCoords), gl.STATIC_DRAW);
        this.vertexTextureCoordBuffer = textureCoordBuffer;
        this.vertexTextureCoordItemSize = 2;
    }
    
    if (!this._showComposeSceneDetailOnce)
    {
        this._showComposeSceneDetailOnce = true;
        window.console.log("[SceneEngine][onComposeScene] Vertex numbers: " + this.vertexItemNumbers +
            " index numbers:" + this.vertexIndexItemNumbers +
            " color numbers: " + colors.length +
            " texture coords numbers: " + textureCoords.length);
    }
    
    return true;
}

SceneEngine.prototype.onAnimateScene = function()
{
    var timeNow = new Date().getTime();
    var elapsed = 0;
    if (this.lastAnimateTime != 0)
        elapsed = timeNow - this.lastAnimateTime;
    this.lastAnimateTime = timeNow;
    
    for (var key in this.entityBucket)
    {
        this.entityBucket[key].onAnimate(elapsed);
    }
    return elapsed;
}

SceneEngine.prototype.onDrawScene = function()
{
    if (!this.gl)
    {
        return;
    }
    
    //mat4.rotate(framework_mv_matrix, framework_mv_matrix, degToRad(30), [1, 0, 0]);
    //mat4.translate(framework_mv_matrix, framework_mv_matrix, [0, -10, 0]);
    
    var drawSuccess = false;
    /*
    try
    {
        // Mechanism to compose all vertex/index and other resource
        // into single buffer and draw in once.
        if (this.onComposeScene())
        {
            drawSuccess = this.drawComposedScene();
        }
    }
    catch (e)
    {
        window.console.log("[SceneEngine][onDrawScene] Draw composed scene failed: " + e);
    }
    */
    
    if (!drawSuccess)
    {
        for (var key in this.entityBucket)
        {
            this.drawScene(this.entityBucket[key]);
        }
    }
}

SceneEngine.prototype.drawComposedScene = function()
{
    return false;
}

SceneEngine.prototype.drawScene = function(scene)
{
    var gl = this.gl;
    var shaderProgram = this.shaderProgram;
    
    gl.useProgram(shaderProgram);
    
    this.cookieEngine.pushMVMatrix();
    
    // Move and rotate scene
    var mvMatrix = this.cookieEngine.getMVMatrix();
    var scenePos = scene.getPosition();
    mat4.translate(mvMatrix, mvMatrix, scenePos);
    
    var sceneDegree = scene.getRotateDegree();
    var sceneRotVec = scene.getRotateVector();
    mat4.rotate(mvMatrix, mvMatrix, this.cookieEngine.degToRad(sceneDegree), sceneRotVec);
    
    // Scene resource
    var sceneVertexPositionBuffer = scene.getVertexPositionBuffer();
    var positionItemSize = scene.getVertexPositionItemSize();
    gl.bindBuffer(gl.ARRAY_BUFFER, sceneVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, positionItemSize, gl.FLOAT, false, 0, 0);
    
    var colorItemSize = scene.getVertexColorItemSize();
    var textureCoordItemSize = scene.getVertexTextureCoordItemSize();
    if (colorItemSize > 0)
    {
        var sceneVertexColorBuffer = scene.getVertexColorBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sceneVertexColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, colorItemSize, gl.FLOAT, false, 0, 0);
    }
    else if (textureCoordItemSize > 0)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, scene.getVertexTextureCoordsBuffer());
        gl.vertexAttribPointer(shaderProgram.vertexTextureCoordAttribute, textureCoordItemSize, gl.FLOAT, false, 0, 0);
        
        currentTexture = this.cookieEngine.initTexture(scene.textureName);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, currentTexture);
        gl.uniform1i(shaderProgram.samplerUniform, 0);
    }
    
    //setMatrixUniforms();
    
    var numIndexItems = scene.getVertexIndexItemNumbers();
    if (numIndexItems)
    {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, scene.getVertexIndexBuffer());
        this.cookieEngine.setMatrixUniforms();
        
        if (!this._showDrawDetailOnce)
        {
            this._showDrawDetailOnce = true;
            window.console.log("index items: " + numIndexItems + " pos item size: " + positionItemSize +
                " color item size: " + colorItemSize);
        }
        
        gl.drawElements(gl.TRIANGLES, numIndexItems, gl.UNSIGNED_SHORT, 0);
    }
    else
    {
        this.cookieEngine.setMatrixUniforms();
        var numItems = scene.getVertexItemNumber();
        var drawMethod = scene.getVertexDrawMethod();
        gl.drawArrays(drawMethod, 0, numItems);
    }
    
    this.cookieEngine.popMVMatrix();
}
