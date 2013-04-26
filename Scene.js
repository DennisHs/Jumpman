// Provide Entity object which contain vertex/color information.
// And provide few functions to construct final buffer to rendering.

function Entity(name)
{
    window.console.log("[Entity][Entity] Entity object construct for: " + name);
    
    // TODO: Properties should change to private.
    
    this.entityName = name;
    
    this.position = [0, 0, 0];
    this.degree = 0;
    this.rotateVector = [0.0, 1.0, 0.0];
    
    // Following buffer are GL buffer.
    this.vertexPositionBuffer = undefined;
    this.vertexColorBuffer = undefined;
    this.vertexTextureCoordBuffer = undefined;
    
    // Following are raw buffer
    this.vertexPositions = undefined;
    this.vertexColors = undefined;
    this.textureCoords = undefined;
    this.vertexIndices = undefined;
    
    this.vertexPositionItemSize = 0;
    this.vertexColorItemSize = 0;
    this.vertexTextureCoordItemSize = 0;
    this.itemNumbers = 0;
    
    this.vertexIndexBuffer = undefined;
    this.vertexIndexItemSize = 0;
    this.vertexIndexItemNumbers = 0;
    
    this.vertexDrawMethod = undefined;
    this.textureName = "";
}

Entity.prototype.release = function(gl)
{
    if (this.vertexPositionBuffer)
        gl.deleteBuffer(this.vertexPositionBuffer);
    delete this.vertexPositionBuffer;
    
    if (this.vertexColorBuffer)
        gl.deleteBuffer(this.vertexColorBuffer);
    delete this.vertexColorBuffer;
    
    if (this.vertexTextureCoordBuffer)
        gl.deleteBuffer(this.vertexTextureCoordBuffer);
    delete this.vertexTextureCoordBuffer;
}

Entity.prototype.setPosition = function(position)
{
    this.position = position.slice();
}

Entity.prototype.getPosition = function()
{
    return this.position;
}

Entity.prototype.setRotateDegree = function(degree)
{
    this.degree = degree;
}

Entity.prototype.getRotateDegree = function()
{
    return this.degree;
}

Entity.prototype.setRotateVector = function(rotateVector)
{
    this.rotateVector = rotateVector.slice();
}

Entity.prototype.getRotateVector = function()
{
    return this.rotateVector;
}

Entity.prototype.setVertexPositionBuffer = function(gl, vertexPositionBuffer, itemSize)
{
    if (this.vertexPositionBuffer && this.vertexPositionItemSize > 0)
    {
        gl.deleteBuffer(this.vertexPositionBuffer);
    }
    
    this.vertexPositionBuffer = vertexPositionBuffer;
    this.vertexPositionItemSize = itemSize;
}

Entity.prototype.getVertexPositionBuffer = function()
{
    return this.vertexPositionBuffer;
}

Entity.prototype.getVertexPositionItemSize = function()
{
    return this.vertexPositionItemSize;
}

Entity.prototype.setVertexIndexBuffer = function(vertexIndexBuffer, itemSize, vertexIndexItemNumbers)
{
    this.vertexIndexBuffer = vertexIndexBuffer;
    this.vertexIndexItemSize = itemSize;
    this.vertexIndexItemNumbers = vertexIndexItemNumbers;
}

Entity.prototype.getVertexIndexBuffer = function()
{
    return this.vertexIndexBuffer;
}

Entity.prototype.getVertexIndexItemSize = function()
{
    return this.vertexIndexItemSize;
}

Entity.prototype.getVertexIndexItemNumbers = function()
{
    return this.vertexIndexItemNumbers;
}

Entity.prototype.setVertexColorBuffer = function(gl, vertexColorBuffer, itemSize)
{
    if (this.vertexColorBuffer && this.vertexColorItemSize > 0)
    {
        gl.deleteBuffer(this.vertexColorBuffer);
    }
    
    this.vertexColorBuffer = vertexColorBuffer;
    this.vertexColorItemSize = itemSize;
}

Entity.prototype.getVertexColorBuffer = function()
{
    return this.vertexColorBuffer;
}

Entity.prototype.getVertexColorItemSize = function()
{
    return this.vertexColorItemSize;
}

Entity.prototype.setVertexItemNumber = function(itemNum)
{
    this.itemNumbers = itemNum;;
}

Entity.prototype.getVertexItemNumber = function()
{
    return this.itemNumbers;
}

Entity.prototype.getVertexTextureCoordItemSize = function()
{
    return this.vertexTextureCoordItemSize;
}

Entity.prototype.getVertexTextureCoordsBuffer = function()
{
    return this.vertexTextureCoordBuffer;
}

Entity.prototype.bindVertexBuffers = function(gl, vertices, vertexItemSize, itemNumbers,
        colors, colorItemSize, indices, indexItemSize, indexItemNumbers)
{
    var vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.setVertexPositionBuffer(gl, vertexPositionBuffer, vertexItemSize);
    this.setVertexItemNumber(itemNumbers);
    
    var vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    this.setVertexColorBuffer(gl, vertexColorBuffer, colorItemSize);
    
    var vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    this.setVertexIndexBuffer(vertexIndexBuffer, indexItemSize, indexItemNumbers);
}

Entity.prototype.bindVertexTextureBuffer = function(gl, vertices, vertexItemSize, itemNumbers,
        textureCoords, textureCoordItemSize, indices, indexItemSize, indexItemNumbers)
{
    var vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.setVertexPositionBuffer(gl, vertexPositionBuffer, vertexItemSize);
    this.setVertexItemNumber(itemNumbers);
    
    var textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    if (this.vertexTextureCoordBuffer && this.vertexTextureCoordItemSize > 0)
        gl.deleteBuffer(this.vertexTextureCoordBuffer);
    this.vertexTextureCoordBuffer = textureCoordBuffer;
    this.vertexTextureCoordItemSize = textureCoordItemSize;
    
    var vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    this.setVertexIndexBuffer(vertexIndexBuffer, indexItemSize, indexItemNumbers);
}

Entity.prototype.onAnimate = function(elapsed)
{
}

Entity.prototype.setVertexDrawMethod = function(method)
{
    this.vertexDrawMethod = method;
}

Entity.prototype.getVertexDrawMethod = function()
{
    return this.vertexDrawMethod;
}

